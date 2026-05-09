import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import BottomNavbar from "../components/BottomNavbar";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen() {
  const { appUser } = useAuth();
  const navigation = useNavigation<any>();

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
  onPress={() => navigation.navigate("Questions")}
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

        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Recent activity</Text>
          <Pressable>
            <Text style={homeStyles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        <View style={homeStyles.activityCard}>
          <View style={homeStyles.activityIcon}>
            <Ionicons name="time-outline" size={22} color="#4e7e5d" />
          </View>

          <View style={homeStyles.activityTextBox}>
            <Text style={homeStyles.activityTitle}>No recent activity yet</Text>
            <Text style={homeStyles.activityText}>
              Your latest medicine replies and pharmacist answers will appear
              here.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavbar />
    </View>
  );
}