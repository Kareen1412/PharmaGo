import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { MedicineRequest } from "../../../shared/types/medRequest";

type PharmacyRequestFilterData = {
  region: string | null;
  city: string | null;
  mapLat: number | null;
  mapLng: number | null;
};

const NEARBY_RADIUS_KM = 10;

const normalize = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? "";

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

const sortUrgentFirst = (items: MedicineRequest[]) => {
  return [...items].sort((a, b) => {
    if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
    if (a.urgency !== "urgent" && b.urgency === "urgent") return 1;
    return b.createdAt - a.createdAt;
  });
};

const getCurrentPharmacyFilterData = async (): Promise<PharmacyRequestFilterData | null> => {
  const pharmacyId = auth.currentUser?.uid;

  if (!pharmacyId) return null;

  const pharmacyRef = doc(db, "pharmacies", pharmacyId);
  const pharmacySnap = await getDoc(pharmacyRef);

  if (!pharmacySnap.exists()) return null;

  const pharmacy = pharmacySnap.data();

  return {
    region: pharmacy.address?.region ?? null,
    city: pharmacy.address?.city ?? null,
    mapLat: pharmacy.address?.mapLat ?? null,
    mapLng: pharmacy.address?.mapLng ?? null,
  };
};

const canPharmacySeeRequest = (
  request: MedicineRequest,
  pharmacy: PharmacyRequestFilterData
) => {
  const requestLat = request.locationLat;
  const requestLng = request.locationLng;

  if (requestLat !== null && requestLng !== null) {
    if (pharmacy.mapLat === null || pharmacy.mapLng === null) return false;

    const distance = getDistanceInKm(
      requestLat,
      requestLng,
      pharmacy.mapLat,
      pharmacy.mapLng
    );

    return distance <= NEARBY_RADIUS_KM;
  }

  const requestRegion = normalize(request.region);
  const requestCity = normalize(request.city);
  const pharmacyRegion = normalize(pharmacy.region);
  const pharmacyCity = normalize(pharmacy.city);

  if (requestRegion && requestCity) {
    return requestRegion === pharmacyRegion && requestCity === pharmacyCity;
  }

  if (requestRegion) {
    return requestRegion === pharmacyRegion;
  }

  return false;
};

export const listenToAllActiveMedicineRequests = async (
  onSuccess: (items: MedicineRequest[]) => void,
  onError: () => void
) => {
  const pharmacy = await getCurrentPharmacyFilterData();

  if (!pharmacy) {
    onSuccess([]);
    return () => {};
  }

  const q = query(
    collection(db, "medicineRequests"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicineRequest[];

      const visibleItems = items.filter((request) =>
        canPharmacySeeRequest(request, pharmacy)
      );

      onSuccess(sortUrgentFirst(visibleItems));
    },
    (error) => {
      console.error("Failed to listen to active medicine requests:", error);
      onError();
    }
  );
};

export const listenToReservedMedicineRequestsForPharmacy = (
  onSuccess: (items: MedicineRequest[]) => void,
  onError: () => void
) => {
  const pharmacyId = auth.currentUser?.uid;

  if (!pharmacyId) {
    onSuccess([]);
    return () => {};
  }

  const q = query(
    collection(db, "medicineRequests"),
    where("status", "==", "reserved"),
    where("reservedPharmacyId", "==", pharmacyId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicineRequest[];

      onSuccess(sortUrgentFirst(items));
    },
    (error) => {
      console.error("Failed to listen to reserved medicine requests:", error);
      onError();
    }
  );
};