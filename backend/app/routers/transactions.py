from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
import datetime

from app.database import get_db
from app.models.models import Transaction, User, Goal, AuditLog
from app.schemas.schemas import TransactionResponse, TransactionCreate
from app.middleware.auth_middleware import get_current_user, require_student
from app.services.csv_parser import parse_transactions_csv
from app.services.rule_engine import apply_roundup_if_eligible

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=List[TransactionResponse])
def get_my_transactions(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Retrieves all transactions for the authenticated student."""
    return db.query(Transaction).filter(Transaction.user_id == current_user.user_id).order_by(Transaction.date.desc()).all()


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Creates a new transaction for the authenticated student.
    Triggers automated roundups and logs audits.
    """
    # Create the transaction
    db_transaction = Transaction(
        user_id=current_user.user_id,
        amount=transaction_data.amount,
        category=transaction_data.category,
        merchant=transaction_data.merchant or "Unknown Merchant",
        type=transaction_data.type or "debit",
        date=transaction_data.date or datetime.datetime.utcnow(),
        description=transaction_data.description
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # 1. Log transaction audit record (Transactions records AuditLogs)
    audit = AuditLog(
        trans_id=db_transaction.trans_id,
        action="create",
        performed_by=f"user_{current_user.user_id}",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    # Search for an active goal to deposit roundups
    active_goal = db.query(Goal).filter(
        Goal.user_id == current_user.user_id
    ).first()  # Let's find their first goal

    roundup_result = None
    if active_goal:
        simulated_checking_balance = Decimal("150.00")
        
        roundup_result = await apply_roundup_if_eligible(
            db=db,
            transaction=db_transaction,
            goal=active_goal,
            checking_balance=simulated_checking_balance
        )

    return {
        "transaction": {
            "trans_id": db_transaction.trans_id,
            "amount": db_transaction.amount,
            "category": db_transaction.category,
            "merchant": db_transaction.merchant,
            "type": db_transaction.type,
            "date": db_transaction.date,
            "description": db_transaction.description
        },
        "roundup_applied": roundup_result is not None and roundup_result.get("success", False),
        "roundup_details": roundup_result
    }


@router.post("/upload", response_model=dict)
async def upload_bank_statement(
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Uploads a CSV statement, parses transactions, and logs audit logs."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported."
        )

    try:
        content = await file.read()
        parsed_txs = parse_transactions_csv(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"CSV parsing error: {str(e)}"
        )

    inserted_count = 0
    roundup_count = 0
    total_roundup = Decimal("0.00")

    # Fetch active goal
    active_goal = db.query(Goal).filter(
        Goal.user_id == current_user.user_id
    ).first()

    for tx in parsed_txs:
        db_tx = Transaction(
            user_id=current_user.user_id,
            amount=tx["amount"],
            category=tx["category"],
            merchant=tx.get("merchant") or tx["description"],
            type=tx.get("type", "debit"),
            date=tx["transaction_date"],
            description=tx["description"]
        )
        db.add(db_tx)
        db.commit()
        db.refresh(db_tx)
        inserted_count += 1

        # 2. Log transaction audit record
        audit = AuditLog(
            trans_id=db_tx.trans_id,
            action="import_csv",
            performed_by=f"user_{current_user.user_id}",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        if active_goal:
            roundup_res = await apply_roundup_if_eligible(
                db=db,
                transaction=db_tx,
                goal=active_goal,
                checking_balance=Decimal("150.00")
            )
            if roundup_res.get("success"):
                roundup_count += 1
                total_roundup += roundup_res.get("roundup_amount", Decimal("0.00"))

    return {
        "success": True,
        "message": f"Successfully imported {inserted_count} transactions.",
        "roundups_triggered": roundup_count,
        "total_roundup_saved": total_roundup
    }
