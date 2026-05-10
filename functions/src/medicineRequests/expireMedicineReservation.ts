import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type ExpireReservationData = {
  reservationId: string;
};

export const expireMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }

    const data = request.data as ExpireReservationData;

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

      const isOwner = reservation.userId === uid;
      const isPharmacy = reservation.pharmacyId === uid;

      if (!isOwner && !isPharmacy) {
        throw new HttpsError(
          "permission-denied",
          "You cannot update this reservation."
        );
      }

      if (reservation.status === "expired") {
        return;
      }

      if (reservation.status !== "confirmed") {
        throw new HttpsError(
          "failed-precondition",
          "Only confirmed reservations can expire."
        );
      }

      if (!reservation.expiresAt || Date.now() < reservation.expiresAt) {
        throw new HttpsError(
          "failed-precondition",
          "This reservation has not expired yet."
        );
      }

      transaction.update(reservationRef, {
        status: "expired",
        updatedAt: Date.now(),
      });
    });

    return {success: true};
  }
);
