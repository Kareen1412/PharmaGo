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
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import type { PharmaQuestion, QuestionReply } from "../../../shared/types/question";

const createQuestionCallable = httpsCallable(functions, "createQuestion");
const updateQuestionCallable = httpsCallable(functions, "updateQuestion");
const deleteQuestionCallable = httpsCallable(functions, "deleteQuestion");

export const createQuestion = async (data: {
  text: string;
  imageUrls: string[];
  imageStoragePaths: string[];
  isAnonymous: boolean;
}) => {
  const result = await createQuestionCallable(data);
  return result.data as { questionId: string };
};

export const updateQuestion = async (
  questionId: string,
  data: {
    text: string;
    imageUrls: string[];
    imageStoragePaths: string[];
    isAnonymous: boolean;
  }
) => {
  await updateQuestionCallable({ questionId, ...data });
};

export const deleteQuestion = async (questionId: string) => {
  await deleteQuestionCallable({ questionId });
};

export const listenToMyQuestions = (
  userId: string,
  onData: (questions: PharmaQuestion[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, "questions"),
    where("userId", "==", userId),
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

export const sendQuestionReply = async (data: Omit<QuestionReply, "id">) => {
  await addDoc(collection(db, "questionReplies"), data);
  await updateDoc(doc(db, "questions", data.questionId), {
    replyCount: increment(1),
    updatedAt: Date.now(),
  });
};