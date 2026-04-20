import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {createDefaultOperatingHours} from "../utils/operatingHours";
import type {Pharmacy} from "../types/pharmacy";

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

      const pharmacyData: Pharmacy = {
        id: uid,
        pharmacyNameEnglish: null,
        pharmacyNameArabic: null,
        verificationStatus: "unverified",
        latestVerificationRequestId: null,
        ownerName: null,
        email,
        createdAt: now,
        verifiedAt: null,
        isActive: false,
        address: {
          region: null,
          city: null,
          street: null,
          mapLat: null,
          mapLng: null,
          locationUrl: null,
          additionalDetails: null,
        },
        suspensionReason: null,
        reportCount: 0,
        is24Hours: false,
        operatingHours: createDefaultOperatingHours(),
        updatedAt: null,
      };

      transaction.set(pharmacyRef, pharmacyData);
    });

    return {success: true};
  }
);
