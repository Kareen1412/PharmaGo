import { createUserWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../config/firebase";

const createPharmacyProfile = httpsCallable(
  functions,
  "createPharmacyProfile"
);

export const signUpPharmacy = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  try {
    await createPharmacyProfile({});
    return userCredential.user;
  } catch (error) {
    console.error("Failed to create pharmacy profile:", error);
    throw error;
  }
};