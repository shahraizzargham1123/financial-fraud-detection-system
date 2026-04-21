from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FraudAlertResponse(BaseModel):
    id: int
    transaction_id: int
    user_id: str
    risk_score: float
    reasons: str
    severity: str
    created_at: datetime

    model_config = {"from_attributes": True}
