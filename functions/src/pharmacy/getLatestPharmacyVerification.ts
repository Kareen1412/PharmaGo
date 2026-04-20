import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

export const getLatestPharmacyVerification = onCall(
  {region: "europe-west1"},
  async (request) => {
    try {
      const uid = request.auth?.uid;

      if (!uid) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
      }

      console.log("Fetching latest pharmacy verification for uid:", uid);

      const db = admin.firestore();

      const pharmacySnap = await db.collection("pharmacies").doc(uid).get();

      if (!pharmacySnap.exists) {
        return {
          success: true,
          request: null,
        };
      }

      const pharmacyData = pharmacySnap.data();
      const latestVerificationRequestId =
        pharmacyData?.latestVerificationRequestId ?? null;

      if (!latestVerificationRequestId) {
        return {
          success: true,
          request: null,
        };
      }

      const verificationDoc = await db
        .collection("pharmacyVerificationRequests")
        .doc(latestVerificationRequestId)
        .get();

      if (!verificationDoc.exists) {
        return {
          success: true,
          request: null,
        };
      }

      const data = verificationDoc.data();

      return {
        success: true,
        request: {
          id: verificationDoc.id,
          pharmacyId: data?.pharmacyId ?? null,
          ownerName: data?.ownerName ?? "",
          guildIdNumber: data?.guildIdNumber ?? "",
          notes: data?.notes ?? null,
          storagePath: data?.storagePath ?? "",
          fileName: data?.fileName ?? "",
          mimeType: data?.mimeType ?? "",
          status: data?.status ?? "queued",
          createdAt: data?.createdAt ?? null,
          updatedAt: data?.updatedAt ?? null,
          processedAt: data?.processedAt ?? null,
          geminiDecision: data?.geminiDecision ?? null,
          geminiReason: data?.geminiReason ?? null,
          extractedOwnerName: data?.extractedOwnerName ?? null,
          extractedGuildIdNumber: data?.extractedGuildIdNumber ?? null,
          failureReason: data?.failureReason ?? null,
        },
      };
    } catch (error) {
      console.error("getLatestPharmacyVerification failed:", error);

      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Failed to fetch verification."
      );
    }
  }
);
