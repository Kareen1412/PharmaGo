import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import type {
  PharmaQuestion,
  QuestionReply,
} from "../../../shared/types/question";

export const listenToAllActiveQuestions = (
  onData: (questions: PharmaQuestion[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, "questions"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PharmaQuestion[]
      );
    },
    onError
  );
};

export const listenToQuestionReplies = (
  questionId: string,
  onData: (replies: QuestionReply[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, "questionReplies"),
    where("questionId", "==", questionId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as QuestionReply[]
      );
    },
    onError
  );
};

export const sendPharmacyQuestionReply = async (data: {
  questionId: string;
  text: string;
  parentReplyId: string | null;
}) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const pharmacyRef = doc(db, "pharmacies", user.uid);

  return new Promise<void>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribe();

      try {
        if (!currentUser) {
          throw new Error("You must be logged in.");
        }

        const pharmacySnapshotUnsubscribe = onSnapshot(
          pharmacyRef,
          async (snapshot) => {
            pharmacySnapshotUnsubscribe();

            if (!snapshot.exists()) {
              throw new Error("Pharmacy profile not found.");
            }

            const pharmacy = snapshot.data();

            await addDoc(collection(db, "questionReplies"), {
              questionId: data.questionId,
              authorId: currentUser.uid,
              authorRole: "pharmacy",
              authorName:
                pharmacy.pharmacyNameEnglish ??
                pharmacy.pharmacyNameArabic ??
                "Pharmacy",
              pharmacyId: currentUser.uid,
              pharmacyName:
                pharmacy.pharmacyNameEnglish ??
                pharmacy.pharmacyNameArabic ??
                "Pharmacy",
              text: data.text.trim(),
              parentReplyId: data.parentReplyId,
              createdAt: Date.now(),
              updatedAt: null,
              isDeleted: false,
            });

            await updateDoc(doc(db, "questions", data.questionId), {
              replyCount: increment(1),
              updatedAt: Date.now(),
            });

            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  });
};