import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

type RenewReservationData = {
  reservationId: string;
  reservedQuantity: number;
  durationDays: 1 | 3 | 7;
};

export const renewMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to renew this reservation."
      );
    }

    const data = request.data as RenewReservationData;

    const reservationId =
      typeof data.reservationId === "string" ? data.reservationId.trim() : "";

    const reservedQuantity = Number(data.reservedQuantity);
    const durationDays = Number(data.durationDays) as 1 | 3 | 7;

    if (!reservationId) {
      throw new HttpsError("invalid-argument", "Reservation ID is required.");
    }

    if (!Number.isInteger(reservedQuantity) || reservedQuantity <= 0) {
      throw new HttpsError(
        "invalid-argument",
        "Reserved quantity must be greater than 0."
      );
    }

    if (![1, 3, 7].includes(durationDays)) {
      throw new HttpsError("invalid-argument", "Invalid reservation duration.");
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
          "You can only renew your own reservation."
        );
      }

      if (reservation.status !== "expired") {
        throw new HttpsError(
          "failed-precondition",
          "Only expired reservations can be renewed."
        );
      }

      const requestRef = db
        .collection("medicineRequests")
        .doc(reservation.requestId);

      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists) {
        throw new HttpsError("not-found", "Original request not found.");
      }

      const medicineRequest = requestSnap.data();

      if (!medicineRequest) {
        throw new HttpsError("not-found", "Original request not found.");
      }

      if (
        medicineRequest.status !== "reserved" ||
        medicineRequest.reservedReservationId !== reservationId
      ) {
        throw new HttpsError(
          "failed-precondition",
          "This request is no longer linked to this reservation."
        );
      }

      const now = Date.now();

      transaction.update(reservationRef, {
        status: "pending",
        reservedQuantity,
        reservationDurationDays: durationDays,
        passcode: null,
        confirmedAt: null,
        expiresAt: null,
        updatedAt: now,
      });

      transaction.update(requestRef, {
        status: "reserved",
        reservedReservationId: reservationId,
        updatedAt: now,
      });
    });

    return {success: true};
  }
);
