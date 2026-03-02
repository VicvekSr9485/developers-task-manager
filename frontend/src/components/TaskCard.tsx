"use client";

import { useRouter } from "next/navigation";
import { Task } from "@/types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  cn,
} from "@/lib/utils";
import { GitBranch, Clock, Tag } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="w-full text-left rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all space-y-2"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">
          {task.title}
        </p>
        <span
          className={cn(
            "text-xs font-semibold shrink-0 mt-0.5",
            PRIORITY_COLORS[task.priority]
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Branch */}
      {task.branch_name && (
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit max-w-full truncate">
          <GitBranch className="w-3 h-3 shrink-0" />
          <span className="truncate">{task.branch_name}</span>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              <Tag className="w-2.5 h-2.5" />
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white",
            STATUS_COLORS[task.status]
          )}
        >
          {STATUS_LABELS[task.status]}
        </span>
        {task.due_date && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(task.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </button>
  );
}
