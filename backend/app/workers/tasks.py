from app.workers.celery_app import celery_app


@celery_app.task(name="tasks.notify_due_soon")
def notify_due_soon(task_id: int, user_email: str):
    """Placeholder: send email notification for tasks due within 24h."""
    print(f"[TASK] Notifying {user_email} about task {task_id} due soon")


@celery_app.task(name="tasks.auto_snapshot_cleanup")
def auto_snapshot_cleanup(task_id: int, keep_latest: int = 5):
    """Keep only the latest N workspace snapshots per task."""
    print(f"[TASK] Cleaning up snapshots for task {task_id}, keeping latest {keep_latest}")
