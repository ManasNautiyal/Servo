from pydantic import BaseModel, Field
from typing import Optional, List
import datetime
from app.schemas.user import UserResponse

class ServiceBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=20)
    category: str  # Academic, Technical, Creative, Career, Other
    price: float = Field(..., gt=0)
    delivery_time: int = Field(..., gt=0)  # in days
    image_url: Optional[str] = None
    tags: Optional[str] = None  # Comma-separated
    status: Optional[str] = "available"  # available, busy, offline

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    delivery_time: Optional[int] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None

class ServiceResponse(ServiceBase):
    id: int
    provider_id: int
    created_at: datetime.datetime
    provider: Optional[UserResponse] = None

    class Config:
        from_attributes = True
