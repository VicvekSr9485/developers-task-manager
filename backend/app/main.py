from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.routers import tasks, auth, tags, timelogs, focus, workspaces


@asynccontextmanager
async def lifespan(app: FastAPI):
    # NOTE: In production, do NOT rely on create_all — run `alembic upgrade head` instead.
    # create_all is kept here only for rapid local development without Docker.
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="DevTaskr API",
    description="Developer Task Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(tags.router, prefix="/api/v1/tags", tags=["tags"])
app.include_router(timelogs.router, prefix="/api/v1/timelogs", tags=["timelogs"])
app.include_router(focus.router, prefix="/api/v1/focus", tags=["focus"])
app.include_router(workspaces.router, prefix="/api/v1/workspaces", tags=["workspaces"])


@app.get("/api/v1/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
