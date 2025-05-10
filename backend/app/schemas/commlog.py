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
