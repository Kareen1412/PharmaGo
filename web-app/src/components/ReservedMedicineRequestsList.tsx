import { useState } from "react";
import { Bookmark, CheckCircle, Clock } from "lucide-react";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import ReservationDetailsModal from "./ReservationDetailsModal";
import styles from "../styles/pharmacy-requests.module.css";

type Props = {
  reservations: MedicineReservation[];
};

const getDurationText = (days: 1 | 3 | 7) => {
  if (days === 7) return "1 week";
  return `${days} day${days > 1 ? "s" : ""}`;
};

const getTimeLeft = (expiresAt: number | null) => {
  if (!expiresAt) return "No timer yet";

  const diff = expiresAt - Date.now();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} left`;

  return `${hours} hour${hours !== 1 ? "s" : ""} left`;
};

export default function ReservedMedicineRequestsList({
  reservations,
}: Props) {
  const [selectedReservation, setSelectedReservation] =
    useState<MedicineReservation | null>(null);

  const [showConfirmed, setShowConfirmed] = useState(true);
  const [showPending, setShowPending] = useState(true);

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "confirmed"
  );

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending"
  );

  const renderReservationCard = (reservation: MedicineReservation) => {
    const isConfirmed = reservation.status === "confirmed";

    return (
      <button
        key={reservation.id}
        className={styles.requestCard}
        onClick={() => setSelectedReservation(reservation)}
      >
        <div className={styles.cardMain}>
          <div className={styles.iconBox}>
            {isConfirmed ? <CheckCircle size={22} /> : <Bookmark size={22} />}
          </div>

          <div className={styles.requestInfo}>
            <h3>{reservation.medicineName}</h3>

            <p className={styles.requestNote}>
              {isConfirmed
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
                {isConfirmed ? "Reserved" : "Pending confirmation"}
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

      {selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  );
}