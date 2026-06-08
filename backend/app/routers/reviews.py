from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime

from app.database.session import get_db
from app.database.models import User, Service, Order, Review, Notification
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

# Helper to create notification and broadcast
async def send_review_notification(db: Session, user_id: int, notif_type: str, content: str):
    notification = Notification(
        user_id=user_id,
        type=notif_type,
        content=content,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # WebSocket broadcast
    await manager.send_personal_message({
        "type": "notification",
        "notification_id": notification.id,
        "notif_type": notif_type,
        "content": content,
        "is_read": False,
        "created_at": str(notification.created_at)
    }, user_id)

@router.post("", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check if order exists and belongs to user
    order = db.query(Order).filter(
        Order.id == review_in.order_id,
        Order.buyer_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found or you are not authorized to review it."
        )
        
    # 2. Check if order is completed
    if order.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="You can only leave reviews on completed orders."
        )
        
    # 3. Check if review already exists for this order
    existing_review = db.query(Review).filter(Review.order_id == order.id).first()
    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted a review for this order."
        )
        
    new_review = Review(
        reviewer_id=current_user.id,
        provider_id=order.provider_id,
        service_id=order.service_id,
        order_id=order.id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Notify provider
    await send_review_notification(
        db=db,
        user_id=order.provider_id,
        notif_type="new_review",
        content=f"⭐ {current_user.name} left a {review_in.rating}-star review on your service: '{order.service.title}'!"
    )
    
    return new_review

@router.get("/service/{service_id}", response_model=List[ReviewResponse])
def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.service_id == service_id).order_by(Review.created_at.desc()).all()

@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
def get_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.provider_id == provider_id).order_by(Review.created_at.desc()).all()
