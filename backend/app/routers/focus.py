from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_db, get_current_user_id
from app.models.focus_session import FocusSession
from app.models.task import Task
from app.schemas.time_log import FocusSessionCreate, FocusSessionOut

router = APIRouter()


@router.post("/", response_model=FocusSessionOut, status_code=status.HTTP_201_CREATED)
async def create_focus_session(
    payload: FocusSessionCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task_result = await db.execute(select(Task).where(Task.id == payload.task_id, Task.user_id == user_id))
    if not task_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Task not found")

    session = FocusSession(task_id=payload.task_id, duration_minutes=payload.duration_minutes)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.patch("/{session_id}/complete", response_model=FocusSessionOut)
async def complete_focus_session(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Join to Task to verify the session belongs to the authenticated user
    result = await db.execute(
        select(FocusSession)
        .join(Task, Task.id == FocusSession.task_id)
        .where(FocusSession.id == session_id, Task.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Focus session not found")
    session.completed = True
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/task/{task_id}", response_model=list[FocusSessionOut])
async def get_task_focus_sessions(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task_result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if not task_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Task not found")

    result = await db.execute(
        select(FocusSession).where(FocusSession.task_id == task_id).order_by(FocusSession.created_at.desc())
    )
    return result.scalars().all()
