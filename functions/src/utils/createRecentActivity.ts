import * as admin from "firebase-admin";

type CreateRecentActivityInput = {
  userId: string;
  type:
    | "medicine_request_reply"
    | "medicine_reservation_status"
    | "question_reply";
  title: string;
  message: string;
  targetType: "medicineRequest" | "reservation" | "question";
  targetId: string;
};

export const createRecentActivity = async (
  input: CreateRecentActivityInput
) => {
  const db = admin.firestore();
  const now = Date.now();

  await db.collection("recentActivities").add({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    targetType: input.targetType,
    targetId: input.targetId,
    readAt: null,
    createdAt: now,
  });
};
