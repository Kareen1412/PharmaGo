export type MedicineReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired";

export type MedicineReservation = {
  id: string;

  requestId: string;
  replyId: string;

  userId: string;
  pharmacyId: string;

  medicineName: string;

  status: MedicineReservationStatus;

  reservedQuantity: number | null;
  priceAtReservation: number | null;

  passcode: string;

  createdAt: number;
  expiresAt: number;
  updatedAt: number | null;
};