from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional

from app.core.deps import get_db, get_current_user_id
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.tag import Tag
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskListOut

router = APIRouter()


@router.get("/", response_model=TaskListOut)
async def list_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Task)
        .options(selectinload(Task.tags))
        .where(Task.user_id == user_id)
    )
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if search:
        query = query.where(Task.title.ilike(f"%{search}%"))

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    result = await db.execute(query.offset(skip).limit(limit).order_by(Task.updated_at.desc()))
    tasks = result.scalars().all()

    return TaskListOut(items=list(tasks), total=total)


@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task = Task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        branch_name=payload.branch_name,
        due_date=payload.due_date,
    )
    if payload.tag_ids:
        tags_result = await db.execute(
            select(Tag).where(Tag.id.in_(payload.tag_ids), Tag.user_id == user_id)
        )
        task.tags = list(tags_result.scalars().all())

    db.add(task)
    await db.commit()
    await db.refresh(task, ["tags"])
    return task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).options(selectinload(Task.tags)).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).options(selectinload(Task.tags)).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "tag_ids":
            if value is not None:
                tags_result = await db.execute(
                    select(Tag).where(Tag.id.in_(value), Tag.user_id == user_id)
                )
                task.tags = list(tags_result.scalars().all())
        else:
            setattr(task, field, value)

    await db.commit()
    await db.refresh(task, ["tags"])
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
