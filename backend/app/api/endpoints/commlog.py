from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...models import commlog as commlog_models
from ...schemas import commlog as commlog_schemas

router = APIRouter()

@router.get("/commlog/", response_model=List[commlog_schemas.Commlog])
def get_commlog_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve commlog entries.
    """
    commlog_entries = db.query(commlog_models.Commlog).order_by(commlog_models.Commlog.created_at.desc()).offset(skip).limit(limit).all()
    return commlog_entries

@router.get("/commlog/{call_summary_id}/", response_model=List[commlog_schemas.Commlog])
def get_commlog_entries_for_summary(
    call_summary_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve commlog entries for a specific call summary.
    """
    commlog_entries = (
        db.query(commlog_models.Commlog)
        .filter(commlog_models.Commlog.call_summary_id == call_summary_id)
        .order_by(commlog_models.Commlog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return commlog_entries