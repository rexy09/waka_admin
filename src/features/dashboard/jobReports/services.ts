import {
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  where,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import useDbService from "../../services/DbService";
import {
  IJobReport,
  IJobReportFilters,
  IReportStatusUpdate,
  ReportStatus,
} from "./types";
import { IJobPost } from "../jobs/types";

export const useJobReportServices = () => {
  const { jobReportsRef, jobPostsRef } = useDbService();

  const getJobReports = async (
    filters?: IJobReportFilters,
    lastDocument?: any,
    limitCount: number = 10
  ) => {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters?.reason) {
        constraints.push(where("reason", "==", filters.reason));
      }

      // Order by date (most recent first)
      constraints.push(orderBy("dateAdded", "desc"));

      // Pagination
      if (lastDocument) {
        constraints.push(startAfter(lastDocument));
      }
      constraints.push(limit(limitCount));

      const q = query(jobReportsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const reports: IJobReport[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data(),
        } as IJobReport);
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        data: reports,
        lastDoc: lastDoc,
        hasMore: querySnapshot.docs.length === limitCount,
      };
    } catch (error) {
      console.error("Error fetching job reports:", error);
      throw error;
    }
  };

  const getJobReportById = async (reportId: string) => {
    try {
      const reportDoc = await getDoc(doc(jobReportsRef, reportId));
      if (reportDoc.exists()) {
        return {
          id: reportDoc.id,
          ...reportDoc.data(),
        } as IJobReport;
      }
      throw new Error("Report not found");
    } catch (error) {
      console.error("Error fetching job report:", error);
      throw error;
    }
  };

  const getJobDetails = async (jobId: string) => {
    try {
      const jobDoc = await getDoc(doc(jobPostsRef, jobId));
      if (jobDoc.exists()) {
        return {
          id: jobDoc.id,
          ...jobDoc.data(),
        } as IJobPost;
      }
      return null;
    } catch (error) {
      console.error("Error fetching job details:", error);
      return null;
    }
  };

  const updateReportStatus = async (
    reportId: string,
    updateData: IReportStatusUpdate
  ) => {
    try {
      const reportRef = doc(jobReportsRef, reportId);
      await updateDoc(reportRef, {
        status: updateData.status,
        reviewNotes: updateData.reviewNotes || "",
        actionTaken: updateData.actionTaken || "",
        reviewedBy: updateData.reviewedBy,
        reviewedByName: updateData.reviewedByName,
        dateUpdated: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  };

  const getReportCountByStatus = async (status: ReportStatus) => {
    try {
      const q = query(jobReportsRef, where("status", "==", status));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting report count:", error);
      return 0;
    }
  };

  return {
    getJobReports,
    getJobReportById,
    getJobDetails,
    updateReportStatus,
    getReportCountByStatus,
  };
};
