import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasPharmacyProfile, setHasPharmacyProfile] = useState(false);

  useEffect(() => {
    const checkPharmacyProfile = async () => {
      if (loading) return;

      if (!user) {
        setHasPharmacyProfile(false);
        setCheckingProfile(false);
        return;
      }

      try {
        const pharmacyRef = doc(db, "pharmacies", user.uid);
        const pharmacySnap = await getDoc(pharmacyRef);

        if (!pharmacySnap.exists()) {
          await signOut(auth);
          setHasPharmacyProfile(false);
          setCheckingProfile(false);
          return;
        }

        setHasPharmacyProfile(true);
      } catch (error) {
        console.error("Failed to check pharmacy profile:", error);
        await signOut(auth);
        setHasPharmacyProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkPharmacyProfile();
  }, [user, loading]);

  if (loading || checkingProfile) {
    return <p>Loading...</p>;
  }

  if (!user || !hasPharmacyProfile) {
    return <Navigate to="/login" replace />;
  }

  return children;
}