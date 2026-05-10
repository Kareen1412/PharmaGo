import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bookmark,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import ReservationDetailsModal from "./ReservationDetailsModal";
import { expireMedicineReservation } from "../services/pharmacyReservationService";
import styles from "../styles/pharmacy-requests.module.css";

type Props = {
  reservations: MedicineReservation[];
  openReservationId?: string;
};

const getDurationText = (days: 1 | 3 | 7) => {
  if (days === 7) return "1 week";
  return `${days} day${days > 1 ? "s" : ""}`;
};

const getTimeLeft = (expiresAt: number | null) => {
  if (!expiresAt) return "No timer yet";

  const diff = expiresAt - Date.now();

  if (diff <= 0) return "Expired";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;

  return `${seconds}s left`;
};

export default function ReservedMedicineRequestsList({
  reservations,
  openReservationId,
}: Props) {
  const [selectedReservation, setSelectedReservation] =
    useState<MedicineReservation | null>(null);

    const openedReservationIdRef = useRef<string | null>(null);

  const [showConfirmed, setShowConfirmed] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showExpired, setShowExpired] = useState(true);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
  if (!openReservationId) return;
  if (openedReservationIdRef.current === openReservationId) return;

  const targetReservation = reservations.find(
    (reservation) => reservation.id === openReservationId
  );

  if (!targetReservation) return;

  openedReservationIdRef.current = openReservationId;
  setSelectedReservation(targetReservation);
}, [openReservationId, reservations]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    reservations.forEach((reservation) => {
      if (
        reservation.status === "confirmed" &&
        reservation.expiresAt &&
        Date.now() >= reservation.expiresAt
      ) {
        expireMedicineReservation(reservation.id).catch((error) =>
          console.error("Failed to expire reservation:", error)
        );
      }
    });
  }, [reservations]);

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "confirmed"
  );

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending"
  );

  const expiredReservations = reservations.filter(
    (reservation) => reservation.status === "expired"
  );

  const renderReservationCard = (reservation: MedicineReservation) => {
    const isConfirmed = reservation.status === "confirmed";
    const isExpired = reservation.status === "expired";

    return (
      <button
        key={reservation.id}
        className={`${styles.requestCard} ${
          isExpired ? styles.expiredRequestCard : ""
        }`}
        onClick={() => setSelectedReservation(reservation)}
      >
        <div className={styles.cardMain}>
          <div className={styles.iconBox}>
            {isExpired ? (
              <AlertCircle size={22} />
            ) : isConfirmed ? (
              <CheckCircle size={22} />
            ) : (
              <Bookmark size={22} />
            )}
          </div>

          <div className={styles.requestInfo}>
            <h3>{reservation.medicineName}</h3>

            <p className={styles.requestNote}>
              {isExpired
                ? "Reservation expired"
                : isConfirmed
                ? getTimeLeft(reservation.expiresAt)
                : "Waiting for your confirmation"}
            </p>

            <div className={styles.cardFooter}>
              <span>
                Quantity: {reservation.reservedQuantity ?? "Not specified"}
              </span>
            </div>

            <div className={styles.metaRow}>
              <span>
                {isExpired
                  ? "Expired"
                  : isConfirmed
                  ? "Reserved"
                  : "Pending confirmation"}
              </span>
              <span>
                {getDurationText(reservation.reservationDurationDays)}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  if (reservations.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <div className={styles.emptyIcon}>
          <Bookmark size={25} />
        </div>
        <h3>No reserved requests</h3>
        <p>Reservations from users will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <section className={styles.urgentSection}>
        <button
          className={styles.urgentToggle}
          onClick={() => setShowConfirmed((current) => !current)}
        >
          <span>Reserved</span>
          <span>{showConfirmed ? "Hide" : "Show"}</span>
        </button>

        {showConfirmed && (
          <>
            {confirmedReservations.length === 0 ? (
              <div className={styles.emptyMiniCard}>
                <Clock size={18} />
                <span>No confirmed reservations yet.</span>
              </div>
            ) : (
              <div className={styles.requestGrid}>
                {confirmedReservations.map(renderReservationCard)}
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.urgentSection}>
        <button
          className={styles.urgentToggle}
          onClick={() => setShowPending((current) => !current)}
        >
          <span>Pending confirmation</span>
          <span>{showPending ? "Hide" : "Show"}</span>
        </button>

        {showPending && (
          <>
            {pendingReservations.length === 0 ? (
              <div className={styles.emptyMiniCard}>
                <Clock size={18} />
                <span>No pending reservations.</span>
              </div>
            ) : (
              <div className={styles.requestGrid}>
                {pendingReservations.map(renderReservationCard)}
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.urgentSection}>
        <button
          className={styles.urgentToggle}
          onClick={() => setShowExpired((current) => !current)}
        >
          <span>Expired reservations</span>
          <span>{showExpired ? "Hide" : "Show"}</span>
        </button>

        {showExpired && (
          <>
            {expiredReservations.length === 0 ? (
              <div className={styles.emptyMiniCard}>
                <Clock size={18} />
                <span>No expired reservations.</span>
              </div>
            ) : (
              <div className={styles.requestGrid}>
                {expiredReservations.map(renderReservationCard)}
              </div>
            )}
          </>
        )}
      </section>

      {selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  );
}