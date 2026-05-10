export type CurrencyCode = "LBP" | "USD";

export type PharmacyMedicineRequestReply = {
  id: string;

  medicineRequestId: string;
  pharmacyId: string;
  pharmacyName: string;

  isSubstitute: boolean;

  price: number;
  currencyCode: CurrencyCode;

  medicineName: string | null;
  additionalNotes: string | null;

  limitedStock: boolean;

  createdAt: number;
};
