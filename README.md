# DevTaskr — Developer Task Manager

A production-ready task management system designed specifically for software developers.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| State | TanStack Query v5, Zustand |
| Backend | FastAPI 0.110, Python 3.12, Pydantic v2 |
| ORM | SQLAlchemy 2.0 async + Alembic migrations |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 + Celery v5 |
| Reverse Proxy | Nginx |
| Containers | Docker Compose |

## Quick Start

### 1. Copy environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_very_long_random_secret_key
```

Generate a strong secret key with:

```bash
python3 -c "import secrets; print(secrets.token_hex(64))"
```

### 2. Start all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| App (via Nginx) | http://localhost |
| Frontend (direct) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 |

### 3. Run database migrations

In a separate terminal, after containers are running:

```bash
docker compose exec backend alembic upgrade head
```

## Features

- **Kanban Board** — Drag tasks across TODO → In Progress → Blocked → In Review → Done
- **Git Branch Linking** — Associate tasks with git branches for context switching
- **Pomodoro Timer** — Built-in 25-minute focus sessions tracked per task
- **Time Logging** — Start/stop tracking to record how long you spend on each task
- **Workspace Snapshots** — Save your open files, terminal history, and notes per task
- **Tags** — Color-coded labels for categorisation
- **Dark / Light mode** — System-aware theme toggle

## Project Structure

```
.
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   └── app/
│       ├── main.py
│       ├── core/          # config, security, deps
│       ├── db/            # engine, base
│       ├── models/        # SQLAlchemy models
│       ├── schemas/       # Pydantic schemas
│       ├── routers/       # FastAPI routers
│       ├── services/      # git, workspace, task logic
│       └── workers/       # Celery tasks
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── app/           # Next.js App Router pages
        ├── components/    # UI components
        ├── hooks/         # TanStack Query + timer hooks
        ├── lib/           # axios instance, utils
        ├── store/         # Zustand global store
        └── types/         # TypeScript interfaces
```

## API Endpoints

All endpoints are under `/api/v1/`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new account |
| POST | `/auth/login` | Login → JWT token |
| GET | `/auth/me` | Current user |
| GET | `/tasks` | List tasks (filterable) |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/tags` | List tags |
| POST | `/tags` | Create tag |
| POST | `/timelogs/start` | Start time tracking |
| PATCH | `/timelogs/{id}/stop` | Stop time tracking |
| POST | `/focus` | Create focus session |
| PATCH | `/focus/{id}/complete` | Complete focus session |
| POST | `/workspaces` | Save workspace snapshot |
| GET | `/workspaces/task/{id}/latest` | Latest snapshot |

## Development

### Backend (without Docker)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (without Docker)

```bash
cd frontend
npm install
npm run dev
```
