import {
  collection,
  doc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import type {
  Pharmacy,
  PharmacyPhone,
  PharmacyAddress,
  OperatingHours,
} from "../../../shared/types/pharmacy";

export interface UpdatePharmacyProfilePayload {
  pharmacyNameEnglish: string | null;
  pharmacyNameArabic: string | null;
  ownerName: string | null;
  isActive: boolean;
  address: PharmacyAddress;
  is24Hours: boolean;
  operatingHours: OperatingHours;
  phones: PharmacyPhone[];
}

export function subscribeToPharmacyProfile(
  uid: string,
  onData: (pharmacy: Pharmacy | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const pharmacyRef = doc(db, "pharmacies", uid);

  return onSnapshot(
    pharmacyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      onData(snapshot.data() as Pharmacy);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export function subscribeToPharmacyPhones(
  uid: string,
  onData: (phones: PharmacyPhone[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const phonesRef = collection(db, "pharmacies", uid, "phones");

  return onSnapshot(
    phonesRef,
    (snapshot) => {
      const phones = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as PharmacyPhone),
        id: docSnap.id,
      }));

      onData(phones);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function savePharmacyProfile(
  payload: UpdatePharmacyProfilePayload
): Promise<void> {
  const callable = httpsCallable<UpdatePharmacyProfilePayload, { success: boolean }>(
    functions,
    "updatePharmacyProfile"
  );

  await callable(payload);
}