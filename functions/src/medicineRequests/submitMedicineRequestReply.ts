import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import type {PharmacyMedicineRequestReply} from "../types/pharmacyRequestReply";

type SubmitReplyData = Omit<
  PharmacyMedicineRequestReply,
  "id" | "pharmacyId" | "pharmacyName" | "createdAt"
>;

const NEARBY_RADIUS_KM = 10;

const normalize = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getDistanceInKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const earthRadiusKm = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const canPharmacySeeRequest = (
  request: FirebaseFirestore.DocumentData,
  pharmacy: FirebaseFirestore.DocumentData
) => {
  const requestLat = request.locationLat;
  const requestLng = request.locationLng;

  const pharmacyLat = pharmacy.address?.mapLat;
  const pharmacyLng = pharmacy.address?.mapLng;

  if (typeof requestLat === "number" && typeof requestLng === "number") {
    if (typeof pharmacyLat !== "number" || typeof pharmacyLng !== "number") {
      return false;
    }

    const distance = getDistanceInKm(
      requestLat,
      requestLng,
      pharmacyLat,
      pharmacyLng
    );

    return distance <= NEARBY_RADIUS_KM;
  }

  const requestRegion = normalize(request.region);
  const requestCity = normalize(request.city);

  const pharmacyRegion = normalize(pharmacy.address?.region);
  const pharmacyCity = normalize(pharmacy.address?.city);

  if (requestRegion && requestCity) {
    return requestRegion === pharmacyRegion &&
      requestCity === pharmacyCity;
  }

  if (requestRegion) {
    return requestRegion === pharmacyRegion;
  }

  return false;
};

export const submitMedicineRequestReply = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }

    const pharmacyId = request.auth.uid;
    const data = request.data as SubmitReplyData;

    const medicineRequestId =
      typeof data.medicineRequestId === "string" ?
        data.medicineRequestId.trim() :
        "";

    const isSubstitute = data.isSubstitute === true;
    const price = Number(data.price);
    const currencyCode = data.currencyCode;

    const medicineName =
      typeof data.medicineName === "string" ?
        data.medicineName.trim() :
        "";

    const additionalNotes =
      typeof data.additionalNotes === "string" ?
        data.additionalNotes.trim() :
        "";

    const limitedStock = data.limitedStock === true;

    if (!medicineRequestId) {
      throw new HttpsError(
        "invalid-argument",
        "Medicine request ID is required."
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new HttpsError(
        "invalid-argument",
        "Price must be greater than 0."
      );
    }

    if (currencyCode !== "LBP" && currencyCode !== "USD") {
      throw new HttpsError(
        "invalid-argument",
        "Invalid currency."
      );
    }

    if (isSubstitute && !medicineName) {
      throw new HttpsError(
        "invalid-argument",
        "Substitute medicine name is required."
      );
    }

    const db = admin.firestore();

    const pharmacySnap = await db
      .collection("pharmacies")
      .doc(pharmacyId)
      .get();

    if (!pharmacySnap.exists) {
      throw new HttpsError(
        "permission-denied",
        "Pharmacy profile not found."
      );
    }

    const pharmacy = pharmacySnap.data();

    if (!pharmacy) {
      throw new HttpsError(
        "permission-denied",
        "Pharmacy profile not found."
      );
    }

    if (
      pharmacy.verificationStatus !== "verified" ||
      pharmacy.isActive !== true
    ) {
      throw new HttpsError(
        "permission-denied",
        "Only verified active pharmacies can reply."
      );
    }

    const medicineRequestSnap = await db
      .collection("medicineRequests")
      .doc(medicineRequestId)
      .get();

    if (!medicineRequestSnap.exists) {
      throw new HttpsError(
        "not-found",
        "Medicine request not found."
      );
    }

    const medicineRequest = medicineRequestSnap.data();

    if (!medicineRequest) {
      throw new HttpsError(
        "not-found",
        "Medicine request not found."
      );
    }

    if (medicineRequest.status !== "active") {
      throw new HttpsError(
        "failed-precondition",
        "This request is no longer active."
      );
    }

    if (
      isSubstitute &&
      medicineRequest.allowSubstitutes !== true
    ) {
      throw new HttpsError(
        "failed-precondition",
        "This request does not allow substitutes."
      );
    }

    if (!canPharmacySeeRequest(medicineRequest, pharmacy)) {
      throw new HttpsError(
        "permission-denied",
        "This request is outside your pharmacy search area."
      );
    }

    const now = Date.now();

    const replyRef = await db
      .collection("medicineRequestReplies")
      .add({
        medicineRequestId,
        pharmacyId,
        pharmacyName: pharmacy.pharmacyNameEnglish ?? "Pharmacy",

        isSubstitute,

        price,
        currencyCode,

        medicineName: isSubstitute ? medicineName : null,
        additionalNotes: additionalNotes || null,

        limitedStock,

        createdAt: now,
      });

    await medicineRequestSnap.ref.update({
      replyCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now,
    });

    return {
      replyId: replyRef.id,
    };
  }
);
