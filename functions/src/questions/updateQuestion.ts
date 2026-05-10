import * as admin from "firebase-admin";
import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

export const updateQuestion = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const uid = request.auth.uid;
    const {
      questionId,
      text,
      imageUrls,
      imageStoragePaths,
      isAnonymous,
    } = request.data;

    const cleanedText = String(text ?? "").trim();

    if (!questionId || !cleanedText) {
      throw new HttpsError(
        "invalid-argument",
        "Question ID and text are required."
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
        "You can only edit your own questions."
      );
    }

    await questionRef.update({
      text: cleanedText,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      imageStoragePaths: Array.isArray(imageStoragePaths) ?
        imageStoragePaths :
        [],
      isAnonymous: Boolean(isAnonymous),
      updatedAt: Date.now(),
    });

    return {success: true};
  }
);
