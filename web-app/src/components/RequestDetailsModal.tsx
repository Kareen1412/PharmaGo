import { useState } from "react";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import PharmacyReplyForm from "./pharmacyRequestReplyForm";
import styles from "../styles/pharmacy-requests.module.css";

type Props = {
  request: MedicineRequest;
  showActions: boolean;
  onClose: () => void;
};

type ReplyMode = "available" | "substitute" | null;

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function RequestDetailsModal({
  request,
  showActions,
  onClose,
}: Props) {
  const [replyMode, setReplyMode] = useState<ReplyMode>(null);
  const displayUpdatedDate = request.updatedAt ?? request.createdAt;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2>Request Details</h2>
            <p>Review the user request before replying.</p>
          </div>

          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {request.imageUrl && (
          <img
            src={request.imageUrl}
            alt={request.medicineName}
            className={styles.detailImage}
          />
        )}

        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Medicine name</span>
          <strong className={styles.detailValue}>{request.medicineName}</strong>
        </div>

        <div className={styles.detailSection}>
          <span className={styles.detailLabel}>Notes</span>
          <p className={styles.detailMuted}>
            {request.notes || "No notes added."}
          </p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoPill}>
            <span>Patient</span>
            <strong>{request.userName || "User"}</strong>
          </div>

          <div className={styles.infoPill}>
            <span>Urgency</span>
            <strong>{request.urgency}</strong>
          </div>

          <div className={styles.infoPill}>
            <span>Updated</span>
            <strong>{formatDate(displayUpdatedDate)}</strong>
          </div>
        </div>

        {showActions && (
          <>
            <div className={styles.modalActions}>
              <button
                className={`${styles.availableButton} ${
                  replyMode === "available" ? styles.availableButtonActive : ""
                }`}
                onClick={() => setReplyMode("available")}
              >
                Available
              </button>

              <button
                className={`${styles.substituteButton} ${
                  request.allowSubstitutes ? styles.substituteButtonActive : ""
                } ${
                  replyMode === "substitute"
                    ? styles.substituteButtonSelected
                    : ""
                }`}
                onClick={() => setReplyMode("substitute")}
                disabled={!request.allowSubstitutes}
              >
                {request.allowSubstitutes
                  ? "Substitute available"
                  : "Substitute not allowed"}
              </button>
            </div>

            {replyMode && (
              <PharmacyReplyForm
                request={request}
                isSubstitute={replyMode === "substitute"}
                onSent={onClose}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}