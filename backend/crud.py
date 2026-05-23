from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username_or_email(db: Session, identifier: str):
    """Look up a user by username OR email — whichever matches."""
    return db.query(models.User).filter(
        (models.User.username == identifier) | (models.User.email == identifier)
    ).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_habits(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Habit).filter(models.Habit.user_id == user_id, models.Habit.is_archived == False).offset(skip).limit(limit).all()

def create_habit(db: Session, habit: schemas.HabitCreate, user_id: int):
    db_habit = models.Habit(**habit.dict(), user_id=user_id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit
def delete_habit(db: Session, habit_id: int):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if db_habit:
        db_habit.is_archived = True
        db.commit()
    return db_habit

def create_completion(db: Session, completion: schemas.CompletionCreate):
    # Check if a completion already exists for this habit on this date
    existing = db.query(models.Completion).filter(
        models.Completion.habit_id == completion.habit_id,
        models.Completion.date == completion.date
    ).first()
    
    if existing:
        existing.progress_value += completion.progress_value
        db.commit()
        db.refresh(existing)
        return existing
    
    db_completion = models.Completion(**completion.dict())
    db.add(db_completion)
    db.commit()
    db.refresh(db_completion)
    return db_completion

def get_completions_for_habit(db: Session, habit_id: int):
    return db.query(models.Completion).filter(models.Completion.habit_id == habit_id).all()

def update_user_profile(db: Session, user_id: int, profile_data: schemas.UserUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        if profile_data.username is not None:
            user.username = profile_data.username
        if profile_data.bio is not None:
            user.bio = profile_data.bio
        db.commit()
        db.refresh(user)
    return user

def update_user_preferences(db: Session, user_id: int, prefs_data: schemas.PreferencesUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        if prefs_data.email_notifs is not None:
            user.email_notifs = prefs_data.email_notifs
        if prefs_data.dark_mode is not None:
            user.dark_mode = prefs_data.dark_mode
        db.commit()
        db.refresh(user)
    return user
