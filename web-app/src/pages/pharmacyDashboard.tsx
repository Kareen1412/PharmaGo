import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import styles from "../styles/pharmacy-dashboard.module.css";
import VerificationCard, {
  type VerificationStatus,
} from "../components/VerificationCard";
import PharmacySidebar from "../components/PharmacySidebar";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import type { QuestionReply } from "../../../shared/types/question";

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



type DashboardRange = "today" | "week" | "month";

const getRangeStart = (range: DashboardRange) => {
  const now = new Date();

  if (range === "today") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
  }

  if (range === "week") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - diff);
    return start.getTime();
  }

  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
};

const isWithinRange = (
  timestamp: number | null | undefined,
  rangeStart: number
) => {
  if (typeof timestamp !== "number") return false;
  return timestamp >= rangeStart;
};

const getRangeLabel = (range: DashboardRange) => {
  if (range === "today") return "Today";
  if (range === "week") return "This week";
  return "This month";
};

export default function PharmacyDashboardPage() {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [latestVerification, setLatestVerification] =
    useState<LatestVerification | null>(null);

  const [medicineReplies, setMedicineReplies] = useState<
    PharmacyMedicineRequestReply[]
  >([]);
  const [questionReplies, setQuestionReplies] = useState<QuestionReply[]>([]);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);

  const [selectedRange, setSelectedRange] =
    useState<DashboardRange>("today");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribePharmacy: (() => void) | null = null;
    let unsubscribeVerification: (() => void) | null = null;
    let unsubscribeMedicineReplies: (() => void) | null = null;
    let unsubscribeQuestionReplies: (() => void) | null = null;
    let unsubscribeReservations: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribePharmacy?.();
      unsubscribeVerification?.();
      unsubscribeMedicineReplies?.();
      unsubscribeQuestionReplies?.();
      unsubscribeReservations?.();

      unsubscribePharmacy = null;
      unsubscribeVerification = null;
      unsubscribeMedicineReplies = null;
      unsubscribeQuestionReplies = null;
      unsubscribeReservations = null;

      if (!user) {
        setPharmacy(null);
        setLatestVerification(null);
        setMedicineReplies([]);
        setQuestionReplies([]);
        setReservations([]);
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

          const pharmacyData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Pharmacy;

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

      const medicineRepliesQuery = query(
        collection(db, "medicineRequestReplies"),
        where("pharmacyId", "==", user.uid)
      );

      unsubscribeMedicineReplies = onSnapshot(
        medicineRepliesQuery,
        (snapshot) => {
          const items = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })) as PharmacyMedicineRequestReply[];

          setMedicineReplies(items);
        },
        (error) => {
          console.error("MEDICINE REPLIES SNAPSHOT ERROR:", error);
        }
      );

      const questionRepliesQuery = query(
        collection(db, "questionReplies"),
        where("pharmacyId", "==", user.uid)
      );

      unsubscribeQuestionReplies = onSnapshot(
        questionRepliesQuery,
        (snapshot) => {
          const items = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })) as QuestionReply[];

          setQuestionReplies(
            items.filter(
              (reply) =>
                reply.authorRole === "pharmacy" && !reply.isDeleted
            )
          );
        },
        (error) => {
          console.error("QUESTION REPLIES SNAPSHOT ERROR:", error);
        }
      );

      const reservationsQuery = query(
        collection(db, "medicineReservations"),
        where("pharmacyId", "==", user.uid)
      );

      unsubscribeReservations = onSnapshot(
        reservationsQuery,
        (snapshot) => {
          const items = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })) as MedicineReservation[];

          setReservations(items);
        },
        (error) => {
          console.error("RESERVATIONS SNAPSHOT ERROR:", error);
        }
      );
    });

    return () => {
      unsubscribePharmacy?.();
      unsubscribeVerification?.();
      unsubscribeMedicineReplies?.();
      unsubscribeQuestionReplies?.();
      unsubscribeReservations?.();
      unsubscribeAuth();
    };
  }, []);

  const stats = useMemo(() => {
    const rangeStart = getRangeStart(selectedRange);

    const repliedRequestsCount = medicineReplies.filter((reply) =>
      isWithinRange(reply.createdAt, rangeStart)
    ).length;

    const answeredQuestionsCount = questionReplies.filter((reply) =>
      isWithinRange(reply.createdAt, rangeStart)
    ).length;

    const reservationsCount = reservations.filter((reservation) =>
      isWithinRange(reservation.createdAt, rangeStart)
    ).length;

    const soldItemsCount = reservations
      .filter((reservation) => reservation.status === "completed")
      .filter((reservation) =>
        isWithinRange(
          reservation.updatedAt ?? reservation.createdAt,
          rangeStart
        )
      )
      .reduce((total, reservation) => {
        return total + (reservation.reservedQuantity ?? 0);
      }, 0);

    return [
      {
        label: "Requests replied to",
        value: repliedRequestsCount,
      },
      {
        label: "Questions answered",
        value: answeredQuestionsCount,
      },
      {
        label: "Reservations",
        value: reservationsCount,
      },
      {
        label: "Sold items",
        value: soldItemsCount,
      },
    ];
  }, [medicineReplies, questionReplies, reservations, selectedRange]);

  const recentlySoldItems = useMemo(() => {
  return reservations
    .filter(
      (reservation) =>
        reservation.status === "confirmed" ||
        reservation.status === "completed"
    )
    .sort((a, b) => {
      const aTime = a.updatedAt ?? a.createdAt;
      const bTime = b.updatedAt ?? b.createdAt;

      return bTime - aTime;
    })
    .slice(0, 8)
    .map((reservation) => {
      const matchingReply = medicineReplies.find(
        (reply) => reply.id === reservation.replyId
      );

      const displayName =
        matchingReply?.isSubstitute &&
        matchingReply.medicineName
          ? matchingReply.medicineName
          : reservation.medicineName;

      const activityDate = new Date(
        reservation.updatedAt ?? reservation.createdAt
      ).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        id: reservation.id,
        displayName: displayName || "Medicine",
        quantity: reservation.reservedQuantity,
        status: reservation.status,
        activityDate,
      };
    });
}, [reservations, medicineReplies]);

  if (loading) {
    return <div className={styles.mainContent}>Loading dashboard...</div>;
  }

  if (!pharmacy) {
    return <div className={styles.mainContent}>Pharmacy profile not found.</div>;
  }

  return (
    <div className={styles.dashboardLayout}>
     

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

        <section className={styles.dashboardStatsSection}>
          <div className={styles.statsHeader}>
            <div>
              <h2>Dashboard overview</h2>
              <p>{getRangeLabel(selectedRange)} performance summary.</p>
            </div>

            <div className={styles.rangeTabs}>
              {(["today", "week", "month"] as DashboardRange[]).map(
                (range) => (
                  <button
                    key={range}
                    type="button"
                    className={`${styles.rangeTab} ${
                      selectedRange === range ? styles.rangeTabActive : ""
                    }`}
                    onClick={() => setSelectedRange(range)}
                  >
                    {getRangeLabel(range)}
                  </button>
                )
              )}
            </div>
          </div>

          <section className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <p>{stat.label}</p>
                <h3>{stat.value}</h3>
              </div>
            ))}
          </section>

          <section className={styles.recentlySoldSection}>
  <div className={styles.recentlySoldHeader}>
    <h2>Recently sold</h2>
    <p>Latest reserved and completed medicine items.</p>
  </div>

  <div className={styles.soldList}>
    {recentlySoldItems.map((item, index) => (
  <div key={item.id}>
    <div className={styles.recentlySoldItem}>
      <div className={styles.recentlySoldLeft}>
        <div className={styles.soldIcon}>💊</div>

        <div className={styles.recentlySoldTopRow}>
          <p className={styles.recentlySoldName}>
            {item.displayName}
          </p>

          <span className={styles.recentlySoldQuantity}>
            x{item.quantity ?? 1}
          </span>
        </div>
      </div>

      <span className={styles.recentlySoldDate}>
        {item.activityDate}
      </span>
    </div>

    {index !== recentlySoldItems.length - 1 && (
      <div className={styles.recentlySoldDivider} />
    )}
  </div>
))}
  </div>
</section>
        </section>
      </main>
    </div>
  );
}