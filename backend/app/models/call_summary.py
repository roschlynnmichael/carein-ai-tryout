from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base

class CallSummary(Base):
    __tablename__ = "call_summaries"

    id = Column(Integer, primary_key = True, index = True)
    transcript = Column(Text, nullable = False)
    summary = Column(Text, nullable = True)
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    updated_at = Column(DateTime(timezone = True), onupdate = func.now())