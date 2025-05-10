from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from ..database import Base

class Commlog(Base):
    __tablename__ = "commlog"
    id = Column(Integer, primary_key=True, index=True)
    call_summary_id = Column(Integer, ForeignKey("call_summaries.id"))
    action = Column(String, nullable=False)  # e.g., "created", "rerun"
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())