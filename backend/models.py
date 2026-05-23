from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, Enum, JSON, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class Priority(enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class Frequency(enum.Enum):
    DAILY = "Daily"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    bio = Column(Text, nullable=True)
    email_notifs = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    habits = relationship("Habit", back_populates="owner")
    badges = relationship("UserBadge", back_populates="user")

class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100))
    description = Column(Text)
    category = Column(String(50))
    priority = Column(Enum(Priority))
    frequency = Column(Enum(Frequency))
    goal_value = Column(Integer)
    unit = Column(String(50))
    color = Column(String(20))
    icon = Column(String(50))
    reminder_time = Column(Time, nullable=True)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="habits")
    completions = relationship("Completion", back_populates="habit")

class Completion(Base):
    __tablename__ = "completions"
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(Date)
    progress_value = Column(Integer)
    notes = Column(Text, nullable=True)

    habit = relationship("Habit", back_populates="completions")

class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text)
    icon = Column(String(50))
    criteria = Column(JSON)

class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_id = Column(Integer, ForeignKey("badges.id"))
    earned_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")
