from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import datetime

from app.database import get_db
from app.models.models import User, ChatHistory, Transaction, Goal
from app.schemas.schemas import ChatRequest, ChatHistoryResponse
from app.middleware.auth_middleware import require_student
from app.services.ai_service import call_ai, build_coach_prompt

router = APIRouter(prefix="/chat", tags=["AI Coach"])

@router.post("/", response_model=ChatHistoryResponse, status_code=status.HTTP_200_OK)
async def chat_with_coach(
    request: ChatRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Interacts with the AI Financial Coach.
    Builds context from recent transactions and savings goals, then invokes the AI model.
    Logs conversation to the ChatHistory table.
    """
    # Build context from database
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.user_id
    ).order_by(Transaction.date.desc()).limit(5).all()

    active_goals = db.query(Goal).filter(
        Goal.user_id == current_user.user_id
    ).all()

    context = {
        "recent_purchases": [
            {"amount": float(t.amount), "merchant": t.merchant, "category": t.category}
            for t in recent_transactions
        ],
        "goals": [
            {"title": g.goal_name, "target": float(g.target), "current": float(g.saved)}
            for g in active_goals
        ]
    }

    # Build prompt and run
    prompt = build_coach_prompt(request.message, current_user.full_name, context)
    ai_response_text = await call_ai(prompt)

    # Save to ChatHistory
    chat_record = ChatHistory(
        user_id=current_user.user_id,
        question=request.message,
        response=ai_response_text,
        created_at=datetime.datetime.utcnow()
    )
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return chat_record
