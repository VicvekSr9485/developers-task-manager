"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  GitBranch,
  Timer,
  LayoutGrid,
  FolderOpen,
  Tag,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Kanban Board",
    description:
      "Visualise your workflow across Todo → In Progress → Blocked → In Review → Done.",
  },
  {
    icon: GitBranch,
    title: "Git Branch Linking",
    description:
      "Associate every task with a git branch so you never lose context when switching work.",
  },
  {
    icon: Timer,
    title: "Pomodoro Focus Timer",
    description:
      "Built-in 25-minute focus sessions tracked per task to keep you in flow state.",
  },
  {
    icon: Clock,
    title: "Time Logging",
    description:
      "Start and stop a timer per task. See a bar chart of your logged sessions at a glance.",
  },
  {
    icon: FolderOpen,
    title: "Workspace Snapshots",
    description:
      "Save open files, terminal history, and notes per task — restore context instantly.",
  },
  {
    icon: Tag,
    title: "Colour-coded Tags",
    description:
      "Organise tasks with custom hex-coloured labels and filter your board by them.",
  },
];

export default function Home() {
  const router = useRouter();
  const token =
    useAppStore((s) => s.token) ??
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  useEffect(() => {
    if (token) {
      router.replace("/tasks");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-lg mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">DevTaskr</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-medium px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-screen-lg mx-auto px-6 py-24 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-primary/30 text-primary bg-primary/5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Built for software developers
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
          Task management that<br />
          <span className="text-primary">thinks like a developer</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          DevTaskr links tasks to git branches, tracks focus sessions, logs your
          time, and snapshots your workspace — so context switching costs nothing.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition underline-offset-2 hover:underline"
          >
            View API docs
          </a>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-screen-lg mx-auto px-6 pb-24">
        <h2 className="text-center text-2xl font-bold mb-10">Everything you need, nothing you don&apos;t</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-border">
        <div className="max-w-screen-lg mx-auto px-6 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to ship faster?</h2>
          <p className="text-muted-foreground">Create your free account and set up your board in under a minute.</p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Create account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

