import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

import type {MedicineReservation} from "../types/reservedMedRequest";

type CreateReservationData = {
  requestId: string;
  replyId: string;
  reservedQuantity: number;
  durationDays: 1 | 3 | 7;
};

export const createMedicineReservation = onCall(
  {region: "europe-west1"},
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to reserve medicine."
      );
    }

    const data = request.data as CreateReservationData;

    const requestId =
      typeof data.requestId === "string" ? data.requestId.trim() : "";

    const replyId =
      typeof data.replyId === "string" ? data.replyId.trim() : "";

    const reservedQuantity = Number(data.reservedQuantity);
    const durationDays = Number(data.durationDays) as 1 | 3 | 7;

    if (!requestId || !replyId) {
      throw new HttpsError(
        "invalid-argument",
        "Request ID and reply ID are required."
      );
    }

    if (!Number.isInteger(reservedQuantity) || reservedQuantity <= 0) {
      throw new HttpsError(
        "invalid-argument",
        "Reserved quantity must be greater than 0."
      );
    }

    if (![1, 3, 7].includes(durationDays)) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid reservation duration."
      );
    }

    const db = admin.firestore();

    return db.runTransaction(async (transaction) => {
      const requestRef = db.collection("medicineRequests").doc(requestId);

      const replyRef = db
        .collection("medicineRequestReplies")
        .doc(replyId);

      const reservationRef = db
        .collection("medicineReservations")
        .doc();

      const requestSnap = await transaction.get(requestRef);
      const replySnap = await transaction.get(replyRef);

      if (!requestSnap.exists) {
        throw new HttpsError(
          "not-found",
          "Medicine request not found."
        );
      }

      if (!replySnap.exists) {
        throw new HttpsError(
          "not-found",
          "Pharmacy reply not found."
        );
      }

      const medicineRequest = requestSnap.data();
      const reply = replySnap.data();

      if (!medicineRequest || !reply) {
        throw new HttpsError(
          "not-found",
          "Reservation data not found."
        );
      }

      if (medicineRequest.userId !== uid) {
        throw new HttpsError(
          "permission-denied",
          "You can only reserve medicine for your own request."
        );
      }

      if (medicineRequest.status !== "active") {
        throw new HttpsError(
          "failed-precondition",
          "This medicine request is no longer active."
        );
      }

      if (reply.medicineRequestId !== requestId) {
        throw new HttpsError(
          "failed-precondition",
          "This reply does not belong to this request."
        );
      }

      const now = Date.now();

      const reservedMedicineName =
        reply.isSubstitute === true &&
        typeof reply.medicineName === "string" ?
          reply.medicineName :
          medicineRequest.medicineName;

      const reservationData: Omit<MedicineReservation, "id"> = {
        requestId,
        replyId,

        userId: uid,
        pharmacyId: reply.pharmacyId,

        medicineName: reservedMedicineName,

        status: "pending",

        reservedQuantity,

        priceAtReservation:
          typeof reply.price === "number" ?
            reply.price :
            null,

        reservationDurationDays: durationDays,

        passcode: null,

        createdAt: now,
        confirmedAt: null,
        expiresAt: null,
        updatedAt: null,
      };

      transaction.set(reservationRef, reservationData);

      transaction.update(requestRef, {
        status: "reserved",
        reservedReservationId: reservationRef.id,
        updatedAt: now,
      });

      return {
        reservationId: reservationRef.id,
      };
    });
  }
);
