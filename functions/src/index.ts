import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

admin.initializeApp();

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
    const emailVerified = request.auth.token.email_verified ?? false;
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
        isEmailVerified: emailVerified,
        createdAt: now,
        verifiedAt: null,
        rejectionReason: null,
        isActive: true,
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
