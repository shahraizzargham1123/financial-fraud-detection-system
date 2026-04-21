from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TransactionCreate(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=64)
    amount: float = Field(..., gt=0)
    location: str = Field(..., min_length=1, max_length=128)
    merchant_type: str = Field(..., min_length=1, max_length=64)
    timestamp: Optional[datetime] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: str
    amount: float
    location: str
    merchant_type: str
    timestamp: datetime
    is_fraud: bool
    risk_score: float
    fraud_reasons: Optional[str]

    model_config = {"from_attributes": True}


class TransactionFilter(BaseModel):
    user_id: Optional[str] = None
    min_risk_score: Optional[float] = None
    max_risk_score: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_fraud: Optional[bool] = None
    limit: int = Field(default=100, le=500)
    offset: int = Field(default=0, ge=0)
