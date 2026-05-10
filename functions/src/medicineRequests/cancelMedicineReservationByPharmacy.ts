import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type CancelReservationData = {
  reservationId: string;
};

export const cancelMedicineReservationByPharmacy = onCall(
  {region: "europe-west1"},
  async (request) => {
    const pharmacyId = request.auth?.uid;

    if (!pharmacyId) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in as a pharmacy."
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

      if (reservation.pharmacyId !== pharmacyId) {
        throw new HttpsError(
          "permission-denied",
          "You can only cancel reservations for your pharmacy."
        );
      }

      if (
        reservation.status !== "pending" &&
        reservation.status !== "confirmed"
      ) {
        throw new HttpsError(
          "failed-precondition",
          "Only pending or confirmed reservations can be cancelled."
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
    });

    return {success: true};
  }
);
