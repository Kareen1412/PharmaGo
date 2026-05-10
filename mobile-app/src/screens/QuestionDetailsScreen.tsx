import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import {
  deleteQuestion,
  listenToQuestionReplies,
  sendQuestionReply,
  updateQuestion,
} from "../services/questionService";
import type {
  PharmaQuestion,
  QuestionReply,
} from "../../../shared/types/question";
import { questionStyles as styles } from "../styles/questionsStyles";

type RouteParams = {
  question: PharmaQuestion;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function QuestionDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { question } = route.params as RouteParams;
  const { appUser, firebaseUser } = useAuth();

  const keyboardLift = useRef(new Animated.Value(0)).current;

  const [currentQuestion, setCurrentQuestion] = useState(question);
  const [isEditing, setIsEditing] = useState(false);

  const [text, setText] = useState(question.text);
  const [isAnonymous, setIsAnonymous] = useState(question.isAnonymous);
  const [saving, setSaving] = useState(false);

  const [replies, setReplies] = useState<QuestionReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<QuestionReply | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(keyboardLift, {
        toValue: -180,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardLift, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardLift]);

  useEffect(() => {
    const unsubscribe = listenToQuestionReplies(
      question.id,
      (items) => {
        setReplies(items.filter((reply) => !reply.isDeleted));
        setLoadingReplies(false);
      },
      (error) => {
        console.error("Failed to load question replies:", error);
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

  const handleCancelEdit = () => {
    setText(currentQuestion.text);
    setIsAnonymous(currentQuestion.isAnonymous);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const cleanedText = text.trim();

    if (!cleanedText) {
      Alert.alert("Missing question", "Question text cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      await updateQuestion(currentQuestion.id, {
        text: cleanedText,
        isAnonymous,
        imageUrls: currentQuestion.imageUrls,
        imageStoragePaths: currentQuestion.imageStoragePaths,
      });

      setCurrentQuestion({
        ...currentQuestion,
        text: cleanedText,
        isAnonymous,
        updatedAt: Date.now(),
      });

      setIsEditing(false);
      Alert.alert("Saved", "Your question was updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update question.";

      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete question?",
      "This will remove the question from your active questions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuestion(currentQuestion.id);
              navigation.goBack();
            } catch {
              Alert.alert("Error", "Could not delete question.");
            }
          },
        },
      ]
    );
  };

  const handleSendReply = async () => {
    const cleanedText = replyText.trim();

    if (!cleanedText || !firebaseUser || !appUser) return;

    try {
      setSendingReply(true);

      await sendQuestionReply({
        questionId: currentQuestion.id,
        authorId: firebaseUser.uid,
        authorRole: "user",
        authorName: currentQuestion.isAnonymous
          ? "Anonymous User"
          : appUser.name ?? "User",
        pharmacyId: null,
        pharmacyName: null,
        text: cleanedText,
        parentReplyId: replyingTo?.id ?? null,
        createdAt: Date.now(),
        updatedAt: null,
        isDeleted: false,
      });

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send reply.";

      Alert.alert("Error", message);
    } finally {
      setSendingReply(false);
    }
  };

  const renderReply = (reply: QuestionReply, nested = false) => {
    const childReplies = repliesByParent[reply.id] ?? [];
    const parentReply = reply.parentReplyId
      ? repliesById[reply.parentReplyId]
      : null;

    return (
      <View key={reply.id}>
        <View
          style={[
            styles.commentRow,
            nested && styles.nestedCommentRow,
          ]}
        >
          <View style={styles.avatar}>
            <Ionicons
              name={
                reply.authorRole === "pharmacy"
                  ? "medical-outline"
                  : "person-outline"
              }
              size={17}
              color="#4e7e5d"
            />
          </View>

          <View style={styles.commentBubble}>
            <View style={styles.commentAuthorRow}>
              <Text style={styles.commentAuthor}>{reply.authorName}</Text>

              {parentReply && (
                <Text style={styles.replyingToName}>
                  → {parentReply.authorName}
                </Text>
              )}
            </View>

            <Text style={styles.commentText}>{reply.text}</Text>

            <View style={styles.commentMetaRow}>
              <Text style={styles.commentMeta}>
                {formatDate(reply.createdAt)}
              </Text>

              <View style={styles.replyMetaSpacer} />

              <Pressable onPress={() => setReplyingTo(reply)}>
                <Text style={styles.commentMeta}>Reply</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {childReplies.map((child) => renderReply(child, true))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.page,
        {
          transform: [{ translateY: keyboardLift }],
        },
      ]}
    >
      <View style={styles.detailsTopBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={styles.detailsTitleBox}>
          <Text style={styles.title}>Question Details</Text>
          <Text style={styles.subtitle}>View replies from pharmacies.</Text>
        </View>

        {!isEditing && (
          <View style={styles.topActionsRow}>
            <Pressable
              style={styles.topEditButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={18} color="#4e7e5d" />
            </Pressable>

            <Pressable style={styles.topDeleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#9f2a20" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing && (
          <View style={styles.compactEditActionsRow}>
            <Pressable
              style={styles.compactCancelButton}
              onPress={handleCancelEdit}
              disabled={saving}
            >
              <Text style={styles.compactCancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.compactSaveButton,
                saving && styles.submitButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.compactSaveText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.card}>
          {currentQuestion.imageUrls.map((imageUrl) => (
            <Image
              key={imageUrl}
              source={{ uri: imageUrl }}
              style={styles.detailImage}
            />
          ))}

          <Text style={styles.detailLabel}>Question</Text>

          {isEditing ? (
            <TextInput
              value={text}
              onChangeText={setText}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              placeholder="Type your question..."
              placeholderTextColor="#8a968d"
            />
          ) : (
            <Text style={styles.detailValue}>{currentQuestion.text}</Text>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Replies</Text>
              <Text style={styles.infoValue}>
                {(currentQuestion.replyCount ?? 0) === 1
                  ? "1 reply"
                  : `${currentQuestion.replyCount ?? 0} replies`}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {formatDate(currentQuestion.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextBox}>
                <Text style={styles.switchTitle}>Post anonymously</Text>
                <Text style={styles.switchSubtitle}>
                  Pharmacies will see this as Anonymous User.
                </Text>
              </View>

              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                thumbColor={isAnonymous ? "#4e7e5d" : "#f4f4f4"}
                trackColor={{ false: "#d9e4dc", true: "#b9d3c1" }}
              />
            </View>
          </View>
        )}

        <View style={styles.repliesPlainSection}>
          <Text style={styles.repliesTitle}>Replies</Text>
          <Text style={styles.repliesHint}>
            Continue the conversation with pharmacies.
          </Text>

          {loadingReplies ? (
            <Text style={styles.detailValueMuted}>Loading replies...</Text>
          ) : replies.length === 0 ? (
            <Text style={[styles.detailValueMuted, { marginTop: 12 }]}>
              No replies yet.
            </Text>
          ) : (
            <View style={styles.commentsList}>
              {topLevelReplies.map((reply) => renderReply(reply))}
            </View>
          )}

          {replyingTo && (
            <View style={styles.replyingToBox}>
              <Text style={styles.replyingToText}>
                Replying to {replyingTo.authorName}
              </Text>

              <Pressable onPress={() => setReplyingTo(null)}>
                <Text style={styles.cancelReplyText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.replyInputBox}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              style={styles.replyInput}
              placeholder="Write a reply..."
              placeholderTextColor="#8a968d"
              multiline
            />

            <Pressable
              style={[
                styles.sendButton,
                sendingReply && styles.submitButtonDisabled,
              ]}
              onPress={handleSendReply}
              disabled={sendingReply}
            >
              <Ionicons name="send" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}