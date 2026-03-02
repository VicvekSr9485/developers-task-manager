"use client";

import { useState } from "react";
import { WorkspaceSnapshot } from "@/types";
import { useSaveSnapshot } from "@/hooks/useTasks";
import { useCurrentBranch } from "@/hooks/useGit";
import { formatDate } from "@/lib/utils";
import { Save, FolderOpen, GitBranch, Terminal, Pencil, X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceBadgeProps {
  taskId: number;
  snapshot?: WorkspaceSnapshot;
}

type SnapshotData = {
  open_files: string[];
  notes: string;
  terminal_commands: string[];
  active_branch: string | null;
};

export function WorkspaceBadge({ taskId, snapshot }: WorkspaceBadgeProps) {
  const saveSnapshot = useSaveSnapshot();
  const { data: branchData } = useCurrentBranch();
  const [editing, setEditing] = useState(false);

  const existing = snapshot?.snapshot_json as SnapshotData | undefined;

  const [openFiles, setOpenFiles] = useState<string[]>(existing?.open_files ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [commands, setCommands] = useState<string[]>(existing?.terminal_commands ?? []);
  const [activeBranch, setActiveBranch] = useState(
    existing?.active_branch ?? branchData?.branch ?? ""
  );
  const [newFile, setNewFile] = useState("");
  const [newCmd, setNewCmd] = useState("");

  const openEdit = () => {
    // Seed branch from live git detection when opening the editor
    if (!activeBranch && branchData?.branch) {
      setActiveBranch(branchData.branch);
    }
    setEditing(true);
  };

  const handleSave = () => {
    saveSnapshot.mutate({
      task_id: taskId,
      snapshot_json: {
        open_files: openFiles,
        notes,
        terminal_commands: commands,
        cursor_positions: {},
        active_branch: activeBranch || null,
        captured_at: new Date().toISOString(),
      },
    });
    setEditing(false);
  };

  const data = snapshot?.snapshot_json as SnapshotData | undefined;

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Edit Snapshot</p>
          <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Branch */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5" /> Active Branch
            {branchData?.branch && (
              <button
                type="button"
                onClick={() => setActiveBranch(branchData.branch!)}
                className="ml-1 text-primary hover:underline text-xs"
              >
                use detected ({branchData.branch})
              </button>
            )}
          </label>
          <input
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            placeholder="feature/my-branch"
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Open files */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5" /> Open Files
          </label>
          <div className="space-y-1">
            {openFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="flex-1 text-xs font-mono bg-muted px-2 py-0.5 rounded truncate">{f}</span>
                <button onClick={() => setOpenFiles(openFiles.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-1">
              <input
                value={newFile}
                onChange={(e) => setNewFile(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFile.trim()) {
                    setOpenFiles([...openFiles, newFile.trim()]);
                    setNewFile("");
                  }
                }}
                placeholder="src/components/Auth.tsx (Enter to add)"
                className="flex-1 text-xs font-mono rounded border border-input bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => { if (newFile.trim()) { setOpenFiles([...openFiles, newFile.trim()]); setNewFile(""); } }}
                className="p-1 rounded bg-muted hover:bg-accent"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Terminal commands */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> Last Commands
          </label>
          <div className="space-y-1">
            {commands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="flex-1 text-xs font-mono bg-muted px-2 py-0.5 rounded truncate">$ {cmd}</span>
                <button onClick={() => setCommands(commands.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-1">
              <input
                value={newCmd}
                onChange={(e) => setNewCmd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCmd.trim()) {
                    setCommands([...commands, newCmd.trim()]);
                    setNewCmd("");
                  }
                }}
                placeholder="npm run dev (Enter to add)"
                className="flex-1 text-xs font-mono rounded border border-input bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => { if (newCmd.trim()) { setCommands([...commands, newCmd.trim()]); setNewCmd(""); } }}
                className="p-1 rounded bg-muted hover:bg-accent"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Where you left off…"
            className="w-full text-xs rounded-md border border-input bg-background px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saveSnapshot.isPending}
          className="w-full flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          {saveSnapshot.isPending ? "Saving…" : "Save Snapshot"}
        </button>
      </div>
    );
  }

  // ── Read view ──
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {snapshot ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Captured {formatDate(snapshot.created_at)}</p>
            <button onClick={openEdit} className="p-1 rounded hover:bg-accent" title="Edit snapshot">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

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
                  <li key={i} className="text-xs font-mono text-muted-foreground truncate">{f}</li>
                ))}
                {data.open_files.length > 5 && (
                  <li className="text-xs text-muted-foreground/60">+{data.open_files.length - 5} more</li>
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
                  <li key={i} className="text-xs font-mono text-muted-foreground truncate bg-muted px-1.5 py-0.5 rounded">$ {cmd}</li>
                ))}
              </ul>
            </div>
          )}

          {data?.notes && (
            <p className="text-xs text-muted-foreground italic line-clamp-3">{data.notes}</p>
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
        onClick={openEdit}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-md border border-input hover:bg-accent transition",
        )}
      >
        <Save className="w-3.5 h-3.5" />
        {snapshot ? "Update Snapshot" : "Capture Snapshot"}
      </button>
    </div>
  );
}

