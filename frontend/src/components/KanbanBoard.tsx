"use client";

import { Task, TaskStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/utils";
import { TaskCard } from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.BLOCKED,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "border-slate-400",
  [TaskStatus.IN_PROGRESS]: "border-blue-500",
  [TaskStatus.BLOCKED]: "border-red-500",
  [TaskStatus.IN_REVIEW]: "border-amber-500",
  [TaskStatus.DONE]: "border-green-500",
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const byStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((status) => {
        const col = byStatus(status);
        return (
          <div key={status} className="flex-shrink-0 w-64 space-y-2">
            {/* Column header */}
            <div
              className={`border-t-2 pt-2 flex items-center justify-between ${COLUMN_HEADER_COLORS[status]}`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                {col.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[200px]">
              {col.length === 0 ? (
                <div className="text-xs text-muted-foreground/50 text-center pt-8">
                  Empty
                </div>
              ) : (
                col.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
