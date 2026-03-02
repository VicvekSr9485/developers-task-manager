"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useTimeLogs,
  useFocusSessions,
  useLatestSnapshot,
} from "@/hooks/useTasks";
import { FocusTimer } from "@/components/FocusTimer";
import { TimeLogChart } from "@/components/TimeLogChart";
import { WorkspaceBadge } from "@/components/WorkspaceBadge";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  formatDate,
  cn,
} from "@/lib/utils";
import { TaskStatus, TaskPriority } from "@/types";
import { ArrowLeft, Trash2, GitBranch, Calendar, Tag } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: Props) {
  const { id: rawId } = use(params);
  const id = Number(rawId);
  const router = useRouter();

  const { data: task, isLoading } = useTask(id);
  const { data: timeLogs = [] } = useTimeLogs(id);
  const { data: focusSessions = [] } = useFocusSessions(id);
  const { data: snapshot } = useLatestSnapshot(id);

  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading task…
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Task not found.</p>
        <button
          onClick={() => router.push("/tasks")}
          className="text-sm text-primary hover:underline"
        >
          Back to tasks
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await deleteTask.mutateAsync(id);
    router.push("/tasks");
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask.mutate({ priority });
  };

  const totalLogged = timeLogs.reduce(
    (sum, l) => sum + (l.duration_seconds ?? 0),
    0
  );
  const completedPomodoros = focusSessions.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/tasks")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Tasks
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-sm text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto px-4 py-8 space-y-8">
        {/* Title & meta */}
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">{task.title}</h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="rounded-full border border-input bg-background px-3 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/50 transition"
            >
              {Object.values(TaskStatus).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={task.priority}
              onChange={(e) =>
                handlePriorityChange(e.target.value as TaskPriority)
              }
              className={cn(
                "rounded-full border border-input bg-background px-3 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/50 transition",
                PRIORITY_COLORS[task.priority]
              )}
            >
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>

            {/* Git branch */}
            {task.branch_name && (
              <span className="flex items-center gap-1 text-xs font-mono bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                <GitBranch className="w-3.5 h-3.5" /> {task.branch_name}
              </span>
            )}

            {/* Due date */}
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> Due {formatDate(task.due_date)}
              </span>
            )}

            {/* Tags */}
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                <Tag className="w-3 h-3" /> {tag.name}
              </span>
            ))}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          )}
        </section>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="Time Logged"
            value={formatSeconds(totalLogged)}
          />
          <StatCard
            label="Pomodoros"
            value={`${completedPomodoros} / ${focusSessions.length}`}
          />
          <StatCard
            label="Created"
            value={formatDate(task.created_at)}
          />
        </div>

        {/* Two-column layout for focus + workspace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Focus Timer
            </h2>
            <FocusTimer taskId={id} />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace Snapshot
            </h2>
            <WorkspaceBadge taskId={id} snapshot={snapshot} />
          </section>
        </div>

        {/* Time log chart */}
        {timeLogs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Time Logs
            </h2>
            <TimeLogChart timeLogs={timeLogs} />
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
