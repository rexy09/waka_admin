import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Env from "./env";

const firebaseConfig = {
  apiKey: Env.FIREBASE_API_KEY,
  authDomain: "daywaka-768aa.firebaseapp.com",
  projectId: "daywaka-768aa",
  storageBucket: "daywaka-768aa.firebasestorage.app",
  messagingSenderId: "476064351728",
  appId: "1:476064351728:web:cbf66db67d2ee925380935",
  measurementId: "G-HWQR5JX8KC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth — initialized against the same app instance so Firestore
// queries share the authenticated session. Export so all features use it.
export const auth = getAuth(app);

// Messaging service
export const messaging = getMessaging(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export const storage = getStorage(app);