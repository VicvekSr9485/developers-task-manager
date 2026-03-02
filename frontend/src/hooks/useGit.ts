import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCurrentBranch(enabled = true) {
  return useQuery<{ branch: string | null }>({
    queryKey: ["git", "current-branch"],
    queryFn: () => api.get("/git/current-branch").then((r) => r.data),
    enabled,
    staleTime: 10_000, // re-check every 10s
    retry: false,       // don't spam if git not available
  });
}

export function useGitBranches() {
  return useQuery<{ branches: string[] }>({
    queryKey: ["git", "branches"],
    queryFn: () => api.get("/git/branches").then((r) => r.data),
    staleTime: 15_000,
    retry: false,
  });
}
