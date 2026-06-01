from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud, auth, database, gamification, social
from database import engine

app = FastAPI(title="HabitChain API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # Accept username or email
    user = crud.get_user_by_username_or_email(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me/", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me/profile", response_model=schemas.UserResponse)
def update_user_profile(profile_data: schemas.UserUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.update_user_profile(db, current_user.id, profile_data)

@app.put("/users/me/preferences", response_model=schemas.UserResponse)
def update_user_preferences(prefs_data: schemas.PreferencesUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.update_user_preferences(db, current_user.id, prefs_data)

@app.post("/habits/", response_model=schemas.HabitResponse)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_habit(db=db, habit=habit, user_id=current_user.id)

@app.get("/habits/", response_model=List[schemas.HabitResponse])
def read_habits(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    habits = crud.get_habits(db, user_id=current_user.id, skip=skip, limit=limit)
    return habits

@app.post("/habits/{habit_id}/complete", response_model=schemas.CompletionResponse)
def complete_habit(habit_id: int, completion: schemas.CompletionBase, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify owner
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Check if a completion already exists for this habit on this date BEFORE creating/updating
    # This determines if we award XP
    existing = db.query(models.Completion).filter(
        models.Completion.habit_id == habit_id,
        models.Completion.date == completion.date
    ).first()

    db_completion_schema = schemas.CompletionCreate(**completion.dict(), habit_id=habit_id)
    db_completion = crud.create_completion(db=db, completion=db_completion_schema)
    
    # Only award XP if this is the first progress entry for this habit today
    if not existing:
        gamification.update_user_xp(db, current_user.id, 10) # 10 points per new daily habit activity
        gamification.check_and_award_badges(db, current_user.id)
    
    return db_completion

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify owner
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    crud.delete_habit(db, habit_id)
    return {"status": "success"}

@app.get("/users/me/stats")
async def read_user_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    total_habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id, models.Habit.is_archived == False).count()
    total_completions = db.query(models.Completion).join(models.Habit).filter(
        models.Habit.user_id == current_user.id,
        models.Habit.is_archived == False
    ).count()
    return {
        "total_habits": total_habits,
        "total_completions": total_completions,
        "level": current_user.level,
        "points": current_user.points
    }

@app.get("/users/me/badges", response_model=List[schemas.BadgeResponse])
async def read_user_badges(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    badges = [ub.badge for ub in current_user.badges]
    return badges

@app.get("/users/leaderboard/", response_model=List[schemas.UserResponse])
def get_leaderboard(limit: int = 10, time_filter: str = "All Time", db: Session = Depends(database.get_db)):
    return social.get_leaderboard(db, limit, time_filter)

class PasswordResetRequest(BaseModel):
    new_password: str

@app.post("/reset-password")
def reset_password(
    payload: PasswordResetRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Allows an authenticated user to change their password.
    """
    current_user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

class ForgotPasswordRequest(BaseModel):
    identifier: str
    new_password: str

@app.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(database.get_db)
):
    """
    Allows a user to reset their password using their username or email without being authenticated.
    """
    user = crud.get_user_by_username_or_email(db, payload.identifier)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
