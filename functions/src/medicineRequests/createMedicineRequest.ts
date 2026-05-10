import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";

import type {
  MedicineRequest,
  MedicineRequestUrgency,
} from "../types/medRequest";

import {
  LEBANON_REGIONS,
  REGION_CITIES,
  type LebanonRegion,
} from "../constants/lebanonLocations";

type CreateMedicineRequestData = {
  userName?: string | null;
  medicineName?: string;
  notes?: string | null;

  imageUrl?: string | null;
  imageStoragePath?: string | null;

  region?: LebanonRegion | null;
  city?: string | null;

  locationLat?: number | null;
  locationLng?: number | null;

  urgency?: MedicineRequestUrgency;
  allowSubstitutes?: boolean;
};

const isValidRegion = (region: string): region is LebanonRegion => {
  return LEBANON_REGIONS.includes(region as LebanonRegion);
};

const validateArea = (
  region: LebanonRegion | null,
  city: string | null
): void => {
  if (!region && city) {
    throw new HttpsError(
      "invalid-argument",
      "City cannot be selected without a region."
    );
  }

  if (region && !isValidRegion(region)) {
    throw new HttpsError("invalid-argument", "Invalid pharmacy region.");
  }

  if (region && city && !REGION_CITIES[region].includes(city)) {
    throw new HttpsError(
      "invalid-argument",
      "Selected city does not belong to the selected region."
    );
  }
};

const validateLocation = (
  locationLat: number | null,
  locationLng: number | null
): void => {
  const hasLat = typeof locationLat === "number";
  const hasLng = typeof locationLng === "number";

  if (hasLat !== hasLng) {
    throw new HttpsError(
      "invalid-argument",
      "Both latitude and longitude are required for nearby search."
    );
  }

  if (
    hasLat &&
    (locationLat < -90 ||
      locationLat > 90 ||
      locationLng === null ||
      locationLng < -180 ||
      locationLng > 180)
  ) {
    throw new HttpsError("invalid-argument", "Invalid location coordinates.");
  }
};

export const createMedicineRequest = onCall(
  {region: "europe-west1"},
  async (request): Promise<MedicineRequest> => {
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to create a medicine request."
      );
    }

    const data = request.data as CreateMedicineRequestData;

    const medicineName = data.medicineName?.trim();

    if (!medicineName) {
      throw new HttpsError("invalid-argument", "Medicine name is required.");
    }

    const userName = data.userName?.trim() || null;
    const notes = data.notes?.trim() || null;

    const imageUrl = data.imageUrl ?? null;
    const imageStoragePath = data.imageStoragePath ?? null;

    const regionValue = data.region ?? null;
    const city = data.city?.trim() || null;

    const locationLat = data.locationLat ?? null;
    const locationLng = data.locationLng ?? null;

    const urgency = data.urgency ?? "normal";
    const allowSubstitutes = data.allowSubstitutes ?? true;

    if (urgency !== "normal" && urgency !== "urgent") {
      throw new HttpsError("invalid-argument", "Invalid urgency value.");
    }

    validateArea(regionValue, city);
    validateLocation(locationLat, locationLng);

    const hasArea = regionValue !== null;
    const hasNearby = locationLat !== null && locationLng !== null;

    if (!hasArea && !hasNearby) {
      throw new HttpsError(
        "invalid-argument",
        "Choose nearby search or a pharmacy region."
      );
    }

    if (hasArea && hasNearby) {
      throw new HttpsError(
        "invalid-argument",
        "Choose either nearby search or pharmacy area, not both."
      );
    }

    const now = Date.now();

    const requestData: Omit<MedicineRequest, "id"> = {
      userId: uid,
      userName,

      medicineName,
      notes,

      imageUrl,
      imageStoragePath,

      region: regionValue,
      city,
      locationLat,
      locationLng,

      status: "active",
      urgency,

      allowSubstitutes,

      reservedReservationId: null,

      replyCount: 0,

      createdAt: now,
      updatedAt: null,
    };

    const docRef = await admin
      .firestore()
      .collection("medicineRequests")
      .add(requestData);

    return {
      id: docRef.id,
      ...requestData,
    };
  }
);
