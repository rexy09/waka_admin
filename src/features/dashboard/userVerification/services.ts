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
  IUserVerificationProfile,
  IVerificationFilters,
  IVerificationStatusUpdate,
  VerificationStatus,
} from "./types";
import { IUser } from "../../auth/types";

export const useUserVerificationServices = () => {
  const { userVerificationRef, usersRef } = useDbService();

  const getVerificationRequests = async (
    filters?: IVerificationFilters,
    lastDocument?: any,
    limitCount: number = 10
  ) => {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters?.verificationType) {
        constraints.push(
          where("verificationType", "==", filters.verificationType)
        );
      }

      // Order by date (most recent first)
      constraints.push(orderBy("dateAdded", "desc"));

      // Pagination
      if (lastDocument) {
        constraints.push(startAfter(lastDocument));
      }
      constraints.push(limit(limitCount));

      const q = query(userVerificationRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const verifications: IUserVerificationProfile[] = [];
      querySnapshot.forEach((doc) => {
        verifications.push({
          id: doc.id,
          ...doc.data(),
        } as IUserVerificationProfile);
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        data: verifications,
        lastDoc: lastDoc,
        hasMore: querySnapshot.docs.length === limitCount,
      };
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      throw error;
    }
  };

  const getVerificationById = async (verificationId: string) => {
    try {
      const verificationDoc = await getDoc(
        doc(userVerificationRef, verificationId)
      );
      if (verificationDoc.exists()) {
        return {
          id: verificationDoc.id,
          ...verificationDoc.data(),
        } as IUserVerificationProfile;
      }
      throw new Error("Verification request not found");
    } catch (error) {
      console.error("Error fetching verification request:", error);
      throw error;
    }
  };

  const getUserDetails = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(usersRef, userId));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
        } as IUser;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const updateVerificationStatus = async (
    verificationId: string,
    updateData: IVerificationStatusUpdate
  ) => {
    try {
      const verificationRef = doc(userVerificationRef, verificationId);
      const updatePayload: any = {
        status: updateData.status,
        reviewNotes: updateData.reviewNotes || "",
        reviewedBy: updateData.reviewedBy,
        reviewedByName: updateData.reviewedByName,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (updateData.rejectionReason) {
        updatePayload.rejectionReason = updateData.rejectionReason;
      }

      if (updateData.additionalInfoRequested) {
        updatePayload.additionalInfoRequested =
          updateData.additionalInfoRequested;
      }

      await updateDoc(verificationRef, updatePayload);

      // If approved, update user's isVerified status
      if (
        updateData.status === "approved" &&
        updateData.updateUserVerificationStatus
      ) {
        const verification = await getVerificationById(verificationId);
        if (verification.uid) {
          const userRef = doc(usersRef, verification.uid);
          await updateDoc(userRef, {
            isVerified: true,
            updatedAt: Timestamp.now(),
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating verification status:", error);
      throw error;
    }
  };

  const getVerificationCountByStatus = async (status: VerificationStatus) => {
    try {
      const q = query(userVerificationRef, where("status", "==", status));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting verification count:", error);
      return 0;
    }
  };

  return {
    getVerificationRequests,
    getVerificationById,
    getUserDetails,
    updateVerificationStatus,
    getVerificationCountByStatus,
  };
};
