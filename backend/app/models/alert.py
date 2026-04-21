from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db import Base


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False, unique=True)
    user_id = Column(String(64), index=True, nullable=False)
    risk_score = Column(Float, nullable=False)
    reasons = Column(Text, nullable=False)
    severity = Column(String(16), nullable=False)  # low / medium / high / critical
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    transaction = relationship("Transaction", back_populates="alert")
