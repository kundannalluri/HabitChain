from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from typing import List
from datetime import date, timedelta

def get_leaderboard(db: Session, limit: int = 10, time_filter: str = "All Time") -> List[models.User]:
    if time_filter in ["This Month", "This Week"]:
        today = date.today()
        if time_filter == "This Month":
            start_date = today.replace(day=1)
        else:
            start_date = today - timedelta(days=today.weekday())
            
        # Sum of completions for each user in the timeframe (each completion = 10 points)
        results = db.query(
            models.User,
            func.count(models.Completion.id).label("scoped_points")
        ).join(models.Habit, models.Habit.user_id == models.User.id) \
         .join(models.Completion, models.Completion.habit_id == models.Habit.id) \
         .filter(models.Completion.date >= start_date) \
         .group_by(models.User.id) \
         .order_by(func.count(models.Completion.id).desc()) \
         .limit(limit).all()
         
        users = []
        for user, count in results:
            db.expunge(user) # detach so we don't accidentally save
            user.points = count * 10
            users.append(user)
        return users
        
    return db.query(models.User).order_by(models.User.points.desc()).limit(limit).all()

def get_user_stats(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    habits_count = db.query(models.Habit).filter(models.Habit.user_id == user_id).count()
    # Simplified stats for now
    return {
        "username": user.username,
        "points": user.points,
        "level": user.level,
        "habits_count": habits_count,
    }
