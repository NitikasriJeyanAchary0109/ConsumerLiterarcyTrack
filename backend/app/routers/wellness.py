"""
Wellness Router — exposes the /wellness HTTP endpoints for financial stress scoring
and wellbeing advisory reports; the Rule Engine computes the numeric score,
the AI Engine narrates the result in plain language.

Architecture contract
---------------------
- Stress / health scores are PURE MATH computed in rule_engine.py based on
  (total_spent, total_saved, transaction frequency, goal completion %).
  No random number generation and no LLM calls participate in the numeric score.
- The score and supporting data points are assembled into a prompt payload and
  forwarded to ai_engine.py, which asks Llama3 to produce the human-readable
  wellness summary stored in FinancialHealth.ai_summary.
- This router READS from Transaction and Goal tables only.  It WRITES only to
  FinancialHealth (the wellness cache table).

Endpoints (planned)
-------------------
  POST /wellness/score      → compute + narrate stress score for a given timeframe
  GET  /wellness/latest     → return the most recent cached FinancialHealth record

Supersedes
----------
  routers/stress.py — the existing stress router will be consolidated here once
  the Rule Engine score calculation is extracted from the endpoint handler into
  a dedicated rule_engine function (e.g. compute_stress_score).

TODO: Confirm with Member 1 that FinancialHealth has `health_score` (int),
      `stress_score` (int), `ai_summary` (Text), and `created_at` columns.
TODO: Confirm with Member 1 whether the random-score logic in stress.py should
      be replaced by the deterministic formula before this router goes live.
"""

# Placeholder — router will be implemented in the next sprint.
# from fastapi import APIRouter
# router = APIRouter(prefix="/wellness", tags=["Financial Wellness"])
