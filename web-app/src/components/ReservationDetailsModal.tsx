import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import {
  cancelMedicineReservationByPharmacy,
  completeMedicineReservation,
  confirmMedicineReservation,
  expireMedicineReservation,
  getReservationRequestAndReply,
} from "../services/pharmacyReservationService";
import styles from "../styles/pharmacy-requests.module.css";

type Props = {
  reservation: MedicineReservation;
  onClose: () => void;
};

const formatPrice = (price: number | null, currencyCode?: string) => {
  if (price === null) return "Not specified";
  return `${price.toLocaleString()}${currencyCode ? ` ${currencyCode}` : ""}`;
};

const getDurationText = (days: 1 | 3 | 7) => {
  if (days === 7) return "1 week";
  return `${days} day${days > 1 ? "s" : ""}`;
};

const getTimeLeft = (expiresAt: number | null) => {
  if (!expiresAt) return "Timer starts after confirmation.";

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

export default function ReservationDetailsModal({
  reservation,
  onClose,
}: Props) {
  const [requestDetails, setRequestDetails] = useState<MedicineRequest | null>(
    null
  );
  const [replyDetails, setReplyDetails] =
    useState<PharmacyMedicineRequestReply | null>(null);

  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState(0);

  const isPending = reservation.status === "pending";
  const isConfirmed = reservation.status === "confirmed";
  const isExpired = reservation.status === "expired";

  useEffect(() => {
    const interval = window.setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      reservation.status === "confirmed" &&
      reservation.expiresAt &&
      Date.now() >= reservation.expiresAt
    ) {
      expireMedicineReservation(reservation.id).catch((error) =>
        console.error("Failed to expire reservation:", error)
      );
    }
  }, [reservation]);

  useEffect(() => {
    getReservationRequestAndReply(reservation)
      .then((result) => {
        setRequestDetails(result.request);
        setReplyDetails(result.reply);
      })
      .catch((error) => {
        console.error("Failed to load reservation details:", error);
      });
  }, [reservation]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirmMedicineReservation(reservation.id);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not confirm.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Cancel this reservation? This will return the request to active."
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await cancelMedicineReservationByPharmacy(reservation.id);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not cancel.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await completeMedicineReservation(reservation.id, passcode);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not complete.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2>Reservation Details</h2>
            <p>
              Review the reservation, original request, and selected reply.
            </p>
          </div>

          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {isExpired && (
          <div className={styles.reservationWarningLine}>
            <AlertCircle size={15} />
            <span>This reservation expired. The user can renew or delete it.</span>
          </div>
        )}

        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Reserved medicine</span>
          <strong className={styles.detailValue}>
            {reservation.medicineName}
          </strong>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoPill}>
            <span>Status</span>
            <strong>{reservation.status}</strong>
          </div>

          <div className={styles.infoPill}>
            <span>Quantity</span>
            <strong>{reservation.reservedQuantity ?? "Not specified"}</strong>
          </div>

          <div className={styles.infoPill}>
            <span>Duration</span>
            <strong>
              {getDurationText(reservation.reservationDurationDays)}
            </strong>
          </div>

          <div className={styles.infoPill}>
            <span>Price</span>
            <strong>
              {formatPrice(
                reservation.priceAtReservation,
                replyDetails?.currencyCode
              )}
            </strong>
          </div>
        </div>

        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Expiration</span>
          <div
            className={
              isExpired
                ? styles.reservationWarningLine
                : styles.reservationStatusLine
            }
          >
            <Clock size={16} />
            <span>
              {isExpired
                ? "Expired"
                : isConfirmed
                ? getTimeLeft(reservation.expiresAt)
                : "Timer starts after confirmation."}
            </span>
          </div>
        </div>

        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Original request</span>
          <strong className={styles.detailValue}>
            {requestDetails?.medicineName ?? reservation.medicineName}
          </strong>
          <p className={styles.detailMuted}>
            {requestDetails?.notes || "No notes added."}
          </p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoPill}>
            <span>Patient</span>
            <strong>{requestDetails?.userName || "User"}</strong>
          </div>

          <div className={styles.infoPill}>
            <span>Urgency</span>
            <strong>{requestDetails?.urgency ?? "normal"}</strong>
          </div>
        </div>

        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Reserved reply</span>
          <strong className={styles.detailValue}>
            {replyDetails?.isSubstitute
              ? replyDetails.medicineName
              : requestDetails?.medicineName ?? reservation.medicineName}
          </strong>

          {replyDetails?.isSubstitute && (
            <p className={styles.detailMuted}>Substitute offer</p>
          )}

          <p className={styles.detailMuted}>
            {replyDetails?.additionalNotes || "No reply notes added."}
          </p>

          {replyDetails?.limitedStock && (
            <div className={styles.reservationWarningLine}>
              <AlertCircle size={15} />
              <span>Limited stock</span>
            </div>
          )}
        </div>

        {isPending && (
          <div className={styles.modalActions}>
            <button
              className={styles.availableButton}
              onClick={handleConfirm}
              disabled={loading}
            >
              <CheckCircle size={16} />
              Confirm reservation
            </button>

            <button
              className={styles.dangerButton}
              onClick={handleCancel}
              disabled={loading}
            >
              <XCircle size={16} />
              Cancel reservation
            </button>
          </div>
        )}

        {isConfirmed && !isExpired && (
          <div className={styles.replyForm}>
            <label className={styles.formGroup}>
              <span>Reservation passcode</span>
              <input
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder="Enter user passcode"
              />
            </label>

            <button
              className={styles.sendReplyButton}
              onClick={handleComplete}
              disabled={loading}
            >
              Complete pickup
            </button>

            <button
              className={styles.smallDangerButton}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}