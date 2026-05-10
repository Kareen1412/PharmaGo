import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import {
  createMedicineReservation,
  renewMedicineReservation,
} from "../services/medicineRequestService";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type Props = {
  visible: boolean;
  request: MedicineRequest;
  reply: PharmacyMedicineRequestReply | null;
  onClose: () => void;
  onReserved: (replyId: string) => void;
  mode?: "create" | "renew";
  reservationId?: string;
};

type DurationDays = 1 | 3 | 7;

const formatPrice = (price: number, currencyCode: string) => {
  return `${price.toLocaleString()} ${currencyCode}`;
};

export default function ReserveMedicineModal({
  visible,
  request,
  reply,
  onClose,
  onReserved,
  mode = "create",
  reservationId,
}: Props) {
  const [quantity, setQuantity] = useState("1");
  const [durationDays, setDurationDays] = useState<DurationDays>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!reply) return null;

  const medicineName =
    reply.isSubstitute && reply.medicineName
      ? reply.medicineName
      : request.medicineName;

  const isRenewMode = mode === "renew";

  const handleReserve = async () => {
    try {
      setError("");

      const reservedQuantity = Number(quantity);

      if (!Number.isInteger(reservedQuantity) || reservedQuantity <= 0) {
        setError("Quantity must be greater than 0.");
        return;
      }

      if (isRenewMode && !reservationId) {
        setError("Reservation ID is missing.");
        return;
      }

      setSubmitting(true);

      if (isRenewMode) {
        await renewMedicineReservation({
          reservationId: reservationId!,
          reservedQuantity,
          durationDays,
        });
      } else {
        await createMedicineReservation({
          requestId: request.id,
          replyId: reply.id,
          reservedQuantity,
          durationDays,
        });
      }

      onReserved(reply.id);

      Alert.alert(
        isRenewMode ? "Reservation renewed" : "Reservation sent",
        isRenewMode
          ? "Your reservation is pending again. The pharmacy will confirm it and generate a new passcode."
          : "Your reservation is pending. The pharmacy will generate a passcode after confirming it."
      );

      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create reservation.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.reserveModalOverlay}>
        <View style={styles.reserveModalCard}>
          <View style={styles.reserveModalHeader}>
            <View>
              <Text style={styles.reserveModalTitle}>
                {isRenewMode ? "Renew reservation" : "Reserve medicine"}
              </Text>
              <Text style={styles.reserveModalSubtitle}>
                {isRenewMode
                  ? "Choose the new reservation details."
                  : "Confirm reservation details."}
              </Text>
            </View>

            <Pressable style={styles.reserveCloseButton} onPress={onClose}>
              <Text style={styles.reserveCloseText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.reserveSummaryBox}>
            <Text style={styles.reserveLabel}>Medicine</Text>
            <Text style={styles.reserveValue}>{medicineName}</Text>

            <Text style={styles.reserveLabel}>Price</Text>
            <Text style={styles.reserveValue}>
              {formatPrice(reply.price, reply.currencyCode)}
            </Text>
          </View>

          <Text style={styles.reserveLabel}>Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            inputMode="numeric"
            style={styles.reserveInput}
            placeholder="1"
            placeholderTextColor="#8a968d"
          />

          <Text style={styles.reserveLabel}>Reserved for</Text>
          <View style={styles.durationRow}>
            {[1, 3, 7].map((days) => (
              <Pressable
                key={days}
                style={[
                  styles.durationButton,
                  durationDays === days && styles.durationButtonActive,
                ]}
                onPress={() => setDurationDays(days as DurationDays)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    durationDays === days && styles.durationButtonTextActive,
                  ]}
                >
                  {days === 7 ? "1 week" : `${days} day${days > 1 ? "s" : ""}`}
                </Text>
              </Pressable>
            ))}
          </View>

          {error && <Text style={styles.reserveError}>{error}</Text>}

          <Pressable
            style={[
              styles.confirmReserveButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleReserve}
            disabled={submitting}
          >
            <Text style={styles.confirmReserveText}>
              {submitting
                ? isRenewMode
                  ? "Renewing..."
                  : "Reserving..."
                : isRenewMode
                ? "Renew reservation"
                : "Confirm reservation"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}