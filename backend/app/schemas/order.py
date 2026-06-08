from pydantic import BaseModel
import datetime
from typing import Optional
from app.schemas.user import UserResponse
from app.schemas.service import ServiceResponse

class OrderCreate(BaseModel):
    service_id: int

class OrderStatusUpdate(BaseModel):
    status: str  # pending, accepted, in_progress, delivered, completed, cancelled

class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    provider_id: int
    service_id: int
    status: str
    created_at: datetime.datetime
    buyer: Optional[UserResponse] = None
    provider: Optional[UserResponse] = None
    service: Optional[ServiceResponse] = None

    class Config:
        from_attributes = True
