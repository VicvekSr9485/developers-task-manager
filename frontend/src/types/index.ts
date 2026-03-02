// ─── Enums ──────────────────────────────────────────────────────────────────

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  BLOCKED = "blocked",
  IN_REVIEW = "in_review",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: User;
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  color: string;
  user_id: number;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  branch_name?: string | null;
  due_date?: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  branch_name?: string;
  due_date?: string;
  tag_ids?: number[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  branch_name?: string;
  due_date?: string;
  tag_ids?: number[];
}

export interface TaskListOut {
  items: Task[];
  total: number;
}

// ─── Time Logs ───────────────────────────────────────────────────────────────

export interface TimeLog {
  id: number;
  task_id: number;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
}

export interface TimeLogCreate {
  task_id: number;
}

// ─── Focus Sessions ──────────────────────────────────────────────────────────

export interface FocusSession {
  id: number;
  task_id: number;
  duration_minutes: number;
  completed: boolean;
  created_at: string;
}

export interface FocusSessionCreate {
  task_id: number;
  duration_minutes?: number;
}

// ─── Workspace Snapshots ─────────────────────────────────────────────────────

export interface WorkspaceSnapshot {
  id: number;
  task_id: number;
  snapshot_json: Record<string, unknown>;
  created_at: string;
}

export interface WorkspaceSnapshotCreate {
  task_id: number;
  snapshot_json: Record<string, unknown>;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface TaskFilterParams extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}
