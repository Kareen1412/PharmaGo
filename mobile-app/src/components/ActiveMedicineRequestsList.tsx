import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type Props = {
  requests: MedicineRequest[];
  onOpenRequest: (request: MedicineRequest) => void;
  onCreateRequest: () => void;
};

export default function ActiveMedicineRequestsList({
  requests,
  onOpenRequest,
  onCreateRequest,
}: Props) {
  if (requests.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="medkit-outline" size={30} color="#4e7e5d" />
        <Text style={styles.emptyTitle}>No active requests</Text>
        <Text style={styles.emptyText}>
          Create a medicine request and pharmacies will be able to reply.
        </Text>

        <Pressable style={styles.emptyActionButton} onPress={onCreateRequest}>
          <Text style={styles.emptyActionText}>Create request</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {requests.map((request) => {
        const replyCount = 0;

        return (
          <Pressable
            key={request.id}
            style={({ pressed }) => [
              styles.requestCard,
              pressed && styles.requestCardPressed,
            ]}
            onPress={() => onOpenRequest(request)}
          >
            <View style={styles.requestTopRow}>
              <View style={styles.requestIcon}>
                <Ionicons name="medkit-outline" size={22} color="#4e7e5d" />
              </View>

              <View style={styles.requestMain}>
                <Text style={styles.medicineName} numberOfLines={1}>
                  {request.medicineName}
                </Text>

                <Text style={styles.replyText}>
                  {replyCount} replied pharmacies
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#66736a" />
            </View>

            <View style={styles.badgeRow}>
              {request.urgency === "urgent" && (
                <View style={styles.urgentBadge}>
                  <Ionicons name="alert-circle" size={14} color="#9f2a20" />
                  <Text style={styles.urgentBadgeText}>Urgent</Text>
                </View>
              )}

              {request.allowSubstitutes && (
                <View style={styles.softBadge}>
                  <Text style={styles.softBadgeText}>Substitutes allowed</Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}