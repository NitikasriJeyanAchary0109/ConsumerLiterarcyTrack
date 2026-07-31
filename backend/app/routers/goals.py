from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Goal, User
from app.schemas.schemas import GoalCreate, GoalResponse, GoalUpdate
from app.middleware.auth_middleware import get_current_user, require_student

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("/", response_model=List[GoalResponse])
def get_goals(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get all savings goals for the current student."""
    return db.query(Goal).filter(Goal.user_id == current_user.user_id).all()


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Create a new savings goal."""
    db_goal = Goal(
        user_id=current_user.user_id,
        goal_name=goal_data.goal_name,
        target=goal_data.target,
        saved=0.00,
        deadline=goal_data.deadline
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal_by_id(
    goal_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Retrieve specific goal details."""
    goal = db.query(Goal).filter(
        Goal.goal_id == goal_id,
        Goal.user_id == current_user.user_id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings goal not found."
        )
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Update details of an existing goal (e.g. goal_name, target, saved)."""
    goal = db.query(Goal).filter(
        Goal.goal_id == goal_id,
        Goal.user_id == current_user.user_id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings goal not found."
        )

    # Apply updates
    update_data = goal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Delete a savings goal."""
    goal = db.query(Goal).filter(
        Goal.goal_id == goal_id,
        Goal.user_id == current_user.user_id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Savings goal not found."
        )

    db.delete(goal)
    db.commit()
    return None
