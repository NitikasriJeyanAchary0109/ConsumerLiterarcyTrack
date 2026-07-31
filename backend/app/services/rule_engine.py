from decimal import Decimal
import math
import datetime
from sqlalchemy.orm import Session
from app.models.models import Transaction, Goal, Savings, User
from app.services.ai_service import call_ai, build_explain_prompt

def calculate_roundup(amount: Decimal) -> Decimal:
    """
    Computes the difference between a purchase amount and the next highest dollar.
    For example: $3.40 -> $0.60 roundup.
    If the transaction is already a whole dollar ($10.00), roundup is $0.00.
    """
    if amount <= 0:
        return Decimal("0.00")
    
    amount_float = float(amount)
    next_dollar = math.ceil(amount_float)
    
    roundup = Decimal(f"{next_dollar - amount_float:.2f}")
    return roundup

def is_eligible_for_roundup(current_balance: Decimal, threshold: Decimal = Decimal("20.00")) -> bool:
    """
    Determines if a student has enough buffer in their checking account.
    We do not round up if balance falls below the threshold (e.g., $20.00).
    """
    return current_balance >= threshold

async def apply_roundup_if_eligible(
    db: Session,
    transaction: Transaction,
    goal: Goal,
    checking_balance: Decimal,
    threshold: Decimal = Decimal("20.00")
) -> dict:
    """
    Evaluates eligibility, calculates roundup, saves funds to the Savings table,
    updates Goal's saved amount, and generates an AI explanation.
    """
    roundup_amount = calculate_roundup(transaction.amount)
    
    if roundup_amount == 0:
        return {
            "success": False,
            "reason": "Transaction amount is a whole dollar; no roundup calculated.",
            "roundup_amount": Decimal("0.00")
        }
        
    if not is_eligible_for_roundup(checking_balance, threshold):
        return {
            "success": False,
            "reason": f"Account balance (${checking_balance:.2f}) is below the threshold (${threshold:.2f}). Roundup paused.",
            "roundup_amount": Decimal("0.00")
        }
        
    # Apply roundup to Goal
    goal.saved += roundup_amount
    
    # Create Savings record representing the roundup
    save_record = Savings(
        user_id=transaction.user_id,
        amount=roundup_amount,
        source="roundup",
        date=datetime.datetime.utcnow()
    )
    db.add(save_record)
    db.commit()
    db.refresh(save_record)
    
    # Call AI Explainer to generate a motivational roundup description
    prompt = build_explain_prompt(
        transaction_desc=transaction.description or transaction.merchant,
        transaction_amount=float(transaction.amount),
        roundup_amount=float(roundup_amount)
    )
    
    try:
        explanation = await call_ai(prompt)
    except Exception as e:
        # Gracefully handle AI failure without failing the transaction creation itself
        explanation = f"AI Explainer Offline: {getattr(e, 'detail', str(e))}"
    
    return {
        "success": True,
        "save_id": save_record.save_id,
        "roundup_amount": roundup_amount,
        "new_goal_amount": goal.saved,
        "explanation": explanation
    }
