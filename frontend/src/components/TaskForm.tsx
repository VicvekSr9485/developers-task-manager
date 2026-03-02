"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask, useUpdateTask, useTags } from "@/hooks/useTasks";
import { useCurrentBranch } from "@/hooks/useGit";
import { Task, TaskStatus, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
import { X, GitBranch, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  branch_name: z.string().optional(),
  due_date: z.string().optional(),
  tag_ids: z.array(z.number()).default([]),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  onClose: () => void;
  task?: Task; // if provided → edit mode
}

export function TaskForm({ onClose, task }: TaskFormProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id ?? 0);
  const { data: tagsData = [] } = useTags();
  const { data: branchData, isLoading: branchLoading } = useCurrentBranch(!isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? TaskStatus.TODO,
      priority: task?.priority ?? TaskPriority.MEDIUM,
      branch_name: task?.branch_name ?? "",
      due_date: task?.due_date ? task.due_date.split("T")[0] : "",
      tag_ids: task?.tags?.map((t) => t.id) ?? [],
    },
  });

  const selectedTagIds = watch("tag_ids");

  // Auto-fill branch on create if git detection succeeds and field is empty
  useEffect(() => {
    if (!isEdit && branchData?.branch && !watch("branch_name")) {
      setValue("branch_name", branchData.branch);
    }
  }, [branchData, isEdit, setValue, watch]);

  const toggleTag = (id: number) => {
    const current = watch("tag_ids");
    setValue(
      "tag_ids",
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (isEdit) {
      await updateTask.mutateAsync(data);
    } else {
      await createTask.mutateAsync(data);
    }
    onClose();
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition",
      hasError ? "border-destructive" : "border-input"
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold">{isEdit ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title *</label>
            <input
              {...register("title")}
              placeholder="e.g. Implement authentication"
              className={inputClass(!!errors.title)}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Optional details…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select {...register("status")} className={inputClass()}>
                {Object.values(TaskStatus).map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <select {...register("priority")} className={inputClass()}>
                {Object.values(TaskPriority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Git Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              Git Branch
              {branchLoading && !isEdit && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
              {!isEdit && branchData?.branch && (
                <span className="text-xs text-muted-foreground font-normal">
                  (detected: {branchData.branch})
                </span>
              )}
            </label>
            <input
              {...register("branch_name")}
              placeholder="feature/my-branch"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <input
              {...register("due_date")}
              type="date"
              className={inputClass()}
            />
          </div>

          {/* Tags */}
          {tagsData.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tagsData.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border transition",
                        selected ? "text-white" : "bg-background"
                      )}
                      style={{
                        borderColor: tag.color,
                        color: selected ? "white" : tag.color,
                        backgroundColor: selected ? tag.color : undefined,
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

