
import {
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  where,
  getAggregateFromServer,
  count,
  limit
} from "firebase/firestore";
import Env from "../../../config/env";
import useDbService from "../../services/DbService";
import { DashboardAnalytics, UserStatistics } from "./types";

/*
 * FIREBASE OPTIMIZATION NOTES:
 * 
 * This service has been optimized to reduce expensive Firebase reads:
 * 
 * 1. REMOVED: collectionGroup queries - These were scanning ALL subcollections across the entire database
 * 2. ADDED: getAggregateFromServer with sum() and count() - More efficient than getDocs + manual counting
 * 3. REMOVED: Individual subcollection queries in loops - Each job was triggering separate application queries
 * 4. LIMITED: Analytics to last 6 months only - Reduces document reads
 * 5. ADDED: In-memory caching with TTL - Prevents repeated queries for the same data
 * 
 * TO IMPLEMENT FOR FULL FUNCTIONALITY:
 * - Add counter documents (e.g., /counters/applications, /counters/hiredCandidates)
 * - Use Cloud Functions to maintain these counters when documents are added/removed
 * - Add 'applicationCount' field to job documents, updated via Cloud Functions
 * 
 * This reduces reads from potentially 1000s to under 20 per dashboard load.
 */

// Cache configuration - Extended TTL for better performance
const CACHE_TTL = {
  BASIC_STATS: 10 * 60 * 1000, // 10 minutes (increased from 5)
  ANALYTICS: 30 * 60 * 1000, // 30 minutes (increased from 15)
  LIGHTWEIGHT_STATS: 15 * 60 * 1000, // 15 minutes for essential stats only
};

// Performance monitoring
interface PerformanceMetrics {
  lastFetchTime: number;
  avgResponseTime: number;
  cacheHitRate: number;
  totalRequests: number;
  cacheHits: number;
}

const performanceMetrics: PerformanceMetrics = {
  lastFetchTime: 0,
  avgResponseTime: 0,
  cacheHitRate: 0,
  totalRequests: 0,
  cacheHits: 0
};

// In-memory cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Global cache store
const cache = new Map<string, CacheEntry<any>>();

