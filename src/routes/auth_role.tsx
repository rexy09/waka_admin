import { Loader, Center } from "@mantine/core";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { auth } from "../config/firebase";
import { IUser } from "../features/auth/types";

interface Props {
  allowedRights: string[];
}

const AuthRights = ({ allowedRights }: Props) => {
  const authUser = useAuthUser<IUser>();
  const location = useLocation();

  // Wait for Firebase Auth to restore its session from IndexedDB before
  // rendering the protected outlet. Without this gate, child components
  // fire Firestore queries before the auth token is attached, resulting
  // in 403 permission-denied errors even for authenticated users.
  const [firebaseAuthReady, setFirebaseAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const itemsExist = [authUser?.email].some((right: any) =>
    allowedRights.includes(right)
  );

  if (!itemsExist) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!firebaseAuthReady) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!firebaseUser) {
    // react-auth-kit says we're logged in, but Firebase Auth disagrees.
    // Force re-login so the Firebase session is re-established.
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthRights;
