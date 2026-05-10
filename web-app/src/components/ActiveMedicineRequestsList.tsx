import { useState } from "react";
import { Check, Pill } from "lucide-react";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import RequestDetailsModal from "./RequestDetailsModal";
import styles from "../styles/pharmacy-requests.module.css";

type Props = {
  requests: MedicineRequest[];
  repliedRequestIds: string[];
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDisplayUpdatedDate = (request: MedicineRequest) => {
  return formatDate(request.updatedAt ?? request.createdAt);
};

export default function ActiveMedicineRequestsList({
  requests,
  repliedRequestIds,
}: Props) {
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(
    null
  );
  const [showUrgent, setShowUrgent] = useState(true);

  const urgentRequests = requests.filter(
    (request) => request.urgency === "urgent"
  );
  const regularRequests = requests.filter(
    (request) => request.urgency !== "urgent"
  );

  const renderRequestCard = (request: MedicineRequest, isUrgent = false) => {
    const hasReplied = repliedRequestIds.includes(request.id);

    return (
      <button
        key={request.id}
        className={`${styles.requestCard} ${
          isUrgent ? styles.urgentRequestCard : ""
        } ${hasReplied ? styles.repliedRequestCard : ""}`}
        onClick={() => setSelectedRequest(request)}
      >
        {hasReplied && (
          <div className={styles.repliedBadge}>
            <Check size={13} />
            <span>Replied</span>
          </div>
        )}

        <div className={styles.cardMain}>
          <div className={styles.iconBox}>
            <Pill size={22} />
          </div>

          <div className={styles.requestInfo}>
            <h3>{request.medicineName}</h3>

            <p className={styles.requestNote}>
              {request.notes || "No notes added."}
            </p>

            <div className={styles.cardFooter}>
              <span>{getDisplayUpdatedDate(request)}</span>
            </div>

            <div className={styles.metaRow}>
              {request.allowSubstitutes && <span>Substitutes allowed</span>}
            </div>
          </div>
        </div>
      </button>
    );
  };

  if (requests.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <div className={styles.emptyIcon}>
          <Pill size={25} />
        </div>
        <h3>No active requests</h3>
        <p>When nearby users create medicine requests, they will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {urgentRequests.length > 0 && (
        <section className={styles.urgentSection}>
          <button
            className={styles.urgentToggle}
            onClick={() => setShowUrgent((current) => !current)}
          >
            <span>Priority requests</span>
            <span>{showUrgent ? "Hide" : "Show"}</span>
          </button>

          {showUrgent && (
            <div className={styles.requestGrid}>
              {urgentRequests.map((request) => renderRequestCard(request, true))}
            </div>
          )}
        </section>
      )}

      <div className={styles.requestGrid}>
        {regularRequests.map((request) => renderRequestCard(request))}
      </div>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          showActions
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
}