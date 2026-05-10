import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {createRecentActivity} from "../utils/createRecentActivity";

export const onQuestionReplyCreated = onDocumentCreated(
  {
    region: "europe-west1",
    document: "questionReplies/{replyId}",
  },
  async (event) => {
    const reply = event.data?.data();

    if (!reply) return;

    if (reply.authorRole !== "pharmacy") return;

    const questionId =
      typeof reply.questionId === "string" ? reply.questionId : "";

    if (!questionId) return;

    const db = admin.firestore();

    const questionSnap = await db
      .collection("questions")
      .doc(questionId)
      .get();

    if (!questionSnap.exists) return;

    const question = questionSnap.data();

    if (!question) return;

    const userId =
      typeof question.userId === "string" ? question.userId : "";

    if (!userId) return;

    const pharmacyName =
      typeof reply.pharmacyName === "string" && reply.pharmacyName.trim() ?
        reply.pharmacyName.trim() :
        "A pharmacy";

    await createRecentActivity({
      userId,
      type: "question_reply",
      title: "New pharmacist answer",
      message: `${pharmacyName} replied to your question.`,
      targetType: "question",
      targetId: questionId,
    });
  }
);
