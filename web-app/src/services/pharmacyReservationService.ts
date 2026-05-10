import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../config/firebase";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";

const confirmReservationCallable = httpsCallable(
  functions,
  "confirmMedicineReservation"
);

const cancelReservationCallable = httpsCallable(
  functions,
  "cancelMedicineReservationByPharmacy"
);

const completeReservationCallable = httpsCallable(
  functions,
  "completeMedicineReservation"
);

const expireReservationCallable = httpsCallable(
  functions,
  "expireMedicineReservation"
);

export const listenToPharmacyReservations = (
  onSuccess: (items: MedicineReservation[]) => void,
  onError: () => void
) => {
  const pharmacyId = auth.currentUser?.uid;

  if (!pharmacyId) {
    onSuccess([]);
    return () => {};
  }

  const q = query(
    collection(db, "medicineReservations"),
    where("pharmacyId", "==", pharmacyId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MedicineReservation[];

      const visibleItems = items
        .filter(
          (item) =>
            item.status === "pending" ||
            item.status === "confirmed" ||
            item.status === "expired"
        )
        .sort((a, b) => b.createdAt - a.createdAt);

      onSuccess(visibleItems);
    },
    (error) => {
      console.error("Failed to listen to pharmacy reservations:", error);
      onError();
    }
  );
};

export const getReservationRequestAndReply = async (
  reservation: MedicineReservation
): Promise<{
  request: MedicineRequest | null;
  reply: PharmacyMedicineRequestReply | null;
}> => {
  const requestSnap = await getDoc(
    doc(db, "medicineRequests", reservation.requestId)
  );

  const replySnap = await getDoc(
    doc(db, "medicineRequestReplies", reservation.replyId)
  );

  return {
    request: requestSnap.exists()
      ? ({ id: requestSnap.id, ...requestSnap.data() } as MedicineRequest)
      : null,
    reply: replySnap.exists()
      ? ({
          id: replySnap.id,
          ...replySnap.data(),
        } as PharmacyMedicineRequestReply)
      : null,
  };
};

export const confirmMedicineReservation = async (reservationId: string) => {
  await confirmReservationCallable({ reservationId });
};

export const cancelMedicineReservationByPharmacy = async (
  reservationId: string
) => {
  await cancelReservationCallable({ reservationId });
};

export const completeMedicineReservation = async (
  reservationId: string,
  passcode: string
) => {
  await completeReservationCallable({ reservationId, passcode });
};

export const expireMedicineReservation = async (reservationId: string) => {
  await expireReservationCallable({ reservationId });
};