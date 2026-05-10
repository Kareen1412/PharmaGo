import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { PharmacyMedicineRequestReply } from "../../../shared/types/pharmacyRequestReply";
import MedicineRequestRepliesList from "../components/MedicineRequestRepliesList";
import {
  listenToMedicineRequestReplies,
  softDeleteMedicineRequest,
  updateMedicineRequest,
  listenToMedicineRequestById,
} from "../services/medicineRequestService";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type RouteParams = {
  request: MedicineRequest;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getSearchLocationText = (request: MedicineRequest) => {
  if (request.locationLat !== null && request.locationLng !== null) {
    return "Nearby pharmacies";
  }

  if (request.region && request.city) {
    return `${request.region}, ${request.city}`;
  }

  if (request.region) {
    return request.region;
  }

  return "No search location saved.";
};

export default function MedRequestDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { request } = route.params as RouteParams;

  const [currentRequest, setCurrentRequest] = useState(request);
  const [isEditing, setIsEditing] = useState(false);

  const [medicineName, setMedicineName] = useState(request.medicineName);
  const [notes, setNotes] = useState(request.notes ?? "");
  const [allowSubstitutes, setAllowSubstitutes] = useState(
    request.allowSubstitutes
  );
  const [isUrgent, setIsUrgent] = useState(request.urgency === "urgent");
  const [saving, setSaving] = useState(false);

  const [replies, setReplies] = useState<PharmacyMedicineRequestReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);


  useEffect(() => {
  const unsubscribe = listenToMedicineRequestById(
    request.id,
    (updatedRequest) => {
      if (!updatedRequest) {
        navigation.goBack();
        return;
      }

      setCurrentRequest(updatedRequest);
    },
    (error) => {
      console.error("Failed to listen to request details:", error);
    }
  );

  return unsubscribe;
}, [navigation, request.id]);

  useEffect(() => {
    const unsubscribe = listenToMedicineRequestReplies(
      currentRequest.id,
      (items) => {
        setReplies(items);
        setLoadingReplies(false);
      },
      () => {
        setLoadingReplies(false);
      }
    );

    return unsubscribe;
  }, [currentRequest.id]);

  const resetEditFields = () => {
    setMedicineName(currentRequest.medicineName);
    setNotes(currentRequest.notes ?? "");
    setAllowSubstitutes(currentRequest.allowSubstitutes);
    setIsUrgent(currentRequest.urgency === "urgent");
  };

  const handleCancelEdit = () => {
    resetEditFields();
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedUrgency = isUrgent ? "urgent" : "normal";
      const updatedNotes = notes.trim() || null;

      await updateMedicineRequest(currentRequest.id, {
        medicineName,
        notes: updatedNotes,
        allowSubstitutes,
        urgency: updatedUrgency,
      });

      setCurrentRequest({
        ...currentRequest,
        medicineName: medicineName.trim(),
        notes: updatedNotes,
        allowSubstitutes,
        urgency: updatedUrgency,
        updatedAt: Date.now(),
      });

      setIsEditing(false);
      Alert.alert("Saved", "Your request was updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update request.";

      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete request?",
      "This will remove the request from your active requests. The record will stay saved in the system.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await softDeleteMedicineRequest(currentRequest.id);
              navigation.navigate("MedRequests", {
  initialTab: "active",
});
            } catch {
              Alert.alert("Error", "Could not delete request.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.detailsTopBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={styles.detailsTitleBox}>
          <Text style={styles.title}>Request Details</Text>
          <Text style={styles.subtitle}>View or edit your request.</Text>
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
          {currentRequest.imageUrl && (
            <Image
              source={{ uri: currentRequest.imageUrl }}
              style={styles.detailImage}
            />
          )}

          <Text style={styles.detailLabel}>Medicine name</Text>
          {isEditing ? (
            <TextInput
              value={medicineName}
              onChangeText={setMedicineName}
              style={styles.input}
              placeholderTextColor="#8a968d"
            />
          ) : (
            <Text style={styles.detailValue}>{currentRequest.medicineName}</Text>
          )}

          <Text style={styles.detailLabel}>Notes</Text>
          {isEditing ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              placeholder="Optional notes..."
              placeholderTextColor="#8a968d"
            />
          ) : (
            <Text style={styles.detailValueMuted}>
              {currentRequest.notes || "No notes added."}
            </Text>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Replies</Text>
              <Text style={styles.infoValue}>
                {(currentRequest.replyCount ?? 0) === 1
                  ? "1 pharmacy"
                  : `${currentRequest.replyCount ?? 0} pharmacies`}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>Active</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Search location</Text>
              <Text style={styles.infoValue}>
                {getSearchLocationText(currentRequest)}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {formatDate(currentRequest.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextBox}>
              <Text style={styles.switchTitle}>Allow substitutes</Text>
              <Text style={styles.switchSubtitle}>
                Let pharmacies suggest suitable alternatives.
              </Text>
            </View>

            <Switch
              value={allowSubstitutes}
              onValueChange={setAllowSubstitutes}
              disabled={!isEditing}
              thumbColor={allowSubstitutes ? "#4e7e5d" : "#f4f4f4"}
              trackColor={{ false: "#d9e4dc", true: "#b9d3c1" }}
            />
          </View>

          <View style={styles.divider} />

          <View style={[styles.urgentBox, isUrgent && styles.urgentBoxActive]}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextBox}>
                <Text
                  style={[
                    styles.switchTitle,
                    isUrgent && styles.urgentTitle,
                  ]}
                >
                  Urgent request
                </Text>
                <Text style={styles.switchSubtitle}>
                  Mark this if you need fast replies.
                </Text>
              </View>

              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                disabled={!isEditing}
                thumbColor={isUrgent ? "#9f2a20" : "#f4f4f4"}
                trackColor={{ false: "#d9e4dc", true: "#f3b8b2" }}
              />
            </View>
          </View>
        </View>

        {loadingReplies ? (
          <View style={styles.repliesCard}>
            <Text style={styles.repliesTitle}>Loading replies...</Text>
          </View>
        ) : (
          <MedicineRequestRepliesList
  request={currentRequest}
  replies={replies}
/>
        )}
      </ScrollView>
    </View>
  );
}