import { useEffect, useState } from "react";
import ActiveMedicineRequestsList from "../components/ActiveMedicineRequestsList";
import ReservedMedicineRequestsList from "../components/ReservedMedicineRequestsList";
import {
  listenToAllActiveMedicineRequests,
} from "../services/pharmacyMedicineRequestService";
import { listenToMyRepliedMedicineRequestIds } from "../services/pharmacyRequestReplyService";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import styles from "../styles/pharmacy-requests.module.css";
import { listenToPharmacyReservations } from "../services/pharmacyReservationService";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";

export default function PharmacyRequestsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "reserved">("active");
  const [activeRequests, setActiveRequests] = useState<MedicineRequest[]>([]);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);
  const [repliedRequestIds, setRepliedRequestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeActive: (() => void) | undefined;
    let unsubscribeReserved: (() => void) | undefined;
    let unsubscribeReplies: (() => void) | undefined;

    let activeDone = false;
    let reservedDone = false;
    let isMounted = true;

    const finishLoading = () => {
      if (activeDone && reservedDone && isMounted) {
        setLoading(false);
      }
    };

    const startListeners = async () => {
      unsubscribeActive = await listenToAllActiveMedicineRequests(
        (items) => {
          if (!isMounted) return;
          setActiveRequests(items);
          activeDone = true;
          finishLoading();
        },
        () => {
          activeDone = true;
          finishLoading();
        }
      );

      unsubscribeReserved = listenToPharmacyReservations(
        (items) => {
          if (!isMounted) return;
          setReservations(items);
          reservedDone = true;
          finishLoading();
        },
        () => {
          reservedDone = true;
          finishLoading();
        }
      );

      unsubscribeReplies = listenToMyRepliedMedicineRequestIds(
        (ids) => {
          if (!isMounted) return;
          setRepliedRequestIds(ids);
        },
        () => {}
      );
    };

    startListeners();

    return () => {
      isMounted = false;
      unsubscribeActive?.();
      unsubscribeReserved?.();
      unsubscribeReplies?.();
    };
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <section className={styles.header}>
          <div>
            <h1>Medicine Requests</h1>
            <p>
              View active user requests and requests reserved from your pharmacy.
            </p>
          </div>
        </section>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "active" ? styles.tabButtonActive : ""
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active requests
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTab === "reserved" ? styles.tabButtonActive : ""
            }`}
            onClick={() => setActiveTab("reserved")}
          >
            Reserved
          </button>
        </div>

        {loading ? (
          <div className={styles.centerCard}>Loading requests...</div>
        ) : activeTab === "active" ? (
          <ActiveMedicineRequestsList
            requests={activeRequests}
            repliedRequestIds={repliedRequestIds}
          />
        ) : (
          <ReservedMedicineRequestsList reservations={reservations} />
        )}
      </main>
    </div>
  );
}