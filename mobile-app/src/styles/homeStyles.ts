import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f0f4ed",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  greetingBox: {
    flex: 1,
    paddingRight: 16,
  },

  helloText: {
    fontSize: 18,
    color: "#6f7f73",
    fontWeight: "500",
  },

  userName: {
    fontSize: 30,
    color: "#1f2a22",
    fontWeight: "800",
    marginTop: 2,
  },

  subtitle: {
    fontSize: 15,
    color: "#6f7f73",
    marginTop: 8,
  },

    logoBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e1eae3",
    boxShadow: "0px 6px 12px rgba(78, 126, 93, 0.08)",
    elevation: 4,
    },

  logo: {
    width: 52,
    height: 52,
  },

  actionsGrid: {
    gap: 16,
    marginBottom: 30,
  },

 actionCard: {
  backgroundColor: "#ffffff",
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: "#e1eae3",
  boxShadow: "0px 8px 16px rgba(78, 126, 93, 0.08)",
  elevation: 4,
},
actionCardPressed: {
  opacity: 0.82,
  transform: [{ scale: 0.98 }],
},

actionTopRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
},

actionArrow: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#eef5ef",
  alignItems: "center",
  justifyContent: "center",
},

startText: {
  fontSize: 14,
  color: "#4e7e5d",
  fontWeight: "800",
  marginTop: 12,
},


  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 18,
    color: "#1f2a22",
    fontWeight: "800",
    marginBottom: 6,
  },

  actionText: {
    fontSize: 14,
    color: "#6f7f73",
    lineHeight: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    color: "#1f2a22",
    fontWeight: "800",
  },

  viewAllText: {
    fontSize: 14,
    color: "#4e7e5d",
    fontWeight: "700",
  },

  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1eae3",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
  },

  activityTextBox: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 15,
    color: "#1f2a22",
    fontWeight: "700",
    marginBottom: 3,
  },

  activityText: {
    fontSize: 13,
    color: "#6f7f73",
    lineHeight: 18,
  },
});