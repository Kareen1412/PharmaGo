import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import styles from "../styles/pharmacy-dashboard.module.css";
import VerificationCard, {
  type VerificationStatus,
} from "../components/VerificationCard";
import PharmacySidebar from "../components/PharmacySidebar";

type Pharmacy = {
  id: string;
  pharmacyNameEnglish: string | null;
  pharmacyNameArabic: string | null;
  verificationStatus: VerificationStatus;
  ownerName: string | null;
  email: string;
  createdAt: number;
  verifiedAt: number | null;
  isActive: boolean;
  suspensionReason: string | null;
  reportCount: number;
  is24Hours: boolean;
  updatedAt: number | null;
  latestVerificationRequestId: string | null;
};

type LatestVerification = {
  geminiReason: string | null;
  failureReason: string | null;
};

export default function PharmacyDashboardPage() {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [latestVerification, setLatestVerification] =
    useState<LatestVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribePharmacy: (() => void) | null = null;
    let unsubscribeVerification: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribePharmacy?.();
      unsubscribeVerification?.();

      if (!user) {
        setPharmacy(null);
        setLatestVerification(null);
        setLoading(false);
        return;
      }

      const pharmacyRef = doc(db, "pharmacies", user.uid);

      unsubscribePharmacy = onSnapshot(
        pharmacyRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setPharmacy(null);
            setLatestVerification(null);
            setLoading(false);
            unsubscribeVerification?.();
            unsubscribeVerification = null;
            return;
          }

          const pharmacyData = snapshot.data() as Pharmacy;
          setPharmacy(pharmacyData);
          setLoading(false);

          unsubscribeVerification?.();
          unsubscribeVerification = null;

          if (!pharmacyData.latestVerificationRequestId) {
            setLatestVerification(null);
            return;
          }

          const verificationRef = doc(
            db,
            "pharmacyVerificationRequests",
            pharmacyData.latestVerificationRequestId
          );

          unsubscribeVerification = onSnapshot(
            verificationRef,
            (verificationSnapshot) => {
              if (!verificationSnapshot.exists()) {
                setLatestVerification(null);
                return;
              }

              const data = verificationSnapshot.data();

              setLatestVerification({
                geminiReason: data.geminiReason ?? null,
                failureReason: data.failureReason ?? null,
              });
            },
            (error) => {
              console.error("VERIFICATION SNAPSHOT ERROR:", error);
              setLatestVerification(null);
            }
          );
        },
        (error) => {
          console.error("PHARMACY SNAPSHOT ERROR:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribePharmacy?.();
      unsubscribeVerification?.();
      unsubscribeAuth();
    };
  }, []);

  if (loading) {
    return <div className={styles.mainContent}>Loading dashboard...</div>;
  }

  if (!pharmacy) {
    return <div className={styles.mainContent}>Pharmacy profile not found.</div>;
  }

  const stats = [
    { label: "Requests Today", value: 12 },
    { label: "Questions Today", value: 5 },
    { label: "Answered Today", value: 14 },
  ];

  return (
    <div className={styles.dashboardLayout}>
      <PharmacySidebar
        pharmacyName={pharmacy.pharmacyNameEnglish}
        email={pharmacy.email}
        activeItem="dashboard"
      />

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div>
            <h1 className={styles.pageTitle}>Welcome back</h1>
            <p className={styles.pageSubtitle}>
              Manage your pharmacy profile, requests, and patient questions.
            </p>
          </div>
        </header>

        <VerificationCard
          verificationStatus={pharmacy.verificationStatus}
          isActive={pharmacy.isActive}
          rejectionReason={
            latestVerification?.geminiReason ||
            latestVerification?.failureReason ||
            undefined
          }
        />

        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}