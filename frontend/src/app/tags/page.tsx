"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/useTasks";
import { Tag } from "@/types";
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
];

function TagRow({ tag }: { tag: Tag }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const updateTag = useUpdateTag(tag.id);
  const deleteTag = useDeleteTag();

  const save = async () => {
    await updateTag.mutateAsync({ name, color });
    setEditing(false);
  };

  const cancel = () => {
    setName(tag.name);
    setColor(tag.color);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "w-5 h-5 rounded-full border-2 transition",
                color === c ? "border-foreground scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer"
            title="Custom colour"
          />
        </div>
        <button
          onClick={save}
          disabled={updateTag.isPending}
          className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="p-1.5 rounded-md hover:bg-accent transition">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: tag.color }}
      />
      <span
        className="text-xs px-2 py-0.5 rounded-full border font-medium"
        style={{ borderColor: tag.color, color: tag.color }}
      >
        {tag.name}
      </span>
      <span className="text-xs font-mono text-muted-foreground">{tag.color}</span>
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-md hover:bg-accent transition"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete tag "${tag.name}"?`)) deleteTag.mutate(tag.id);
          }}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function TagsPage() {
  const router = useRouter();
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createTag.mutateAsync({ name: newName.trim(), color: newColor });
    setNewName("");
    setNewColor("#6366f1");
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/tasks")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Tasks
          </button>
          <span className="font-semibold">Manage Tags</span>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> New Tag
          </button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-8 space-y-4">
        {/* New tag form */}
        {creating && (
          <div className="rounded-lg border border-primary/40 bg-card px-4 py-4 space-y-3">
            <p className="text-sm font-medium">New Tag</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Tag name"
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-1.5 flex-wrap items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition",
                    newColor === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
                title="Custom colour"
              />
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full border font-medium"
                style={{ borderColor: newColor, color: newColor }}
              >
                {newName || "Preview"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createTag.isPending || !newName.trim()}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
              >
                {createTag.isPending ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => setCreating(false)}
                className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading tags…</p>
        ) : tags.length === 0 && !creating ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No tags yet.</p>
            <button
              onClick={() => setCreating(true)}
              className="text-sm text-primary hover:underline"
            >
              Create your first tag
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <TagRow key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
