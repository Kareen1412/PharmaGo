export type RecentActivityType =
  | "medicine_request_reply"
  | "medicine_reservation_status"
  | "question_reply";

export type RecentActivityTargetType =
  | "medicineRequest"
  | "reservation"
  | "question";

export type RecentActivity = {
  id: string;

  userId: string;

  type: RecentActivityType;

  title: string;
  message: string;

  targetType: RecentActivityTargetType;
  targetId: string;

  readAt: number | null;
  createdAt: number;
};