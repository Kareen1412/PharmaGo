import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import type {AppUser} from "../types/appUser";

export const createUserProfile = onCall(
  {region: "europe-west1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email ?? "";
    const now = Date.now();

    const name = request.data?.name;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new HttpsError("invalid-argument", "Name is required.");
    }

    const db = admin.firestore();

    const accountRef = db.collection("accounts").doc(uid);
    const userRef = db.collection("users").doc(uid);

    const accountSnap = await accountRef.get();
    const userSnap = await userRef.get();

    if (accountSnap.exists || userSnap.exists) {
      throw new HttpsError("already-exists", "User profile already exists.");
    }

    await db.runTransaction(async (transaction) => {
      transaction.set(accountRef, {
        authUserId: uid,
        role: "user",
      });

      const userData: AppUser = {
        id: uid,
        role: "user",

        name: name.trim(),
        email,
        profileImageUrl: null,

        address: null,

        createdAt: now,
        updatedAt: null,
        lastLogin: now,

        isBlocked: false,
      };

      transaction.set(userRef, userData);
    });

    return {success: true};
  }
);
