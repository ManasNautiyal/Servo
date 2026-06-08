from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

class SkillBase(BaseModel):
    skill_name: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserProfileBase(BaseModel):
    name: str
    email: EmailStr
    college_id: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    github_link: Optional[str] = None
    resume_url: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    github_link: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[List[str]] = None  # Replaces existing skills if provided

class UserResponse(UserProfileBase):
    id: int
    role: str
    created_at: datetime.datetime
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True

class UserStats(BaseModel):
    orders_completed: int
    reviews_received_count: int
    average_rating: float
    active_services_count: int
