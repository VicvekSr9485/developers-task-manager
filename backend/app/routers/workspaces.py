from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_db, get_current_user_id
from app.models.workspace import WorkspaceSnapshot
from app.models.task import Task
from app.schemas.workspace import WorkspaceSnapshotCreate, WorkspaceSnapshotOut

router = APIRouter()


@router.get("/task/{task_id}/latest", response_model=WorkspaceSnapshotOut)
async def get_latest_snapshot(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task_result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    if not task_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Task not found")

    result = await db.execute(
        select(WorkspaceSnapshot)
        .where(WorkspaceSnapshot.task_id == task_id)
        .order_by(WorkspaceSnapshot.created_at.desc())
        .limit(1)
    )
    snapshot = result.scalar_one_or_none()
    if not snapshot:
        raise HTTPException(status_code=404, detail="No snapshot found for this task")
    return snapshot


@router.post("/", response_model=WorkspaceSnapshotOut, status_code=status.HTTP_201_CREATED)
async def save_snapshot(
    payload: WorkspaceSnapshotCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task_result = await db.execute(select(Task).where(Task.id == payload.task_id, Task.user_id == user_id))
    if not task_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Task not found")

    snapshot = WorkspaceSnapshot(task_id=payload.task_id, snapshot_json=payload.snapshot_json)
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return snapshot
