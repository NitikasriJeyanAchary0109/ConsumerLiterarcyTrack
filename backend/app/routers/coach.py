"""
Coach Router — exposes the /coach HTTP endpoints through which students converse
with the AI Financial Coach; orchestrates Rule Engine context-building and delegates
natural-language generation entirely to the AI Engine.

Architecture contract
---------------------
- This router READS financial context (recent transactions, goals) via ORM queries
  or existing service functions. It does NOT write to Transactions, Budgets, Goals,
  or Savings tables.
- Numeric context (spending totals, budget headroom, goal progress %) is computed
  by rule_engine.py BEFORE the prompt is assembled — never inside the AI call.
- The assembled prompt is passed to ai_engine.py (or the transitional ai_service.py
  wrapper) which calls Ollama/Llama3 and returns plain-text coaching advice.
- Coaching conversation turns are persisted to the ChatHistory table.

Endpoints (planned)
-------------------
  POST /coach/chat       → free-form coaching chat with user context injected
  GET  /coach/history    → paginated chat history for the authenticated user

TODO: Confirm with Member 1 that ChatHistory model has `question` and `response`
      Text columns and a `created_at` timestamp (used in chat.py already).
"""

# Placeholder — router will be implemented in the next sprint.
# from fastapi import APIRouter
# router = APIRouter(prefix="/coach", tags=["AI Coach"])
