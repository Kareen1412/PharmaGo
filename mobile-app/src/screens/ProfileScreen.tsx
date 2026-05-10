import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

import { auth } from "../config/firebase";
import type { AppUser } from "../../../shared/types/appUser";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import {
  listenToUserProfile,
  updateUserProfile,
} from "../services/userProfileService";
import { listenToCompletedMedicineReservations } from "../services/medicineRequestService";
import BottomNavbar from "../components/BottomNavbar";
import { profileStyles as styles } from "../styles/profileStyles";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [completedReservations, setCompletedReservations] = useState<
    MedicineReservation[]
  >([]);

  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    const unsubscribeProfile = listenToUserProfile(
      userId,
      (profile) => {
        setUserProfile(profile);

        if (profile) {
          setName(profile.name ?? "");
        }
      },
      (error) => console.error("Failed to listen to profile:", error)
    );

    const unsubscribeCompleted = listenToCompletedMedicineReservations(
      setCompletedReservations,
      (error) =>
        console.error("Failed to listen to completed reservations:", error)
    );

    return () => {
      unsubscribeProfile();
      unsubscribeCompleted();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveName = async () => {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) return;

      const cleanedName = name.trim();

      if (!cleanedName) {
        Alert.alert("Missing name", "Name cannot be empty.");
        return;
      }

      setSaving(true);

      await updateUserProfile(userId, {
        name: cleanedName,
      });

      setEditingName(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update name.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditName = () => {
    setName(userProfile?.name ?? "");
    setEditingName(false);
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={30} color="#4e7e5d" />
              </View>

              <View style={styles.userTextBox}>
                {editingName ? (
                  <View style={styles.nameEditBox}>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      style={styles.nameInput}
                      placeholder="Your name"
                      placeholderTextColor="#8a968d"
                    />

                    <View style={styles.nameEditActions}>
                      <Pressable
                        style={[styles.nameIconButton, styles.saveNameButton]}
                        onPress={handleSaveName}
                        disabled={saving}
                      >
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      </Pressable>

                      <Pressable
                        style={[
                          styles.nameIconButton,
                          styles.cancelNameButton,
                        ]}
                        onPress={handleCancelEditName}
                        disabled={saving}
                      >
                        <Ionicons name="close" size={16} color="#9f2a20" />
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>
                      {userProfile?.name ?? "User"}
                    </Text>

                    <Pressable
                      style={styles.editNameButton}
                      onPress={() => setEditingName(true)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={14}
                        color="#4e7e5d"
                      />
                    </Pressable>
                  </View>
                )}

                <Text style={styles.email}>
                  {userProfile?.email ?? auth.currentUser?.email}
                </Text>
              </View>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={15} color="#9f2a20" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.carouselHeader}>
          <Text style={styles.sectionTitle}>Recently bought</Text>
        </View>

        {completedReservations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bag-check-outline" size={28} color="#4e7e5d" />
            <Text style={styles.emptyTitle}>No completed purchases yet</Text>
            <Text style={styles.emptyText}>
              Completed reservations will appear here.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {completedReservations.slice(0, 8).map((reservation) => (
              <Pressable
                key={reservation.id}
                style={styles.purchaseCard}
                onPress={() =>
                  navigation.navigate("ReservationDetails", { reservation })
                }
              >
                <View style={styles.purchaseIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#4e7e5d" />
                </View>

                <Text style={styles.purchaseName} numberOfLines={2}>
                  {reservation.medicineName}
                </Text>

                <Text style={styles.purchaseMeta}>
                  {reservation.reservedQuantity} item
                  {reservation.reservedQuantity === 1 ? "" : "s"}
                </Text>

                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <BottomNavbar />
    </View>
  );
}