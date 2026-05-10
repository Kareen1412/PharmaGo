import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";

import type { RecentActivity } from "../../../shared/types/recentActivity";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import type { PharmaQuestion } from "../../../shared/types/question";

export const listenToRecentActivities = (
  userId: string,
  maxItems: number,
  onData: (activities: RecentActivity[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, "recentActivities"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const activities = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as RecentActivity[];

      onData(activities);
    },
    onError
  );
};

export const markRecentActivityAsRead = async (
  activityId: string
): Promise<void> => {
  await updateDoc(doc(db, "recentActivities", activityId), {
    readAt: Date.now(),
  });
};

export const fetchRecentActivityTarget = async (
  activity: RecentActivity
): Promise<{
  request?: MedicineRequest;
  reservation?: MedicineReservation;
  question?: PharmaQuestion;
}> => {
  if (activity.targetType === "medicineRequest") {
    const snap = await getDoc(doc(db, "medicineRequests", activity.targetId));

    if (!snap.exists()) {
      throw new Error("Medicine request not found.");
    }

    return {
      request: {
        id: snap.id,
        ...snap.data(),
      } as MedicineRequest,
    };
  }

  if (activity.targetType === "reservation") {
    const snap = await getDoc(doc(db, "medicineReservations", activity.targetId));

    if (!snap.exists()) {
      throw new Error("Reservation not found.");
    }

    return {
      reservation: {
        id: snap.id,
        ...snap.data(),
      } as MedicineReservation,
    };
  }

  if (activity.targetType === "question") {
    const snap = await getDoc(doc(db, "questions", activity.targetId));

    if (!snap.exists()) {
      throw new Error("Question not found.");
    }

    return {
      question: {
        id: snap.id,
        ...snap.data(),
      } as PharmaQuestion,
    };
  }

  throw new Error("Unsupported activity target.");
};

export const clearRecentActivities = async (
  userId: string
): Promise<void> => {
  const q = query(
    collection(db, "recentActivities"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  await Promise.all(
    snapshot.docs.map((item) =>
      deleteDoc(doc(db, "recentActivities", item.id))
    )
  );
};