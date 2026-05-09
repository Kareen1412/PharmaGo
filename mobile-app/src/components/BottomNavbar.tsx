import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

type TabItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  {
    label: "Home",
    route: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    label: "Requests",
    route: "MedRequests",
    icon: "medkit-outline",
    activeIcon: "medkit",
  },
  {
    label: "Questions",
    route: "Questions",
    icon: "chatbubble-ellipses-outline",
    activeIcon: "chatbubble-ellipses",
  },
  {
    label: "Profile",
    route: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function BottomNavbar() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View style={styles.wrapper}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.route;

        return (
          <Pressable
            key={tab.route}
            onPress={() => navigation.navigate(tab.route)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? "#4e7e5d" : "#7b8a80"}
            />

            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 18,
  height: 68,
  backgroundColor: "#ffffff",
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "#e1eae3",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",

  boxShadow: "0px 8px 18px rgba(78, 126, 93, 0.12)",
  elevation: 8,
},

  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 20,
  },

  activeTab: {
    backgroundColor: "#eef5ef",
  },

  label: {
    fontSize: 11,
    color: "#7b8a80",
    fontWeight: "500",
  },

  activeLabel: {
    color: "#4e7e5d",
    fontWeight: "700",
  },
});