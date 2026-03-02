"""
Git router — exposes git_service helpers over HTTP.
Allows the frontend to detect the current branch for a given local repo path
and look up tasks linked to that branch.
"""

from fastapi import APIRouter, Depends, Query
from app.core.config import settings
from app.core.deps import get_current_user_id
from app.services.git_service import get_repo_info, list_branches, get_current_branch

router = APIRouter()


@router.get("/info")
async def repo_info(
    repo_path: str = Query(None, description="Path to the git repository (defaults to mounted project root)"),
    _: int = Depends(get_current_user_id),
):
    """
    Return metadata (branch, last commit, remote) for the project repo.
    """
    return get_repo_info(repo_path or settings.GIT_REPO_PATH)


@router.get("/branches")
async def local_branches(
    repo_path: str = Query(None, description="Path to the git repository"),
    _: int = Depends(get_current_user_id),
):
    """Return all local branch names."""
    branches = list_branches(repo_path or settings.GIT_REPO_PATH)
    return {"branches": branches}


@router.get("/current-branch")
async def current_branch(
    repo_path: str = Query(None, description="Path to the git repository"),
    _: int = Depends(get_current_user_id),
):
    """Return the currently active branch name."""
    branch = get_current_branch(repo_path or settings.GIT_REPO_PATH)
    return {"branch": branch}
