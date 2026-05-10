import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, functions, storage } from "../config/firebase";

import type {
  MedicineRequest,
  MedicineRequestUrgency,
} from "../../../shared/types/medRequest";

import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import type { LebanonRegion } from "../../../shared/constants/lebanonLocations";

import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";

type CreateMedicineRequestInput = {
  userName: string | null;
  medicineName: string;
  notes: string | null;
  localImageUri: string | null;
  region: LebanonRegion | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  urgency: MedicineRequestUrgency;
  allowSubstitutes: boolean;
};

type CreateMedicineRequestPayload = {
  userName: string | null;
  medicineName: string;
  notes: string | null;
  imageUrl: string | null;
  imageStoragePath: string | null;
  region: LebanonRegion | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  urgency: MedicineRequestUrgency;
  allowSubstitutes: boolean;
};

type UpdateMedicineRequestInput = {
  medicineName?: string;
  notes?: string | null;
  urgency?: MedicineRequestUrgency;
  allowSubstitutes?: boolean;
};

type CreateMedicineReservationInput = {
  requestId: string;
  replyId: string;
  reservedQuantity: number;
  durationDays: 1 | 3 | 7;
};

type CreateMedicineReservationResult = {
  reservationId: string;
};

type CancelMedicineReservationInput = {
  reservationId: string;
};

type ExpireMedicineReservationInput = {
  reservationId: string;
};

type RenewMedicineReservationInput = {
  reservationId: string;
  reservedQuantity: number;
  durationDays: 1 | 3 | 7;
};

const createMedicineRequestCallable = httpsCallable<
  CreateMedicineRequestPayload,
  MedicineRequest
>(functions, "createMedicineRequest");

const createMedicineReservationCallable = httpsCallable<
  CreateMedicineReservationInput,
  CreateMedicineReservationResult
>(functions, "createMedicineReservation");

const cancelMedicineReservationCallable = httpsCallable<
  CancelMedicineReservationInput,
  { success: boolean }
>(functions, "cancelMedicineReservation");

const expireMedicineReservationCallable = httpsCallable<
  ExpireMedicineReservationInput,
  { success: boolean }
>(functions, "expireMedicineReservation");

const renewMedicineReservationCallable = httpsCallable<
  RenewMedicineReservationInput,
  { success: boolean }
>(functions, "renewMedicineReservation");

const uploadMedicineRequestImage = async (
  uri: string,
  userId: string
): Promise<{ imageUrl: string; imageStoragePath: string }> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileName = `${Date.now()}.jpg`;
  const imageStoragePath = `medicineRequests/${userId}/${fileName}`;
  const imageRef = ref(storage, imageStoragePath);

  await uploadBytes(imageRef, blob);

  const imageUrl = await getDownloadURL(imageRef);

  return { imageUrl, imageStoragePath };
};

export const createMedicineRequest = async (
  input: CreateMedicineRequestInput
): Promise<MedicineRequest> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be logged in to create a medicine request.");
  }

  const medicineName = input.medicineName.trim();

  if (!medicineName) {
    throw new Error("Medicine name is required.");
  }

  let imageUrl: string | null = null;
  let imageStoragePath: string | null = null;

  if (input.localImageUri) {
    const uploadedImage = await uploadMedicineRequestImage(
      input.localImageUri,
      currentUser.uid
    );

    imageUrl = uploadedImage.imageUrl;
    imageStoragePath = uploadedImage.imageStoragePath;
  }

  const result = await createMedicineRequestCallable({
    userName: input.userName,
    medicineName,
    notes: input.notes?.trim() || null,
    imageUrl,
    imageStoragePath,
    region: input.region,
    city: input.city,
    locationLat: input.locationLat,
    locationLng: input.locationLng,
    urgency: input.urgency,
    allowSubstitutes: input.allowSubstitutes,
  });

  return result.data;
};

