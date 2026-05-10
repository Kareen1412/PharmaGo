import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import type { RecentActivity } from "../../../shared/types/recentActivity";
import {
  fetchRecentActivityTarget,
  markRecentActivityAsRead,
} from "../services/recentActivityService";
import { homeStyles } from "../styles/homeStyles";

type Props = {
  activities: RecentActivity[];
  emptyFullScreen?: boolean;
};

const getActivityIcon = (
  type: RecentActivity["type"]
): keyof typeof Ionicons.glyphMap => {
  if (type === "medicine_request_reply") return "medkit-outline";
  if (type === "medicine_reservation_status") return "bookmark-outline";
  return "chatbubble-ellipses-outline";
};

export default function RecentActivityList({
  activities,
  emptyFullScreen = false,
}: Props) {
  const navigation = useNavigation<any>();

  const handleOpenActivity = async (activity: RecentActivity) => {
    try {
      await markRecentActivityAsRead(activity.id);

      const target = await fetchRecentActivityTarget(activity);

      if (activity.targetType === "medicineRequest" && target.request) {
        navigation.navigate("MedRequestDetails", {
          request: target.request,
        });
        return;
      }

      if (activity.targetType === "reservation" && target.reservation) {
        navigation.navigate("ReservationDetails", {
          reservation: target.reservation,
        });
        return;
      }

      if (activity.targetType === "question" && target.question) {
        navigation.navigate("QuestionDetails", {
          question: target.question,
        });
        return;
      }

      Alert.alert("Not found", "Could not open this activity.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not open activity.";

      Alert.alert("Error", message);
    }
  };

  if (activities.length === 0) {
    return (
      <View
        style={[
          homeStyles.activityCard,
          emptyFullScreen && homeStyles.fullEmptyActivityCard,
        ]}
      >
        <View style={homeStyles.activityIcon}>
          <Ionicons name="time-outline" size={22} color="#4e7e5d" />
        </View>

        <View style={homeStyles.activityTextBox}>
          <Text style={homeStyles.activityTitle}>No recent activity yet</Text>
          <Text style={homeStyles.activityText}>
            Your latest medicine replies and pharmacist answers will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={homeStyles.activityList}>
      {activities.map((activity) => {
        const isUnread = activity.readAt === null;

        return (
          <Pressable
            key={activity.id}
            style={({ pressed }) => [
              homeStyles.activityCard,
              pressed && homeStyles.activityCardPressed,
            ]}
            onPress={() => handleOpenActivity(activity)}
          >
            <View style={homeStyles.activityIcon}>
              <Ionicons
                name={getActivityIcon(activity.type)}
                size={22}
                color="#4e7e5d"
              />
            </View>

            <View style={homeStyles.activityTextBox}>
              <View style={homeStyles.activityTitleRow}>
                <Text style={homeStyles.activityTitle} numberOfLines={1}>
                  {activity.title}
                </Text>

                {isUnread && <View style={homeStyles.unreadDot} />}
              </View>

              <Text style={homeStyles.activityText} numberOfLines={2}>
                {activity.message}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}