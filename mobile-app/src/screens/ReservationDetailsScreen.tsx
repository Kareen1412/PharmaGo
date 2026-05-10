import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import ReserveMedicineModal from "../components/reservedMedicineModal";
import {
  cancelMedicineReservation,
  expireMedicineReservation,
  listenToMedicineRequestById,
  listenToMedicineRequestReplyById,
  listenToMedicineReservationById,
} from "../services/medicineRequestService";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type RouteParams = {
  reservation: MedicineReservation;
};

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return "On hold";

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (timestamp: number | null) => {
  if (!timestamp) return "On hold";

  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number | null, currencyCode?: string) => {
  if (price === null) return "Not specified";
  return `${price.toLocaleString()}${currencyCode ? ` ${currencyCode}` : ""}`;
};

const getDurationText = (days: 1 | 3 | 7) => {
  if (days === 7) return "1 week";
  return `${days} day${days > 1 ? "s" : ""}`;
};

const getTimeLeft = (expiresAt: number | null) => {
  if (!expiresAt) return "Timer starts after pharmacy confirmation.";

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

export default function ReservationDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { reservation } = route.params as RouteParams;

  const [currentReservation, setCurrentReservation] =
    useState<MedicineReservation>(reservation);

  const [requestDetails, setRequestDetails] = useState<MedicineRequest | null>(
    null
  );
  const [replyDetails, setReplyDetails] =
    useState<PharmacyMedicineRequestReply | null>(null);

  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribeReservation = listenToMedicineReservationById(
      reservation.id,
      (item) => {
        if (!item) {
          navigation.goBack();
          return;
        }

        setCurrentReservation(item);
      },
      (error) => console.error("Failed to listen to reservation:", error)
    );

    const unsubscribeRequest = listenToMedicineRequestById(
      reservation.requestId,
      (item) => setRequestDetails(item),
      (error) => console.error("Failed to listen to reserved request:", error)
    );

    const unsubscribeReply = listenToMedicineRequestReplyById(
      reservation.replyId,
      (item) => setReplyDetails(item),
      (error) => console.error("Failed to listen to reservation reply:", error)
    );

    return () => {
      unsubscribeReservation();
      unsubscribeRequest();
      unsubscribeReply();
    };
  }, [navigation, reservation.id, reservation.requestId, reservation.replyId]);

  useEffect(() => {
    if (
      currentReservation.status === "confirmed" &&
      currentReservation.expiresAt &&
      Date.now() >= currentReservation.expiresAt
    ) {
      expireMedicineReservation(currentReservation.id).catch((error) =>
        console.error("Failed to expire reservation:", error)
      );
    }
  }, [currentReservation]);

  const handleDeleteOrCancel = () => {
    const isExpired = currentReservation.status === "expired";

    Alert.alert(
      isExpired ? "Delete expired reservation?" : "Cancel reservation?",
      isExpired
        ? "This will remove the expired reservation and make your request active again."
        : "This will cancel your reservation and make the request active again.",
      [
        {
          text: isExpired ? "Keep reservation" : "Keep reservation",
          style: "cancel",
        },
        {
          text: isExpired ? "Delete reservation" : "Cancel reservation",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelMedicineReservation(currentReservation.id);

              Alert.alert(
                isExpired ? "Deleted" : "Cancelled",
                isExpired
                  ? "The expired reservation was deleted and your request is active again."
                  : "Your reservation was cancelled."
              );

              navigation.goBack();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : isExpired
                  ? "Could not delete reservation."
                  : "Could not cancel reservation.";

              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  const isSubstitute = replyDetails?.isSubstitute === true;
  const isConfirmed = currentReservation.status === "confirmed";
  const isExpired = currentReservation.status === "expired";
  const isCompleted = currentReservation.status === "completed";

  return (
    <View style={styles.page}>
      <View style={styles.detailsTopBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={styles.detailsTitleBox}>
          <Text style={styles.title}>Reservation Details</Text>
          <Text style={styles.subtitle}>
            {isExpired
              ? "This reservation expired."
              : isConfirmed
              ? "Your reservation is confirmed."
              : "View your pending reservation."}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.statusHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Reserved medicine</Text>
              <Text style={styles.detailValue}>
                {currentReservation.medicineName}
              </Text>
            </View>

            {isExpired && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Expired</Text>
              </View>
            )}
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{currentReservation.status}</Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>
                {currentReservation.reservedQuantity ?? "Not specified"}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Requested duration</Text>
              <Text style={styles.infoValue}>
                {getDurationText(currentReservation.reservationDurationDays)}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {formatDate(currentReservation.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>Original request</Text>
          <Text style={styles.detailValue}>
            {requestDetails?.medicineName ?? currentReservation.medicineName}
          </Text>

          <Text style={styles.detailLabel}>Request notes</Text>
          <Text style={styles.detailValueMuted}>
            {requestDetails?.notes || "No notes added."}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Urgency</Text>
              <Text style={styles.infoValue}>
                {requestDetails?.urgency ?? "normal"}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Substitutes</Text>
              <Text style={styles.infoValue}>
                {requestDetails?.allowSubstitutes ? "Allowed" : "Not allowed"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>Pharmacy reply</Text>
          <Text style={styles.detailValue}>
            {replyDetails?.pharmacyName ?? "Pharmacy"}
          </Text>

          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>
            {formatPrice(
              currentReservation.priceAtReservation,
              replyDetails?.currencyCode
            )}
          </Text>

          {isSubstitute && (
            <View style={styles.substituteOfferBox}>
              <Text style={styles.substituteOfferLabel}>
                Substitute offered
              </Text>
              <Text style={styles.substituteOfferName}>
                {replyDetails?.medicineName ?? currentReservation.medicineName}
              </Text>
            </View>
          )}

          <Text style={styles.detailLabel}>Reply notes</Text>
          <Text style={styles.detailValueMuted}>
            {replyDetails?.additionalNotes || "No notes added."}
          </Text>

          {replyDetails?.limitedStock && (
            <View style={styles.stockBadge}>
              <Ionicons name="alert-circle" size={13} color="#9f2a20" />
              <Text style={styles.stockBadgeText}>Limited stock</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>Passcode</Text>
          <Text style={isConfirmed ? styles.passcodeText : styles.onHoldText}>
            {isExpired
              ? "Expired reservation. Renew it to receive a new passcode."
              : currentReservation.passcode ??
                "On hold until the pharmacy confirms your reservation."}
          </Text>

          <Text style={styles.detailLabel}>Expiration</Text>
          <Text style={isExpired ? styles.expiredText : styles.onHoldText}>
            {isExpired
              ? "This reservation has expired."
              : isConfirmed
              ? getTimeLeft(currentReservation.expiresAt)
              : "The timer starts after pharmacy confirmation."}
          </Text>

          {currentReservation.expiresAt && (
            <Text style={styles.detailValueMuted}>
              Expires on {formatDateTime(currentReservation.expiresAt)}
            </Text>
          )}
        </View>

        {isExpired ? (
          <View style={styles.expiredActionsRow}>
            <Pressable
              style={styles.renewReservationButton}
              onPress={() => setRenewModalVisible(true)}
            >
              <Text style={styles.renewReservationText}>
                Renew reservation
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelReservationButton}
              onPress={handleDeleteOrCancel}
            >
              <Text style={styles.cancelReservationText}>
                Delete reservation
              </Text>
            </Pressable>
          </View>
        ) : (
          !isCompleted && (
            <Pressable
              style={styles.cancelReservationButton}
              onPress={handleDeleteOrCancel}
            >
              <Text style={styles.cancelReservationText}>
                Cancel reservation
              </Text>
            </Pressable>
          )
        )}
      </ScrollView>

      {requestDetails && replyDetails && (
        <ReserveMedicineModal
          visible={renewModalVisible}
          request={requestDetails}
          reply={replyDetails}
          mode="renew"
          reservationId={currentReservation.id}
          onClose={() => setRenewModalVisible(false)}
          onReserved={() => setRenewModalVisible(false)}
        />
      )}
    </View>
  );
}