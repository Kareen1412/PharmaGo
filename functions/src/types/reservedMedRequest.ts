export type MedicineReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
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

  reservationDurationDays: 1 | 3 | 7;

  passcode: string | null;

  createdAt: number;
  confirmedAt: number | null;
  expiresAt: number | null;
  updatedAt: number | null;
};
