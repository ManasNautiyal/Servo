from pydantic import BaseModel
import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str  # new_order, order_accepted, new_message, order_delivered, new_review, etc.
    content: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
