from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import datetime


from app.database.session import get_db
from app.database.models import User, Service, Order, Review
from app.schemas.user import UserResponse
from app.schemas.service import ServiceResponse
from app.schemas.review import ReviewResponse
from app.services.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

@router.get("/analytics")
def get_analytics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # User analytics
    total_users = db.query(User).count()
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    new_users = db.query(User).filter(User.created_at >= seven_days_ago).count()
    
    # Active users are those who have placed or received orders, or created listings
    active_user_ids = set()
    buyer_ids = db.query(Order.buyer_id).distinct().all()
    provider_ids = db.query(Order.provider_id).distinct().all()
    service_provider_ids = db.query(Service.provider_id).distinct().all()
    
    for uid in buyer_ids + provider_ids + service_provider_ids:
        active_user_ids.add(uid[0])
        
    active_users = len(active_user_ids)
    
    # Service analytics
    total_services = db.query(Service).count()
    
    # Service category distribution
    category_counts = db.query(
        Service.category,
        func.count(Service.id)
    ).group_by(Service.category).all()
    
    categories = {cat[0]: cat[1] for cat in category_counts}
    
    # Order analytics
    total_orders = db.query(Order).count()
    completed_orders = db.query(Order).filter(Order.status == "completed").count()
    pending_orders = db.query(Order).filter(Order.status == "pending").count()
    in_progress_orders = db.query(Order).filter(Order.status == "in_progress").count()
    
    # Review analytics
    total_reviews = db.query(Review).count()
    avg_rating = db.query(func.avg(Review.rating)).scalar() or 0.0
    avg_rating = float(round(avg_rating, 2))
    
    return {
        "users": {
            "total_users": total_users,
            "active_users": active_users if active_users > 0 else total_users,
            "new_users": new_users
        },
        "services": {
            "total_services": total_services,
            "categories": categories
        },
        "orders": {
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "pending_orders": pending_orders,
            "in_progress_orders": in_progress_orders
        },
        "reviews": {
            "total_reviews": total_reviews,
            "average_rating": avg_rating
        }
    }

@router.get("/users", response_model=List[UserResponse])
def list_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.delete("/users/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an administrator account.")
        
    db.delete(user)
    db.commit()
    return {"message": "User and all associated data successfully deleted."}

@router.get("/services", response_model=List[ServiceResponse])
def list_services(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Service).order_by(Service.created_at.desc()).all()

@router.delete("/services/{service_id}", response_model=dict)
def remove_service(
    service_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service listing not found")
        
    db.delete(service)
    db.commit()
    return {"message": "Service listing successfully moderated and removed."}

@router.delete("/reviews/{review_id}", response_model=dict)
def remove_review(
    review_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    db.delete(review)
    db.commit()
    return {"message": "Review successfully deleted."}


class BroadcastRequest(BaseModel):
    subject: str
    content: str


def wrap_broadcast_template(message_body: str) -> str:
    paragraphs = "".join(f"<p style='font-size: 16px; line-height: 24px; color: #4a5568;'>{p.strip()}</p>" for p in message_body.split("\n\n") if p.strip())
    
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                <h1 style="color: #4f46e5; text-align: center; margin-bottom: 30px; font-size: 24px;">Message from Servo Admin</h1>
                {paragraphs}
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 12px; color: #a0aec0; text-align: center;">You received this email because you are a registered user of Servo.</p>
                <p style="font-size: 12px; color: #a0aec0; text-align: center;">Servo Marketplace © 2026</p>
            </div>
        </body>
    </html>
    """


def broadcast_emails_task(emails: List[str], subject: str, html_body: str):
    from app.services.email import send_custom_email
    for email in emails:
        try:
            send_custom_email(email, subject, html_body)
        except Exception as e:
            print(f"[ERROR] Failed to send broadcast email to {email}: {e}")


@router.post("/broadcast-email", response_model=dict)
def broadcast_email(
    payload: BroadcastRequest,
    background_tasks: BackgroundTasks,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    emails = [u.email for u in users if u.email]
    
    if not emails:
        raise HTTPException(status_code=400, detail="No users found to email.")
        
    html_body = wrap_broadcast_template(payload.content)
    background_tasks.add_task(broadcast_emails_task, emails, payload.subject, html_body)
    
    return {"message": f"Broadcast successfully initiated for {len(emails)} users."}

