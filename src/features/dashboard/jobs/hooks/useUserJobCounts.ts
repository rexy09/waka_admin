import { useQuery } from "@tanstack/react-query";
import { useJobServices } from "../services";

/**
 * Custom hooks for fetching user job counts with React Query caching
 *
 * Cache configuration:
 * - Data is cached for 5 minutes (staleTime)
 * - Cache persists for 10 minutes (gcTime)
 * - No automatic refetch on window focus
 */

// Query keys for cache management
export const jobCountKeys = {
  all: ["jobCounts"] as const,
  user: (userId: string) => ["jobCounts", userId] as const,
  applied: (userId: string) =>
    [...jobCountKeys.user(userId), "applied"] as const,
  saved: (userId: string) => [...jobCountKeys.user(userId), "saved"] as const,
  hired: (userId: string) => [...jobCountKeys.user(userId), "hired"] as const,
  allCounts: (userId: string) => [...jobCountKeys.user(userId), "all"] as const,
};

/**
 * Hook to fetch user's applied jobs count with caching
 */
export const useUserAppliedJobsCount = (userId: string | undefined) => {
  const { getUserAppliedJobsCount } = useJobServices();

  return useQuery({
    queryKey: jobCountKeys.applied(userId || ""),
    queryFn: () => getUserAppliedJobsCount(userId!),
    enabled: !!userId, // Only run query if userId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch user's saved jobs count with caching
 */
export const useUserSavedJobsCount = (userId: string | undefined) => {
  const { getUserSavedJobsCount } = useJobServices();

  return useQuery({
    queryKey: jobCountKeys.saved(userId || ""),
    queryFn: () => getUserSavedJobsCount(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch user's hired jobs count with caching
 */
export const useUserHiredJobsCount = (userId: string | undefined) => {
  const { getUserHiredJobsCount } = useJobServices();

  return useQuery({
    queryKey: jobCountKeys.hired(userId || ""),
    queryFn: () => getUserHiredJobsCount(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Combined hook to fetch all user job counts at once
 * This is more efficient than calling separate hooks
 */
export const useUserJobCounts = (userId: string | undefined) => {
  const {
    getUserAppliedJobsCount,
    getUserSavedJobsCount,
    getUserHiredJobsCount,
    getUserPostedJobsCount,
  } = useJobServices();

  return useQuery({
    queryKey: jobCountKeys.allCounts(userId || ""),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const [applied, saved, hired, posted] = await Promise.all([
        getUserAppliedJobsCount(userId),
        getUserSavedJobsCount(userId),
        getUserHiredJobsCount(userId),
        getUserPostedJobsCount(userId),
      ]);

      return { applied, saved, hired, posted };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
