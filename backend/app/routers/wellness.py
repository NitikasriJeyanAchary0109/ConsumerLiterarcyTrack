from __future__ import annotations

import datetime
from decimal import Decimal
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import require_student
from app.models.models import Budget, FinancialHealth, Goal, Savings, Transaction, User
from app.services.ai_engine import AIEngineError, call_llama
from app.services.rule_engine import stress_score, savings_velocity
from app.utils.prompts import wellness_prompt
from app.schemas.schemas import FinancialHealthResponse, StressRequest

logger = logging.getLogger("sparechange_ai.wellness")

router = APIRouter(prefix="", tags=["Financial Wellness"])


def _calculate_wellness_metrics(db: Session, user_id: int, timeframe_days: int):
    # Time boundary
    time_limit = datetime.datetime.utcnow() - datetime.timedelta(days=timeframe_days)

    # 1. Fetch budgets
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.is_deleted == False)
        .all()
    )

    # 2. Fetch transactions within timeframe
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.is_deleted == False,
            Transaction.transaction_date >= time_limit,
        )
        .all()
    )

    # 3. Fetch savings velocity
    savings_records = db.query(Savings).filter(Savings.user_id == user_id).all()
    monthly_savings = savings_velocity(
        [Decimal(str(record.amount)) for record in savings_records],
        30,
    )

    # 4. Calculate spend velocity (total debits in timeframe)
    spend_velocity = sum((Decimal(str(tx.amount)) for tx in transactions if tx.type == "debit"), Decimal("0.00"))

    # 5. Calculate budget overruns
    budget_overruns = 0
    top_overspend_category = None
    max_overspend_amount = Decimal("0.00")

    for budget in budgets:
        # Sum category debits in timeframe
        spent = sum(
            (
                Decimal(str(tx.amount))
                for tx in transactions
                if tx.category == budget.category and tx.type == "debit"
            ),
            Decimal("0.00"),
        )
        if spent > Decimal(str(budget.limit_amount)):
            budget_overruns += 1
            overspend = spent - Decimal(str(budget.limit_amount))
            if overspend > max_overspend_amount:
                max_overspend_amount = overspend
                top_overspend_category = budget.category

    # Compute stress score (0-100)
    score = stress_score(monthly_savings, spend_velocity, budget_overruns)
    health_score = max(100 - score, 0)

    # Assemble reasons list
    reasons = []
    if monthly_savings == 0:
        reasons.append("Savings velocity is currently ₹0/month")
    elif monthly_savings < 1000:
        reasons.append("Low monthly savings velocity relative to spending")
    
    if budget_overruns > 0:
        reasons.append(f"Exceeded budget limit in {budget_overruns} category/categories")
    
    if spend_velocity > 15000:
        reasons.append("High overall spending volume detected this month")

    suggestions_context = {
        "monthly_savings": float(monthly_savings),
        "budget_overruns": budget_overruns,
    }
    if top_overspend_category:
        suggestions_context["top_overspend"] = top_overspend_category

    return score, health_score, reasons, suggestions_context


