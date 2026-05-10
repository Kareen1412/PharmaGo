import { useEffect, useMemo, useState } from "react";
import { Send, MessageCircle, User, Building2 } from "lucide-react";
import type {
  PharmaQuestion,
  QuestionReply,
} from "../../../shared/types/question";
import {
  listenToQuestionReplies,
  sendPharmacyQuestionReply,
} from "../services/pharmacyQuestionService";
import styles from "../styles/pharmacy-questions.module.css";

type Props = {
  question: PharmaQuestion;
  onClose: () => void;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function QuestionDetailsModal({ question, onClose }: Props) {
  const [replies, setReplies] = useState<QuestionReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<QuestionReply | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToQuestionReplies(
      question.id,
      (items) => {
        setReplies(items.filter((reply) => !reply.isDeleted));
        setLoadingReplies(false);
      },
      (error) => {
        console.error("Failed to load replies:", error);
        setLoadingReplies(false);
      }
    );

    return unsubscribe;
  }, [question.id]);

  const topLevelReplies = useMemo(() => {
    return replies.filter((reply) => reply.parentReplyId === null);
  }, [replies]);

  const repliesByParent = useMemo(() => {
    const grouped: Record<string, QuestionReply[]> = {};

    replies.forEach((reply) => {
      if (!reply.parentReplyId) return;

      if (!grouped[reply.parentReplyId]) {
        grouped[reply.parentReplyId] = [];
      }

      grouped[reply.parentReplyId].push(reply);
    });

    return grouped;
  }, [replies]);

  const repliesById = useMemo(() => {
    const map: Record<string, QuestionReply> = {};

    replies.forEach((reply) => {
      map[reply.id] = reply;
    });

    return map;
  }, [replies]);

  const handleSendReply = async () => {
    const cleanedText = replyText.trim();

    if (!cleanedText) return;

    try {
      setSending(true);

      await sendPharmacyQuestionReply({
        questionId: question.id,
        text: cleanedText,
        parentReplyId: replyingTo?.id ?? null,
      });

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send reply.";

      alert(message);
    } finally {
      setSending(false);
    }
  };

  const renderReply = (reply: QuestionReply, nested = false) => {
    const childReplies = repliesByParent[reply.id] ?? [];
    const parentReply = reply.parentReplyId
      ? repliesById[reply.parentReplyId]
      : null;

    return (
      <div key={reply.id}>
        <div
          className={`${styles.commentRow} ${
            nested ? styles.nestedCommentRow : ""
          }`}
        >
          <div className={styles.avatar}>
            {reply.authorRole === "pharmacy" ? (
              <Building2 size={16} />
            ) : (
              <User size={16} />
            )}
          </div>

          <div className={styles.commentBubble}>
            <div className={styles.commentTopRow}>
              <strong>{reply.authorName}</strong>

              {parentReply && (
                <span className={styles.replyingToName}>
                  → {parentReply.authorName}
                </span>
              )}
            </div>

            <p>{reply.text}</p>

            <div className={styles.commentMetaRow}>
              <span>{formatDate(reply.createdAt)}</span>

              <div className={styles.replyMetaSpacer} />

              <button
                type="button"
                onClick={() => setReplyingTo(reply)}
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        {childReplies.map((child) => renderReply(child, true))}
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2>Question Details</h2>
            <p>Answer the patient or reply to another pharmacy.</p>
          </div>

          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <section className={styles.postCard}>
          <div className={styles.postHeader}>
            <div className={styles.avatarLarge}>
              <MessageCircle size={20} />
            </div>

            <div>
              <h3>
                {question.isAnonymous
                  ? "Anonymous User"
                  : question.userName ?? "User"}
              </h3>
              <span>{formatDate(question.createdAt)}</span>
            </div>
          </div>

          <p className={styles.postText}>{question.text}</p>

          {question.imageUrls.length > 0 && (
            <div className={styles.imageGrid}>
              {question.imageUrls.map((imageUrl) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt="Question attachment"
                  className={styles.questionImage}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.commentsSection}>
          <h3>Replies</h3>

          {loadingReplies ? (
            <p className={styles.mutedText}>Loading replies...</p>
          ) : replies.length === 0 ? (
            <p className={styles.mutedText}>
              No replies yet. Be the first pharmacy to answer.
            </p>
          ) : (
            <div className={styles.commentsList}>
              {topLevelReplies.map((reply) => renderReply(reply))}
            </div>
          )}
        </section>

        {replyingTo && (
          <div className={styles.replyingToBox}>
            <span>Replying to {replyingTo.authorName}</span>

            <button type="button" onClick={() => setReplyingTo(null)}>
              Cancel
            </button>
          </div>
        )}

        <div className={styles.replyInputBox}>
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Write an answer..."
          />

          <button
            type="button"
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
          >
            <Send size={17} />
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}