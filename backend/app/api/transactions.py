from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from app.db import get_db
from app.models.transaction import Transaction
from app.models.alert import FraudAlert
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.schemas.alert import FraudAlertResponse
from app.engine.detector import analyze_transaction
from app.api.websocket import broadcast

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionResponse)
async def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    ts = payload.timestamp or datetime.now(timezone.utc)

    result = analyze_transaction(
        db=db,
        user_id=payload.user_id,
        amount=payload.amount,
        location=payload.location,
        timestamp=ts,
    )

    tx = Transaction(
        user_id=payload.user_id,
        amount=payload.amount,
        location=payload.location,
        merchant_type=payload.merchant_type,
        timestamp=ts,
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

    db.commit()
    db.refresh(tx)

    await broadcast(
        {
            "event": "transaction",
            "data": {
                "id": tx.id,
                "user_id": tx.user_id,
                "amount": tx.amount,
                "is_fraud": tx.is_fraud,
                "risk_score": tx.risk_score,
                "severity": result.severity if result.is_fraud else "low",
            },
        }
    )

    return tx


@router.get("/", response_model=list[TransactionResponse])
def list_transactions(
    user_id: Optional[str] = Query(None),
    min_risk_score: Optional[float] = Query(None, ge=0, le=100),
    max_risk_score: Optional[float] = Query(None, ge=0, le=100),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    is_fraud: Optional[bool] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    q = db.query(Transaction)

    if user_id:
        q = q.filter(Transaction.user_id == user_id)
    if min_risk_score is not None:
        q = q.filter(Transaction.risk_score >= min_risk_score)
    if max_risk_score is not None:
        q = q.filter(Transaction.risk_score <= max_risk_score)
    if start_date:
        q = q.filter(Transaction.timestamp >= start_date)
    if end_date:
        q = q.filter(Transaction.timestamp <= end_date)
    if is_fraud is not None:
        q = q.filter(Transaction.is_fraud == is_fraud)

    return q.order_by(Transaction.timestamp.desc()).offset(offset).limit(limit).all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