@router.get("/wellness/score", response_model=FinancialHealthResponse, status_code=status.HTTP_200_OK)
async def get_wellness_score(
    timeframe_days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Computes a deterministic stress score and triggers the AI engine to generate
    a personalized wellness narrative advice. Caches the result in the database.
    """
    score, health_score, reasons, suggestions_context = _calculate_wellness_metrics(
        db, current_user.user_id, timeframe_days
    )

    # Build wellness narration
    prompt = wellness_prompt(
        stress_score=score,
        reasons=reasons,
        suggestions_context=suggestions_context,
    )

    try:
        ai_summary = await call_llama(
            system_prompt="You are SpareChange AI, giving friendly, non-judgmental wellness insights.",
            user_prompt=prompt,
        )
    except AIEngineError as exc:
        logger.error("wellness.score | AIEngineError: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI wellness scanning is currently offline. Please try again in a moment.",
        ) from exc

    # Cache report in FinancialHealth table
    report = FinancialHealth(
        user_id=current_user.user_id,
        health_score=health_score,
        stress_score=score,
        ai_summary=ai_summary,
    )

from __future__ import annotations

import datetime
import json
import logging
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.models import (
    Budget,
    FinancialHealth,
    Savings,
    Transaction,
    User,
)
from app.services.ai_engine import AIEngineError, call_llama
from app.services.rule_engine import (
    budget_status as compute_budget_status,
    savings_velocity,
    stress_score,
)
from app.utils.prompts import wellness_prompt

logger = logging.getLogger("sparechange_ai.wellness")

router = APIRouter(prefix="/wellness", tags=["Financial Wellness"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
_TX_LOOKBACK_DAYS    = 30   # days of transactions to include in spend velocity
_SAVINGS_LOOKBACK    = 60   # max Savings rows for velocity (covers ~2 months)
_HEALTHY_HEALTH_SCORE = 100  # placeholder health_score (rule for it TBD with M1)


# ---------------------------------------------------------------------------
# Pydantic response model
# ---------------------------------------------------------------------------

class WellnessScoreResponse(BaseModel):
    """
    Response for GET /wellness/score.

    ai_summary and suggestions are None when the AI Engine is unavailable.
    ai_unavailable=True signals the client to show a graceful fallback message.
    """
    score:          int   = Field(..., ge=0, le=100,
                                  description="Financial stress score 0-100. Higher = more stressed.")
    reasons:        List[str] = Field(...,
                                      description="Main factors driving the stress score.")
    ai_summary:     Optional[str]        = Field(None,
                                                  description="LLM-generated explanation. Null if AI unavailable.")
    suggestions:    Optional[List[str]]  = Field(None,
                                                  description="2-3 actionable suggestions. Null if AI unavailable.")
    ai_unavailable: bool  = Field(False,
                                  description="True when the AI layer failed; score/reasons are still valid.")
    report_id:      Optional[int] = Field(None,
                                          description="ID of the FinancialHealth record created.")


# Resolve forward references for Pydantic v2
WellnessScoreResponse.model_rebuild()


# ---------------------------------------------------------------------------
# Helper — derive stress reasons from raw numbers (pure, no LLM)
# ---------------------------------------------------------------------------

def _derive_reasons(
    savings_rate: Decimal,
    spend_velocity: Decimal,
    budget_overruns: int,
    score: int,
) -> list[str]:
    """
    Return a list of 1-3 short plain-English strings naming the main stress
    drivers, based on the same inputs passed to rule_engine.stress_score().

    These strings feed directly into wellness_prompt() as the `reasons` arg.
    Pure function — no DB or LLM calls.
    """
    HEALTHY_SAVINGS = Decimal("3000")
    COMFORTABLE_SPEND = Decimal("15000")

    reasons: list[str] = []

    if savings_rate < HEALTHY_SAVINGS:
        if savings_rate == Decimal("0"):
            reasons.append("No savings recorded this month")
        else:
            shortfall = HEALTHY_SAVINGS - savings_rate
            reasons.append(
                f"Monthly savings (₹{savings_rate:.0f}) is ₹{shortfall:.0f} "
                f"below the ₹{HEALTHY_SAVINGS:.0f}/month healthy benchmark"
            )

    if spend_velocity > COMFORTABLE_SPEND:
        excess = spend_velocity - COMFORTABLE_SPEND
        reasons.append(
            f"Monthly spending (₹{spend_velocity:.0f}) exceeds comfortable "
            f"cap by ₹{excess:.0f}"
        )
    elif spend_velocity > Decimal("0"):
        pct = int((spend_velocity / COMFORTABLE_SPEND * 100).quantize(Decimal("1")))
        if pct >= 70:
            reasons.append(
                f"Monthly spending (₹{spend_velocity:.0f}) is at {pct}% of "
                "comfortable cap — approaching the limit"
            )

    if budget_overruns == 1:
        reasons.append("1 budget category exceeded this month")
    elif budget_overruns > 1:
        reasons.append(f"{budget_overruns} budget categories exceeded this month")

    # Fallback if all metrics look fine (low score)
    if not reasons:
        reasons.append("Spending and savings are within healthy ranges")

    return reasons


# ---------------------------------------------------------------------------
# Helper — load context and compute stress inputs (read-only ORM)
# ---------------------------------------------------------------------------

def _compute_stress_inputs(
    user_id: int,
    db: Session,
) -> tuple[Decimal, Decimal, int, dict]:
    """
    Fetch and compute the three inputs for rule_engine.stress_score().

    Returns:
        (savings_rate, spend_velocity, budget_overruns, suggestions_context)

    All DB queries are read-only. No writes in this function.
    """
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=_TX_LOOKBACK_DAYS)

    # --- Spend velocity: sum of debit transactions in last 30 days ---
    tx_rows = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type    == "debit",
            Transaction.date    >= cutoff,
        )
        .all()
    )
    total_spend = sum((Decimal(str(t.amount)) for t in tx_rows), Decimal("0"))
    spend_velocity = total_spend  # already a 30-day sum, equivalent to monthly

    # --- Savings velocity: from last N Savings rows ---
    savings_rows = (
        db.query(Savings)
        .filter(Savings.user_id == user_id)
        .order_by(Savings.date.desc())          # type: ignore[attr-defined]
        .limit(_SAVINGS_LOOKBACK)
        .all()
    )
    amounts = [Decimal(str(s.amount)) for s in savings_rows]
    savings_rate = savings_velocity(amounts, period_days=_TX_LOOKBACK_DAYS)

    # --- Budget overruns: count categories exceeded in latest FinancialHealth ---
    latest_report: Optional[FinancialHealth] = (
        db.query(FinancialHealth)
        .filter(FinancialHealth.user_id == user_id)
        .order_by(FinancialHealth.created_at.desc())  # type: ignore[attr-defined]
        .first()
    )

    budget_overruns = 0
    top_overspend_category: Optional[str] = None

    if latest_report:
        budget_rows = (
            db.query(Budget)
            .filter(Budget.report_id == latest_report.report_id)
            .all()
        )
        worst_excess = Decimal("0")
        for b in budget_rows:
            limit   = Decimal(str(b.limit_amount))
            spent_d = Decimal(str(b.spent))
            if limit > Decimal("0"):
                try:
                    status_val = compute_budget_status(limit, spent_d)
                except ValueError:
                    status_val = "safe"
                if status_val == "exceeded":
                    budget_overruns += 1
                    excess = spent_d - limit
                    if excess > worst_excess:
                        worst_excess = excess
                        top_overspend_category = b.category

    # Build suggestions_context dict for wellness_prompt()
    suggestions_context: dict = {
        "monthly_savings": float(savings_rate),
        "monthly_spend":   float(spend_velocity),
    }
    if budget_overruns > 0:
        suggestions_context["budget_overruns"] = budget_overruns
    if top_overspend_category:
        suggestions_context["top_overspend"] = top_overspend_category

    return savings_rate, spend_velocity, budget_overruns, suggestions_context


# ---------------------------------------------------------------------------
# Helper — parse AI response into summary + suggestions list
# ---------------------------------------------------------------------------

def _parse_ai_response(ai_text: str) -> tuple[str, list[str]]:
    """
    Split the LLM response into a narrative summary and a list of suggestions.

    Convention: if the model returns numbered suggestions (1. / 2. / 3.) we
    extract them; otherwise the entire text is the summary with an empty list.
    The router always prompts for a format with numbered suggestions so this
    is the expected happy path.
    """
    import re
    lines = ai_text.strip().splitlines()
    summary_lines: list[str] = []
    suggestions:   list[str] = []

    for line in lines:
        # Match "1." / "2)" / "- " suggestion prefixes
        m = re.match(r"^\s*(?:\d+[.)]\s*|[-•]\s+)(.*)", line)
        if m and len(suggestions) < 3:
            suggestion = m.group(1).strip()
            if suggestion:
                suggestions.append(suggestion)
        else:
            summary_lines.append(line)

    summary = "\n".join(l for l in summary_lines if l.strip()).strip()
    if not summary:
        summary = ai_text.strip()
    return summary, suggestions


# ---------------------------------------------------------------------------
# GET /api/wellness/score
# ---------------------------------------------------------------------------

@router.get(
    "/score",
    response_model=WellnessScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Financial Wellness Score",
    description=(
        "Computes the user's current financial stress score (0-100) using "
        "deterministic rule-engine math, persists it to FinancialHealth, "
        "then asks the AI to explain it in plain language with 2-3 suggestions. "
        "If the AI layer is unavailable, the score and reasons are still returned "
        "with ai_unavailable=true."
    ),
)
async def get_wellness_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WellnessScoreResponse:
    """
    Flow
    ----
    1. Rule Engine — compute savings_rate, spend_velocity, budget_overruns.
    2. Rule Engine — stress_score() → int 0-100.
    3. Derive reasons list from the same inputs (pure helper, no LLM).
    4. Persist FinancialHealth row (always — before AI call).
    5. Prompt builder — wellness_prompt() with score, reasons, context.
    6. AI Engine — call_llama(). On AIEngineError: degrade gracefully.
    7. Parse AI response → summary + suggestions list.
    8. Return WellnessScoreResponse (ai_unavailable=True if step 6 failed).
    """
    uid = current_user.user_id
    logger.info("wellness.score | user_id=%d — computing stress inputs", uid)

    # ── 1 & 2: Rule Engine ────────────────────────────────────────────────
    savings_rate, spend_velocity, budget_overruns, suggestions_ctx = (
        _compute_stress_inputs(uid, db)
    )
    score = stress_score(savings_rate, spend_velocity, budget_overruns)

    # ── 3: Derive reasons ─────────────────────────────────────────────────
    reasons = _derive_reasons(savings_rate, spend_velocity, budget_overruns, score)

    logger.info(
        "wellness.score | user_id=%d score=%d reasons=%r",
        uid, score, reasons,
    )

    # ── 4: Persist FinancialHealth (before AI — always written) ──────────
    # TODO: confirm with Member 1 — `reasons` JSON column not yet in model.
    # Encoding reasons into ai_summary prefix until column is added.
    reasons_prefix = "REASONS: " + " | ".join(reasons) + "\n\n"

    report = FinancialHealth(
        user_id=uid,
        health_score=_HEALTHY_HEALTH_SCORE,   # TODO: replace when health_score formula is defined
        stress_score=score,
        ai_summary=reasons_prefix,            # will be updated below if AI succeeds
        created_at=datetime.datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report


@router.post("/wellness/score", response_model=FinancialHealthResponse, status_code=status.HTTP_200_OK)
async def generate_wellness_score_post(
    request: StressRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    POST-equivalent endpoint for wellness analysis, supporting JSON-based timeframe configuration.
    """
    return await get_wellness_score(
        timeframe_days=request.timeframe_days,
        current_user=current_user,
        db=db,
    )


@router.post("/stress/", response_model=FinancialHealthResponse, status_code=status.HTTP_200_OK, deprecated=True)
async def generate_stress_meter_post_compat(
    request: StressRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    POST compatibility endpoint for stress analysis.
    """
    return await get_wellness_score(
        timeframe_days=request.timeframe_days,
        current_user=current_user,
        db=db,
    )


@router.get("/wellness/latest", response_model=FinancialHealthResponse, status_code=status.HTTP_200_OK)
def get_latest_wellness_report(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """
    Retrieves the most recent cached financial health/stress report for the authenticated user.
    """
    report = (
        db.query(FinancialHealth)
        .filter(FinancialHealth.user_id == current_user.user_id)
        .order_by(FinancialHealth.created_at.desc())
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No financial wellness report has been generated yet for this user.",
        )
    return report
    logger.info(
        "wellness.score | user_id=%d report_id=%d — FinancialHealth saved",
        uid, report.report_id,
    )

    # ── 5: Build prompt ───────────────────────────────────────────────────
    prompt = wellness_prompt(
        stress_score=score,
        reasons=reasons,
        suggestions_context=suggestions_ctx,
    )

    # ── 6: LLM call (graceful degradation on failure) ─────────────────────
    ai_text: Optional[str] = None
    ai_unavailable = False

    try:
        ai_text = await call_llama(
            system_prompt=(
                "You are SpareChange AI. Explain a college student's financial "
                "stress score in plain, friendly language. This is a FINANCIAL "
                "wellness score — do not use clinical or medical language. "
                "Give 2-3 specific, actionable suggestions numbered 1. 2. 3. "
                "Keep the total response under 120 words."
            ),
            user_prompt=prompt,
        )
    except AIEngineError as exc:
        ai_unavailable = True
        logger.warning(
            "wellness.score | user_id=%d | AIEngineError (degrading gracefully): %s",
            uid, exc.message,
        )

    # ── 7: Parse AI text → summary + suggestions ─────────────────────────
    ai_summary: Optional[str]       = None
    parsed_suggestions: Optional[list[str]] = None

    if ai_text:
        ai_summary, parsed_suggestions = _parse_ai_response(ai_text)
        if not parsed_suggestions:
            parsed_suggestions = None   # keep as null rather than []

        # Update the persisted FinancialHealth row with the full AI text
        report.ai_summary = reasons_prefix + (ai_summary or ai_text)
        db.commit()

    # ── 8: Return ─────────────────────────────────────────────────────────
    return WellnessScoreResponse(
        score=score,
        reasons=reasons,
        ai_summary=ai_summary,
        suggestions=parsed_suggestions,
        ai_unavailable=ai_unavailable,
        report_id=report.report_id,
    )
