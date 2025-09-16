
import {
  collection,
  collectionGroup,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  where
} from "firebase/firestore";
import Env from "../../../config/env";
import { db } from "../../../config/firebase";
import useDbService from "../../services/DbService";
import { DashboardAnalytics, UserStatistics } from "./types";

export const useDashboardServices = () => {
  const { jobPostsRef, savedJobsRef, usersRef } = useDbService();

  const getBasicStatistics = async () => {
    try {
      // Batch 1: Job-related queries
      const [
        totalJobsPosted,
        activeJobPosts,
        totalJobsApplied
      ] = await Promise.all([
        getCountFromServer(
          query(
            jobPostsRef,
            where("isProduction", "==", Env.isProduction)
          )
        ),
        getCountFromServer(
          query(
            jobPostsRef,
            where("isActive", "==", true),
            where("isProduction", "==", Env.isProduction)
          )
        ),
        getCountFromServer(
          query(
            collectionGroup(db, "applications"),
            where("isProduction", "==", Env.isProduction)
          )
        )
      ]);

      // Small delay to prevent resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));

      // Batch 2: User-related queries
      const [
        totalSavedJobs,
        hiredCandidates,
        totalUsers
      ] = await Promise.all([
        getCountFromServer(
          query(
            savedJobsRef,
            where("isProduction", "==", Env.isProduction)
          )
        ),
        getCountFromServer(
          query(
            collectionGroup(db, "applicants"),
            where("isProduction", "==", Env.isProduction)
          )
        ),
        getCountFromServer(
          query(usersRef)
        )
      ]);

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Batch 3: User status queries
      const [
        verifiedUsers,
        activeUsers,
        newUsersThisMonth
      ] = await Promise.all([
        getCountFromServer(
          query(
            usersRef,
            where("isVerified", "==", true)
          )
        ),
        getCountFromServer(
          query(
            usersRef,
            where("status", "==", "active")
          )
        ),
        getCountFromServer(
          query(
            usersRef,
            where("dateAdded", ">=", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          )
        )
      ]);

      return {
        totalJobsPosted: totalJobsPosted.data().count,
        totalJobsApplied: totalJobsApplied.data().count,
        activeJobPosts: activeJobPosts.data().count,
        hiredCandidates: hiredCandidates.data().count,
        profileViews: totalSavedJobs.data().count,
        totalUsers: totalUsers.data().count,
        verifiedUsers: verifiedUsers.data().count,
        newUsersThisMonth: newUsersThisMonth.data().count,
        activeUsers: activeUsers.data().count
      };
    } catch (error) {
      console.error("Error fetching basic statistics:", error);
      throw error;
    }
  };

  const getComplexStatistics = async () => {
    try {
      const userJobsQuery = query(
        jobPostsRef,
        where("isProduction", "==", Env.isProduction)
      );
      const userJobsSnapshot = await getDocs(userJobsQuery);

      let totalViews = 0;
      let totalApplications = 0;
      const docs = userJobsSnapshot.docs;

      // Process jobs in batches to avoid overwhelming Firebase
      const batchSize = 5;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);

        // Process views synchronously (no query needed)
        for (const jobDoc of batch) {
          const jobData = jobDoc.data();
          totalViews += jobData.views || 0;
        }

        // Process applications in parallel for this batch
        const applicationPromises = batch.map(async (jobDoc) => {
          try {
            const applicationsQuery = query(
              collection(jobDoc.ref, "applications"),
              where("isProduction", "==", Env.isProduction)
            );
            const applicationsCount = await getCountFromServer(applicationsQuery);
            return applicationsCount.data().count;
          } catch (error) {
            console.error(`Error fetching applications for job ${jobDoc.id}:`, error);
            return 0;
          }
        });

        const applicationCounts = await Promise.all(applicationPromises);
        totalApplications += applicationCounts.reduce((sum, count) => sum + count, 0);

        // Add delay between batches to prevent resource exhaustion
        if (i + batchSize < docs.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return {
        totalViews,
        totalApplications
      };
    } catch (error) {
      console.error("Error fetching complex statistics:", error);
      throw error;
    }
  };

  const getUserStatistics = async (): Promise<UserStatistics> => {
    try {
      const [basicStats, complexStats] = await Promise.all([
        getBasicStatistics(),
        getComplexStatistics()
      ]);

      const responseRate = complexStats.totalApplications > 0 ?
        Math.round((basicStats.hiredCandidates / complexStats.totalApplications) * 100 * 10) / 10 : 0;

      return {
        ...basicStats,
        ...complexStats,
        responseRate
      };
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw error;
    }
  };

  const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
 

    try {
      const userJobsQuery = query(
        jobPostsRef,
        where("isProduction", "==", Env.isProduction),
        orderBy("datePosted", "desc")
      );
      const userJobsSnapshot = await getDocs(userJobsQuery);

      const monthlyData: { [key: string]: { jobs: number; applications: number } } = {};
      const jobPerformance: { title: string; applications: number; views: number }[] = [];

      for (const jobDoc of userJobsSnapshot.docs) {
        const jobData = jobDoc.data();
        const datePosted = new Date(jobData.datePosted);
        const monthKey = datePosted.toLocaleString('default', { month: 'short' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { jobs: 0, applications: 0 };
        }
        monthlyData[monthKey].jobs++;

        const applicationsQuery = query(
          collection(jobDoc.ref, "applications"),
          where("isProduction", "==", Env.isProduction)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsCount = applicationsSnapshot.docs.length;

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

      return {
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
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      throw error;
    }
  };



  return {
    getUserStatistics,
    getBasicStatistics,
    getComplexStatistics,
    getDashboardAnalytics,
  };
};



