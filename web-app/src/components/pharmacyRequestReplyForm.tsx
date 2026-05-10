import { useState } from "react";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { CurrencyCode } from "../../../shared/types/pharmacyRequestReply";
import { createPharmacyMedicineRequestReply } from "../services/pharmacyRequestReplyService";
import styles from "../styles/pharmacy-requests.module.css";

type Props = {
  request: MedicineRequest;
  isSubstitute: boolean;
  onSent: () => void;
};

export default function PharmacyReplyForm({
  request,
  isSubstitute,
  onSent,
}: Props) {
  const [medicineName, setMedicineName] = useState("");
  const [price, setPrice] = useState("");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("LBP");
  const [limitedStock, setLimitedStock] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    try {
      setError("");

      const cleanedPrice = Number(price);
      const cleanedMedicineName = medicineName.trim();
      const cleanedNotes = additionalNotes.trim();

      if (!price || Number.isNaN(cleanedPrice) || cleanedPrice <= 0) {
        setError("Please enter a valid price.");
        return;
      }

      if (isSubstitute && !cleanedMedicineName) {
        setError("Please enter the substitute medicine name.");
        return;
      }

      setSending(true);

      await createPharmacyMedicineRequestReply({
        medicineRequestId: request.id,
        isSubstitute,
        price: cleanedPrice,
        currencyCode,
        medicineName: isSubstitute ? cleanedMedicineName : null,
        additionalNotes: cleanedNotes || null,
        limitedStock,
      });

      onSent();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send reply.";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.replyForm}>
      {isSubstitute && (
        <label className={styles.formGroup}>
          <span>Medicine name</span>
          <input
            value={medicineName}
            onChange={(event) => setMedicineName(event.target.value)}
            placeholder="Enter substitute medicine name"
          />
        </label>
      )}

      <div className={styles.priceRow}>
        <label className={styles.formGroup}>
          <span>Price</span>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0"
          />
        </label>

        <div className={styles.currencyGroup}>
          <span>Currency</span>

          <div className={styles.radioRow}>
            <label>
              <input
                type="radio"
                checked={currencyCode === "LBP"}
                onChange={() => setCurrencyCode("LBP")}
              />
              LBP
            </label>

            <label>
              <input
                type="radio"
                checked={currencyCode === "USD"}
                onChange={() => setCurrencyCode("USD")}
              />
              USD
            </label>
          </div>
        </div>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={limitedStock}
          onChange={(event) => setLimitedStock(event.target.checked)}
        />
        Limited stock
      </label>

      <label className={styles.formGroup}>
        <span>Additional notes</span>
        <textarea
          value={additionalNotes}
          onChange={(event) => setAdditionalNotes(event.target.value)}
          placeholder="Optional notes for the user..."
        />
      </label>

      {error && <p className={styles.formError}>{error}</p>}

      <button
        className={styles.sendReplyButton}
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? "Sending..." : "Send reply"}
      </button>
    </div>
  );
}