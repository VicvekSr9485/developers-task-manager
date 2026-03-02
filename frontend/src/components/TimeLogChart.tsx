"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TimeLog } from "@/types";
import { useStartTimeLog, useStopTimeLog } from "@/hooks/useTasks";
import { useState } from "react";
import { Play, Square } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface TimeLogChartProps {
  timeLogs: TimeLog[];
  taskId?: number;
}

export function TimeLogChart({ timeLogs, taskId }: TimeLogChartProps) {
  const startLog = useStartTimeLog();
  const stopLog = useStopTimeLog();

  const activeLog = timeLogs.find((l) => !l.ended_at);
  const [stopping, setStopping] = useState(false);

  const handleStart = () => {
    if (taskId) startLog.mutate(taskId);
  };

  const handleStop = async () => {
    if (!activeLog) return;
    setStopping(true);
    await stopLog.mutateAsync(activeLog.id);
    setStopping(false);
  };

  const chartData = timeLogs
    .filter((l) => l.duration_seconds)
    .slice(-10)
    .map((l, i) => ({
      name: `#${i + 1}`,
      minutes: Math.round((l.duration_seconds ?? 0) / 60),
    }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Controls */}
      {taskId && (
        <div className="flex items-center gap-3">
          {activeLog ? (
            <button
              onClick={handleStop}
              disabled={stopping}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-60"
            >
              <Square className="w-3.5 h-3.5" /> Stop Tracking
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              <Play className="w-3.5 h-3.5" /> Start Tracking
            </button>
          )}
          {activeLog && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Timer running…
            </span>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit="m"
            />
            <Tooltip
              formatter={(v: number | undefined) => [formatDuration((v ?? 0) * 60), "Duration"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={`hsl(${218 + i * 8} 84% ${60 - i * 2}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No completed time logs yet.
        </p>
      )}
    </div>
  );
}
