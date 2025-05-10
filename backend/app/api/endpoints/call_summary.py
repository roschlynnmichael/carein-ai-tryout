from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...models import call_summary as models, commlog as commlog_models
from ...schemas import call_summary as schemas
from ...services.openai_service import generate_summary

router = APIRouter()

@router.post("/summaries", response_model=schemas.CallSummary)
async def create_call_summary(
    summary: schemas.CallSummaryCreate,
    db: Session = Depends(get_db)
):
    # Await the async summary generation
    summary_text = await generate_summary(summary.transcript)
    db_summary = models.CallSummary(transcript=summary.transcript, summary=summary_text)
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)

    # Log to commlog on creation
    db_commlog_on_create = commlog_models.Commlog(
        call_summary_id=db_summary.id,
        action="created",
        message="Summary initially created and generated."
    )
    db.add(db_commlog_on_create)
    db.commit()

    return db_summary

@router.get("/summaries/", response_model=List[schemas.CallSummary])
def get_call_summaries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    summaries = db.query(models.CallSummary).offset(skip).limit(limit).all()
    return summaries

@router.get("/summaries/{summary_id}", response_model=schemas.CallSummary)
def get_call_summary(
    summary_id: int,
    db: Session = Depends(get_db)
):
    summary = db.query(models.CallSummary).filter(models.CallSummary.id == summary_id).first()
    if summary is None:
        raise HTTPException(status_code=404, detail="Call summary not found")
    return summary

@router.post("/summaries/{summary_id}/rerun", response_model=schemas.CallSummary)
async def rerun_summary(
    summary_id: int,
    db: Session = Depends(get_db)
):
    db_summary = db.query(models.CallSummary).filter(models.CallSummary.id == summary_id).first()
    if not db_summary:
        raise HTTPException(status_code=404, detail="Call summary not found")
    # Generate new summary
    summary_text = await generate_summary(db_summary.transcript)
    db_summary.summary = summary_text
    # db.commit() # Commit after adding commlog or at the end
    # db.refresh(db_summary) # Refresh after all commits

    # Log to commlog
    db_commlog_on_rerun = commlog_models.Commlog(
        call_summary_id=db_summary.id,
        action="rerun",
        message="Summary re-generated for transcript."
    )
    db.add(db_commlog_on_rerun)
    db.commit() # Commit both summary update and commlog
    db.refresh(db_summary) # Refresh summary object after all changes

    return db_summary