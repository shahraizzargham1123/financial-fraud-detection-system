from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.transaction import Transaction
from app.models.alert import FraudAlert

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Transaction.id)).scalar() or 0
    fraud_count = db.query(func.count(Transaction.id)).filter(Transaction.is_fraud == True).scalar() or 0
    avg_risk = db.query(func.avg(Transaction.risk_score)).scalar() or 0.0
    total_volume = db.query(func.sum(Transaction.amount)).scalar() or 0.0

    return {
        "total_transactions": total,
        "fraud_count": fraud_count,
        "normal_count": total - fraud_count,
        "fraud_rate": round((fraud_count / total * 100) if total > 0 else 0, 2),
        "avg_risk_score": round(float(avg_risk), 2),
        "total_volume": round(float(total_volume), 2),
    }


@router.get("/risk-distribution")
def risk_distribution(db: Session = Depends(get_db)):
    buckets = {"Low (0-49)": 0, "Medium (50-64)": 0, "High (65-79)": 0, "Critical (80-100)": 0}
    transactions = db.query(Transaction.risk_score).all()

    for (score,) in transactions:
        if score < 50:
            buckets["Low (0-49)"] += 1
        elif score < 65:
            buckets["Medium (50-64)"] += 1
        elif score < 80:
            buckets["High (65-79)"] += 1
        else:
            buckets["Critical (80-100)"] += 1

    return [{"range": k, "count": v} for k, v in buckets.items()]


@router.get("/merchant-breakdown")
def merchant_breakdown(db: Session = Depends(get_db)):
    rows = (
        db.query(Transaction.merchant_type, func.count(Transaction.id), func.sum(Transaction.amount))
        .group_by(Transaction.merchant_type)
        .all()
    )
    return [{"merchant_type": r[0], "count": r[1], "total_amount": round(r[2] or 0, 2)} for r in rows]


@router.get("/timeline")
def timeline(db: Session = Depends(get_db)):
    from sqlalchemy import cast, Date, Integer, case
    fraud_expr = func.sum(case((Transaction.is_fraud == True, 1), else_=0))
    rows = (
        db.query(
            cast(Transaction.timestamp, Date).label("date"),
            func.count(Transaction.id).label("total"),
            fraud_expr.label("fraud"),
        )
        .group_by(cast(Transaction.timestamp, Date))
        .order_by(cast(Transaction.timestamp, Date))
        .limit(30)
        .all()
    )
    return [{"date": str(r.date), "total": r.total, "fraud": int(r.fraud or 0)} for r in rows]
