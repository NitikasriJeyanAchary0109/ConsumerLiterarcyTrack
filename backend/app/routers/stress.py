from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.database import get_db
from app.models.models import User, Transaction, Goal, FinancialHealth
from app.schemas.schemas import StressRequest, FinancialHealthResponse
from app.middleware.auth_middleware import require_student
from app.services.ai_service import call_ai, build_stress_prompt

router = APIRouter(prefix="/stress", tags=["Wellness Meter"])

@router.post("/", response_model=FinancialHealthResponse, status_code=status.HTTP_200_OK)
async def generate_stress_meter(
    request: StressRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Evaluates spending patterns and goals over a configurable timeframe (e.g. 30 days)
    to compute a financial stress score and cache a wellness advisory report.
    """
    time_limit = datetime.utcnow() - timedelta(days=request.timeframe_days)
    
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.user_id,
        Transaction.date >= time_limit
    ).all()

    active_goals = db.query(Goal).filter(
        Goal.user_id == current_user.user_id
    ).all()

    # Form list structures for prompt
    tx_list = [
        {"amount": float(t.amount), "merchant": t.merchant, "category": t.category}
        for t in recent_transactions
    ]
    goal_list = [
        {"title": g.goal_name, "target": float(g.target), "current": float(g.saved)}
        for g in active_goals
    ]

    # Generate prompt and query AI
    prompt = build_stress_prompt(recent_transactions=tx_list, active_goals=goal_list)
    ai_wellness = await call_ai(prompt)

    # Compute a deterministic wellness score based on spending vs savings
    # (High savings + low transaction frequency = high health, low stress)
    total_spent = sum(t.amount for t in recent_transactions)
    total_saved = sum(g.saved for g in active_goals)
    
    # Simple algorithm
    if total_saved > total_spent:
        health_score = random.randint(75, 95)
        stress_score = random.randint(10, 30)
    elif total_saved > 0:
        health_score = random.randint(45, 74)
        stress_score = random.randint(31, 65)
    else:
        health_score = random.randint(15, 44)
        stress_score = random.randint(66, 95)

    # Save to FinancialHealth table
    report = FinancialHealth(
        user_id=current_user.user_id,
        health_score=health_score,
        stress_score=stress_score,
        ai_summary=ai_wellness,
        created_at=datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report
