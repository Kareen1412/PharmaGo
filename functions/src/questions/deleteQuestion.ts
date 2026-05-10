import * as admin from "firebase-admin";
import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

export const deleteQuestion = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const uid = request.auth.uid;
    const {questionId} = request.data;

    if (!questionId) {
      throw new HttpsError(
        "invalid-argument",
        "Question ID is required."
      );
    }

    const questionRef = admin
      .firestore()
      .collection("questions")
      .doc(questionId);

    const questionSnap = await questionRef.get();

    if (!questionSnap.exists) {
      throw new HttpsError("not-found", "Question not found.");
    }

    const question = questionSnap.data();

    if (question?.userId !== uid) {
      throw new HttpsError(
        "permission-denied",
        "You can only delete your own questions."
      );
    }

    await questionRef.update({
      status: "deleted",
      updatedAt: Date.now(),
    });

    return {success: true};
  }
);
