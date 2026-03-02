"use client";

import { WorkspaceSnapshot } from "@/types";
import { useSaveSnapshot } from "@/hooks/useTasks";
import { formatDate } from "@/lib/utils";
import { Save, FolderOpen, GitBranch, Terminal } from "lucide-react";

interface WorkspaceBadgeProps {
  taskId: number;
  snapshot?: WorkspaceSnapshot;
}

export function WorkspaceBadge({ taskId, snapshot }: WorkspaceBadgeProps) {
  const saveSnapshot = useSaveSnapshot();

  const handleCapture = () => {
    // In a real desktop integration this would capture the IDE state.
    // Here we save a placeholder snapshot demonstrating the schema.
    saveSnapshot.mutate({
      task_id: taskId,
      snapshot_json: {
        open_files: [],
        notes: "",
        terminal_commands: [],
        cursor_positions: {},
        active_branch: null,
        captured_at: new Date().toISOString(),
      },
    });
  };

  const data = snapshot?.snapshot_json as
    | {
        open_files?: string[];
        notes?: string;
        terminal_commands?: string[];
        active_branch?: string | null;
      }
    | undefined;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {snapshot ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Captured {formatDate(snapshot.created_at)}
          </p>

          {data?.active_branch && (
            <div className="flex items-center gap-1.5 text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
              <GitBranch className="w-3.5 h-3.5" />
              {data.active_branch}
            </div>
          )}

          {data?.open_files && data.open_files.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" /> Open Files
              </p>
              <ul className="space-y-0.5">
                {data.open_files.slice(0, 5).map((f, i) => (
                  <li
                    key={i}
                    className="text-xs font-mono text-muted-foreground truncate"
                  >
                    {f}
                  </li>
                ))}
                {data.open_files.length > 5 && (
                  <li className="text-xs text-muted-foreground/60">
                    +{data.open_files.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {data?.terminal_commands && data.terminal_commands.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> Last Commands
              </p>
              <ul className="space-y-0.5">
                {data.terminal_commands.slice(-3).map((cmd, i) => (
                  <li
                    key={i}
                    className="text-xs font-mono text-muted-foreground truncate bg-muted px-1.5 py-0.5 rounded"
                  >
                    $ {cmd}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data?.notes && (
            <p className="text-xs text-muted-foreground italic line-clamp-3">
              {data.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No snapshot saved yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Capture your open files, branch, and terminal state.
          </p>
        </div>
      )}

      <button
        onClick={handleCapture}
        disabled={saveSnapshot.isPending}
        className="w-full flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-md border border-input hover:bg-accent transition disabled:opacity-60"
      >
        <Save className="w-3.5 h-3.5" />
        {saveSnapshot.isPending ? "Saving…" : "Capture Snapshot"}
      </button>
    </div>
  );
}
