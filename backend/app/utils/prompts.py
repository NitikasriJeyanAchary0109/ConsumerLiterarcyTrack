"""
Prompts Utility — central repository for all LLM prompt-builder functions used
across the AI Engine, keeping natural-language templates out of business-logic
modules and making them easy to version, test, and localise independently.

Architecture contract
---------------------
- Every function in this module is a PURE function: takes typed Python values
  (str, float, list, dict) already computed by rule_engine.py, and returns a
  formatted prompt string.  No I/O, no DB access, no arithmetic.
- Functions MUST NOT compute financial values themselves.  If a number is needed
  in a prompt, the caller (router or ai_engine.py) is responsible for computing
  it via rule_engine.py BEFORE calling the builder.
- Naming convention: build_<feature>_prompt()  (matches existing ai_service.py names
  so they can be migrated here with zero call-site changes).

Functions planned for migration from services/ai_service.py
------------------------------------------------------------
  build_coach_prompt(message, user_name, context)
  build_negotiator_prompt(item_name, item_price, category, user_name, budget_context)
  build_dream_engine_prompt(goal_title, target_amount, current_amount, monthly_contrib)
  build_stress_prompt(recent_transactions, active_goals)
  build_explain_prompt(transaction_desc, transaction_amount, roundup_amount)

Migration plan
--------------
  1. Copy functions verbatim from ai_service.py into this file.
  2. Update ai_service.py imports to: from app.utils.prompts import build_*
  3. Remove originals from ai_service.py after all routers pass tests.

TODO: Confirm with Member 1 that there is no circular-import risk between
      utils/prompts.py → services/rule_engine.py (currently no dependency needed).
"""

# Placeholder — prompt builders will be migrated/extended in the next sprint.
