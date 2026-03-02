"""
Workspace Service — Unique Feature
Manages developer workspace snapshots: open files, notes, terminal history.
Saves and restores context when a developer switches tasks.
"""

import json
from typing import Any


def build_snapshot(
    open_files: list[str] | None = None,
    notes: str | None = None,
    terminal_commands: list[str] | None = None,
    cursor_positions: dict[str, int] | None = None,
    active_branch: str | None = None,
) -> dict[str, Any]:
    """Build a workspace snapshot payload to be stored in the DB."""
    return {
        "open_files": open_files or [],
        "notes": notes or "",
        "terminal_commands": terminal_commands or [],
        "cursor_positions": cursor_positions or {},
        "active_branch": active_branch,
    }


def serialize_snapshot(snapshot: dict) -> str:
    return json.dumps(snapshot, default=str)


def deserialize_snapshot(raw: str) -> dict:
    return json.loads(raw)
