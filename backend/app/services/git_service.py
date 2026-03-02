"""
Git Service — Unique Feature
Detects the current Git branch for a given repository path.
Used to auto-link tasks to Git branches.
"""

import os
from typing import Optional

try:
    from git import Repo, InvalidGitRepositoryError
    GIT_AVAILABLE = True
except ImportError:
    GIT_AVAILABLE = False


def get_current_branch(repo_path: str = ".") -> Optional[str]:
    """Return the active git branch name for the given path."""
    if not GIT_AVAILABLE:
        return None
    try:
        repo = Repo(repo_path, search_parent_directories=True)
        return repo.active_branch.name
    except (InvalidGitRepositoryError, TypeError, Exception):
        return None


def get_repo_info(repo_path: str = ".") -> dict:
    """Return basic repo metadata: branch, last commit, remote URL."""
    if not GIT_AVAILABLE:
        return {}
    try:
        repo = Repo(repo_path, search_parent_directories=True)
        branch = repo.active_branch.name
        last_commit = repo.head.commit
        remote_url = repo.remotes[0].url if repo.remotes else None
        return {
            "branch": branch,
            "last_commit_hash": last_commit.hexsha[:8],
            "last_commit_message": last_commit.message.strip(),
            "remote_url": remote_url,
        }
    except Exception:
        return {}


def list_branches(repo_path: str = ".") -> list[str]:
    """Return all local branch names."""
    if not GIT_AVAILABLE:
        return []
    try:
        repo = Repo(repo_path, search_parent_directories=True)
        return [b.name for b in repo.branches]
    except Exception:
        return []
