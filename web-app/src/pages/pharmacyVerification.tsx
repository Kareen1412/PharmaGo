import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles/pharmacy-verification.module.css";
import {
  getLatestPharmacyVerification,
  getVerificationFileDownloadUrl,
  submitPharmacyVerification,
} from "../services/pharmacyVerificationService";

export default function PharmacyVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isViewMode = searchParams.get("mode") === "view";

  const [ownerName, setOwnerName] = useState("");
  const [guildIdNumber, setGuildIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [guildFile, setGuildFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  useEffect(() => {
    if (!isViewMode) return;

    const loadVerificationData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const result = await getLatestPharmacyVerification();

        if (!result.success || !result.request) {
          setError("No verification request found.");
          return;
        }

        const request = result.request;

        setOwnerName(request.ownerName || "");
        setGuildIdNumber(request.guildIdNumber || "");
        setNotes(request.notes || "");
        setUploadedFileName(request.fileName || "");
        setRequestStatus(request.status || "");

        if (request.storagePath) {
          const url = await getVerificationFileDownloadUrl(request.storagePath);
          setUploadedFileUrl(url);
        }
      } catch (err: any) {
        setError(
          err?.message || "Could not load verification details. Please try again."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadVerificationData();
  }, [isViewMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setGuildFile(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, PNG, or JPG/JPEG file.");
      setGuildFile(null);
      return;
    }

    setError("");
    setGuildFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isViewMode) return;

    if (!ownerName.trim()) {
      setError("Please enter the licensed pharmacist name.");
      return;
    }

    if (!guildIdNumber.trim()) {
      setError("Please enter the guild ID number.");
      return;
    }

    if (!guildFile) {
      setError("Please upload the guild ID file.");
      return;
    }

    try {
      setSubmitting(true);

      await submitPharmacyVerification({
        ownerName: ownerName.trim(),
        guildIdNumber: guildIdNumber.trim(),
        notes: notes.trim(),
        guildFile,
      });

      navigate("/dashboard", {
        state: {
          verificationSubmitted: true,
        },
      });
    } catch (err: any) {
      setError(err?.message || "Could not submit verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>{isViewMode ? "Verification Details" : "Pharmacy Verification"}</h1>
          <p>
            {isViewMode
              ? "This is your submitted verification form. You can view it, but you cannot edit it here."
              : "Upload your guild ID and verification details. After submission, your verification status will become pending."}
          </p>

          {isViewMode && requestStatus && (
            <small className={styles.helperText}>
              Current status: {requestStatus}
            </small>
          )}
        </div>

        {loadingData ? (
          <p>Loading verification details...</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="ownerName">Licensed Pharmacist Name (Owner)</label>
              <input
                id="ownerName"
                type="text"
                placeholder="Enter full name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required={!isViewMode}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="guildIdNumber">Guild ID Number</label>
              <input
                id="guildIdNumber"
                type="text"
                placeholder="Enter guild ID number"
                value={guildIdNumber}
                onChange={(e) => setGuildIdNumber(e.target.value)}
                required={!isViewMode}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="guildFile">
                {isViewMode ? "Uploaded Guild ID" : "Upload Guild ID"}
              </label>

              {isViewMode ? (
                uploadedFileUrl ? (
                  <>
                    <a
                      href={uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      Open uploaded file
                    </a>
                    {uploadedFileName && (
                      <p className={styles.fileName}>File: {uploadedFileName}</p>
                    )}
                  </>
                ) : (
                  <small className={styles.helperText}>
                    No uploaded file found.
                  </small>
                )
              ) : (
                <>
                  <input
                    id="guildFile"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    required
                  />
                  <small className={styles.helperText}>
                    Accepted formats: PDF, PNG, JPG, JPEG
                  </small>
                  {guildFile && (
                    <p className={styles.fileName}>Selected: {guildFile.name}</p>
                  )}
                </>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Add any note if needed, especially when resubmitting"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate("/dashboard")}
              >
                {isViewMode ? "Back to Dashboard" : "Cancel"}
              </button>

              {!isViewMode && (
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit for Verification"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}