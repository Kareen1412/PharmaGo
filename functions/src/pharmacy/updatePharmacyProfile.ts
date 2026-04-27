import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import type {
  Pharmacy,
  PharmacyAddress,
  PharmacyPhone,
  OperatingHours,
} from "../types/pharmacy";

type UpdatePharmacyProfileData = {
  pharmacyNameEnglish: string | null;
  pharmacyNameArabic: string | null;
  ownerName: string | null;
  isActive: boolean;
  address: PharmacyAddress;
  is24Hours: boolean;
  operatingHours: OperatingHours;
  phones: PharmacyPhone[];
};

/**
 * Validates that a value is either a string or null.
 * @param {unknown} value
 * @param {string} fieldName
 */
function validateStringOrNull(value: unknown, fieldName: string) {
  if (value !== null && typeof value !== "string") {
    throw new HttpsError(
      "invalid-argument",
      `${fieldName} must be a string or null.`
    );
  }
}

/**
 * Validates that a value is a boolean.
 * @param {unknown} value
 * @param {string} fieldName
 */
function validateBoolean(value: unknown, fieldName: string) {
  if (typeof value !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      `${fieldName} must be a boolean.`
    );
  }
}

/**
 * Validates a pharmacy address object.
 * @param {unknown} address
 */
function validateAddress(address: unknown): asserts address is PharmacyAddress {
  if (!address || typeof address !== "object") {
    throw new HttpsError("invalid-argument", "address is required.");
  }

  const typed = address as PharmacyAddress;

  validateStringOrNull(typed.region, "address.region");
  validateStringOrNull(typed.city, "address.city");
  validateStringOrNull(typed.street, "address.street");
  validateStringOrNull(typed.locationUrl, "address.locationUrl");
  validateStringOrNull(
    typed.additionalDetails,
    "address.additionalDetails"
  );

  if (typed.mapLat !== null && typeof typed.mapLat !== "number") {
    throw new HttpsError(
      "invalid-argument",
      "address.mapLat must be a number or null."
    );
  }

  if (typed.mapLng !== null && typeof typed.mapLng !== "number") {
    throw new HttpsError(
      "invalid-argument",
      "address.mapLng must be a number or null."
    );
  }
}

/**
 * Validates one day's operating hours.
 * @param {{open: (string|null), close: (string|null), isClosed: boolean}} day
 * @param {string} dayName
 */
function validateDay(
  day: {open: string | null; close: string | null; isClosed: boolean},
  dayName: string
) {
  validateBoolean(day.isClosed, `${dayName}.isClosed`);
  validateStringOrNull(day.open, `${dayName}.open`);
  validateStringOrNull(day.close, `${dayName}.close`);

  if (!day.isClosed && (!day.open || !day.close)) {
    throw new HttpsError(
      "invalid-argument",
      `${dayName} must have open and close times unless it is closed.`
    );
  }

  if (day.isClosed && (day.open !== null || day.close !== null)) {
    throw new HttpsError(
      "invalid-argument",
      `${dayName} must have null open/close when marked closed.`
    );
  }
}

/**
 * Validates operating hours object.
 * @param {unknown} hours
 */
function validateOperatingHours(
  hours: unknown
): asserts hours is OperatingHours {
  if (!hours || typeof hours !== "object") {
    throw new HttpsError(
      "invalid-argument",
      "operatingHours is required."
    );
  }

  const typed = hours as OperatingHours;

  validateDay(typed.monday, "monday");
  validateDay(typed.tuesday, "tuesday");
  validateDay(typed.wednesday, "wednesday");
  validateDay(typed.thursday, "thursday");
  validateDay(typed.friday, "friday");
  validateDay(typed.saturday, "saturday");
  validateDay(typed.sunday, "sunday");
}

/**
 * Validates phone array.
 * @param {unknown} phones
 */
function validatePhones(phones: unknown): asserts phones is PharmacyPhone[] {
  if (!Array.isArray(phones)) {
    throw new HttpsError("invalid-argument", "phones must be an array.");
  }

  for (const phone of phones) {
    if (!phone || typeof phone !== "object") {
      throw new HttpsError(
        "invalid-argument",
        "Each phone must be an object."
      );
    }

    if (typeof phone.id !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "phone.id must be a string."
      );
    }

    if (typeof phone.pharmacyId !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "phone.pharmacyId must be a string."
      );
    }

    if (typeof phone.phoneNumber !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "phone.phoneNumber must be a string."
      );
    }

    validateBoolean(phone.isWhatsapp, "phone.isWhatsapp");
    validateBoolean(phone.isLandline, "phone.isLandline");
  }
}

export const updatePharmacyProfile = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated."
      );
    }

    const uid = request.auth.uid;
    const data = request.data as UpdatePharmacyProfileData;
    const now = Date.now();

    validateStringOrNull(data.pharmacyNameEnglish, "pharmacyNameEnglish");
    validateStringOrNull(data.pharmacyNameArabic, "pharmacyNameArabic");
    validateStringOrNull(data.ownerName, "ownerName");
    validateBoolean(data.isActive, "isActive");
    validateAddress(data.address);
    validateBoolean(data.is24Hours, "is24Hours");
    validateOperatingHours(data.operatingHours);
    validatePhones(data.phones);

    const db = admin.firestore();
    const pharmacyRef = db.collection("pharmacies").doc(uid);
    const phonesCollectionRef = pharmacyRef.collection("phones");

    const pharmacySnap = await pharmacyRef.get();

    if (!pharmacySnap.exists) {
      throw new HttpsError(
        "not-found",
        "Pharmacy profile not found."
      );
    }

    const currentPharmacy = pharmacySnap.data() as Pharmacy;

    const canToggleActivity =
      currentPharmacy.verificationStatus === "verified";

    if (!canToggleActivity && data.isActive !== currentPharmacy.isActive) {
      throw new HttpsError(
        "failed-precondition",
        "Account activity can only be changed for verified pharmacies."
      );
    }

    await db.runTransaction(async (transaction) => {
      transaction.update(pharmacyRef, {
        pharmacyNameEnglish: data.pharmacyNameEnglish,
        pharmacyNameArabic: data.pharmacyNameArabic,
        ownerName: data.ownerName,
        isActive: data.isActive,
        address: data.address,
        is24Hours: data.is24Hours,
        operatingHours: data.operatingHours,
        updatedAt: now,
      });

      const existingPhonesSnap = await phonesCollectionRef.get();
      const existingIds = new Set(
        existingPhonesSnap.docs.map((docSnap) => docSnap.id)
      );
      const incomingIds = new Set<string>();

      for (const phone of data.phones) {
        const trimmedId = phone.id.trim();
        const docId = trimmedId || phonesCollectionRef.doc().id;

        incomingIds.add(docId);

        transaction.set(phonesCollectionRef.doc(docId), {
          id: docId,
          pharmacyId: uid,
          phoneNumber: phone.phoneNumber.trim(),
          isWhatsapp: phone.isWhatsapp,
          isLandline: phone.isLandline,
        });
      }

      for (const existingId of existingIds) {
        if (!incomingIds.has(existingId)) {
          transaction.delete(phonesCollectionRef.doc(existingId));
        }
      }
    });

    return {success: true};
  }
);
