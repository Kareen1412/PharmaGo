import { Image, Pressable, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../services/userAuthService";
import { authStyles } from "../styles/authStyles";

export default function HomeScreen() {
  const { appUser } = useAuth();

  return (
    <View style={authStyles.homePage}>
      <View style={authStyles.homeHeader}>
        <View>
          <Text style={authStyles.homeTitle}>
            Hi, {appUser?.name ?? "there"}
          </Text>
          <Text style={authStyles.homeSubtitle}>What do you need today?</Text>
        </View>

        <Image
          source={require("../assets/images/logo.png")}
          style={authStyles.logoImage}
        />
      </View>

      <Pressable style={authStyles.actionCard}>
        <Text style={authStyles.actionTitle}>Request Medicine</Text>
        <Text style={authStyles.actionText}>
          Send a medicine request to nearby verified pharmacies.
        </Text>
      </Pressable>

      <Pressable style={authStyles.actionCard}>
        <Text style={authStyles.actionTitle}>Ask a Pharmacist</Text>
        <Text style={authStyles.actionText}>
          Ask a question and receive guidance from a verified pharmacy.
        </Text>
      </Pressable>

      <Pressable style={authStyles.logoutButton} onPress={logoutUser}>
        <Text style={authStyles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}