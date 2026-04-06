export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface DailyOperatingHours {
  open: string | null;
  close: string | null;
  isClosed: boolean;
}

export interface OperatingHours {
  monday: DailyOperatingHours;
  tuesday: DailyOperatingHours;
  wednesday: DailyOperatingHours;
  thursday: DailyOperatingHours;
  friday: DailyOperatingHours;
  saturday: DailyOperatingHours;
  sunday: DailyOperatingHours;
}

export interface PharmacyAddress {
  region: string | null;
  city: string | null;
  street: string | null;
  mapLat: number | null;
  mapLng: number | null;
  additionalDetails: string | null;
}

export interface Pharmacy {
  id: string;
  pharmacyNameEnglish: string | null;
  pharmacyNameArabic: string | null;
  guildIdFileUrl: string | null;
  verificationStatus: VerificationStatus;
  ownerName: string | null;
  email: string;
  isEmailVerified: boolean;
  createdAt: number;
  verifiedAt: number | null;
  rejectionReason: string | null; // if verificationStatus is "rejected", this field contains the reason for rejection
  isActive: boolean; // if false, either pharmacy deactivated itself or was suspended by admin upon reaching report threshold
  address: PharmacyAddress;
  suspensionReason: string | null; // if isActive is false, this field contains the reason for suspension (e.g. "Too many reports")
  reportCount: number;
  is24Hours: boolean;
  operatingHours: OperatingHours;
  updatedAt: number | null; // timestamp of last update to pharmacy info, used for cache invalidation
}