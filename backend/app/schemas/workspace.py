from pydantic import BaseModel
from datetime import datetime
from typing import Any


class WorkspaceSnapshotCreate(BaseModel):
    task_id: int
    snapshot_json: dict[str, Any] = {}


class WorkspaceSnapshotOut(BaseModel):
    id: int
    task_id: int
    snapshot_json: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}
