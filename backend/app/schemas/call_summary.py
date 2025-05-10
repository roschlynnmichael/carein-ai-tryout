from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommlogBase(BaseModel):
    call_summary_id: int
    action: str
    message: Optional[str] = None

class CommlogCreate(CommlogBase):
    pass

class Commlog(CommlogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CallSummaryBase(BaseModel):
    transcript: str

class CallSummaryCreate(CallSummaryBase):
    pass

class CallSummaryUpdate(BaseModel):
    summary: str

class CallSummary(CallSummaryBase):
    id: int
    summary: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True