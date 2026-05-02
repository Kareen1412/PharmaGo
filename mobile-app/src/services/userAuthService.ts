import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../config/firebase";

const createUserProfile = httpsCallable(functions, "createUserProfile");

export const signUpUser = async (
  name: string,
  email: string,
  password: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  try {
    await createUserProfile({ name });
    return userCredential.user;
  } catch (error) {
    await signOut(auth);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  const accountRef = doc(db, "accounts", uid);
  const accountSnap = await getDoc(accountRef);

  if (!accountSnap.exists()) {
    await signOut(auth);
    throw new Error("Account profile is missing.");
  }

  const accountData = accountSnap.data();

  if (accountData.role !== "user") {
    await signOut(auth);
    throw new Error("This account is not registered as a user.");
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await signOut(auth);
    throw new Error("User profile is missing.");
  }

  const userData = userSnap.data();

  if (userData.isBlocked) {
    await signOut(auth);
    throw new Error("Your account has been blocked.");
  }

  await updateDoc(userRef, {
    lastLogin: Date.now(),
    updatedAt: Date.now(),
  });

  return userCredential.user;
};

export const resetUserPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  await signOut(auth);
};