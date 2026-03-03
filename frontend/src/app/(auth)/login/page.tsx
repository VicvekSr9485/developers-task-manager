"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { TokenOut } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  username: z.string().min(2, "Username must be at least 2 characters").regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, hyphens and underscores only").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    if (isRegister && !data.username?.trim()) {
      setServerError("Username is required to create an account.");
      return;
    }
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const res = await api.post<TokenOut>(endpoint, data);
      setToken(res.data.access_token);
      setUser(res.data.user);
      router.push("/tasks");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      const message =
        Array.isArray(detail)
          ? (detail as { msg: string }[]).map((e) => e.msg).join(", ")
          : typeof detail === "string"
            ? detail
            : "Something went wrong. Please try again.";
      setServerError(message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      {/* Back home */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" /> Home
      </button>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">DevTaskr</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister ? "Create your account" : "Sign in to your workspace"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-card border border-border rounded-xl p-8 shadow-sm"
        >
          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={cn(
                "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
                "focus:ring-2 focus:ring-primary/50 transition",
                errors.email ? "border-destructive" : "border-input"
              )}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register("username")}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
                  "focus:ring-2 focus:ring-primary/50 transition",
                  errors.username ? "border-destructive" : "border-input"
                )}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              {...register("password")}
              className={cn(
                "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
                "focus:ring-2 focus:ring-primary/50 transition",
                errors.password ? "border-destructive" : "border-input"
              )}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait…"
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegister((v) => !v)}
            className="text-primary underline-offset-2 hover:underline"
          >
            {isRegister ? "Sign in" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
