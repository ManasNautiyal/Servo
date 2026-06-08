from pydantic import BaseModel, Field
import datetime
from typing import Optional
from app.schemas.user import UserResponse

class ReviewCreate(BaseModel):
    order_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    provider_id: int
    service_id: int
    order_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime.datetime
    reviewer: Optional[UserResponse] = None

    class Config:
        from_attributes = True
