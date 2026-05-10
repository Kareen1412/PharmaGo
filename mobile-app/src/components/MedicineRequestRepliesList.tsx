import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import ReserveMedicineModal from "./reservedMedicineModal";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type Props = {
  request: MedicineRequest;
  replies: PharmacyMedicineRequestReply[];
};

const formatPrice = (price: number, currencyCode: string) => {
  return `${price.toLocaleString()} ${currencyCode}`;
};

export default function MedicineRequestRepliesList({
  request,
  replies,
}: Props) {
  const [selectedReply, setSelectedReply] =
    useState<PharmacyMedicineRequestReply | null>(null);

  const [reservedReplyId, setReservedReplyId] = useState<string | null>(null);

  const requestIsReserved = request.status === "reserved";

  if (replies.length === 0) {
    return (
      <View style={styles.repliesCard}>
        <Text style={styles.repliesTitle}>Pharmacy replies</Text>
        <Text style={styles.repliesHint}>
          Replies from pharmacies will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.repliesCard}>
      <Text style={styles.repliesTitle}>Pharmacy replies</Text>

      <View style={styles.reserveNotice}>
        <Ionicons name="information-circle-outline" size={17} color="#4e7e5d" />
        <Text style={styles.reserveNoticeText}>
          It is recommended to reserve quickly when stock is limited.
        </Text>
      </View>

      <View style={styles.repliesList}>
        {replies.map((reply) => {
          const isReservedReply = reservedReplyId === reply.id;
          const shouldDisableReserve =
            requestIsReserved || Boolean(reservedReplyId);

          return (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.replyContentRow}>
                <View style={styles.replyMain}>
                  <View style={styles.replyTopRow}>
                    <Pressable
                      onPress={() =>
                        console.log(
                          "Open pharmacy profile later:",
                          reply.pharmacyId
                        )
                      }
                      style={styles.replyPharmacyButton}
                    >
                      <Text style={styles.replyPharmacyName} numberOfLines={1}>
                        {reply.pharmacyName}
                      </Text>
                    </Pressable>

                    <Text style={styles.replyPrice}>
                      {formatPrice(reply.price, reply.currencyCode)}
                    </Text>
                  </View>

                  {reply.isSubstitute && (
                    <View style={styles.substituteOfferBox}>
                      <Text style={styles.substituteOfferLabel}>
                        Substitute offered
                      </Text>
                      <Text style={styles.substituteOfferName}>
                        {reply.medicineName}
                      </Text>
                    </View>
                  )}

                  {reply.additionalNotes && (
                    <Text style={styles.replyNotes}>{reply.additionalNotes}</Text>
                  )}

                  {reply.limitedStock && (
                    <View style={styles.stockBadge}>
                      <Ionicons name="alert-circle" size={13} color="#9f2a20" />
                      <Text style={styles.stockBadgeText}>Limited stock</Text>
                    </View>
                  )}
                </View>

                <Pressable
                  style={[
                    styles.reserveButton,
                    isReservedReply && styles.reservedButton,
                    shouldDisableReserve &&
                      !isReservedReply &&
                      styles.reserveButtonDisabled,
                  ]}
                  onPress={() => setSelectedReply(reply)}
                  disabled={shouldDisableReserve}
                >
                  <Text
                    style={[
                      styles.reserveButtonText,
                      shouldDisableReserve &&
                        !isReservedReply &&
                        styles.reserveButtonTextDisabled,
                    ]}
                  >
                    {isReservedReply ? "Reserved" : "Reserve"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <ReserveMedicineModal
        visible={selectedReply !== null}
        request={request}
        reply={selectedReply}
        onClose={() => setSelectedReply(null)}
        onReserved={(replyId) => setReservedReplyId(replyId)}
      />
    </View>
  );
}