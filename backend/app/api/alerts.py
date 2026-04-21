from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db import get_db
from app.models.alert import FraudAlert
from app.schemas.alert import FraudAlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[FraudAlertResponse])
def list_alerts(
    user_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    q = db.query(FraudAlert)
    if user_id:
        q = q.filter(FraudAlert.user_id == user_id)
    if severity:
        q = q.filter(FraudAlert.severity == severity)
    return q.order_by(FraudAlert.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/count")
def alert_counts(db: Session = Depends(get_db)):
    from sqlalchemy import func
    rows = (
        db.query(FraudAlert.severity, func.count(FraudAlert.id))
        .group_by(FraudAlert.severity)
        .all()
    )
    return {severity: count for severity, count in rows}