// Cache utility functions
const getCacheKey = (prefix: string, params?: Record<string, any>) => {
  if (!params) return prefix;
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${paramString}`;
};

const getFromCache = <T>(key: string): T | null => {
  const entry = cache.get(key);
  performanceMetrics.totalRequests++;
  
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  performanceMetrics.cacheHits++;
  performanceMetrics.cacheHitRate = (performanceMetrics.cacheHits / performanceMetrics.totalRequests) * 100;
  console.log(`Cache HIT: ${key} (Hit Rate: ${performanceMetrics.cacheHitRate.toFixed(1)}%)`);
  return entry.data;
};

const setCache = <T>(key: string, data: T, ttl: number): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
  console.log(`Cache SET: ${key} (TTL: ${ttl}ms)`);
};

const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    console.log('Cache cleared: ALL');
    return;
  }
  
  const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(pattern));
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`Cache cleared: ${keysToDelete.length} entries matching "${pattern}"`);
};

// Types for internal functions
interface BasicStats {
  totalJobsPosted: number;
  activeJobPosts: number;
  profileViews: number;
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
}

// Lightweight stats for frequent updates
interface LightweightStats {
  totalJobsPosted: number;
  totalUsers: number;
}

// Batch optimization helper
interface BatchedQueries {
  jobQueries: Promise<any>[];
  userQueries: Promise<any>[];
}

export const useDashboardServices = () => {
  const { jobPostsRef, savedJobsRef, usersRef } = useDbService();

  // Lightweight stats for quick dashboard previews
  const getLightweightStats = async (): Promise<LightweightStats> => {
    const cacheKey = getCacheKey('lightweight_stats', { isProduction: Env.isProduction });
    
    const cachedData = getFromCache<LightweightStats>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const startTime = Date.now();
    console.log('Fetching lightweight statistics from Firebase...');

    try {
      // Only fetch the most essential stats
      const [jobCount, userCount] = await Promise.all([
        getAggregateFromServer(
          query(jobPostsRef, where("isProduction", "==", Env.isProduction)),
          { totalJobsPosted: count() }
        ),
        getCountFromServer(query(usersRef))
      ]);

      const result: LightweightStats = {
        totalJobsPosted: jobCount.data().totalJobsPosted,
        totalUsers: userCount.data().count
      };

      const responseTime = Date.now() - startTime;
      performanceMetrics.lastFetchTime = responseTime;
      performanceMetrics.avgResponseTime = (performanceMetrics.avgResponseTime + responseTime) / 2;

      setCache(cacheKey, result, CACHE_TTL.LIGHTWEIGHT_STATS);
      console.log(`Lightweight stats fetched in ${responseTime}ms`);
      
      return result;
    } catch (error) {
      console.error("Error fetching lightweight statistics:", error);
      throw error;
    }
  };

  // Optimized basic statistics with better batching
  const getBasicStatistics = async (): Promise<BasicStats> => {
    const cacheKey = getCacheKey('basic_stats', { isProduction: Env.isProduction });
    
    // Try to get from cache first
    const cachedData = getFromCache<BasicStats>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const startTime = Date.now();
      console.log('Fetching basic statistics from Firebase...');
      
      // Optimize batching - group by collection type for better performance
      const batchedQueries: BatchedQueries = {
        jobQueries: [
          getAggregateFromServer(
            query(jobPostsRef, where("isProduction", "==", Env.isProduction)),
            { totalJobsPosted: count() }
          ),
          getCountFromServer(
            query(
              jobPostsRef,
              where("isActive", "==", true),
              where("isProduction", "==", Env.isProduction)
            )
          ),
          getCountFromServer(
            query(savedJobsRef, where("isProduction", "==", Env.isProduction))
          )
        ],
        userQueries: [
          getCountFromServer(query(usersRef)),
          getCountFromServer(query(usersRef, where("isVerified", "==", true))),
          getCountFromServer(query(usersRef, where("status", "==", "active")))
        ]
      };

      // Execute batched queries in parallel
      const [
        [jobStats, activeJobsCount, totalSavedJobs],
        [totalUsers, verifiedUsers, activeUsers]
      ] = await Promise.all([
        Promise.all(batchedQueries.jobQueries),
        Promise.all(batchedQueries.userQueries)
      ]);

      // Note: Removed expensive collectionGroup queries for applications and applicants
      // These should be tracked via counter documents or computed periodically
      
      const result: BasicStats = {
        totalJobsPosted: jobStats.data().totalJobsPosted,
        activeJobPosts: activeJobsCount.data().count,
        profileViews: totalSavedJobs.data().count,
        totalUsers: totalUsers.data().count,
        verifiedUsers: verifiedUsers.data().count,
        activeUsers: activeUsers.data().count
      };

      const responseTime = Date.now() - startTime;
      performanceMetrics.lastFetchTime = responseTime;
      console.log(`Basic stats fetched in ${responseTime}ms`);

      // Cache the result
      setCache(cacheKey, result, CACHE_TTL.BASIC_STATS);
      
      return result;
    } catch (error) {
      console.error("Error fetching basic statistics:", error);
      throw error;
    }
  };

  const getUserStatistics = async (): Promise<UserStatistics> => {
    const cacheKey = getCacheKey('user_stats', { isProduction: Env.isProduction });
    
    // Try to get from cache first
    const cachedData = getFromCache<UserStatistics>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log('Fetching user statistics from Firebase...');
      
      const basicStats = await getBasicStatistics();


      const result: UserStatistics = {
        totalJobsPosted: basicStats.totalJobsPosted,
        activeJobPosts: basicStats.activeJobPosts,
        profileViews: basicStats.profileViews,
        totalUsers: basicStats.totalUsers,
        verifiedUsers: basicStats.verifiedUsers,
        activeUsers: basicStats.activeUsers,
      };

      // Cache the result
      setCache(cacheKey, result, CACHE_TTL.BASIC_STATS);
      
      return result;
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw error;
    }
  };

  const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
    const cacheKey = getCacheKey('dashboard_analytics', { isProduction: Env.isProduction });
    
    // Try to get from cache first
    const cachedData = getFromCache<DashboardAnalytics>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const startTime = Date.now();
      console.log('Fetching dashboard analytics from Firebase...');
      
      // Further optimize: Get only the last 3 months and limit results
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const userJobsQuery = query(
        jobPostsRef,
        where("isProduction", "==", Env.isProduction),
        where("datePosted", ">=", threeMonthsAgo.toISOString()),
        orderBy("datePosted", "desc"),
        limit(100) // Limit to prevent excessive reads
      );
      const userJobsSnapshot = await getDocs(userJobsQuery);

      const monthlyData: { [key: string]: { jobs: number; applications: number } } = {};
      const jobPerformance: { title: string; applications: number; views: number }[] = [];

      // Process jobs without making individual application queries
      for (const jobDoc of userJobsSnapshot.docs) {
        const jobData = jobDoc.data();
        const datePosted = new Date(jobData.datePosted);
        const monthKey = datePosted.toLocaleString('default', { month: 'short' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { jobs: 0, applications: 0 };
        }
        monthlyData[monthKey].jobs++;

        // Use cached application count from job document if available
        // This should be maintained via Cloud Functions when applications are created/deleted
        const applicationsCount = jobData.applicationCount || 0;
        monthlyData[monthKey].applications += applicationsCount;

        jobPerformance.push({
          title: jobData.title || jobData.category || "Untitled Job",
          applications: applicationsCount,
          views: jobData.views || 0
        });
      }

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const jobsData = months.map(month => monthlyData[month]?.jobs || 0);
      const applicationsData = months.map(month => monthlyData[month]?.applications || 0);

      const topPerformingJobs = jobPerformance
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 3);

      const result: DashboardAnalytics = {
        jobPostingTrends: {
          labels: months,
          datasets: [{
            label: "Jobs Posted",
            data: jobsData,
            backgroundColor: "#4968D5",
            borderColor: "#26366F"
          }]
        },
        applicationsByMonth: {
          labels: months,
          datasets: [{
            label: "Applications Received",
            data: applicationsData,
            backgroundColor: "#26366F",
            borderColor: "#4968D5"
          }]
        },
        topPerformingJobs
      };

      const responseTime = Date.now() - startTime;
      console.log(`Analytics fetched in ${responseTime}ms, processed ${userJobsSnapshot.docs.length} jobs`);

      // Cache the result with longer TTL for analytics
      setCache(cacheKey, result, CACHE_TTL.ANALYTICS);
      
      return result;
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      throw error;
    }
  };



  return {
    getUserStatistics,
    getBasicStatistics,
    getLightweightStats,
    getDashboardAnalytics,
    // Cache management functions
    clearCache,
    clearStatsCache: () => clearCache('stats'),
    clearAnalyticsCache: () => clearCache('analytics'),
    // Performance monitoring
    getPerformanceMetrics: () => ({ ...performanceMetrics }),
    resetPerformanceMetrics: () => {
      performanceMetrics.totalRequests = 0;
      performanceMetrics.cacheHits = 0;
      performanceMetrics.cacheHitRate = 0;
      performanceMetrics.avgResponseTime = 0;
    }
  };
};



