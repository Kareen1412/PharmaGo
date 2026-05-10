import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f0f4ed",
  },

  content: {
    padding: 18,
    paddingBottom: 110,
  },

  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1eae3",
    marginBottom: 18,
    elevation: 2,
  },

  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  userInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
  },

  userTextBox: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2a22",
  },

  editNameButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
  },

  email: {
    fontSize: 12,
    color: "#66736a",
    marginTop: 3,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff2f0",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },

  logoutButtonText: {
    color: "#9f2a20",
    fontWeight: "800",
    fontSize: 12,
  },

  nameEditBox: {
    gap: 8,
  },

  nameInput: {
    borderWidth: 1,
    borderColor: "#d9e4dc",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#1f2a22",
    backgroundColor: "#fbfdfb",
    fontSize: 15,
    fontWeight: "800",
  },

  nameEditActions: {
    flexDirection: "row",
    gap: 8,
  },

  nameIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  saveNameButton: {
    backgroundColor: "#4e7e5d",
  },

  cancelNameButton: {
    backgroundColor: "#fff2f0",
  },

  carouselHeader: {
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1f2a22",
    marginBottom: 12,
  },

  carousel: {
    gap: 12,
    paddingRight: 18,
  },

  purchaseCard: {
    width: 150,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e1eae3",
  },

  purchaseIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  purchaseName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f2a22",
    minHeight: 38,
  },

  purchaseMeta: {
    fontSize: 12,
    color: "#66736a",
    marginTop: 6,
  },

  completedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#edf8f0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
  },

  completedBadgeText: {
    color: "#2f6f42",
    fontSize: 11,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1eae3",
  },

  emptyTitle: {
    color: "#1f2a22",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },

  emptyText: {
    color: "#66736a",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
});