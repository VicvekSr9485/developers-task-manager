"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Read directly from localStorage as a fallback — Zustand hydrates async
  const token =
    useAppStore((s) => s.token) ??
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
