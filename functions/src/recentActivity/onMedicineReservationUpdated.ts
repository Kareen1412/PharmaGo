import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {createRecentActivity} from "../utils/createRecentActivity";

const getReservationStatusMessage = (
  status: string,
  medicineName: string
): { title: string; message: string } | null => {
  if (status === "confirmed") {
    return {
      title: "Reservation confirmed",
      message:
        `Your reservation for ${medicineName} was confirmed. ` +
        "Check your passcode.",
    };
  }

  if (status === "expired") {
    return {
      title: "Reservation expired",
      message:
        `Your reservation for ${medicineName} expired. ` +
        "You can renew or delete it.",
    };
  }

  if (status === "completed") {
    return {
      title: "Reservation completed",
      message:
        `Your reservation for ${medicineName} was marked ` +
        "as completed.",
    };
  }

  if (status === "cancelled") {
    return {
      title: "Reservation cancelled",
      message: `Your reservation for ${medicineName} was cancelled.`,
    };
  }

  if (status === "pending") {
    return {
      title: "Reservation renewed",
      message:
        `Your reservation for ${medicineName} is pending ` +
        "confirmation again.",
    };
  }

  return null;
};

export const onMedicineReservationUpdated = onDocumentUpdated(
  {
    region: "europe-west1",
    document: "medicineReservations/{reservationId}",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    if (before.status === after.status) return;

    const userId = typeof after.userId === "string" ? after.userId : "";

    if (!userId) return;

    const medicineName =
      typeof after.medicineName === "string" && after.medicineName.trim() ?
        after.medicineName.trim() :
        "your medicine";

    const status =
      typeof after.status === "string" ? after.status : "";

    const content = getReservationStatusMessage(status, medicineName);

    if (!content) return;

    await createRecentActivity({
      userId,
      type: "medicine_reservation_status",
      title: content.title,
      message: content.message,
      targetType: "reservation",
      targetId: event.params.reservationId,
    });
  }
);
