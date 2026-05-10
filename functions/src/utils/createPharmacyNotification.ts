import * as admin from "firebase-admin";

type CreatePharmacyNotificationInput = {
  pharmacyId: string;
  type:
    | "reservation_created"
    | "reservation_renewed"
    | "reservation_cancelled"
    | "question_reply";
  title: string;
  message: string;
  targetType: "reservation" | "request" | "question";
  targetId: string;
};

export const createPharmacyNotification = async (
  input: CreatePharmacyNotificationInput
) => {
  await admin.firestore().collection("pharmacyNotifications").add({
    pharmacyId: input.pharmacyId,
    type: input.type,
    title: input.title,
    message: input.message,
    targetType: input.targetType,
    targetId: input.targetId,
    readAt: null,
    createdAt: Date.now(),
  });
};
