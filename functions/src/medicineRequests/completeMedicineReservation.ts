import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type CompleteReservationData = {
  reservationId: string;
  passcode: string;
};

export const completeMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const pharmacyId = request.auth?.uid;

    if (!pharmacyId) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in as a pharmacy."
      );
    }

    const data = request.data as CompleteReservationData;

    const reservationId =
      typeof data.reservationId === "string" ? data.reservationId.trim() : "";

    const passcode =
      typeof data.passcode === "string" ? data.passcode.trim() : "";

    if (!reservationId || !passcode) {
      throw new HttpsError(
        "invalid-argument",
        "Reservation ID and passcode are required."
      );
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
          "You can only complete reservations for your pharmacy."
        );
      }

      if (reservation.status !== "confirmed") {
        throw new HttpsError(
          "failed-precondition",
          "Only confirmed reservations can be completed."
        );
      }

      if (reservation.expiresAt && Date.now() > reservation.expiresAt) {
        transaction.update(reservationRef, {
          status: "expired",
          updatedAt: Date.now(),
        });

        throw new HttpsError(
          "deadline-exceeded",
          "This reservation has expired."
        );
      }

      if (reservation.passcode !== passcode) {
        throw new HttpsError("permission-denied", "Invalid passcode.");
      }

      const requestRef = db
        .collection("medicineRequests")
        .doc(reservation.requestId);

      const now = Date.now();

      transaction.update(reservationRef, {
        status: "completed",
        updatedAt: now,
      });

      transaction.update(requestRef, {
        status: "deleted",
        updatedAt: now,
      });
    });

    return {success: true};
  }
);
