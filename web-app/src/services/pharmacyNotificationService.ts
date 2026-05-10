import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { PharmacyNotification } from
  "../../../shared/types/pharmacyNotification";

export const listenToPharmacyNotifications = (
  onData: (items: PharmacyNotification[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const pharmacyId = auth.currentUser?.uid;

  if (!pharmacyId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, "pharmacyNotifications"),
    where("pharmacyId", "==", pharmacyId),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as PharmacyNotification[];

      onData(items);
    },
    onError
  );
};

export const markPharmacyNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  await updateDoc(doc(db, "pharmacyNotifications", notificationId), {
    readAt: Date.now(),
  });
};