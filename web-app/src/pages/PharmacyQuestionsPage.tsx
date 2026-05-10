import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import QuestionDetailsModal from "../components/QuestionDetailsModal";
import { listenToAllActiveQuestions } from "../services/pharmacyQuestionService";
import type { PharmaQuestion } from "../../../shared/types/question";
import styles from "../styles/pharmacy-questions.module.css";

type QuestionsRouteState = {
  openQuestionId?: string;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PharmacyQuestionsPage() {
  const location = useLocation();
  const state = location.state as QuestionsRouteState | null;

  const [questions, setQuestions] = useState<PharmaQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<PharmaQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  const openedQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToAllActiveQuestions(
      (items) => {
        setQuestions(items);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to listen to questions:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const openQuestionId = state?.openQuestionId;

    if (!openQuestionId) return;
    if (openedQuestionIdRef.current === openQuestionId) return;

    const targetQuestion = questions.find(
      (question) => question.id === openQuestionId
    );

    if (!targetQuestion) return;

    openedQuestionIdRef.current = openQuestionId;
    setSelectedQuestion(targetQuestion);
  }, [state?.openQuestionId, questions]);

  const renderQuestionCard = (question: PharmaQuestion) => {
    return (
      <button
        key={question.id}
        className={styles.questionCard}
        onClick={() => setSelectedQuestion(question)}
      >
        <div className={styles.cardMain}>
          <div className={styles.iconBox}>
            <MessageCircle size={22} />
          </div>

          <div className={styles.questionInfo}>
            <h3>{question.isAnonymous ? "Anonymous User" : question.userName}</h3>

            <p>{question.text}</p>

            <div className={styles.metaRow}>
              <span>
                {(question.replyCount ?? 0) === 1
                  ? "1 reply"
                  : `${question.replyCount ?? 0} replies`}
              </span>

              <span>{formatDate(question.createdAt)}</span>

              {question.imageUrls.length > 0 && (
                <span>
                  {question.imageUrls.length} image
                  {question.imageUrls.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <section className={styles.header}>
          <div>
            <h1>Questions</h1>
            <p>View patient questions and answer them directly in real time.</p>
          </div>
        </section>

        {loading ? (
          <div className={styles.centerCard}>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <MessageCircle size={25} />
            </div>
            <h3>No questions yet</h3>
            <p>Patient questions will appear here.</p>
          </div>
        ) : (
          <div className={styles.questionGrid}>
            {questions.map(renderQuestionCard)}
          </div>
        )}

        {selectedQuestion && (
          <QuestionDetailsModal
            question={selectedQuestion}
            onClose={() => setSelectedQuestion(null)}
          />
        )}
      </main>
    </div>
  );
}