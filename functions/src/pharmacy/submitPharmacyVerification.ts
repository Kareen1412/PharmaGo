import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import type {SubmitPharmacyVerificationData} from "../types/verification";

export const submitPharmacyVerification = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated."
      );
    }

    const uid = request.auth.uid;
    const data = request.data as SubmitPharmacyVerificationData;

    if (
      !data.ownerName?.trim() ||
      !data.guildIdNumber?.trim() ||
      !data.storagePath?.trim() ||
      !data.fileName?.trim() ||
      !data.mimeType?.trim()
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required verification data."
      );
    }

    const allowedMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedMimeTypes.includes(data.mimeType)) {
      throw new HttpsError(
        "invalid-argument",
        "Unsupported file type."
      );
    }

    const db = admin.firestore();
    const now = Date.now();

    const pharmacyRef = db.collection("pharmacies").doc(uid);
    const verificationRef =
      db.collection("pharmacyVerificationRequests").doc();

    const bucket = admin.storage().bucket();
    const storageFile = bucket.file(data.storagePath);
    const [exists] = await storageFile.exists();

    if (!exists) {
      throw new HttpsError(
        "not-found",
        "Uploaded guild ID file not found."
      );
    }

    await db.runTransaction(async (transaction) => {
      transaction.update(pharmacyRef, {
        ownerName: data.ownerName.trim(),
        verificationStatus: "pending",
        verifiedAt: null,
        updatedAt: now,
        latestVerificationRequestId: verificationRef.id,
      });

      transaction.set(verificationRef, {
        pharmacyId: uid,
        ownerName: data.ownerName.trim(),
        guildIdNumber: data.guildIdNumber.trim(),
        notes: data.notes?.trim() || null,
        storagePath: data.storagePath,
        fileName: data.fileName,
        mimeType: data.mimeType,
        status: "queued",
        createdAt: now,
        updatedAt: now,
      });
    });

    return {
      success: true,
      verificationRequestId: verificationRef.id,
    };
  }
);
