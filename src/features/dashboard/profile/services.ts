import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Env from "../../../config/env";
import { messaging } from "../../../config/firebase";
import { IAuthUser } from "../../auth/types";
import useDbService from "../../services/DbService";
import { IUserData, ProfileForm } from "./types";

export const useProfileServices = () => {
  const { usersRef, CACHE_DURATION } = useDbService();
    const authUser = useAuthUser<IAuthUser>();

  // Add caching for frequently accessed user data
  const userCache = new Map<string, { data: any; timestamp: number }>();

  const getUserData = async (uid: string) => {
    try {
      const cached = userCache.get(uid);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as IUserData;
      }

      const docRef = doc(usersRef, uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // console.log("Fetched user data:", data);

        const result = {
          id: docSnap.id,
          ...data,
        };

        userCache.set(uid, {
          data: result,
          timestamp: Date.now(),
        });

        return result as IUserData;
      }

      return undefined;
    } catch (error) {
      console.error("Error fetching user data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to fetch user data: ${errorMessage}`);
    }
  };

  const createUserData = async (data: ProfileForm) => {
    try {
      // Get FCM token before creating user data
      const notificationToken = await getFCMToken();
      
      const docRef = doc(usersRef, authUser?.uid);
      await setDoc(
        docRef,
        {
          uid: authUser?.uid,
          fullName: data.fullName,
          gender: data.gender,
          userType: data.userType,
          ageGroup: data.ageGroup,
          email: authUser?.email,
          phoneNumber: data.phoneCountryCode+data.phoneNumber,
          country: data.country || null,
          currency: data.currency || null,
          bio: data.bio,
          avatarURL: data.avatarURL || null,
          notifToken: notificationToken || "",
          fcmTokens: notificationToken ? [notificationToken] : [],
          deviceUniqueId: null,
          isProduction: Env.isProduction,
          isVerified: true,
          isOnline: true,
          isDeleted: false,
          lastSeen: Timestamp.fromDate(new Date()),
          status: "active",
          searchTerms: [],
          role: "user",
          dateAdded: Timestamp.fromDate(new Date()),
          dateUpdated: Timestamp.fromDate(new Date()),
        },
        { merge: true }
      );
      console.log("User data created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating user data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to create user data: ${errorMessage}`);
    }
  };

  const getFCMToken = async (): Promise<string | null> => {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: Env.APP_VAPID_KEY,
        });
        console.log("FCM Token generated:", token);
        return token;
      } else {
        console.log("Notification permission denied");
        return null;
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  };

  const updateUserNotificationToken = async (uid: string, token: string) => {
    try {
      const docRef = doc(usersRef, uid);
      
      // First get the current user data to check existing fcmTokens
      const userData = await getUserData(uid);
      const currentTokens = userData?.fcmTokens || [];
      
      // Check if token already exists in fcmTokens array
      if (!currentTokens.includes(token)) {
        // Add the new token to existing tokens
        const updatedTokens = [...currentTokens, token];
        
        await updateDoc(docRef, {
          notifToken: token,
          fcmTokens: updatedTokens,
          dateUpdated: Timestamp.fromDate(new Date()),
        });
        console.log("New notification token added to array and notifToken updated");
      } else {
        // Token exists, just update notifToken (current active token)
        await updateDoc(docRef, {
          notifToken: token,
          dateUpdated: Timestamp.fromDate(new Date()),
        });
        console.log("Notification token already exists in array, updated notifToken only");
      }
    } catch (error) {
      console.error("Error updating notification token:", error);
      throw new Error(`Failed to update notification token: ${error}`);
    }
  };

  const initializeNotificationToken = async () => {
    try {
      if (!authUser?.uid) return;

      // Get FCM token first
      const token = await getFCMToken();
      if (!token) return;

      // Check if user exists
      const userData = await getUserData(authUser.uid);
      
      if (userData) {
        // User exists, check if we need to update tokens
        const currentTokens = userData.fcmTokens || [];
        const currentNotifToken = userData.notifToken;
        
        // Update if:
        // 1. Token doesn't exist in fcmTokens array, OR
        // 2. Current notifToken is different from the new token
        if (!currentTokens.includes(token) || currentNotifToken !== token) {
          await updateUserNotificationToken(authUser.uid, token);
          console.log("Updated user notification token");
        } else {
          console.log("User notification token is already up to date");
        }
      } else {
        console.log("User data not found, token will be set during profile completion");
      }
      
    } catch (error) {
      console.error("Error initializing notification token:", error);
    }
  };

  const removeTokenFromUser = async (uid: string, tokenToRemove: string) => {
    try {
      const userData = await getUserData(uid);
      if (!userData) return;

      const currentTokens = userData.fcmTokens || [];
      const updatedTokens = currentTokens.filter(token => token !== tokenToRemove);
      
      // If removed token was the current notifToken, set to the first available token
      const newNotifToken = userData.notifToken === tokenToRemove 
        ? (updatedTokens.length > 0 ? updatedTokens[0] : "") 
        : userData.notifToken;

      const docRef = doc(usersRef, uid);
      await updateDoc(docRef, {
        notifToken: newNotifToken,
        fcmTokens: updatedTokens,
        dateUpdated: Timestamp.fromDate(new Date()),
      });
      
      console.log("Token removed from user successfully");
    } catch (error) {
      console.error("Error removing token from user:", error);
      throw new Error(`Failed to remove token: ${error}`);
    }
  };

  return {
    getUserData,
    createUserData,
    getFCMToken,
    updateUserNotificationToken,
    initializeNotificationToken,
    removeTokenFromUser,
  };
};
