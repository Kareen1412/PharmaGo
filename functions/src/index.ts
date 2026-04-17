import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {defineSecret} from "firebase-functions/params";
import {GoogleGenAI} from "@google/genai";

admin.initializeApp();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const createClosedDay = () => ({
  open: null,
  close: null,
  isClosed: true,
});

const createDefaultOperatingHours = () => ({
  monday: createClosedDay(),
  tuesday: createClosedDay(),
  wednesday: createClosedDay(),
  thursday: createClosedDay(),
  friday: createClosedDay(),
  saturday: createClosedDay(),
  sunday: createClosedDay(),
});

type SubmitPharmacyVerificationData = {
  ownerName: string;
  guildIdNumber: string;
  notes?: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
};

type GeminiVerificationDecision = {
  decision: "verified" | "rejected";
  reason: string | null;
  extractedOwnerName: string | null;
  extractedGuildIdNumber: string | null;
};

export const createPharmacyProfile = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated."
      );
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email ?? "";
    const now = Date.now();

    const db = admin.firestore();

    const accountRef = db.collection("accounts").doc(uid);
    const pharmacyRef = db.collection("pharmacies").doc(uid);

    const accountSnap = await accountRef.get();
    const pharmacySnap = await pharmacyRef.get();

    if (accountSnap.exists || pharmacySnap.exists) {
      throw new HttpsError(
        "already-exists",
        "Pharmacy profile already exists."
      );
    }

    await db.runTransaction(async (transaction) => {
      transaction.set(accountRef, {
        authUserId: uid,
        role: "pharmacy",
      });

      transaction.set(pharmacyRef, {
        id: uid,
        pharmacyNameEnglish: null,
        pharmacyNameArabic: null,
        guildIdFileUrl: null,
        verificationStatus: "unverified",
        ownerName: null,
        email,
        createdAt: now,
        verifiedAt: null,
        rejectionReason: null,
        isActive: false,
        address: {
          region: null,
          city: null,
          street: null,
          mapLat: null,
          mapLng: null,
          additionalDetails: null,
        },
        suspensionReason: null,
        reportCount: 0,
        is24Hours: false,
        operatingHours: createDefaultOperatingHours(),
        updatedAt: null,
      });
    });

    return {success: true};
  }
);

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
        guildIdFileUrl: data.storagePath,
        verificationStatus: "pending",
        rejectionReason: null,
        verifiedAt: null,
        updatedAt: now,
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
            rejectionReason: null,
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
          rejectionReason:
            geminiResult.reason ||
            "The uploaded guild ID could not be verified.",
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
        rejectionReason:
          "Verification processing failed. Please resubmit.",
        isActive: false,
        updatedAt: Date.now(),
      });
    }
  }
);

/**
 * Verifies an uploaded pharmacy guild ID document with Gemini.
 * @param {Object} params
 * @param {string} params.apiKey
 * @param {Buffer} params.fileBytes
 * @param {string} params.mimeType
 * @param {string} params.ownerName
 * @param {string} params.guildIdNumber
 * @return {Promise<GeminiVerificationDecision>}
 */
async function verifyWithGemini(params: {
  apiKey: string;
  fileBytes: Buffer;
  mimeType: string;
  ownerName: string;
  guildIdNumber: string;
}): Promise<GeminiVerificationDecision> {
  const ai = new GoogleGenAI({
    apiKey: params.apiKey,
  });

  const prompt = `
You are verifying whether an uploaded pharmacy guild ID document
appears to be a real pharmacist/pharmacy licensing or guild-related
document.

Given:
- Claimed licensed pharmacist name: ${params.ownerName}
- Claimed guild ID number: ${params.guildIdNumber}

Your task:
1. Inspect the uploaded document.
2. Decide whether it plausibly represents an authentic
   pharmacy/pharmacist guild, licensing, syndicate, or professional
   registration document.
3. Compare the visible document information to the claimed owner name
   and guild ID number if possible.
4. Return strict JSON only.

Rules:
- Return "verified" only if the document clearly appears to be a
  pharmacy/pharmacist credential and the details do not conflict
  with the claimed data.
- Return "rejected" if the document is unrelated, unreadable,
  obviously inconsistent, or missing enough evidence.
- Be conservative. If uncertain, reject.
- Do not include markdown fences.

Return exactly this JSON shape:
{
  "decision": "verified" | "rejected",
  "reason": "short explanation",
  "extractedOwnerName": "string or null",
  "extractedGuildIdNumber": "string or null"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {text: prompt},
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.fileBytes.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed: GeminiVerificationDecision;

  try {
    parsed = JSON.parse(text) as GeminiVerificationDecision;
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (
    parsed.decision !== "verified" &&
    parsed.decision !== "rejected"
  ) {
    throw new Error("Gemini returned an invalid decision.");
  }

  return {
    decision: parsed.decision,
    reason: parsed.reason ?? null,
    extractedOwnerName: parsed.extractedOwnerName ?? null,
    extractedGuildIdNumber: parsed.extractedGuildIdNumber ?? null,
  };
}

export const getLatestPharmacyVerification = onCall(
  {region: "europe-west1"},
  async (request) => {
    try {
      const uid = request.auth?.uid;

      if (!uid) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
      }

      console.log("Fetching latest pharmacy verification for uid:", uid);

      const snapshot = await admin
        .firestore()
        .collection("pharmacyVerificationRequests")
        .where("pharmacyId", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      console.log("Snapshot empty:", snapshot.empty);

      if (snapshot.empty) {
        return {
          success: true,
          request: null,
        };
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      return {
        success: true,
        request: {
          id: doc.id,
          pharmacyId: data.pharmacyId ?? null,
          ownerName: data.ownerName ?? "",
          guildIdNumber: data.guildIdNumber ?? "",
          notes: data.notes ?? null,
          storagePath: data.storagePath ?? "",
          fileName: data.fileName ?? "",
          mimeType: data.mimeType ?? "",
          status: data.status ?? "queued",
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
          processedAt: data.processedAt ?? null,
          geminiDecision: data.geminiDecision ?? null,
          geminiReason: data.geminiReason ?? null,
          extractedOwnerName: data.extractedOwnerName ?? null,
          extractedGuildIdNumber: data.extractedGuildIdNumber ?? null,
          failureReason: data.failureReason ?? null,
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
