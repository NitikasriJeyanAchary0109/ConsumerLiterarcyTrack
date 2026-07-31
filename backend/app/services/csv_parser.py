import io
import pandas as pd
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any

def parse_transactions_csv(csv_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Parses a bank statement CSV upload using Pandas.
    Cleans, normalizes headers, ensures standard columns, and handles data conversion.
    Expected columns: amount, category, description, transaction_date, source (optional)
    """
    # Read bytes into Pandas DataFrame
    csv_file = io.BytesIO(csv_bytes)
    df = pd.read_csv(csv_file)
    
    # Normalize column headers (strip spaces, make lowercase)
    df.columns = [col.strip().lower() for col in df.columns]
    
    # Required columns check
    required_cols = {"amount", "category", "description"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in CSV: {', '.join(missing)}")
        
    transactions = []
    
    for idx, row in df.iterrows():
        # Check and parse amount
        raw_amount = row["amount"]
        try:
            # Strip dollar signs, commas if any, and convert to Decimal
            amount_str = str(raw_amount).replace("$", "").replace(",", "").strip()
            amount = Decimal(amount_str)
        except (ValueError, InvalidOperation):
            # Skip invalid rows or raise an error
            continue

        # Check and parse transaction date
        raw_date = row.get("transaction_date", None)
        if pd.isna(raw_date) or not raw_date:
            transaction_date = datetime.utcnow()
        else:
            try:
                # Support common formats
                transaction_date = pd.to_datetime(raw_date).to_pydatetime()
            except Exception:
                transaction_date = datetime.utcnow()

        category = str(row["category"]).strip() if not pd.isna(row["category"]) else "Uncategorized"
        description = str(row["description"]).strip() if not pd.isna(row["description"]) else "Transaction"
        source = str(row.get("source", "checking")).strip()
        if pd.isna(source) or not source:
            source = "checking"

        transactions.append({
            "amount": amount,
            "category": category,
            "description": description,
            "transaction_date": transaction_date,
            "source": source
        })

    return transactions
