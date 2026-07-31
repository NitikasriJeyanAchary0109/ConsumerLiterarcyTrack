from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, date

from app.database import get_db
from app.models.models import Goal, User, Savings
from app.schemas.schemas import GoalCreate, GoalResponse, GoalUpdate, GoalDetailResponse
from app.middleware.auth_middleware import get_current_user, require_student
from app.services.rule_engine import savings_velocity, goal_forecast

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("/", response_model=List[GoalResponse])
def get_goals(
    status: Optional[str] = Query(None, description="Filter by status (active/completed/abandoned)"),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get all savings goals for the current student."""
    query = db.query(Goal).filter(
        Goal.user_id == current_user.user_id,
        Goal.is_deleted == False
    )
    if status:
        query = query.filter(Goal.status == status)
    return query.all()

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Create a new savings goal."""
    if goal_data.target_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_amount must be greater than 0."
        )
    if goal_data.target_date and goal_data.target_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_date must be in the future."
        )

    db_goal = Goal(
        user_id=current_user.user_id,
        title=goal_data.title,
        target_amount=goal_data.target_amount,
        current_amount=0.00,
        target_date=goal_data.target_date,
        status="active"
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def compute_goal_details(goal: Goal, db: Session) -> dict:
    """Helper to compute progress and projection."""
    result = goal.__dict__.copy()
    
    # Progress percentage
    if goal.target_amount > 0:
        pct = float((goal.current_amount / goal.target_amount) * 100)
        result["progress_percentage"] = min(pct, 100.0)
    else:
        result["progress_percentage"] = 0.0

    # Projected completion date
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    past_savings = db.query(Savings.amount).filter(
        Savings.goal_id == goal.id,
        Savings.date >= thirty_days_ago
    ).all()
    
    savings_list = [s[0] for s in past_savings]
    velocity = savings_velocity(savings_list, 30)
    
    projected_date = goal_forecast(goal.target_amount, goal.current_amount, velocity)
    # goal_forecast returns date. We handle Sentinel GOAL_UNREACHABLE_DATE if velocity 0
    # The requirement asks to return it, we just pass the date object.
    
    # Ensure it's compatible with datetime.date
    if projected_date:
        result["projected_completion_date"] = projected_date
    else:
        result["projected_completion_date"] = None
        
    return result


@router.get("/{goal_id}", response_model=GoalDetailResponse)
def get_goal_by_id(
    goal_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Retrieve specific goal details with progress and projection."""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.user_id,
        Goal.is_deleted == False
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings goal not found."
        )
        
    return compute_goal_details(goal, db)


@router.put("/{goal_id}", response_model=GoalDetailResponse)
def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Update details of an existing goal."""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.user_id,
        Goal.is_deleted == False
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings goal not found."
        )

    if goal_update.target_amount is not None and goal_update.target_amount <= 0:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_amount must be greater than 0."
        )
        
    if goal_update.target_date and goal_update.target_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_date must be in the future."
        )

    # Apply updates
    update_data = goal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return compute_goal_details(goal, db)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    force: bool = False,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Delete a savings goal."""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.user_id,
        Goal.is_deleted == False
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings goal not found."
        )

    if goal.current_amount > 0:
        if not force:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete goal with saved funds unless force=true."
            )
        else:
            # Reallocate back to general Savings
            reallocation = Savings(
                user_id=goal.user_id,
                goal_id=None,
                amount=goal.current_amount,
                source="goal_reallocation",
                date=datetime.utcnow()
            )
            db.add(reallocation)
            goal.current_amount = 0

    goal.is_deleted = True
    goal.status = "abandoned"
    db.commit()
    return None
