import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import {
  expireMedicineReservation,
} from "../services/medicineRequestService";
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

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;

  return `${seconds}s left`;
};

export default function ReservedMedicineRequestsList({
  reservations,
  onOpenReservation,
  onCreateRequest,
}: Props) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    reservations.forEach((reservation) => {
      if (
        reservation.status === "confirmed" &&
        reservation.expiresAt &&
        Date.now() >= reservation.expiresAt
      ) {
        expireMedicineReservation(reservation.id).catch((error) =>
          console.error("Failed to expire reservation:", error)
        );
      }
    });
  }, [reservations]);

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
        const isExpired = reservation.status === "expired";

        return (
          <Pressable
            key={reservation.id}
            style={({ pressed }) => [
              styles.requestCard,
              isExpired && styles.expiredRequestCard,
              pressed && styles.requestCardPressed,
            ]}
            onPress={() => onOpenReservation(reservation)}
          >
            <View style={styles.requestTopRow}>
              <View style={styles.requestIcon}>
                <Ionicons
                  name={
                    isExpired
                      ? "alert-circle-outline"
                      : isConfirmed
                      ? "checkmark-circle-outline"
                      : "bookmark-outline"
                  }
                  size={22}
                  color={isExpired ? "#9f2a20" : "#4e7e5d"}
                />
              </View>

              <View style={styles.requestMain}>
                <Text style={styles.medicineName} numberOfLines={1}>
                  {reservation.medicineName}
                </Text>

                <Text style={styles.replyText}>
                  {isExpired
                    ? "Reservation expired"
                    : isConfirmed
                    ? getTimeLeft(reservation.expiresAt)
                    : "Waiting for pharmacy confirmation"}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#66736a" />
            </View>

            <View style={styles.badgeRow}>
              <View style={isExpired ? styles.expiredBadge : styles.softBadge}>
                <Text
                  style={
                    isExpired ? styles.expiredBadgeText : styles.softBadgeText
                  }
                >
                  {isExpired ? "Expired" : isConfirmed ? "Confirmed" : "Pending"}
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