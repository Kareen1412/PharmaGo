import * as admin from "firebase-admin";
import * as crypto from "crypto";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type ConfirmReservationData = {
  reservationId: string;
};

const generatePasscode = () => {
  return crypto.randomInt(10000, 99999).toString();
};

export const confirmMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const pharmacyId = request.auth?.uid;

    if (!pharmacyId) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in as a pharmacy."
      );
    }

    const data = request.data as ConfirmReservationData;

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
          "You can only confirm reservations for your pharmacy."
        );
      }

      if (reservation.status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          "Only pending reservations can be confirmed."
        );
      }

      const durationDays = Number(reservation.reservationDurationDays);

      if (![1, 3, 7].includes(durationDays)) {
        throw new HttpsError(
          "failed-precondition",
          "Reservation duration is invalid."
        );
      }

      const now = Date.now();
      const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;
      const passcode = generatePasscode();

      transaction.update(reservationRef, {
        status: "confirmed",
        passcode,
        confirmedAt: now,
        expiresAt,
        updatedAt: now,
      });
    });

    return {success: true};
  }
);
