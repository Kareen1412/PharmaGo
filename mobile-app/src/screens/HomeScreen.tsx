import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import BottomNavbar from "../components/BottomNavbar";
import RecentActivityList from "../components/RecentActivityList";
import { listenToRecentActivities } from "../services/recentActivityService";
import type { RecentActivity } from "../../../shared/types/recentActivity";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen() {
  const { appUser, firebaseUser } = useAuth();
  const navigation = useNavigation<any>();

  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = listenToRecentActivities(
      firebaseUser.uid,
      3,
      setActivities,
      (error) => {
        console.error("Failed to listen to recent activities:", error);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  return (
    <View style={homeStyles.page}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.header}>
          <View style={homeStyles.greetingBox}>
            <Text style={homeStyles.helloText}>Hi,</Text>
            <Text style={homeStyles.userName}>{appUser?.name ?? "there"}</Text>
            <Text style={homeStyles.subtitle}>What do you need today?</Text>
          </View>

          <View style={homeStyles.logoBox}>
            <Image
              source={require("../assets/images/logo.png")}
              style={homeStyles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={homeStyles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [
              homeStyles.actionCard,
              pressed && homeStyles.actionCardPressed,
            ]}
            onPress={() => navigation.navigate("CreateMedicineRequest")}
          >
            <View style={homeStyles.actionTopRow}>
              <View style={homeStyles.iconCircle}>
                <Ionicons name="medkit-outline" size={24} color="#4e7e5d" />
              </View>

              <View style={homeStyles.actionArrow}>
                <Ionicons name="arrow-forward" size={20} color="#4e7e5d" />
              </View>
            </View>

            <Text style={homeStyles.actionTitle}>Request Medicine</Text>
            <Text style={homeStyles.actionText}>
              Send a medicine request to nearby verified pharmacies.
            </Text>

            <Text style={homeStyles.startText}>Start request</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              homeStyles.actionCard,
              pressed && homeStyles.actionCardPressed,
            ]}
            onPress={() => navigation.navigate("AskQuestion")}
          >
            <View style={homeStyles.actionTopRow}>
              <View style={homeStyles.iconCircle}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color="#4e7e5d"
                />
              </View>

              <View style={homeStyles.actionArrow}>
                <Ionicons name="arrow-forward" size={20} color="#4e7e5d" />
              </View>
            </View>

            <Text style={homeStyles.actionTitle}>Ask a Pharmacist</Text>
            <Text style={homeStyles.actionText}>
              Ask a question and receive guidance from a verified pharmacy.
            </Text>

            <Text style={homeStyles.startText}>Ask now</Text>
          </Pressable>
        </View>
       <Pressable
  style={({ pressed }) => [
    homeStyles.browsePharmacyCard,
    pressed && homeStyles.browsePharmacyCardPressed,
  ]}
  onPress={() => navigation.navigate("PharmacyList")}
>
  <View style={homeStyles.browsePharmacyIcon}>
    <Ionicons name="business-outline" size={22} color="#4e7e5d" />
  </View>

  <View style={homeStyles.browsePharmacyTextBox}>
    <Text style={homeStyles.browsePharmacyTitle}>Browse Pharmacies</Text>
    <Text style={homeStyles.browsePharmacyText} numberOfLines={2}>
      Find verified pharmacies by nearby location, region, or city.
    </Text>
  </View>

  <View style={homeStyles.browsePharmacyArrow}>
    <Ionicons name="arrow-forward" size={19} color="#4e7e5d" />
  </View>
</Pressable>

        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Recent activity</Text>

          <Pressable onPress={() => navigation.navigate("RecentActivity")}>
            <Text style={homeStyles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        <RecentActivityList activities={activities} />
      </ScrollView>

      <BottomNavbar />
    </View>
  );
}