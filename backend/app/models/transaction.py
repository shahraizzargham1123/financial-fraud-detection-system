from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    location = Column(String(128), nullable=False)
    merchant_type = Column(String(64), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_fraud = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    fraud_reasons = Column(Text, nullable=True)

    alert = relationship("FraudAlert", back_populates="transaction", uselist=False)
