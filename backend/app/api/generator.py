import random
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.transaction import Transaction
from app.models.alert import FraudAlert
from app.engine.detector import analyze_transaction

router = APIRouter(prefix="/generator", tags=["generator"])

USERS = [f"user_{i:03d}" for i in range(1, 21)]
LOCATIONS = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "London", "Paris", "Dubai", "Tokyo", "Sydney",
    "Berlin", "Toronto", "Singapore", "Mumbai", "São Paulo",
]
MERCHANT_TYPES = [
    "grocery", "electronics", "restaurant", "gas_station", "online_retail",
    "atm_withdrawal", "travel", "entertainment", "healthcare", "utilities",
]


def _make_transaction(user_id: str, fraudulent: bool = False) -> dict:
    now = datetime.now(timezone.utc)

    if fraudulent:
        fraud_type = random.choice(["high_amount", "unusual_location", "rapid"])
        amount = random.uniform(5000, 15000) if fraud_type == "high_amount" else random.uniform(10, 500)
        location = random.choice(LOCATIONS[-5:])  # exotic locations
        timestamp = now - timedelta(seconds=random.randint(0, 60))
    else:
        amount = random.uniform(5, 1500)
        location = random.choice(LOCATIONS[:8])
        timestamp = now - timedelta(hours=random.randint(0, 72))

    return {
        "user_id": user_id,
        "amount": round(amount, 2),
        "location": location,
        "merchant_type": random.choice(MERCHANT_TYPES),
        "timestamp": timestamp,
    }


@router.post("/seed")
def seed_transactions(
    count: int = Query(default=50, ge=1, le=500),
    fraud_ratio: float = Query(default=0.15, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
):
    created = 0
    fraud_created = 0

    for _ in range(count):
        user_id = random.choice(USERS)
        is_intended_fraud = random.random() < fraud_ratio
        data = _make_transaction(user_id, fraudulent=is_intended_fraud)

        result = analyze_transaction(
            db=db,
            user_id=data["user_id"],
            amount=data["amount"],
            location=data["location"],
            timestamp=data["timestamp"],
        )

        tx = Transaction(
            user_id=data["user_id"],
            amount=data["amount"],
            location=data["location"],
            merchant_type=data["merchant_type"],
            timestamp=data["timestamp"],
            is_fraud=result.is_fraud,
            risk_score=round(result.risk_score, 2),
            fraud_reasons="; ".join(result.reasons) if result.reasons else None,
        )
        db.add(tx)
        db.flush()

        if result.is_fraud:
            alert = FraudAlert(
                transaction_id=tx.id,
                user_id=tx.user_id,
                risk_score=tx.risk_score,
                reasons=tx.fraud_reasons or "",
                severity=result.severity,
            )
            db.add(alert)
            fraud_created += 1

        created += 1

    db.commit()

    return {
        "message": f"Seeded {created} transactions",
        "fraud_flagged": fraud_created,
        "normal": created - fraud_created,
    }
