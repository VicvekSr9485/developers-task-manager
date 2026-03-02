from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# TimeLogCreate is no longer exposed to clients; started_at is set server-side.
# Kept for internal/test use only.
class TimeLogCreate(BaseModel):
    task_id: int


class TimeLogOut(BaseModel):
    id: int
    task_id: int
    started_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: Optional[int]

    model_config = {"from_attributes": True}


class FocusSessionCreate(BaseModel):
    task_id: int
    duration_minutes: int = 25


class FocusSessionOut(BaseModel):
    id: int
    task_id: int
    duration_minutes: int
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
