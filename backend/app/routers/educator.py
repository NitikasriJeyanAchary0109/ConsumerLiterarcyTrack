from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from typing import List

from app.database import get_db
from app.models.models import User, Goal, Transaction, ChatHistory
from app.schemas.schemas import EducatorAnalyticsResponse, ChatHistoryResponse
from app.middleware.auth_middleware import require_educator

router = APIRouter(prefix="/educator", tags=["Educator Analytics"])

@router.get("/analytics", response_model=EducatorAnalyticsResponse)
def get_educator_analytics(
    current_user: User = Depends(require_educator),
    db: Session = Depends(get_db)
):
    """
    Computes aggregated savings and transaction metrics across all students.
    Only accessible by users with the 'educator' role.
    """
    # Count total students
    total_students = db.query(func.count(User.user_id)).filter(User.role == "student").scalar() or 0

    # Sum savings across all students' goals
    total_savings = db.query(func.sum(Goal.saved)).join(User, Goal.user_id == User.user_id).filter(User.role == "student").scalar()
    total_savings = Decimal(str(total_savings)) if total_savings is not None else Decimal("0.00")

    # Calculate average savings
    average_savings = total_savings / Decimal(str(total_students)) if total_students > 0 else Decimal("0.00")

    # Count total student transactions processed
    total_txs = db.query(func.count(Transaction.trans_id)).join(User, Transaction.user_id == User.user_id).filter(User.role == "student").scalar() or 0

    # Retrieve recent AI insights / chat questions across all student accounts to observe literacy topics/trends
    recent_insights = db.query(ChatHistory).join(User, ChatHistory.user_id == User.user_id).filter(User.role == "student").order_by(ChatHistory.created_at.desc()).limit(5).all()

    return {
        "total_students": total_students,
        "total_savings": total_savings,
        "average_savings_per_student": average_savings,
        "total_transactions_processed": total_txs,
        "recent_insights": recent_insights
    }
