import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {createPharmacyNotification} from
  "../utils/createPharmacyNotification";

export const onUserReplyToPharmacyAnswer = onDocumentCreated(
  {
    region: "europe-west1",
    document: "questionReplies/{replyId}",
  },
  async (event) => {
    const reply = event.data?.data();

    if (!reply) return;
    if (reply.authorRole !== "user") return;

    const parentReplyId =
      typeof reply.parentReplyId === "string" ? reply.parentReplyId : "";

    if (!parentReplyId) return;

    const db = admin.firestore();

    const parentReplySnap = await db
      .collection("questionReplies")
      .doc(parentReplyId)
      .get();

    if (!parentReplySnap.exists) return;

    const parentReply = parentReplySnap.data();

    if (!parentReply) return;
    if (parentReply.authorRole !== "pharmacy") return;

    const pharmacyId =
      typeof parentReply.pharmacyId === "string" ?
        parentReply.pharmacyId :
        "";

    const questionId =
      typeof reply.questionId === "string" ? reply.questionId : "";

    if (!pharmacyId || !questionId) return;

    await createPharmacyNotification({
      pharmacyId,
      type: "question_reply",
      title: "New reply to your answer",
      message: "Someone replied to your answer on a patient question.",
      targetType: "question",
      targetId: questionId,
    });
  }
);
