import { Timestamp } from "firebase/firestore";

export type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "under_review"
  | "needs_info";



export interface IVerificationDocument {
  url: string;
  type: "image" | "pdf" | "document";
  name: string;
  uploadedAt: Timestamp | string;
}





export interface IVerificationFilters {
  status?: VerificationStatus;
  verificationType?: string;
}

export interface IVerificationStatusUpdate {
  status: VerificationStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
  reviewedBy: string;
  reviewedByName: string;
  updateUserVerificationStatus?: boolean;
}

export interface IUserVerificationProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  birthDate: string | null;
  gender: string | null;
  avatarURL: string | null;
  faceImageUrl: string;
  idCardImageUrl: string;
  idCardType: string;
  faceEmbeddings: number[];
  embeddingVersion: number;
  verificationMethod: string; // e.g., "face_scan"
  verificationStatus: "pending" | "verified" | "rejected" | "failed";
  verificationDate: string; // ISO timestamp
  dateAdded: string;
  dateUpdated: string;
  expiryDate: string | null;
  deviceId: string | null;
  isActive: boolean;
  isProduction: boolean;
  metadata: {
    apiMessage: string;
    apiStatus: string;
    embeddingSampleCount: number;
    hasFrontFaceImage: boolean;
    hasIdCard: boolean;
    hasImage: boolean;
    idCardType: string;
    imageUrl: string;
    registrationTimestamp: number;
    scanMethod: string; // e.g., "two_rotation_scan"
    totalSamples: number;
  };
}
