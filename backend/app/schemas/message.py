from pydantic import BaseModel
import datetime
from typing import Optional

class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# WebSocket connection payloads
class WsMessage(BaseModel):
    type: str  # "message", "typing", "read_receipt", "online_status"
    sender_id: Optional[int] = None
    receiver_id: Optional[int] = None
    content: Optional[str] = None
    is_typing: Optional[bool] = None
    message_id: Optional[int] = None
    online: Optional[bool] = None
