from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime, time
from models import Priority, Frequency

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    points: int
    level: int
    bio: Optional[str] = None
    email_notifs: bool = True
    dark_mode: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None

class PreferencesUpdate(BaseModel):
    email_notifs: Optional[bool] = None
    dark_mode: Optional[bool] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CompletionBase(BaseModel):
    date: date
    progress_value: int
    notes: Optional[str] = None

class CompletionCreate(CompletionBase):
    habit_id: int

class CompletionResponse(CompletionBase):
    id: int
    habit_id: int

    class Config:
        from_attributes = True

class HabitBase(BaseModel):
    name: str
    description: str
    category: str
    priority: Priority
    frequency: Frequency
    goal_value: int
    unit: str
    color: str
    icon: str
    reminder_time: Optional[time] = None

class HabitCreate(HabitBase):
    pass

class HabitResponse(HabitBase):
    id: int
    user_id: int
    is_archived: bool
    created_at: datetime
    completions: List[CompletionResponse] = []

    class Config:
        from_attributes = True

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str

    class Config:
        from_attributes = True
