import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavbar from "../components/BottomNavbar";
import ActiveMedicineRequestsList from "../components/ActiveMedicineRequestsList";
import ReservedMedicineRequestsList from "../components/ReservedMedicineRequestsList";
import { listenToMyActiveMedicineRequests } from "../services/medicineRequestService";
import type { MedicineRequest } from "../../../shared/types/medRequest";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

export default function MedRequestsScreen() {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<"active" | "reserved">("active");
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToMyActiveMedicineRequests(
      (items) => {
        setRequests(items);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const goToCreateRequest = () => {
    navigation.navigate("CreateMedicineRequest");
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextBox}>
            <Text style={styles.title}>Medicine Requests</Text>
            <Text style={styles.subtitle}>
              Track your active medicine requests and pharmacy replies.
            </Text>
          </View>

          <Pressable style={styles.addButton} onPress={goToCreateRequest}>
            <Ionicons name="add" size={22} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === "active" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "active" && styles.tabTextActive,
              ]}
            >
              Active requests
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabButton,
              activeTab === "reserved" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("reserved")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reserved" && styles.tabTextActive,
              ]}
            >
              Reserved
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color="#4e7e5d" />
          </View>
        ) : activeTab === "active" ? (
          <ActiveMedicineRequestsList
            requests={requests}
            onCreateRequest={goToCreateRequest}
            onOpenRequest={(request) =>
              navigation.navigate("MedRequestDetails", { request })
            }
          />
        ) : (
          <ReservedMedicineRequestsList onCreateRequest={goToCreateRequest} />
        )}
      </ScrollView>

      <BottomNavbar />
    </View>
  );
}