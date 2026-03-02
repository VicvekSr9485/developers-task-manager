import { useState, useEffect, useRef, useCallback } from "react";
import { useCreateFocusSession, useCompleteFocusSession } from "./useTasks";

interface UseFocusTimerOptions {
  taskId: number;
  durationMinutes?: number;
  onComplete?: () => void;
}

export function useFocusTimer({
  taskId,
  durationMinutes = 25,
  onComplete,
}: UseFocusTimerOptions) {
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createSession = useCreateFocusSession();
  const completeSession = useCompleteFocusSession();

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clear();
            setIsRunning(false);
            // Mark session complete
            if (sessionId) {
              completeSession.mutate(sessionId);
            }
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clear();
    }
    return clear;
  }, [isRunning, clear, sessionId, completeSession, onComplete]);

  const start = useCallback(async () => {
    if (!sessionId) {
      const session = await createSession.mutateAsync({
        task_id: taskId,
        duration_minutes: durationMinutes,
      });
      setSessionId(session.id);
    }
    setIsRunning(true);
  }, [sessionId, taskId, durationMinutes, createSession]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    clear();
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setSessionId(null);
  }, [totalSeconds, clear]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    timeLeft,
    minutes,
    seconds,
    isRunning,
    sessionId,
    start,
    pause,
    reset,
    progress: 1 - timeLeft / totalSeconds,
  };
}
