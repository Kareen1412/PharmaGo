import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../config/firebase";
import type { CurrencyCode } from "../../../shared/types/pharmacyRequestReply";

type CreateReplyInput = {
  medicineRequestId: string;
  isSubstitute: boolean;
  price: number;
  currencyCode: CurrencyCode;
  medicineName: string | null;
  additionalNotes: string | null;
  limitedStock: boolean;
};

const submitMedicineRequestReply = httpsCallable(
  functions,
  "submitMedicineRequestReply"
);

export const createPharmacyMedicineRequestReply = async (
  input: CreateReplyInput
) => {
  await submitMedicineRequestReply(input);
};

export const listenToMyRepliedMedicineRequestIds = (
  onSuccess: (requestIds: string[]) => void,
  onError: () => void
) => {
  const pharmacyId = auth.currentUser?.uid;

  if (!pharmacyId) {
    onSuccess([]);
    return () => {};
  }

  const q = query(
    collection(db, "medicineRequestReplies"),
    where("pharmacyId", "==", pharmacyId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const requestIds = Array.from(
        new Set(
          snapshot.docs
            .map((doc) => doc.data().medicineRequestId)
            .filter((id): id is string => typeof id === "string")
        )
      );

      onSuccess(requestIds);
    },
    (error) => {
      console.error("Failed to listen to pharmacy replies:", error);
      onError();
    }
  );
};