"use client";

import { useFocusTimer } from "@/hooks/useFocusTimer";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw } from "lucide-react";

interface FocusTimerProps {
  taskId: number;
  durationMinutes?: number;
}

export function FocusTimer({ taskId, durationMinutes = 25 }: FocusTimerProps) {
  const { minutes, seconds, isRunning, progress, start, pause, reset } =
    useFocusTimer({ taskId, durationMinutes });

  const circumference = 2 * Math.PI * 54; // radius = 54

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
      {/* SVG ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000",
              isRunning ? "text-primary" : "text-muted-foreground"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {isRunning ? "Focus session in progress…" : "Ready to focus"}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="p-2 rounded-full border border-input hover:bg-accent transition"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={isRunning ? pause : start}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {durationMinutes} min Pomodoro
      </p>
    </div>
  );
}
