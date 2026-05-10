import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type Props = {
  reservations: MedicineReservation[];
  onOpenReservation: (reservation: MedicineReservation) => void;
  onCreateRequest: () => void;
};

const getDurationText = (days: 1 | 3 | 7) => {
  if (days === 7) return "1 week";
  return `${days} day${days > 1 ? "s" : ""}`;
};

const getTimeLeft = (expiresAt: number | null) => {
  if (!expiresAt) return "Timer starts after confirmation";

  const diff = expiresAt - Date.now();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} left`;

  return `${hours} hour${hours !== 1 ? "s" : ""} left`;
};

export default function ReservedMedicineRequestsList({
  reservations,
  onOpenReservation,
  onCreateRequest,
}: Props) {
  if (reservations.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="bookmark-outline" size={30} color="#4e7e5d" />
        <Text style={styles.emptyTitle}>No reserved requests</Text>
        <Text style={styles.emptyText}>
          When you reserve medicine from a pharmacy, it will appear here.
        </Text>

        <Pressable style={styles.emptyActionButton} onPress={onCreateRequest}>
          <Text style={styles.emptyActionText}>Create request</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {reservations.map((reservation) => {
        const isConfirmed = reservation.status === "confirmed";

        return (
          <Pressable
            key={reservation.id}
            style={({ pressed }) => [
              styles.requestCard,
              pressed && styles.requestCardPressed,
            ]}
            onPress={() => onOpenReservation(reservation)}
          >
            <View style={styles.requestTopRow}>
              <View style={styles.requestIcon}>
                <Ionicons
                  name={isConfirmed ? "checkmark-circle-outline" : "bookmark-outline"}
                  size={22}
                  color="#4e7e5d"
                />
              </View>

              <View style={styles.requestMain}>
                <Text style={styles.medicineName} numberOfLines={1}>
                  {reservation.medicineName}
                </Text>

                <Text style={styles.replyText}>
                  {isConfirmed
                    ? getTimeLeft(reservation.expiresAt)
                    : "Waiting for pharmacy confirmation"}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#66736a" />
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.softBadge}>
                <Text style={styles.softBadgeText}>
                  {isConfirmed ? "Confirmed" : "Pending"}
                </Text>
              </View>

              <View style={styles.softBadge}>
                <Text style={styles.softBadgeText}>
                  {getDurationText(reservation.reservationDurationDays)}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}