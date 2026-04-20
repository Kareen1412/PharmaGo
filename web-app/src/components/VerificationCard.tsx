import { useNavigate } from "react-router-dom";
import styles from "../styles/pharmacy-dashboard.module.css";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

type VerificationCardProps = {
  verificationStatus: VerificationStatus;
  isActive: boolean;
  rejectionReason?: string;
};

export default function VerificationCard({
  verificationStatus,
  isActive,
  rejectionReason,
}: VerificationCardProps) {
  const navigate = useNavigate();

  const getStatusContent = () => {
    if (verificationStatus === "pending") {
      return {
        toneClass: styles.pending,
        badgeClass: styles.statusBadgePending,
        badge: "Pending",
        title: "Your verification is under review",
        text: "Your documents were submitted successfully. We are currently reviewing them, and your pharmacy is not visible to users yet.",
        buttonText: "View Verification",
      };
    }

    if (verificationStatus === "verified") {
      if (!isActive) {
        return {
          toneClass: styles.inactive,
          badgeClass: styles.statusBadgeInactive,
          badge: "Inactive",
          title: "Your pharmacy is verified but inactive",
          text: "Your pharmacy is verified, but it is currently hidden from users until the account is active again.",
          buttonText: "Go to Settings",
        };
      }

      return {
        toneClass: styles.verified,
        badgeClass: styles.statusBadgeVerified,
        badge: "Verified",
        title: "Your pharmacy is verified and visible to users",
        text: "Your pharmacy can now appear to users because it is verified and active.",
        buttonText: "View Verification",
      };
    }

    if (verificationStatus === "rejected") {
      return {
        toneClass: styles.rejected,
        badgeClass: styles.statusBadgeRejected,
        badge: "Rejected",
        title: "Your verification form was rejected",
        text:
          rejectionReason ||
          "There was a problem with the submitted verification details. Please update the information and resubmit.",
        buttonText: "Fix & Resubmit",
      };
    }

    return {
      toneClass: styles.unverified,
      badgeClass: styles.statusBadgeUnverified,
      badge: "Not Verified",
      title: "Verify your pharmacy to appear to users",
      text: "Only pharmacies that are verified and active will appear to users. Complete verification to continue.",
      buttonText: "Verify Pharmacy",
    };
  };

  const status = getStatusContent();

  const handleAction = () => {
    if (verificationStatus === "verified" && !isActive) {
      navigate("/pharmacy/settings");
      return;
    }

    if (verificationStatus === "pending" || verificationStatus === "verified") {
      navigate("/dashboard/verification?mode=view");
      return;
    }

    navigate("/dashboard/verification");
  };

  return (
    <section className={`${styles.statusBanner} ${status.toneClass}`}>
      <div>
        <span className={`${styles.statusBadge} ${status.badgeClass}`}>
          {status.badge}
        </span>
        <h2>{status.title}</h2>
        <p>{status.text}</p>
      </div>

      <div className={styles.bannerActions}>
        <button className={styles.primaryButton} onClick={handleAction}>
          {status.buttonText}
        </button>
      </div>
    </section>
  );
}