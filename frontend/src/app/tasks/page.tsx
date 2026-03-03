"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks, useTags } from "@/hooks/useTasks";
import { useAppStore } from "@/store/useAppStore";
import { TaskStatus, TaskPriority, Task } from "@/types";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, cn } from "@/lib/utils";
import { TaskForm } from "@/components/TaskForm";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Plus, LayoutGrid, List, LogOut, Moon, Sun, Tag } from "lucide-react";
import { useTheme } from "next-themes";

const STATUSES = Object.values(TaskStatus);

export default function TasksPage() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const { theme, setTheme } = useTheme();

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<Set<number>>(new Set());

  const { data: tagsData = [] } = useTags();

  const toggleTagFilter = (id: number) =>
    setTagFilter((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const { data, isLoading } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search: search || undefined,
  });

  const allTasks = data?.items ?? [];
  const tasks =
    tagFilter.size === 0
      ? allTasks
      : allTasks.filter((t) => t.tags.some((tag) => tagFilter.has(tag.id)));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="font-bold text-lg tracking-tight">DevTaskr</span>

          <div className="flex-1 max-w-sm">
            <input
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-accent transition"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => router.push("/tags")}
              className="p-2 rounded-md hover:bg-accent transition"
              title="Manage tags"
            >
              <Tag className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-accent transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter ?? ""}
              onChange={(e) =>
                setStatusFilter((e.target.value as TaskStatus) || undefined)
              }
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter ?? ""}
              onChange={(e) =>
                setPriorityFilter((e.target.value as TaskPriority) || undefined)
              }
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All priorities</option>
              {Object.values(TaskPriority).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>

            {/* Tag filter pills */}
            {tagsData.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tagsData.map((tag) => {
                  const active = tagFilter.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.id)}
                      className="text-xs px-2 py-1 rounded-full border transition font-medium"
                      style={{
                        borderColor: tag.color,
                        color: active ? "white" : tag.color,
                        backgroundColor: active ? tag.color : "transparent",
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {tagFilter.size > 0 && (
                  <button
                    onClick={() => setTagFilter(new Set())}
                    className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground hover:bg-accent transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            <span className="text-sm text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md border border-input overflow-hidden">
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "px-3 py-1.5 text-sm flex items-center gap-1 transition",
                  view === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "px-3 py-1.5 text-sm flex items-center gap-1 transition",
                  view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Loading tasks…
          </div>
        ) : view === "kanban" ? (
          <KanbanBoard tasks={tasks} />
        ) : (
          <ListView tasks={tasks} />
        )}
      </main>

      {/* Task creation modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

// ─── List View ───────────────────────────────────────────────────────────────

function ListView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        No tasks found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => router.push(`/tasks/${task.id}`)}
          className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left hover:bg-accent/50 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                STATUS_COLORS[task.status]
              )}
            />
            <span className="font-medium text-sm truncate">{task.title}</span>
            {task.branch_name && (
              <span className="hidden sm:block text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground truncate max-w-[140px]">
                {task.branch_name}
              </span>
            )}
            {task.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-1.5 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <span
              className={cn(
                "text-xs font-medium",
                PRIORITY_COLORS[task.priority]
              )}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span className="text-xs text-muted-foreground">
              {STATUS_LABELS[task.status]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
