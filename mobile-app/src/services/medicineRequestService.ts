import {
  collection,
  doc,
  onSnapshot,
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

import type { LebanonRegion } from "../../../shared/constants/lebanonLocations";

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

const createMedicineRequestCallable = httpsCallable<
  CreateMedicineRequestPayload,
  MedicineRequest
>(functions, "createMedicineRequest");

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
      const requests = snapshot.docs
        .map((docSnap) => ({
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