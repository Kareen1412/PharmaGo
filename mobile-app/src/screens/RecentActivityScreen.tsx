import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import RecentActivityList from "../components/RecentActivityList";
import {
  clearRecentActivities,
  listenToRecentActivities,
} from "../services/recentActivityService";
import type { RecentActivity } from "../../../shared/types/recentActivity";
import { homeStyles } from "../styles/homeStyles";

export default function RecentActivityScreen() {
  const navigation = useNavigation<any>();
  const { firebaseUser } = useAuth();

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = listenToRecentActivities(
      firebaseUser.uid,
      50,
      setActivities,
      (error) => {
        console.error("Failed to listen to recent activities:", error);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  const handleClearAll = () => {
    if (!firebaseUser || activities.length === 0) return;

    Alert.alert(
      "Clear recent activity?",
      "This will remove all recent activity from this list.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear all",
          style: "destructive",
          onPress: async () => {
            try {
              setClearing(true);
              await clearRecentActivities(firebaseUser.uid);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not clear recent activity.";

              Alert.alert("Error", message);
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={homeStyles.page}>
      <View style={homeStyles.detailsTopBar}>
        <Pressable
          style={homeStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={homeStyles.detailsTitleBox}>
          <Text style={homeStyles.detailsTitle}>Recent Activity</Text>
          <Text style={homeStyles.detailsSubtitle}>
            Updates from your medicine requests and questions.
          </Text>
        </View>

        {activities.length > 0 && (
          <Pressable
            style={homeStyles.clearActivityButton}
            onPress={handleClearAll}
            disabled={clearing}
          >
            <Text style={homeStyles.clearActivityText}>
              {clearing ? "Clearing..." : "Clear"}
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={homeStyles.recentActivityContent}
        showsVerticalScrollIndicator={false}
      >
        <RecentActivityList activities={activities} emptyFullScreen />
      </ScrollView>
    </View>
  );
}