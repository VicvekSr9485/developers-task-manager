# DevTaskr — Comprehensive Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [System Requirements](#4-system-requirements)
5. [Installation & Setup](#5-installation--setup)
6. [Environment Variables](#6-environment-variables)
7. [Running the Application](#7-running-the-application)
8. [User Flows](#8-user-flows)
9. [Feature Reference](#9-feature-reference)
10. [API Reference](#10-api-reference)
11. [Data Models](#11-data-models)
12. [Frontend Structure](#12-frontend-structure)
13. [Backend Structure](#13-backend-structure)
14. [Docker Services](#14-docker-services)
15. [Git Branch Integration](#15-git-branch-integration)
16. [Security Considerations](#16-security-considerations)
17. [Database Migrations](#17-database-migrations)
18. [Development Guide](#18-development-guide)
19. [Deployment Considerations](#19-deployment-considerations)
20. [Known Limitations & Future Work](#20-known-limitations--future-work)

---

## 1. Overview

**DevTaskr** is a task management system designed specifically for software developers. It goes beyond basic to-do lists by integrating developer-centric features: git branch linking, Pomodoro-based focus sessions, time logging, and workspace snapshots that capture context (open files, terminal commands, notes) per task.

### Core Problem It Solves

Context switching is expensive for developers. When an urgent bug interrupts deep work, switching back restores code state (via git) but loses _mental_ context — which files were open, what commands were being run, where the thinking was. DevTaskr captures and restores that context.

### Unique Features

| Feature | Description |
|---|---|
| **Git Branch Linking** | Each task can be associated with a git branch name. The app can auto-detect the active branch in the local repo. |
| **Workspace Snapshots** | Save open files, terminal commands, active branch, and notes against a task. Restore context on return. |
| **Pomodoro Focus Timer** | Built-in 25-minute countdown timer. Sessions are persisted and counted per task. |
| **Time Logging** | Server-side start/stop timer. Duration is calculated server-side (tamper-proof). Bar chart of sessions per task. |
| **Kanban Board** | Drag-and-drop board across five status columns. |
| **Tag System** | Colour-coded labels with full CRUD management. Applied to tasks via a multi-select pill picker. |

---

## 2. Architecture

```
┌─────────────┐     port 80      ┌─────────────────────────────────────┐
│   Browser   │ ───────────────► │             Nginx (reverse proxy)    │
└─────────────┘                  │  /api/* → backend:8000               │
                                 │  /*     → frontend:3000              │
                                 └──────────────┬──────────────────────┘
                                                │
                    ┌───────────────────────────┼──────────────────────┐
                    │                           │                      │
             ┌──────▼──────┐           ┌────────▼──────┐    ┌─────────▼────────┐
             │  Next.js 16  │           │  FastAPI 0.110 │    │  Celery Worker   │
             │  (React 19)  │           │  (Python 3.12) │    │  (async tasks)   │
             │  port 3000   │           │  port 8000     │    │                  │
             └─────────────┘           └───────┬────────┘    └─────────┬────────┘
                                               │                       │
                                    ┌──────────┼───────────────────────┘
                                    │          │
                             ┌──────▼───┐  ┌───▼──────┐
                             │PostgreSQL│  │  Redis   │
                             │port 5432 │  │port 6379 │
                             └──────────┘  └──────────┘
```

### Request Flow

1. All traffic enters via **Nginx** on port 80.
2. Requests to `/api/*` and `/docs` are proxied to the **FastAPI** backend.
3. All other requests go to the **Next.js** frontend.
4. The frontend communicates with the backend API exclusively through the `/api/v1/` prefix.
5. Background tasks (cleanup, notifications) are dispatched to **Celery** via **Redis**.
6. FastAPI reads and writes to **PostgreSQL** using async SQLAlchemy.

---

## 3. Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | App Router, SSR/CSR framework |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| TailwindCSS | 3.4 | Utility-first styling |
| TanStack Query | v5 | Server state, caching, mutations |
| Zustand | 4 | Client state (auth token, user) |
| React Hook Form | 7 | Form state management |
| Zod | 3 | Schema validation |
| @dnd-kit | 6/8 | Drag-and-drop Kanban |
| Recharts | 3.7 | Time log bar charts |
| Axios | 1.7 | HTTP client with interceptors |
| next-themes | 0.4.6 | Dark/light mode |
| Lucide React | 0.576 | Icons |

### Backend
| Package | Version | Purpose |
|---|---|---|
| FastAPI | 0.110 | Async REST API framework |
| Python | 3.12 | Runtime |
| Pydantic | v2 | Request/response validation |
| SQLAlchemy | 2.0 (async) | ORM |
| Alembic | 1.13 | Database migrations |
| asyncpg | 0.29 | Async PostgreSQL driver |
| Celery | 5.3 | Async task queue |
| passlib[bcrypt] | 1.7 | Password hashing |
| python-jose | 3.3 | JWT creation and verification |
| gitpython | 3.1 | Git repository introspection |
| pydantic-settings | 2.2 | Environment variable configuration |

### Infrastructure
| Service | Image | Purpose |
|---|---|---|
| PostgreSQL | postgres:16-alpine | Primary data store |
| Redis | redis:7-alpine | Celery broker + result backend |
| Nginx | nginx:alpine | Reverse proxy |
| pgAdmin | dpage/pgadmin4 | Database GUI |

---

## 4. System Requirements

- **Docker Desktop** 4.x or later (includes Docker Compose v2)
- **macOS / Linux** — Windows works via WSL2
- Ports **80, 3000, 5432, 6379, 8000, 5050** available on the host
- Minimum 4 GB free RAM for all containers

Verify Docker Compose is available:
```bash
docker compose version
# Docker Compose version v2.x.x
```

---

## 5. Installation & Setup

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd developers-task-manager
```

### Step 2 — Create the environment file

```bash
cp .env.example .env
```

### Step 3 — Generate secure secrets

```bash
# Generate SECRET_KEY (paste into .env)
python3 -c "import secrets; print(secrets.token_hex(64))"

# Generate NEXTAUTH_SECRET (paste into .env)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Edit `.env` and replace the placeholder values for `SECRET_KEY` and `NEXTAUTH_SECRET`.

### Step 4 — Build and start all services

```bash
docker compose up --build
```

First build takes 3–5 minutes to pull base images and install dependencies. Subsequent starts are fast.

### Step 5 — Run database migrations

In a separate terminal, once all containers are healthy:

```bash
docker compose exec backend alembic revision --autogenerate -m "initial migration"
docker compose exec backend alembic upgrade head
```

> Note: the first command generates a migration file from your SQLAlchemy models. The second applies it to create all tables.

### Access Points

| Service | URL | Credentials |
|---|---|---|
| Application | http://localhost | — |
| API Swagger UI | http://localhost:8000/docs | — |
| pgAdmin | http://localhost:5050 | admin@devtaskr.com / admin |
| Backend direct | http://localhost:8000 | — |
| Frontend direct | http://localhost:3000 | — |

---

## 6. Environment Variables

All variables live in `.env` at the project root.

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `devtaskr` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `devtaskr_password` | PostgreSQL password — **change in production** |
| `POSTGRES_DB` | `devtaskr` | PostgreSQL database name |
| `SECRET_KEY` | _(insecure placeholder)_ | JWT signing key — **must be changed** |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token lifetime (7 days) |
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection string |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Public API base URL (used by browser) |
| `NEXTAUTH_SECRET` | _(insecure placeholder)_ | Next.js auth secret — **must be changed** |
| `NEXTAUTH_URL` | `http://localhost:3000` | Next.js canonical URL |
| `PGADMIN_EMAIL` | `admin@devtaskr.com` | pgAdmin login email |
| `PGADMIN_PASSWORD` | `admin` | pgAdmin login password |
| `ENVIRONMENT` | `development` | `development` or `production` |
| `DEBUG` | `false` | Enables SQLAlchemy query logging when `true` |
| `GIT_REPO_PATH` | `/repo` | Path inside the backend container to the git repo |

### Security Guards

- If `SECRET_KEY` is still the default and `ENVIRONMENT=production`, the backend **refuses to start** with a `RuntimeError`.
- In development, it logs a warning instead.
- `DEBUG=true` in production emits a warning.
- `Base.metadata.create_all` only runs when `ENVIRONMENT=development` — in production, Alembic is the sole migration mechanism.

---

## 7. Running the Application

### Start everything

```bash
docker compose up
```

### Start in background (detached)

```bash
docker compose up -d
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Stop all services

```bash
docker compose down
```

### Full reset (wipes database volumes)

```bash
docker compose down -v
docker compose up --build
```

### Restart a single service (e.g. after config change)

```bash
docker compose restart backend
docker compose up -d --no-deps pgadmin
```

---

## 8. User Flows

### 8.1 Registration

1. Visit **http://localhost** → the landing page is shown.
2. Click **Get started** or **Sign in** → redirected to `/login`.
3. Click **Register** to switch to registration mode.
4. Enter:
   - **Email** — must be a valid email address.
   - **Username** — 2+ characters, alphanumeric with `_` and `-` allowed.
   - **Password** — minimum 8 characters, must contain at least one letter and one digit.
5. Click **Create Account** → JWT token issued, user redirected to `/tasks`.

### 8.2 Login

1. Visit **http://localhost** or `/login`.
2. Enter email and password.
3. Click **Sign In** → token stored in `localStorage`, redirected to `/tasks`.

> Unauthenticated users attempting to access `/tasks/*` or `/tags` are immediately redirected to `/login`.

### 8.3 Creating a Task

1. From `/tasks`, click **New Task** (top-right).
2. Fill in the form:
   - **Title** _(required)_ — descriptive task name.
   - **Description** _(optional)_ — detailed notes.
   - **Status** — defaults to `Todo`.
   - **Priority** — defaults to `Medium`.
   - **Git Branch** — auto-detected from the live repository if available; otherwise type manually (e.g. `feature/oauth`).
   - **Due Date** _(optional)_.
   - **Tags** _(optional)_ — click coloured pills to attach existing tags.
3. Click **Create Task** → task appears on the Kanban board.

### 8.4 Moving Tasks on the Kanban Board

1. From `/tasks`, ensure **Board** view is selected.
2. Click and hold any task card.
3. Drag it to a different column — the target column highlights with a blue ring.
4. Release → status is updated immediately via API and the card moves.

> Alternatively, status can be changed via the dropdown on the task detail page without dragging.

### 8.5 Editing a Task

**From the board:** Click a task card to open the detail page, then click **Edit** in the header.

**What can be edited:**
- Title, description, status, priority, due date, git branch, tags.

Click **Save Changes** to persist.

### 8.6 Working on a Task (Detail Page)

Navigate to any task to access its full detail page at `/tasks/:id`.

#### Changing Status / Priority
Use the inline dropdowns at the top of the page. Changes are saved on selection — no Save button required.

#### Starting the Pomodoro Timer
1. Click **Start** on the Focus Timer widget.
2. A 25-minute countdown begins with a circular progress ring.
3. Click **Pause** to pause, **Reset** to start over.
4. When the timer reaches zero, the session is automatically marked as completed.
5. The stats row shows `Pomodoros: completed / total`.

#### Logging Time
1. Click **Start Tracking** on the Time Log widget.
2. Work on the task. The server records the `started_at` timestamp.
3. Click **Stop Tracking** when done. `ended_at` and `duration_seconds` are calculated server-side.
4. The bar chart updates showing session duration in minutes.
5. **Total time logged** is shown in the stats row.

#### Capturing a Workspace Snapshot
1. Click **Capture Snapshot** (or the pencil icon on an existing snapshot).
2. In the editor:
   - **Active Branch** — auto-populated if git detection is active; or type manually. Click "use detected (branch-name)" to apply the live branch.
   - **Open Files** — type a file path and press Enter (or click +) to add. Click the trash icon to remove.
   - **Last Commands** — type a terminal command and press Enter to add.
   - **Notes** — free text of where you left off.
3. Click **Save Snapshot** → stored in the database.
4. On return to the task, the snapshot is displayed showing branch, files, commands, and notes.

### 8.7 Managing Tags

1. Click the **tag icon** (🏷) in the top navigation bar from any task page.
2. Navigates to `/tags`.

#### Creating a tag
1. Click **New Tag**.
2. Enter a name.
3. Select a colour from the preset palette or use the colour picker for custom hex.
4. Live preview shows the tag pill as you type.
5. Click **Create** or press Enter.

#### Editing a tag
1. Click the pencil icon on any tag row.
2. Modify name and/or colour inline.
3. Click the checkmark to save or X to cancel.

#### Deleting a tag
1. Click the trash icon on the tag row.
2. Confirm the deletion prompt.

> Deleting a tag removes it from all tasks it was attached to (cascaded at the database level).

### 8.8 Filtering and Searching Tasks

From the `/tasks` page:

- **Search** — type in the search bar (top, centre) to filter by title (case-insensitive, debounced).
- **Status filter** — dropdown to show only tasks of a specific status.
- **Priority filter** — dropdown to show only tasks of a specific priority.
- **View toggle** — switch between **Board** (Kanban) and **List** view.

### 8.9 Signing Out

Click the **logout icon** in the top-right navigation. Clears the token from localStorage and redirects to `/login`.

---

## 9. Feature Reference

### Kanban Board

- Five columns: **To Do**, **In Progress**, **Blocked**, **In Review**, **Done**.
- Cards are draggable via `@dnd-kit`. Drag activation requires moving 8px to avoid accidental drags when clicking.
- A ghost overlay follows the cursor while dragging; the destination column highlights.
- Dropping on a different column fires `PATCH /api/v1/tasks/:id` immediately.
- Each card shows: title, priority badge, description snippet, git branch badge, colour-coded tags, status pill, due date.

### Pomodoro Focus Timer

- Default session length: **25 minutes** (configurable via the `FocusTimer` component's `durationMinutes` prop).
- A `FocusSession` record is created when Start is first pressed (not when resumed after pause).
- Completion auto-triggers `PATCH /api/v1/focus/:id/complete`.
- Progress ring is drawn with SVG — smooth 1-second transitions.

### Time Logging

- `started_at` is set **server-side only** — clients cannot manipulate the timestamp.
- `ended_at` and `duration_seconds` are set **server-side** when the timer is stopped.
- An idempotency guard prevents stopping an already-stopped timer (returns HTTP 400).
- The bar chart shows the **last 10 completed sessions** with gradient blue bars.

### Workspace Snapshots

Schema stored per snapshot:
```json
{
  "open_files": ["src/app/login/page.tsx", "src/hooks/useTasks.ts"],
  "notes": "Left off implementing the tag filter. useQuery key needs updating.",
  "terminal_commands": ["npm run dev", "docker compose logs -f backend"],
  "cursor_positions": {},
  "active_branch": "feature/tag-filter",
  "captured_at": "2026-03-03T10:22:00Z"
}
```

Only the latest snapshot is shown per task on the UI, but all historical snapshots are retained in the database.

### Git Branch Auto-Detection

When the backend container has `/repo` mounted (the project root volume), it uses `gitpython` to read the `.git` folder and return the currently checked-out branch. This is queried:
- When the **New Task** form opens (to pre-fill the branch field).
- When the **Workspace Snapshot** editor opens (to offer "use detected" shortcut).

The query is non-blocking — if git is unavailable or the path has no repo, the field simply remains empty.

---

## 10. API Reference

All endpoints are under `/api/v1/`. Authentication uses **Bearer tokens** in the `Authorization` header.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user. Returns JWT + user. |
| POST | `/auth/login` | No | Login. Returns JWT + user. |
| GET | `/auth/me` | Yes | Returns the current authenticated user. |

**Register body:**
```json
{
  "email": "dev@example.com",
  "username": "devuser",
  "password": "securePass1"
}
```

**Login body:**
```json
{
  "email": "dev@example.com",
  "password": "securePass1"
}
```

**Token response:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": { "id": 1, "email": "...", "username": "...", "is_active": true, "created_at": "..." }
}
```

---

### Tasks

| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List tasks. Supports `status`, `priority`, `search`, `skip`, `limit` query params. |
| POST | `/tasks` | Create a task. |
| GET | `/tasks/:id` | Get a single task with tags. |
| PATCH | `/tasks/:id` | Partially update a task. |
| DELETE | `/tasks/:id` | Delete a task (cascades time logs, focus sessions, snapshots). |
| GET | `/tasks/branch/:branch_name` | List all tasks linked to a specific git branch. |

**Task create/update body (all fields optional on update):**
```json
{
  "title": "Implement OAuth",
  "description": "Add Google login",
  "status": "todo",
  "priority": "high",
  "branch_name": "feature/oauth",
  "due_date": "2026-03-10T00:00:00Z",
  "tag_ids": [1, 3]
}
```

**Status values:** `todo` | `in_progress` | `blocked` | `in_review` | `done`

**Priority values:** `low` | `medium` | `high` | `critical`

---

### Tags

| Method | Path | Description |
|---|---|---|
| GET | `/tags` | List all tags for the current user. |
| POST | `/tags` | Create a tag. |
| PATCH | `/tags/:id` | Update a tag name/colour. |
| DELETE | `/tags/:id` | Delete a tag. |

**Tag body:**
```json
{ "name": "backend", "color": "#6366f1" }
```
Colour must be a valid 6-digit hex code (`#RRGGBB`).

---

### Time Logs

| Method | Path | Description |
|---|---|---|
| GET | `/timelogs/task/:task_id` | List all time logs for a task. |
| POST | `/timelogs/start?task_id=:id` | Start a timer for a task. `started_at` set server-side. |
| PATCH | `/timelogs/:id/stop` | Stop a running timer. `ended_at` and `duration_seconds` set server-side. |

---

### Focus Sessions

| Method | Path | Description |
|---|---|---|
| GET | `/focus/task/:task_id` | List focus sessions for a task. |
| POST | `/focus` | Create a new focus session. |
| PATCH | `/focus/:id/complete` | Mark a session as completed. |

**Focus session body:**
```json
{ "task_id": 1, "duration_minutes": 25 }
```

---

### Workspace Snapshots

| Method | Path | Description |
|---|---|---|
| GET | `/workspaces/task/:task_id/latest` | Get the most recent snapshot for a task. |
| POST | `/workspaces` | Save a new snapshot. |

**Snapshot body:**
```json
{
  "task_id": 1,
  "snapshot_json": {
    "open_files": ["src/main.py"],
    "notes": "Left off at line 42",
    "terminal_commands": ["uvicorn app.main:app --reload"],
    "active_branch": "feature/my-work"
  }
}
```

---

### Git

| Method | Path | Description |
|---|---|---|
| GET | `/git/current-branch` | Returns the active branch of the mounted repo. |
| GET | `/git/branches` | Returns all local branches. |
| GET | `/git/info` | Returns branch, last commit hash/message, remote URL. |

All git endpoints accept an optional `?repo_path=` query param to override the default `/repo` path.

---

## 11. Data Models

### User
| Column | Type | Notes |
|---|---|---|
| id | integer PK | Auto-increment |
| email | varchar(255) | Unique, indexed |
| username | varchar(100) | Unique, indexed |
| hashed_password | varchar(255) | bcrypt |
| is_active | boolean | Default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Task
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| user_id | FK → users | CASCADE delete |
| title | varchar(255) | |
| description | text | Nullable |
| status | enum | todo / in_progress / blocked / in_review / done |
| priority | enum | low / medium / high / critical |
| branch_name | varchar(255) | Nullable |
| due_date | timestamptz | Nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Tag
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| user_id | FK → users | CASCADE delete |
| name | varchar(50) | |
| color | varchar(7) | Hex e.g. `#6366f1` |

### task_tags (association)
| Column | Type |
|---|---|
| task_id | FK → tasks |
| tag_id | FK → tags |

Both columns are a composite primary key. Both have CASCADE delete.

### TimeLog
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| task_id | FK → tasks | CASCADE delete |
| started_at | timestamptz | Set server-side |
| ended_at | timestamptz | Nullable, set server-side |
| duration_seconds | integer | Nullable, calculated on stop |

### FocusSession
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| task_id | FK → tasks | CASCADE delete |
| duration_minutes | integer | Default 25 |
| completed | boolean | Default false |
| created_at | timestamptz | |

### WorkspaceSnapshot
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| task_id | FK → tasks | CASCADE delete |
| snapshot_json | JSON | Arbitrary developer context |
| created_at | timestamptz | |

---

## 12. Frontend Structure

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx       # Login + registration form
│   ├── page.tsx                 # Landing page (redirects to /tasks if logged in)
│   ├── layout.tsx               # Root layout: Providers, Inter font, globals.css
│   ├── globals.css              # CSS variables for light/dark theme
│   ├── tasks/
│   │   ├── layout.tsx           # Auth guard — redirects to /login if no token
│   │   ├── page.tsx             # Main task board: Kanban + list view, filters
│   │   └── [id]/page.tsx        # Task detail: timer, time log, snapshot, edit
│   └── tags/
│       ├── layout.tsx           # Auth guard for tags section
│       └── page.tsx             # Tag CRUD management page
├── components/
│   ├── Providers.tsx            # TanStack Query + next-themes wrapper
│   ├── TaskCard.tsx             # Kanban card: title, priority, branch, tags, status
│   ├── TaskForm.tsx             # Create/edit modal with tags + branch auto-detect
│   ├── KanbanBoard.tsx          # DnD board with DndContext + DroppableColumn
│   ├── FocusTimer.tsx           # SVG ring countdown with start/pause/reset
│   ├── TimeLogChart.tsx         # Recharts bar chart + start/stop controls
│   └── WorkspaceBadge.tsx       # Snapshot read view + inline edit form
├── hooks/
│   ├── useTasks.ts              # All TanStack Query hooks: tasks, timelogs, focus, snapshots, tags
│   ├── useFocusTimer.ts         # Local countdown state + session lifecycle
│   └── useGit.ts                # Git branch detection hooks
├── lib/
│   ├── api.ts                   # Axios instance + request/401 interceptors
│   └── utils.ts                 # cn(), formatDuration(), STATUS_LABELS/COLORS, etc.
├── store/
│   └── useAppStore.ts           # Zustand store: token, user, activeTaskId, logout
└── types/
    └── index.ts                 # All TypeScript interfaces and enums
```

### State Architecture

- **Server state** — all API data is owned by **TanStack Query**. Cache is invalidated after each mutation. No manual state synchronisation needed.
- **Auth state** — stored in **Zustand** with `persist` middleware (writes to `localStorage`). Also duplicated to `localStorage["access_token"]` for the Axios interceptor.
- **Form state** — owned by **React Hook Form**. Zod schemas validate before submission.
- **Local UI state** — component-level `useState` (modal open, edit mode, timer running).

### Authentication Flow (Frontend)

1. On login/register: token and user stored to Zustand + localStorage.
2. On every API request: Axios interceptor reads `localStorage["access_token"]` and sets `Authorization: Bearer <token>`.
3. On 401 response: interceptor removes token and `window.location.href = "/login"`.
4. On page load at `/tasks/*`: `tasks/layout.tsx` reads token synchronously from Zustand/localStorage and redirects if absent (no flash of protected content).

---

## 13. Backend Structure

```
backend/
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── env.py                   # Async migration setup; reads DATABASE_URL from settings
│   ├── script.py.mako           # Migration file template
│   └── versions/                # Generated migration files
└── app/
    ├── main.py                  # FastAPI app, CORS middleware, all router includes
    ├── core/
    │   ├── config.py            # Settings (pydantic-settings), security guards
    │   ├── security.py          # JWT create/verify, bcrypt hash/verify
    │   └── deps.py              # get_db, get_current_user_id FastAPI dependencies
    ├── db/
    │   ├── base.py              # DeclarativeBase, all model imports (for Alembic)
    │   └── session.py           # async engine, AsyncSessionLocal
    ├── models/
    │   ├── user.py
    │   ├── task.py              # TaskStatus + TaskPriority enums, Task model
    │   ├── tag.py               # Tag model + task_tags association table
    │   ├── time_log.py
    │   ├── focus_session.py
    │   └── workspace.py
    ├── schemas/
    │   ├── user.py              # UserCreate (validators), UserLogin, UserOut, TokenOut
    │   ├── task.py              # TaskCreate, TaskUpdate, TaskOut, TaskListOut
    │   ├── tag.py               # TagCreate (hex validator), TagUpdate, TagOut
    │   ├── time_log.py          # TimeLogOut, FocusSessionCreate, FocusSessionOut
    │   └── workspace.py         # WorkspaceSnapshotCreate, WorkspaceSnapshotOut
    ├── routers/
    │   ├── auth.py              # /register, /login, /me
    │   ├── tasks.py             # CRUD + /branch/:name
    │   ├── tags.py              # Tag CRUD
    │   ├── timelogs.py          # /start, /:id/stop, /task/:id
    │   ├── focus.py             # Create, complete, list per task
    │   ├── workspaces.py        # Save + latest per task
    │   └── git.py               # /current-branch, /branches, /info
    ├── services/
    │   ├── git_service.py       # get_current_branch(), get_repo_info(), list_branches()
    │   ├── task_service.py      # get_task_stats(), get_tasks_by_branch()
    │   └── workspace_service.py # build_snapshot(), serialize/deserialize helpers
    └── workers/
        ├── celery_app.py        # Celery app configured with Redis broker
        └── tasks.py             # notify_due_soon, auto_snapshot_cleanup (stubs)
```

### Dependency Injection

Every route receives:
- `db: AsyncSession` — from `get_db` (yields, ensures session is closed after request)
- `user_id: int` — from `get_current_user_id` (verifies Bearer JWT, returns `sub` claim as int)

Every data-mutating endpoint that acts on a resource (timelog, focus session, snapshot) performs an ownership check via a `JOIN` to the `tasks` table, ensuring a user can never access another user's data even if they guess a valid ID.

---

## 14. Docker Services

| Service | Container | Image | Role |
|---|---|---|---|
| `postgres` | devtaskr_postgres | postgres:16-alpine | Primary database |
| `redis` | devtaskr_redis | redis:7-alpine | Celery broker + result backend |
| `backend` | devtaskr_backend | Custom (Python 3.12) | FastAPI application |
| `celery_worker` | devtaskr_celery | Same as backend | Background task worker |
| `frontend` | devtaskr_frontend | Custom (Node 20) | Next.js dev server |
| `nginx` | devtaskr_nginx | nginx:alpine | Reverse proxy on port 80 |
| `pgadmin` | devtaskr_pgadmin | dpage/pgadmin4 | Database GUI on port 5050 |

### Volume Mounts

| Service | Host Path | Container Path | Notes |
|---|---|---|---|
| backend | `./backend` | `/app` | Hot-reload source |
| backend | `..` (project root) | `/repo` (read-only) | Git repo access for branch detection |
| celery_worker | `./backend` | `/app` | |
| celery_worker | `..` | `/repo` (read-only) | |
| frontend | `./frontend` | `/app` | Hot-reload source |
| frontend | _(anonymous)_ | `/app/node_modules` | Prevents host overwrite |
| frontend | _(anonymous)_ | `/app/.next` | Preserves build cache |

### Health Checks

- **postgres** — `pg_isready -U devtaskr` every 10s, 5 retries
- **redis** — `redis-cli ping` every 10s, 5 retries
- **backend** and **frontend** wait for `postgres` and `redis` to be healthy before starting

---

## 15. Git Branch Integration

### How It Works

The integration has two layers:

#### Layer 1 — Manual linking (always available)

Every task has a `branch_name` field. Developers type (or paste) their branch name when creating or editing a task. This links a task to a branch conceptually.

**Use cases:**
- `GET /api/v1/tasks/branch/feature/oauth` — find all tasks for a branch (useful in git hooks or CLI tools)
- Branch shown on every task card and detail page
- Workspace snapshots include `active_branch` in their JSON

#### Layer 2 — Live detection (when `/repo` volume is mounted)

The backend container has the project root mounted at `/repo`. `gitpython` reads `/repo/.git` to detect the currently checked-out branch.

**Use cases:**
- **New task form** — branch field auto-populated on open
- **Workspace snapshot editor** — "use detected (branch-name)" shortcut
- `GET /api/v1/git/current-branch` — any external tool can query this

### Setting Up Live Detection

Live detection works out of the box in the default Docker Compose setup because `..:/repo:ro` is already configured.

To verify it works:
```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:8000/api/v1/git/current-branch
# {"branch": "main"}
```

### Using with Git Hooks

A `post-checkout` hook can query the API and display related tasks in the terminal:

```bash
#!/bin/bash
# .git/hooks/post-checkout
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TOKEN=$(cat ~/.devtaskr_token 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "DevTaskr tasks for branch: $BRANCH"
  curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8000/api/v1/tasks/branch/$BRANCH" | \
    python3 -c "import sys,json; [print(f'  [{t[\"status\"]}] {t[\"title\"]}') for t in json.load(sys.stdin)]"
fi
```

---

## 16. Security Considerations

### Authentication

- Passwords hashed with **bcrypt** via passlib. Plain-text passwords are never stored.
- JWTs signed with `HS256` using a configurable `SECRET_KEY`.
- Token expiry defaults to 7 days (`ACCESS_TOKEN_EXPIRE_MINUTES=10080`).
- All protected endpoints use `HTTPBearer` dependency — missing/invalid tokens return `401`.

### Authorisation

- Every resource (task, tag, timelog, focus session, snapshot) is scoped to the authenticated user via `user_id` filters on all queries.
- Time log stop and focus session complete endpoints use a `JOIN` to the tasks table to verify ownership — prevents horizontal privilege escalation by ID enumeration.

### Input Validation (Pydantic)

| Field | Rule |
|---|---|
| password | Min 8 chars, must contain letter + digit |
| username | Min 2 chars, alphanumeric + `_-` only |
| tag color | Must match `#[0-9A-Fa-f]{6}` |
| tag name | Non-empty, max 50 chars |
| time log `started_at` | Set server-side — not accepted from client |
| time log `ended_at` | Set server-side — not accepted from client |

### Known Risks (acceptable for MVP / development)

| Risk | Notes |
|---|---|
| JWT in `localStorage` | Vulnerable to XSS. Production should use `httpOnly` cookies. |
| No rate limiting | Add `slowapi` to auth endpoints before exposing publicly. |
| Postgres + Redis ports exposed | Remove `ports:` from those services in production Docker Compose. |
| No HTTPS | Add a TLS-terminating proxy (e.g. Caddy, Nginx with cert) in production. |
| Celery runs as root | SecurityWarning is emitted. Add a non-root user in the Dockerfile for production. |

---

## 17. Database Migrations

DevTaskr uses **Alembic** for all schema changes in production. `Base.metadata.create_all` only runs in `ENVIRONMENT=development`.

### Generate a new migration

```bash
docker compose exec backend alembic revision --autogenerate -m "describe your change"
```

### Apply migrations

```bash
docker compose exec backend alembic upgrade head
```

### Roll back one step

```bash
docker compose exec backend alembic downgrade -1
```

### View migration history

```bash
docker compose exec backend alembic history --verbose
```

### Migration file location

`backend/alembic/versions/` — each file is named `<revision_id>_<message>.py`.

> The `alembic.ini` file does **not** contain database credentials. The URL is injected programmatically in `alembic/env.py` from `settings.DATABASE_URL`.

---

## 18. Development Guide

### Running without Docker

#### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start a local PostgreSQL and Redis, then:
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Celery worker

```bash
cd backend
source .venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=info
```

### Adding a New API Endpoint

1. Add the SQLAlchemy model in `backend/app/models/` and import it in `backend/app/db/base.py`.
2. Add Pydantic schemas in `backend/app/schemas/`.
3. Create or extend a router in `backend/app/routers/`.
4. Register the router in `backend/app/main.py`.
5. Generate and apply a migration.
6. Add a TanStack Query hook in `frontend/src/hooks/useTasks.ts` or a new hook file.

### Adding a New Frontend Page

1. Create `frontend/src/app/<route>/page.tsx`.
2. If the route requires authentication, add a `layout.tsx` alongside it with the auth guard pattern (copy from `frontend/src/app/tasks/layout.tsx`).
3. Add navigation to it from an existing page.

### Code Style

- **Backend** — `ruff` for linting (`ruff check .` from `backend/`).
- **Frontend** — ESLint with `eslint-config-next` (`npm run lint` from `frontend/`).
- TypeScript strict mode is enabled. All props and return types should be explicitly typed.

---

## 19. Deployment Considerations

### Environment changes

| Setting | Development | Production |
|---|---|---|
| `ENVIRONMENT` | `development` | `production` |
| `DEBUG` | `true` (optional) | `false` |
| `SECRET_KEY` | Any value (warns if default) | Long random hex — **required** |
| `POSTGRES_PASSWORD` | `devtaskr_password` | Strong random password |
| Backend command | `uvicorn ... --reload` | `gunicorn -k uvicorn.workers.UvicornWorker` |
| Frontend | `npm run dev` | `npm run build && npm start` |

### Heroku (example)

- Create two apps: one for backend (Python buildpack), one for frontend (Node buildpack).
- Add **Heroku Postgres** and **Heroku Redis** add-ons.
- `DATABASE_URL` from Heroku uses `postgres://` — add a config var fix:
  ```python
  # In config.py
  DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
  ```
- Add a `Procfile` to the backend:
  ```
  web: gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT
  release: alembic upgrade head
  ```
- `NEXT_PUBLIC_API_URL` on the frontend must point to the deployed backend URL.

### Scaling

- Backend is stateless — scale horizontally with multiple Uvicorn/Gunicorn workers.
- Celery workers can be scaled independently.
- Redis is the single point of coordination — use Redis Cluster or a managed Redis for high availability.
- PostgreSQL connection pool is set to `pool_size=10, max_overflow=20` — adjust for production load.

---

## 20. Known Limitations & Future Work

### Current Limitations

| Area | Limitation |
|---|---|
| Auth tokens | Stored in `localStorage` (XSS risk). Should use `httpOnly` cookies in production. |
| Workspace snapshots | Manually entered in the UI. Full automation requires a VS Code extension or CLI tool. |
| Git detection | Only detects the branch of the mounted project repo, not arbitrary repos. |
| Celery tasks | `notify_due_soon` and `auto_snapshot_cleanup` are stubbed — no email integration yet. |
| No real-time updates | Task status changes by one user don't push to another user's browser (no WebSocket). |
| No test suite | Unit and integration tests are not yet written (pytest + httpx infrastructure is in `requirements.txt`). |

### Planned Improvements

- **Email notifications** — wire `notify_due_soon` Celery task to SendGrid or SES for tasks due within 24h.
- **WebSocket support** — FastAPI supports WebSockets natively; add real-time board updates.
- **VS Code extension** — capture open editors, active terminal, cursor positions automatically.
- **CLI tool** — `devtaskr switch <branch>` to simultaneously `git checkout` and restore the snapshot.
- **OAuth login** — add GitHub OAuth so developers can sign in with their existing GitHub account.
- **Task comments** — threaded comments per task for async team communication.
- **Team workspaces** — multi-user boards with role-based access (viewer, editor, admin).
- **httpOnly cookie auth** — replace `localStorage` token with a secure `httpOnly` cookie.
- **Rate limiting** — add `slowapi` to auth endpoints.
- **Full test coverage** — pytest with `pytest-asyncio` for routers, services, and Pydantic validators.
