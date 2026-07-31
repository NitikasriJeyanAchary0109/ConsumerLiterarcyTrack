from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import datetime

from app.database import get_db
from app.models.models import User, Goal, ChatHistory
from app.schemas.schemas import NegotiateRequest, ChatHistoryResponse
from app.middleware.auth_middleware import require_student
from app.services.ai_service import call_ai, build_negotiator_prompt

router = APIRouter(prefix="/negotiator", tags=["AI Negotiator"])

@router.post("/", response_model=ChatHistoryResponse, status_code=status.HTTP_200_OK)
async def negotiate_purchase(
    request: NegotiateRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Evaluates a potential purchase against the student's savings progress.
    Returns realistic plain-language advice to deter impulsive spending.
    Logs interaction to the ChatHistory table.
    """
    # Fetch student goals to customize budget context
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.user_id
    ).all()
    
    goal_summary = [
        {"title": g.goal_name, "target": float(g.target), "current": float(g.saved)}
        for g in goals
    ]
    
    budget_context = {
        "active_goals": goal_summary,
        "negotiating_category": request.category
    }

    # Generate prompt and query AI
    prompt = build_negotiator_prompt(
        item_name=request.item_name,
        item_price=float(request.item_price),
        category=request.category,
        user_name=current_user.full_name,
        budget_context=budget_context
    )
    ai_feedback = await call_ai(prompt)

    # Save to ChatHistory
    chat_record = ChatHistory(
        user_id=current_user.user_id,
        question=f"Negotiate purchase: Should I buy {request.item_name} for ${request.item_price:.2f} in {request.category}?",
        response=ai_feedback,
        created_at=datetime.datetime.utcnow()
    )
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return chat_record
