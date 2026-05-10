import * as admin from "firebase-admin";
import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

export const createQuestion = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const uid = request.auth.uid;
    const {
      text,
      imageUrls,
      imageStoragePaths,
      isAnonymous,
    } = request.data;

    const cleanedText = String(text ?? "").trim();

    if (!cleanedText) {
      throw new HttpsError(
        "invalid-argument",
        "Question text is required."
      );
    }

    const userSnap = await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!userSnap.exists) {
      throw new HttpsError(
        "permission-denied",
        "Only users can ask questions."
      );
    }

    const user = userSnap.data();

    const docRef = admin.firestore().collection("questions").doc();
    const now = Date.now();

    await docRef.set({
      userId: uid,
      userName: user?.name ?? "User",
      userProfileImageUrl: user?.profileImageUrl ?? null,
      text: cleanedText,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      imageStoragePaths: Array.isArray(imageStoragePaths) ?
        imageStoragePaths :
        [],
      isAnonymous: Boolean(isAnonymous),
      status: "active",
      replyCount: 0,
      createdAt: now,
      updatedAt: null,
    });

    return {questionId: docRef.id};
  }
);