export const listenToMyActiveMedicineRequests = (
  onRequestsChange: (requests: MedicineRequest[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const q = query(
    collection(db, "medicineRequests"),
    where("userId", "==", currentUser.uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MedicineRequest[];

      const activeRequests = requests
        .filter((request) => request.status === "active")
        .sort((a, b) => b.createdAt - a.createdAt);

      onRequestsChange(activeRequests);
    },
    (error) => onError(error)
  );
};

export const listenToMedicineRequestReplies = (
  medicineRequestId: string,
  onRepliesChange: (replies: PharmacyMedicineRequestReply[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, "medicineRequestReplies"),
    where("medicineRequestId", "==", medicineRequestId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const replies = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as PharmacyMedicineRequestReply[];

      onRepliesChange(replies);
    },
    (error) => onError(error)
  );
};

export const updateMedicineRequest = async (
  requestId: string,
  input: UpdateMedicineRequestInput
): Promise<void> => {
  const requestRef = doc(db, "medicineRequests", requestId);

  const updates: UpdateMedicineRequestInput & { updatedAt: number } = {
    updatedAt: Date.now(),
  };

  if (input.medicineName !== undefined) {
    const medicineName = input.medicineName.trim();

    if (!medicineName) {
      throw new Error("Medicine name is required.");
    }

    updates.medicineName = medicineName;
  }

  if (input.notes !== undefined) {
    updates.notes = input.notes?.trim() || null;
  }

  if (input.urgency !== undefined) {
    updates.urgency = input.urgency;
  }

  if (input.allowSubstitutes !== undefined) {
    updates.allowSubstitutes = input.allowSubstitutes;
  }

  await updateDoc(requestRef, updates);
};

export const softDeleteMedicineRequest = async (
  requestId: string
): Promise<void> => {
  const requestRef = doc(db, "medicineRequests", requestId);

  await updateDoc(requestRef, {
    status: "deleted",
    updatedAt: Date.now(),
  });
};

export const listenToMedicineRequestById = (
  requestId: string,
  onRequestChange: (request: MedicineRequest | null) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const requestRef = doc(db, "medicineRequests", requestId);

  return onSnapshot(
    requestRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onRequestChange(null);
        return;
      }

      onRequestChange({
        id: snapshot.id,
        ...snapshot.data(),
      } as MedicineRequest);
    },
    (error) => onError(error)
  );
};

export const createMedicineReservation = async (
  input: CreateMedicineReservationInput
): Promise<CreateMedicineReservationResult> => {
  const result = await createMedicineReservationCallable(input);
  return result.data;
};

export const listenToMyReservedMedicineRequests = (
  onReservationsChange: (reservations: MedicineReservation[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const q = query(
    collection(db, "medicineReservations"),
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const reservations = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MedicineReservation[];

      const visibleReservations = reservations.filter(
        (reservation) =>
          reservation.status === "pending" ||
          reservation.status === "confirmed" ||
          reservation.status === "expired"
      );

      onReservationsChange(visibleReservations);
    },
    (error) => onError(error)
  );
};

export const cancelMedicineReservation = async (
  reservationId: string
): Promise<void> => {
  await cancelMedicineReservationCallable({ reservationId });
};

export const expireMedicineReservation = async (
  reservationId: string
): Promise<void> => {
  await expireMedicineReservationCallable({ reservationId });
};

export const renewMedicineReservation = async (
  input: RenewMedicineReservationInput
): Promise<void> => {
  await renewMedicineReservationCallable(input);
};

export const listenToMedicineRequestReplyById = (
  replyId: string,
  onReplyChange: (reply: PharmacyMedicineRequestReply | null) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const replyRef = doc(db, "medicineRequestReplies", replyId);

  return onSnapshot(
    replyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onReplyChange(null);
        return;
      }

      onReplyChange({
        id: snapshot.id,
        ...snapshot.data(),
      } as PharmacyMedicineRequestReply);
    },
    (error) => onError(error)
  );
};

export const listenToMedicineReservationById = (
  reservationId: string,
  onReservationChange: (reservation: MedicineReservation | null) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const reservationRef = doc(db, "medicineReservations", reservationId);

  return onSnapshot(
    reservationRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onReservationChange(null);
        return;
      }

      onReservationChange({
        id: snapshot.id,
        ...snapshot.data(),
      } as MedicineReservation);
    },
    (error) => onError(error)
  );
};

export const listenToCompletedMedicineReservations = (
  onReservationsChange: (reservations: MedicineReservation[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be logged in.");
  }

  const q = query(
    collection(db, "medicineReservations"),
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const reservations = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MedicineReservation[];

      const completedReservations = reservations.filter(
        (reservation) => reservation.status === "completed"
      );

      onReservationsChange(completedReservations);
    },
    (error) => onError(error)
  );
};