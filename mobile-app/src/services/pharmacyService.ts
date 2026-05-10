import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { Pharmacy, PharmacyPhone } from "../../../shared/types/pharmacy";
import type { LebanonRegion } from "../../../shared/constants/lebanonLocations";

export type PharmacyFilterMode = "all" | "nearby" | "area";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export const NEARBY_RADIUS_KM = 10;

export const getDistanceKm = (
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

const normalize = (value: string | null | undefined) => {
  return value?.trim().toLowerCase() ?? "";
};

export const getVerifiedActivePharmacies = async (): Promise<Pharmacy[]> => {
  const q = query(
    collection(db, "pharmacies"),
    where("verificationStatus", "==", "verified"),
    where("isActive", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Pharmacy[];
};

export const getPharmacyPhones = async (
  pharmacyId: string
): Promise<PharmacyPhone[]> => {
  const snapshot = await getDocs(
    collection(db, "pharmacies", pharmacyId, "phones")
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PharmacyPhone[];
};

export const filterPharmacies = (
  pharmacies: Pharmacy[],
  input: {
    mode: PharmacyFilterMode;
    userLocation: UserLocation | null;
    region: LebanonRegion | null;
    city: string | null;
  }
): Pharmacy[] => {
  if (input.mode === "all") {
    return pharmacies;
  }

  if (input.mode === "nearby") {
    if (!input.userLocation) return [];

    return pharmacies.filter((pharmacy) => {
      const lat = pharmacy.address?.mapLat;
      const lng = pharmacy.address?.mapLng;

      if (typeof lat !== "number" || typeof lng !== "number") {
        return false;
      }

      const userLocation = input.userLocation;

if (!userLocation) {
  return false;
}

const distance = getDistanceKm(
  userLocation.latitude,
  userLocation.longitude,
  lat,
  lng
);

      return distance <= NEARBY_RADIUS_KM;
    });
  }

  if (input.mode === "area") {
    const selectedRegion = normalize(input.region);
    const selectedCity = normalize(input.city);

    return pharmacies.filter((pharmacy) => {
      const pharmacyRegion = normalize(pharmacy.address?.region);
      const pharmacyCity = normalize(pharmacy.address?.city);

      if (selectedRegion && pharmacyRegion !== selectedRegion) {
        return false;
      }

      if (selectedCity && pharmacyCity !== selectedCity) {
        return false;
      }

      return true;
    });
  }

  return pharmacies;
};

export const listenToFavoritePharmacyIds = (
  onData: (ids: string[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(db, "users", userId, "favoritePharmacies"),
    (snapshot) => {
      onData(snapshot.docs.map((item) => item.id));
    },
    onError
  );
};

export const toggleFavoritePharmacy = async (
  pharmacyId: string,
  isFavorite: boolean
): Promise<void> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("You must be logged in.");
  }

  const favoriteRef = doc(
    db,
    "users",
    userId,
    "favoritePharmacies",
    pharmacyId
  );

  if (isFavorite) {
    await deleteDoc(favoriteRef);
    return;
  }

  await setDoc(favoriteRef, {
    createdAt: Date.now(),
  });
};

export const getFavoritePharmacies = async (): Promise<Pharmacy[]> => {
  const userId = auth.currentUser?.uid;

  if (!userId) return [];

  const favoritesSnapshot = await getDocs(
    collection(db, "users", userId, "favoritePharmacies")
  );

  const pharmacyDocs = await Promise.all(
    favoritesSnapshot.docs.map((favoriteDoc) =>
      getDoc(doc(db, "pharmacies", favoriteDoc.id))
    )
  );

  return pharmacyDocs
    .filter((item) => item.exists())
    .map((item) => ({
      id: item.id,
      ...item.data(),
    })) as Pharmacy[];
};

export const listenToPharmacyById = (
  pharmacyId: string,
  onData: (pharmacy: Pharmacy | null) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const pharmacyRef = doc(db, "pharmacies", pharmacyId);

  return onSnapshot(
    pharmacyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      onData({
        id: snapshot.id,
        ...snapshot.data(),
      } as Pharmacy);
    },
    onError
  );
};