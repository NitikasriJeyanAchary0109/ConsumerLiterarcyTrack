"""
AI Engine — natural-language reasoning layer that wraps Ollama/Llama3 to *explain*
pre-computed numbers from the Rule Engine; never performs financial calculations itself.

Architecture contract
---------------------
- ONLY responsibility: send a fully-formed prompt string to the LLM and return
  the raw text response.
- NEVER compute round-ups, stress scores, budget deltas, or any numeric logic.
  All numbers this module receives must already be calculated by rule_engine.py.
- Delegates all HTTP I/O to the lower-level call_ai() function in ai_service.py.

Downstream consumers
--------------------
- routers/coach.py      → build_coach_prompt    → call_ai
- routers/negotiator.py → build_negotiator_prompt → call_ai
- routers/wellness.py   → build_stress_prompt   → call_ai
- services/rule_engine.py → build_explain_prompt → call_ai  (roundup explainer)
"""

# ---------------------------------------------------------------------------
# NOTE: Prompt-builder functions (build_coach_prompt, build_negotiator_prompt,
# build_stress_prompt, build_dream_engine_prompt, build_explain_prompt) are
# currently defined in services/ai_service.py and will be migrated here
# incrementally as each feature stabilises.
#
# TODO: Confirm with Member 1 whether a shared PromptHistory table (for audit)
#       should be written by this layer or by the individual routers.
# ---------------------------------------------------------------------------
