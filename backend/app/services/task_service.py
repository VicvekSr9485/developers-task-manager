"""
Task Service — Business logic layer for task operations.
Keeps routers thin and logic testable.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.task import Task, TaskStatus


async def get_task_stats(user_id: int, db: AsyncSession) -> dict:
    """Return count of tasks per status for the dashboard."""
    result = await db.execute(
        select(Task.status, func.count(Task.id))
        .where(Task.user_id == user_id)
        .group_by(Task.status)
    )
    rows = result.all()
    stats = {status.value: 0 for status in TaskStatus}
    for row_status, count in rows:
        stats[row_status.value] = count
    return stats


async def get_tasks_by_branch(branch_name: str, user_id: int, db: AsyncSession) -> list[Task]:
    """Find all tasks linked to a git branch."""
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.tags))
        .where(Task.branch_name == branch_name, Task.user_id == user_id)
    )
    return result.scalars().all()
