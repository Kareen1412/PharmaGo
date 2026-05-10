import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { AppUser } from "../../../shared/types/appUser";

export const listenToUserProfile = (
  userId: string,
  onChange: (user: AppUser | null) => void,
  onError?: (error: Error) => void
) => {
  const userRef = doc(db, "users", userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }

      onChange({
        id: snapshot.id,
        ...snapshot.data(),
      } as AppUser);
    },
    (error) => onError?.(error)
  );
};

export const updateUserProfile = async (
  userId: string,
  data: {
    name: string;
  }
) => {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    name: data.name.trim(),
    updatedAt: Date.now(),
  });
};