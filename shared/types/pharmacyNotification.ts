export type PharmacyNotificationType =
  | "reservation_created"
  | "reservation_renewed"
  | "reservation_cancelled"
  | "question_reply";

export type PharmacyNotificationTargetType =
  | "reservation"
  | "request"
  | "question";

export type PharmacyNotification = {
  id: string;

  pharmacyId: string;

  type: PharmacyNotificationType;

  title: string;
  message: string;

  targetType: PharmacyNotificationTargetType;
  targetId: string;

  readAt: number | null;
  createdAt: number;
};