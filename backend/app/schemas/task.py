from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.task import TaskStatus, TaskPriority


class TagBase(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    branch_name: Optional[str] = None
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    branch_name: Optional[str] = None
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None


class TaskOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    branch_name: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    tags: List[TagBase] = []

    model_config = {"from_attributes": True}


class TaskListOut(BaseModel):
    items: List[TaskOut]
    total: int
