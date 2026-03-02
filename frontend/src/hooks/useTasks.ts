import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListOut,
  TaskFilterParams,
  TimeLog,
  FocusSession,
  FocusSessionCreate,
  WorkspaceSnapshot,
  WorkspaceSnapshotCreate,
} from "@/types";

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function useTasks(filters: TaskFilterParams = {}) {
  return useQuery<TaskListOut>({
    queryKey: ["tasks", filters],
    queryFn: () =>
      api.get("/tasks", { params: filters }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

export function useTask(id: number) {
  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: () => api.get(`/tasks/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation<Task, Error, TaskCreate>({
    mutationFn: (data) => api.post("/tasks", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask(id: number) {
  const qc = useQueryClient();
  return useMutation<Task, Error, TaskUpdate>({
    mutationFn: (data) => api.patch(`/tasks/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["tasks", id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// ─── Time Logs ───────────────────────────────────────────────────────────────

export function useTimeLogs(taskId: number) {
  return useQuery<TimeLog[]>({
    queryKey: ["timelogs", taskId],
    queryFn: () =>
      api.get(`/timelogs/task/${taskId}`).then((r) => r.data),
    enabled: !!taskId,
  });
}

export function useStartTimeLog() {
  const qc = useQueryClient();
  return useMutation<TimeLog, Error, number>({
    mutationFn: (task_id) =>
      api.post(`/timelogs/start?task_id=${task_id}`).then((r) => r.data),
    onSuccess: (_data, task_id) =>
      qc.invalidateQueries({ queryKey: ["timelogs", task_id] }),
  });
}

export function useStopTimeLog() {
  const qc = useQueryClient();
  return useMutation<TimeLog, Error, number>({
    mutationFn: (log_id) =>
      api.patch(`/timelogs/${log_id}/stop`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timelogs"] }),
  });
}

// ─── Focus Sessions ──────────────────────────────────────────────────────────

export function useFocusSessions(taskId: number) {
  return useQuery<FocusSession[]>({
    queryKey: ["focus", taskId],
    queryFn: () => api.get(`/focus/task/${taskId}`).then((r) => r.data),
    enabled: !!taskId,
  });
}

export function useCreateFocusSession() {
  const qc = useQueryClient();
  return useMutation<FocusSession, Error, FocusSessionCreate>({
    mutationFn: (data) => api.post("/focus", data).then((r) => r.data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["focus", vars.task_id] }),
  });
}

export function useCompleteFocusSession() {
  const qc = useQueryClient();
  return useMutation<FocusSession, Error, number>({
    mutationFn: (id) =>
      api.patch(`/focus/${id}/complete`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["focus"] }),
  });
}

// ─── Workspace Snapshots ─────────────────────────────────────────────────────

export function useLatestSnapshot(taskId: number) {
  return useQuery<WorkspaceSnapshot>({
    queryKey: ["snapshot", taskId],
    queryFn: () =>
      api.get(`/workspaces/task/${taskId}/latest`).then((r) => r.data),
    enabled: !!taskId,
  });
}

export function useSaveSnapshot() {
  const qc = useQueryClient();
  return useMutation<WorkspaceSnapshot, Error, WorkspaceSnapshotCreate>({
    mutationFn: (data) => api.post("/workspaces", data).then((r) => r.data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["snapshot", vars.task_id] }),
  });
}
