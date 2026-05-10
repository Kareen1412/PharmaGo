import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type CancelReservationData = {
  reservationId: string;
};

export const cancelMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }

    const data = request.data as CancelReservationData;

    const reservationId =
      typeof data.reservationId === "string" ? data.reservationId.trim() : "";

    if (!reservationId) {
      throw new HttpsError("invalid-argument", "Reservation ID is required.");
    }

    const db = admin.firestore();

    await db.runTransaction(async (transaction) => {
      const reservationRef = db
        .collection("medicineReservations")
        .doc(reservationId);

      const reservationSnap = await transaction.get(reservationRef);

      if (!reservationSnap.exists) {
        throw new HttpsError("not-found", "Reservation not found.");
      }

      const reservation = reservationSnap.data();

      if (!reservation) {
        throw new HttpsError("not-found", "Reservation not found.");
      }

      if (reservation.userId !== userId) {
        throw new HttpsError(
          "permission-denied",
          "You can only cancel your own reservation."
        );
      }

      if (
        reservation.status !== "pending" &&
        reservation.status !== "confirmed" &&
        reservation.status !== "expired"
      ) {
        throw new HttpsError(
          "failed-precondition",
          "This reservation cannot be cancelled."
        );
      }

      const requestRef = db
        .collection("medicineRequests")
        .doc(reservation.requestId);

      const now = Date.now();

      transaction.update(reservationRef, {
        status: "cancelled",
        updatedAt: now,
      });

      transaction.update(requestRef, {
        status: "active",
        reservedReservationId: null,
        updatedAt: now,
      });

      const notificationRef = db.collection("pharmacyNotifications").doc();

      transaction.set(notificationRef, {
        pharmacyId: reservation.pharmacyId,
        type: "reservation_cancelled",
        title: "Reservation cancelled",
        message: "A user cancelled a reservation. The request is active again.",
        targetType: "request",
        targetId: reservation.requestId,
        readAt: null,
        createdAt: now,
      });
    });

    return {success: true};
  }
);
