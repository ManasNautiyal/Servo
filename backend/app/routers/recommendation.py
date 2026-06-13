from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.database.session import get_db
from app.database.models import User, Service
from app.services.auth import get_current_user
from app.services.recommendation import get_content_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


class RecommendationResponse(BaseModel):
    service_id: int
    title: str
    score: float


@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exposes GET /api/recommendations. 
    Retrieves the top 6 content-based service recommendations matched to the active 
    student's branch, bio, and skills, while filtering out their own listings.
    """
    try:
        # 1. Fetch active services (recommendation engine filters out user's own listings)
        available_services = db.query(Service).filter(Service.status == "available").all()
        
        # 2. Compute similarities using Scikit-Learn TF-IDF engine
        recommended_services = get_content_recommendations(
            user_profile=current_user,
            services=available_services,
            top_n=6
        )
        
        # 3. Format result payload to match required JSON structure
        response_payload = [
            RecommendationResponse(
                service_id=service.get("id"),
                title=service.get("title"),
                score=round(service.get("similarity_score", 0.0), 4)
            )
            for service in recommended_services
        ]
        
        return response_payload
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate service recommendations: {str(e)}"
        )
