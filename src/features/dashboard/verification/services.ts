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
  getCountFromServer,
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
      const firstDoc = querySnapshot.docs[0];

      // Get total count
      const totalQuery = query(userVerificationRef, ...constraints.slice(0, constraints.length - 2)); // Remove startAfter and limit
      const totalSnapshot = await getCountFromServer(totalQuery);
      const totalCount = totalSnapshot.data().count;

      return {
        data: verifications,
        lastDoc: lastDoc,
        firstDoc: firstDoc,
        totalCount: totalCount,
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

      // If approved, set verificationStatus to "verified" and update verificationDate
      if (updateData.status === "approved") {
        updatePayload.verificationStatus = "verified";
        updatePayload.verificationDate = Timestamp.now();
      }

      // If rejected, set verificationStatus to "rejected"
      if (updateData.status === "rejected") {
        updatePayload.verificationStatus = "rejected";
      }

      if (updateData.rejectionReason) {
        updatePayload.rejectionReason = updateData.rejectionReason;
      }

      if (updateData.additionalInfoRequested) {
        updatePayload.additionalInfoRequested =
          updateData.additionalInfoRequested;
      }

      await updateDoc(verificationRef, updatePayload);

      // If approved, update user's isVerified status and send notification
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

          // Send notification to user
          try {
            const axios = (await import("axios")).default;
            const Env = (await import("../../../config/env")).default;

            await axios.post(
              Env.baseURL + "/notifications/job_notifications",
              {
                user_id: verification.uid,
                country_code: verification.country || "",
                title: "Account Verified ✅",
                body: "Congratulations! Your account has been verified. You now have access to all verified features.",
                data: {
                  type: "account_verification",
                  verificationId: verificationId,
                  timestamp: new Date().toISOString(),
                },
              }
            );
            console.log("Verification notification sent successfully");
          } catch (notificationError) {
            console.error("Error sending verification notification:", notificationError);
            // Don't throw error - verification was successful even if notification fails
          }
        }
      }

      // If rejected, send notification to user
      if (updateData.status === "rejected") {
        const verification = await getVerificationById(verificationId);
        if (verification.uid) {
          // Update user's isVerified to false
          const userRef = doc(usersRef, verification.uid);
          await updateDoc(userRef, {
            isVerified: false,
            updatedAt: Timestamp.now(),
          });

          // Send rejection notification
          try {
            const axios = (await import("axios")).default;
            const Env = (await import("../../../config/env")).default;

            const rejectionMessage = updateData.rejectionReason
              ? `Verification not approved. ${updateData.rejectionReason}. Please resubmit.`.substring(0, 160)
              : "Verification not approved. Please review your documents and resubmit.";

            await axios.post(
              Env.baseURL + "/notifications/job_notifications",
              {
                user_id: verification.uid,
                country_code: verification.country || "",
                title: "Verification Update",
                body: rejectionMessage,
                data: {
                  type: "account_verification_rejected",
                  verificationId: verificationId,
                  rejectionReason: updateData.rejectionReason || "",
                  timestamp: new Date().toISOString(),
                },
              }
            );
            console.log("Rejection notification sent successfully");
          } catch (notificationError) {
            console.error("Error sending rejection notification:", notificationError);
            // Don't throw error - rejection was successful even if notification fails
          }
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
