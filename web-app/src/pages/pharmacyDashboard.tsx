// src/pages/PharmacyDashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import styles from "../styles/pharmacy-dashboard.module.css";
import VerificationCard, {
  type VerificationStatus,
} from "../components/VerificationCard";

type Pharmacy = {
  id: string;
  pharmacyNameEnglish: string | null;
  pharmacyNameArabic: string | null;
  guildIdFileUrl: string | null;
  verificationStatus: VerificationStatus;
  ownerName: string | null;
  email: string;
  createdAt: number;
  verifiedAt: number | null;
  rejectionReason: string | null;
  isActive: boolean;
  suspensionReason: string | null;
  reportCount: number;
  is24Hours: boolean;
  updatedAt: number | null;
};

export default function PharmacyDashboardPage() {
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const pharmacyRef = doc(db, "pharmacies", currentUser.uid);

    const unsubscribe = onSnapshot(
      pharmacyRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPharmacy(snapshot.data() as Pharmacy);
        } else {
          setPharmacy(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/pharmacy/signin");
  };

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
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brandBox}>
            <h2>PharmaGo</h2>
            <p>{pharmacy.pharmacyNameEnglish || pharmacy.email}</p>
          </div>

          <nav className={styles.sidebarNav}>
            <button className={`${styles.navItem} ${styles.activeNavItem}`}>
              Dashboard
            </button>

            <button
              className={styles.navItem}
              onClick={() => navigate("/pharmacy/profile")}
            >
              Profile
            </button>

            <button
              className={styles.navItem}
              onClick={() => navigate("/pharmacy/requests")}
            >
              Requests
            </button>

            <button
              className={styles.navItem}
              onClick={() => navigate("/pharmacy/questions")}
            >
              Questions
            </button>

            <button
              className={styles.navItem}
              onClick={() => navigate("/pharmacy/settings")}
            >
              Settings
            </button>
          </nav>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </aside>

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
          rejectionReason={pharmacy.rejectionReason ?? undefined}
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