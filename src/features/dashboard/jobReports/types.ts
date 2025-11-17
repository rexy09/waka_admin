import { Timestamp } from "firebase/firestore";
import { IJobPost } from "../jobs/types";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export type ReportReason =
  | "spam"
  | "inappropriate"
  | "fraud"
  | "misleading"
  | "duplicate"
  | "other";

export interface IJobReport {
  id: string;
  reporterId: string;
  fullName: string;
  jobId: string;
  reason: ReportReason | string;
  additionalDetails: string;
  status: ReportStatus;
  dateAdded: Timestamp | string;
  dateUpdated: Timestamp | string;
  reportedAt: Timestamp | string;
  reviewedAt?: Timestamp | string | null;
  reviewerId?: string | null;
  uid: string;
}

export interface IJobReportWithJobDetails extends IJobReport {
  jobDetails?: IJobPost;
}

export interface IJobReportFilters {
  status?: ReportStatus;
  reason?: ReportReason;
}

export interface IReportStatusUpdate {
  status: ReportStatus;
  reviewNotes?: string;
  actionTaken?: string;
  reviewedBy: string;
  reviewedByName: string;
}
