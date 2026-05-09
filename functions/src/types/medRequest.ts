export type MedicineRequestStatus = "active" | "reserved" | "deleted";

export type MedicineRequestUrgency = "normal" | "urgent";

export type MedicineRequest = {
  id: string;

  userId: string;
  userName: string | null;

  medicineName: string;
  notes: string | null;

  imageUrl: string | null;
  imageStoragePath: string | null;

  region: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;

  status: MedicineRequestStatus;
  urgency: MedicineRequestUrgency;

  allowSubstitutes: boolean;

  reservedReservationId: string | null;

  createdAt: number;
  updatedAt: number | null;
};
