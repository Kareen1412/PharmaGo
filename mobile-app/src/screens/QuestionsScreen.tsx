import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavbar from "../components/BottomNavbar";
import { useAuth } from "../contexts/AuthContext";
import { listenToMyQuestions } from "../services/questionService";
import type { PharmaQuestion } from "../../../shared/types/question";
import { questionStyles as styles } from "../styles/questionsStyles";

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function QuestionsScreen() {
  const navigation = useNavigation<any>();
  const { firebaseUser } = useAuth();

  const [questions, setQuestions] = useState<PharmaQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = listenToMyQuestions(
      firebaseUser.uid,
      (items) => {
        setQuestions(items);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load questions:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  const renderQuestion = (question: PharmaQuestion) => {
    return (
      <Pressable
        key={question.id}
        style={({ pressed }) => [
          styles.questionCard,
          pressed && styles.questionCardPressed,
        ]}
        onPress={() => navigation.navigate("QuestionDetails", { question })}
      >
        <View style={styles.questionTopRow}>
          <View style={styles.questionIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#4e7e5d"
            />
          </View>

          <View style={styles.questionMain}>
            <Text style={styles.questionText} numberOfLines={2}>
              {question.text}
            </Text>

            <Text style={styles.replyText}>
              {(question.replyCount ?? 0) === 1
                ? "1 reply"
                : `${question.replyCount ?? 0} replies`}{" "}
              • {formatDate(question.createdAt)}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#66736a" />
        </View>

        <View style={styles.badgeRow}>
          {question.isAnonymous && (
            <View style={styles.softBadge}>
              <Text style={styles.softBadgeText}>Anonymous</Text>
            </View>
          )}

          {question.imageUrls.length > 0 && (
            <View style={styles.softBadge}>
              <Text style={styles.softBadgeText}>
                {question.imageUrls.length} image
                {question.imageUrls.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextBox}>
            <Text style={styles.title}>My Questions</Text>
            <Text style={styles.subtitle}>
              View pharmacist replies and continue the conversation.
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => navigation.navigate("AskQuestion")}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading questions...</Text>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={30}
              color="#4e7e5d"
            />
            <Text style={styles.emptyTitle}>No questions yet</Text>
            <Text style={styles.emptyText}>
              Ask a pharmacist and replies will appear here.
            </Text>

            <Pressable
              style={styles.emptyActionButton}
              onPress={() => navigation.navigate("AskQuestion")}
            >
              <Text style={styles.emptyActionText}>Ask a question</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>{questions.map(renderQuestion)}</View>
        )}
      </ScrollView>

      <BottomNavbar />
    </View>
  );
}