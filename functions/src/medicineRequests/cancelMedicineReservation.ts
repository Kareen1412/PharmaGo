import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type CancelReservationData = {
  reservationId: string;
};

export const cancelMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to cancel a reservation."
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

      if (reservation.userId !== uid) {
        throw new HttpsError(
          "permission-denied",
          "You can only cancel your own reservation."
        );
      }

      if (reservation.status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          "Only pending reservations can be cancelled."
        );
      }

      const requestRef = db
        .collection("medicineRequests")
        .doc(reservation.requestId);

      transaction.update(reservationRef, {
        status: "cancelled",
        updatedAt: Date.now(),
      });

      transaction.update(requestRef, {
        status: "active",
        reservedReservationId: null,
        updatedAt: Date.now(),
      });
    });

    return {success: true};
  }
);
