from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_db, get_current_user_id
from app.models.time_log import TimeLog
from app.models.task import Task
from app.schemas.time_log import TimeLogOut

router = APIRouter()


@router.get("/task/{task_id}", response_model=list[TimeLogOut])
async def get_task_timelogs(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task_result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if not task_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Task not found")

    result = await db.execute(
        select(TimeLog).where(TimeLog.task_id == task_id).order_by(TimeLog.started_at.desc())
    )
    return result.scalars().all()


@router.post("/start", response_model=TimeLogOut, status_code=status.HTTP_201_CREATED)
async def start_timer(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Start a time log. Started_at is always set server-side to prevent clock manipulation."""
    task_result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if not task_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Task not found")

    log = TimeLog(task_id=task_id, started_at=datetime.now(timezone.utc))
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.patch("/{log_id}/stop", response_model=TimeLogOut)
async def stop_timer(
    log_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Stop a time log. Ended_at is always set server-side."""
    # Join to Task to verify the log belongs to the authenticated user
    result = await db.execute(
        select(TimeLog)
        .join(Task, Task.id == TimeLog.task_id)
        .where(TimeLog.id == log_id, Task.user_id == user_id)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Time log not found")
    if log.ended_at is not None:
        raise HTTPException(status_code=400, detail="Timer already stopped")

    ended_at = datetime.now(timezone.utc)
    log.ended_at = ended_at
    log.duration_seconds = int((ended_at - log.started_at).total_seconds())
    await db.commit()
    await db.refresh(log)
    return log
