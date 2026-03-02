from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so Alembic can detect them
from app.models.user import User  # noqa: F401, E402
from app.models.task import Task  # noqa: F401, E402
from app.models.tag import Tag, TaskTag  # noqa: F401, E402
from app.models.time_log import TimeLog  # noqa: F401, E402
from app.models.focus_session import FocusSession  # noqa: F401, E402
from app.models.workspace import WorkspaceSnapshot  # noqa: F401, E402
