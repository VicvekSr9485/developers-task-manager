"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Task, TaskStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { usePatchTask } from "@/hooks/useTasks";

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

const COLUMN_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "border-slate-400",
  [TaskStatus.IN_PROGRESS]: "border-blue-500",
  [TaskStatus.BLOCKED]: "border-red-500",
  [TaskStatus.IN_REVIEW]: "border-amber-500",
  [TaskStatus.DONE]: "border-green-500",
};

// ─── Draggable Card ──────────────────────────────────────────────────────────

function DraggableCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────────────────────

function DroppableColumn({
  status,
  tasks,
  isOver,
}: {
  status: TaskStatus;
  tasks: Task[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex-shrink-0 w-64 space-y-2">
      <div className={`border-t-2 pt-2 flex items-center justify-between ${COLUMN_COLORS[status]}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] rounded-lg p-1 transition-colors ${
          isOver ? "bg-primary/5 ring-1 ring-primary/30" : ""
        }`}
      >
        {tasks.length === 0 ? (
          <div className="text-xs text-muted-foreground/50 text-center pt-8">
            Drop here
          </div>
        ) : (
          tasks.map((task) => <DraggableCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

// ─── Board ───────────────────────────────────────────────────────────────────

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const patchTask = usePatchTask();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverColumn(over ? (over.id as TaskStatus) : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setOverColumn(null);
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      patchTask.mutate({ id: task.id, data: { status: newStatus } });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            tasks={byStatus(status)}
            isOver={overColumn === status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-90 shadow-2xl">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

