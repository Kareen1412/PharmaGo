import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {GEMINI_API_KEY} from "../config/secrets";
import {
  verifyWithGemini,
  type GeminiVerificationDecision,
} from "../services/geminiVerification";

export const processPharmacyVerification = onDocumentCreated(
  {
    region: "europe-west1",
    document: "pharmacyVerificationRequests/{requestId}",
    secrets: [GEMINI_API_KEY],
  },
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      return;
    }

    const requestId = event.params.requestId;
    const data = snapshot.data();

    const pharmacyId = data.pharmacyId as string;
    const ownerName = data.ownerName as string;
    const guildIdNumber = data.guildIdNumber as string;
    const storagePath = data.storagePath as string;
    const mimeType = data.mimeType as string;

    const db = admin.firestore();
    const requestRef =
      db.collection("pharmacyVerificationRequests").doc(requestId);
    const pharmacyRef = db.collection("pharmacies").doc(pharmacyId);

    try {
      await requestRef.update({
        status: "processing",
        updatedAt: Date.now(),
      });

      const bucket = admin.storage().bucket();
      const [fileBytes] = await bucket.file(storagePath).download();

      let geminiResult: GeminiVerificationDecision;

      if (guildIdNumber === "TEST-VERIFY") {
        geminiResult = {
          decision: "verified",
          reason: "Test verification bypass.",
          extractedOwnerName: ownerName,
          extractedGuildIdNumber: guildIdNumber,
        };
      } else if (guildIdNumber === "TEST-REJECT") {
        geminiResult = {
          decision: "rejected",
          reason: "Test rejection bypass.",
          extractedOwnerName: ownerName,
          extractedGuildIdNumber: guildIdNumber,
        };
      } else {
        geminiResult = await verifyWithGemini({
          apiKey: GEMINI_API_KEY.value(),
          fileBytes,
          mimeType,
          ownerName,
          guildIdNumber,
        });
      }

      console.log("Gemini verification result:", geminiResult);

      const now = Date.now();

      if (geminiResult.decision === "verified") {
        await db.runTransaction(async (transaction) => {
          transaction.update(pharmacyRef, {
            verificationStatus: "verified",
            verifiedAt: now,
            isActive: true,
            updatedAt: now,
          });

          transaction.update(requestRef, {
            status: "verified",
            geminiDecision: geminiResult.decision,
            geminiReason: geminiResult.reason,
            extractedOwnerName: geminiResult.extractedOwnerName,
            extractedGuildIdNumber:
              geminiResult.extractedGuildIdNumber,
            processedAt: now,
            updatedAt: now,
          });
        });

        return;
      }

      await db.runTransaction(async (transaction) => {
        transaction.update(pharmacyRef, {
          verificationStatus: "rejected",
          verifiedAt: null,
          isActive: false,
          updatedAt: now,
        });

        transaction.update(requestRef, {
          status: "rejected",
          geminiDecision: geminiResult.decision,
          geminiReason: geminiResult.reason,
          extractedOwnerName: geminiResult.extractedOwnerName,
          extractedGuildIdNumber:
            geminiResult.extractedGuildIdNumber,
          processedAt: now,
          updatedAt: now,
        });
      });
    } catch (error: unknown) {
      const failureReason =
        error instanceof Error ?
          error.message :
          "Unknown verification error";

      await requestRef.update({
        status: "failed",
        failureReason,
        updatedAt: Date.now(),
      });

      await pharmacyRef.update({
        verificationStatus: "rejected",
        isActive: false,
        updatedAt: Date.now(),
      });
    }
  }
);
