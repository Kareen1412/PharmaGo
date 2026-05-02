import { createUserWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../config/firebase";

const createPharmacyProfile = httpsCallable(
  functions,
  "createPharmacyProfile"
);

export const signUpPharmacy = async (
  pharmacyNameEnglish: string,
  email: string,
  password: string
) => {
  const cleanedPharmacyName = pharmacyNameEnglish.trim();

  if (!cleanedPharmacyName) {
    throw new Error("Pharmacy name in English is required.");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  try {
    await createPharmacyProfile({
      pharmacyNameEnglish: cleanedPharmacyName,
    });

    return userCredential.user;
  } catch (error) {
    console.error("Failed to create pharmacy profile:", error);
    throw error;
  }
};