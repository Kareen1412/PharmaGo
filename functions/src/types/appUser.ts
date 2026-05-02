type AppUser = {
  id: string;
  role: "user";

  name: string;
  email: string;
  profileImageUrl: string | null;

  address: UserAddress | null;

  createdAt: number;
  updatedAt: number | null;
  lastLogin: number | null;

  isBlocked: boolean;
};

type UserAddress = {
  region: string | null;
  city: string | null;
  street: string | null;
  mapLat: number | null;
  mapLng: number | null;
  locationUrl: string | null;
  additionalDetails: string | null;
};

export type {AppUser, UserAddress};
