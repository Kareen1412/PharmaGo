export type QuestionStatus = "active" | "deleted";
export type QuestionReplyAuthorRole = "user" | "pharmacy";

export type PharmaQuestion = {
  id: string;
  userId: string;
  userName: string | null;
  userProfileImageUrl: string | null;
  text: string;
  imageUrls: string[];
  imageStoragePaths: string[];
  isAnonymous: boolean;
  status: QuestionStatus;
  replyCount: number;
  createdAt: number;
  updatedAt: number | null;
};

export type QuestionReply = {
  id: string;
  questionId: string;
  authorId: string;
  authorRole: QuestionReplyAuthorRole;
  authorName: string;
  pharmacyId: string | null;
  pharmacyName: string | null;
  text: string;
  parentReplyId: string | null;
  createdAt: number;
  updatedAt: number | null;
  isDeleted: boolean;
};