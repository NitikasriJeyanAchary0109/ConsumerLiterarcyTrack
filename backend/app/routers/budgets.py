from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from datetime import datetime, timedelta

from app.database import get_db
from app.models.models import Budget, Transaction, User
from app.schemas.schemas import BudgetCreate, BudgetResponse, BudgetUpdate
from app.middleware.auth_middleware import require_student

router = APIRouter(prefix="/budgets", tags=["Budgets"])


def _get_period_bounds(period: str, start_date: datetime | None = None):
    if period not in {"weekly", "monthly"}:
        raise HTTPException(status_code=400, detail="period must be either weekly or monthly")

    if start_date is None:
        start_date = datetime.utcnow()

    if period == "weekly":
        start = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59, microseconds=999999)
    else:
        start = start_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = (start.replace(year=start.year + (start.month // 12), month=((start.month % 12) + 1), day=1) - timedelta(microseconds=1))

    return start, end


def _serialize_budget(budget: Budget, db: Session) -> dict:
    start_date = budget.start_date or datetime.utcnow()
    start, end = _get_period_bounds(budget.period, start_date)

    spent_amount = (
        db.query(Transaction.amount)
        .filter(
            Transaction.user_id == budget.user_id,
            Transaction.category == budget.category,
            Transaction.is_deleted == False,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
        )
        .all()
    )
    spent_total = Decimal("0.00")
    for amount in spent_amount:
        raw_value = amount[0]
        if raw_value is None:
            continue
        spent_total += Decimal(str(raw_value))

    remaining_amount = Decimal(str(budget.limit_amount)) - spent_total
    is_over_limit = spent_total > Decimal(str(budget.limit_amount))

    def _fmt_amount(value: Decimal) -> Decimal:
        return value.quantize(Decimal("0.01"))

    return {
        "id": budget.id,
        "user_id": budget.user_id,
        "category": budget.category,
        "limit_amount": _fmt_amount(Decimal(str(budget.limit_amount))),
        "period": budget.period,
        "start_date": budget.start_date,
        "created_at": budget.created_at,
        "is_deleted": budget.is_deleted,
        "spent_amount": _fmt_amount(spent_total),
        "remaining_amount": _fmt_amount(remaining_amount),
        "is_over_limit": is_over_limit,
    }


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    if Decimal(str(budget_data.limit_amount)) <= 0:
        raise HTTPException(status_code=400, detail="limit_amount must be greater than 0")

    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.user_id,
            Budget.category == budget_data.category,
            Budget.period == budget_data.period,
            Budget.is_deleted == False,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Duplicate active budget for this user, category, and period")

    db_budget = Budget(
        user_id=current_user.user_id,
        category=budget_data.category,
        limit_amount=budget_data.limit_amount,
        period=budget_data.period,
        start_date=budget_data.start_date or datetime.utcnow(),
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return _serialize_budget(db_budget, db)


@router.get("/", response_model=List[BudgetResponse])
def list_budgets(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.user_id, Budget.is_deleted == False)
        .order_by(Budget.created_at.desc())
        .all()
    )
    return [_serialize_budget(budget, db) for budget in budgets]


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.user_id, Budget.is_deleted == False)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return _serialize_budget(budget, db)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_update: BudgetUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.user_id, Budget.is_deleted == False)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if budget_update.limit_amount is not None:
        if Decimal(str(budget_update.limit_amount)) <= 0:
            raise HTTPException(status_code=400, detail="limit_amount must be greater than 0")
        budget.limit_amount = budget_update.limit_amount

    if budget_update.period is not None:
        budget.period = budget_update.period

    db.commit()
    db.refresh(budget)
    return _serialize_budget(budget, db)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.user_id, Budget.is_deleted == False)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget.is_deleted = True
    db.commit()
    return None
