import httpx
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger("sparechange_ai")

async def call_ai(prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
    """
    Sends a query prompt to the local Ollama llama3 model.
    Throws a clear error state (HTTPException) to the caller if Ollama is unreachable.
    Does NOT contain mock/hardcoded fallback text strings.
    """
    url = settings.OLLAMA_URL
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("response", "").strip()
                if not response_text:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="AI model returned an empty response."
                    )
                return response_text
            else:
                logger.error(f"Ollama returned status {response.status_code}: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"AI model returned status code {response.status_code}."
                )
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Ollama connection failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Service (Ollama Llama3) is currently unreachable. Please verify server status."
        )


# ==========================================
# PROMPT TEMPLATES
# ==========================================

def build_coach_prompt(message: str, user_name: str, context: dict) -> str:
    return (
        f"[Context: Coach prompt for user {user_name}]\n"
        f"You are a helpful, encouraging financial coach for college students.\n"
        f"User message: '{message}'\n"
        f"User context: {context}\n"
        f"Provide a friendly, actionable response in plain language under 3 sentences."
    )

def build_negotiator_prompt(item_name: str, item_price: float, category: str, user_name: str, budget_context: dict) -> str:
    return (
        f"[Context: Purchase Negotiator for user {user_name}]\n"
        f"The student is considering buying '{item_name}' in category '{category}' costing ${item_price:.2f}.\n"
        f"Student budget summary: {budget_context}\n"
        f"Act as a realistic friend. Give a 3-sentence reality check on whether they should buy it or save it instead."
    )

def build_dream_engine_prompt(goal_title: str, target_amount: float, current_amount: float, monthly_contrib: float) -> str:
    return (
        f"[Context: Dream Engine Forecaster]\n"
        f"Student wants to reach goal '{goal_title}' of ${target_amount:.2f} (currently at ${current_amount:.2f}).\n"
        f"They plan to save ${monthly_contrib:.2f} per month.\n"
        f"Write a brief, motivational forecast on how they will achieve this, and how automated roundups speed up the timeline."
    )

def build_stress_prompt(recent_transactions: list, active_goals: list) -> str:
    return (
        f"[Context: Stress Meter / Financial Wellness]\n"
        f"Analyze this student's recent spending transactions: {recent_transactions}\n"
        f"And their active savings goals: {active_goals}\n"
        f"Provide a single brief paragraph assessing their current financial stress level (e.g. Low, Medium, High) and why."
    )

def build_explain_prompt(transaction_desc: str, transaction_amount: float, roundup_amount: float) -> str:
    return (
        f"[Context: Savings Explainer]\n"
        f"The student spent ${transaction_amount:.2f} on '{transaction_desc}'.\n"
        f"A roundup amount of ${roundup_amount:.2f} was successfully saved.\n"
        f"Explain in one sentence why this automated savings is beneficial for their long-term habit."
    )
