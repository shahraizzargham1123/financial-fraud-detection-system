from __future__ import annotations

import numpy as np
from datetime import datetime, timezone, timedelta
from typing import Optional
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


# Thresholds
HIGH_AMOUNT_THRESHOLD = 5000.0
RAPID_TX_WINDOW_SECONDS = 300   # 5 minutes
RAPID_TX_COUNT = 3
ZSCORE_THRESHOLD = 2.5
SPENDING_DEVIATION_MULTIPLIER = 3.0


@dataclass
class DetectionResult:
    risk_score: float = 0.0
    is_fraud: bool = False
    reasons: list[str] = field(default_factory=list)
    severity: str = "low"

    def add_reason(self, reason: str, score_delta: float) -> None:
        self.reasons.append(reason)
        self.risk_score = min(100.0, self.risk_score + score_delta)

    def finalize(self) -> None:
        self.is_fraud = self.risk_score >= 50.0
        if self.risk_score >= 80:
            self.severity = "critical"
        elif self.risk_score >= 65:
            self.severity = "high"
        elif self.risk_score >= 50:
            self.severity = "medium"
        else:
            self.severity = "low"


def _user_history(db: Session, user_id: str, limit: int = 100) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.timestamp.desc())
        .limit(limit)
        .all()
    )


# ── Layer 1: Rule-based checks ─────────────────────────────────────────────

def check_high_amount(amount: float, result: DetectionResult) -> None:
    if amount >= HIGH_AMOUNT_THRESHOLD:
        result.add_reason(f"High transaction amount (${amount:,.2f})", 30.0)
    elif amount >= HIGH_AMOUNT_THRESHOLD * 0.6:
        result.add_reason(f"Elevated transaction amount (${amount:,.2f})", 15.0)


def check_rapid_transactions(db: Session, user_id: str, current_ts: datetime, result: DetectionResult) -> None:
    window_start = current_ts - timedelta(seconds=RAPID_TX_WINDOW_SECONDS)
    recent = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.timestamp >= window_start,
        )
        .count()
    )
    if recent >= RAPID_TX_COUNT:
        result.add_reason(
            f"Rapid transactions: {recent} transactions in the last 5 minutes", 35.0
        )


def check_unusual_location(db: Session, user_id: str, location: str, result: DetectionResult) -> None:
    history = _user_history(db, user_id, limit=20)
    if not history:
        return
    recent_locations = {t.location for t in history[:5]}
    all_locations = {t.location for t in history}

    if location not in all_locations:
        result.add_reason(f"Never-seen location: {location}", 25.0)
    elif location not in recent_locations:
        result.add_reason(f"Unusual location (not used recently): {location}", 12.0)


# ── Layer 2: Statistical checks ────────────────────────────────────────────

def check_zscore(db: Session, user_id: str, amount: float, result: DetectionResult) -> None:
    history = _user_history(db, user_id, limit=50)
    if len(history) < 5:
        return

    amounts = np.array([t.amount for t in history], dtype=float)
    mean = amounts.mean()
    std = amounts.std()

    if std == 0:
        return

    z = abs((amount - mean) / std)
    if z >= ZSCORE_THRESHOLD:
        result.add_reason(
            f"Z-score anomaly: amount is {z:.1f} standard deviations from user mean (${mean:.2f})",
            min(30.0, z * 8),
        )


def check_spending_deviation(db: Session, user_id: str, amount: float, result: DetectionResult) -> None:
    history = _user_history(db, user_id, limit=30)
    if len(history) < 3:
        return

    amounts = np.array([t.amount for t in history], dtype=float)
    avg = amounts.mean()

    if avg == 0:
        return

    if amount >= avg * SPENDING_DEVIATION_MULTIPLIER:
        result.add_reason(
            f"Spending deviation: ${amount:.2f} is {amount / avg:.1f}x the user average (${avg:.2f})",
            20.0,
        )


# ── Layer 3: Orchestrator ──────────────────────────────────────────────────

def analyze_transaction(
    db: Session,
    user_id: str,
    amount: float,
    location: str,
    timestamp: Optional[datetime] = None,
) -> DetectionResult:
    ts = timestamp or datetime.now(timezone.utc)
    result = DetectionResult()

    # Rule-based
    check_high_amount(amount, result)
    check_rapid_transactions(db, user_id, ts, result)
    check_unusual_location(db, user_id, location, result)

    # Statistical
    check_zscore(db, user_id, amount, result)
    check_spending_deviation(db, user_id, amount, result)

    result.finalize()
    return result
