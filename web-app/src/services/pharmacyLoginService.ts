import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const loginPharmacy = async (
  email: string,
  password: string,
  rememberMe: boolean
) => {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  const accountRef = doc(db, "accounts", uid);
  const accountSnap = await getDoc(accountRef);

  if (!accountSnap.exists()) {
    throw new Error("Account profile is missing.");
  }

  const accountData = accountSnap.data();

  if (accountData.role !== "pharmacy") {
    throw new Error("This account is not registered as a pharmacy.");
  }

  return userCredential.user;
};

export const resetPharmacyPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};