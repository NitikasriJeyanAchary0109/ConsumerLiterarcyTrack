from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime

from app.database import get_db
from app.models.models import User, Goal, ChatHistory
from app.schemas.schemas import ForecastRequest, ChatHistoryResponse
from app.middleware.auth_middleware import require_student
from app.services.ai_service import call_ai, build_dream_engine_prompt

router = APIRouter(prefix="/forecast", tags=["Dream Engine"])

@router.post("/", response_model=ChatHistoryResponse, status_code=status.HTTP_200_OK)
async def forecast_savings(
    request: ForecastRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Simulates a savings timeline for a specific goal using a monthly contribution rate,
    incorporating automated roundups. Caches the forecast in ChatHistory.
    """
    goal = db.query(Goal).filter(
        Goal.goal_id == request.goal_id,
        Goal.user_id == current_user.user_id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found."
        )

    # Generate prompt and query AI
    prompt = build_dream_engine_prompt(
        goal_title=goal.goal_name,
        target_amount=float(goal.target),
        current_amount=float(goal.saved),
        monthly_contrib=float(request.monthly_contribution)
    )
    ai_forecast = await call_ai(prompt)

    # Save to ChatHistory
    chat_record = ChatHistory(
        user_id=current_user.user_id,
        question=f"Dream Engine Forecast: Save for goal '{goal.goal_name}' with monthly contribution ${request.monthly_contribution:.2f}",
        response=ai_forecast,
        created_at=datetime.datetime.utcnow()
    )
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return chat_record
