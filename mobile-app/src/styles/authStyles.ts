import { StyleSheet } from "react-native";


export const colors = {
  pageMiddle: "#f0f4ed",
  text: "#1f2a22",
  muted: "#66736a",
  border: "#d9e4dc",
  borderSoft: "#e7eee8",
  card: "rgba(255, 255, 255, 0.94)",
  primary: "#4e7e5d",
  primaryDark: "#345c42",
  dangerBg: "#fff2f0",
  dangerText: "#9f2a20",
  successBg: "#edf8f0",
  successText: "#2f6f42",
};

export const authStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.pageMiddle,
  },

topBar: {
  height: 120,
  paddingTop: 42,
  paddingHorizontal: 22,
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
  backgroundColor: colors.pageMiddle,
  zIndex: 20,
  elevation: 20,
},

  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },

scrollContent: {
  flexGrow: 1,
  justifyContent: "center",
  paddingHorizontal: 22,
  paddingBottom: 60,
},

  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.3,
  },

 card: {
  backgroundColor: colors.card,
  borderRadius: 26,
  borderWidth: 1,
  borderColor: colors.borderSoft,
  padding: 22,
  boxShadow: "0px 8px 18px rgba(78, 126, 93, 0.1)",
  elevation: 4,
},

  title: {
    fontSize: 31,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 34,
  },

  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 22,
    lineHeight: 21,
  },

  fieldGroup: {
    gap: 8,
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: colors.text,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },

  iconButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },

  secondaryButtonText: {
    color: colors.primaryDark,
    fontWeight: "700",
  },

  secondaryButtonLink: {
    color: colors.primary,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  linkButtonLeft: {
    alignSelf: "flex-start",
    marginTop: -4,
    marginBottom: 8,
  },

  linkText: {
    color: colors.primary,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: "#f3c3bd",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  errorText: {
    color: colors.dangerText,
    fontSize: 14,
    lineHeight: 19,
  },

  successBox: {
    backgroundColor: colors.successBg,
    borderColor: "#c7e8cf",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  successText: {
    color: colors.successText,
    fontSize: 14,
    lineHeight: 19,
  },

  homePage: {
    flex: 1,
    backgroundColor: colors.pageMiddle,
    padding: 22,
    paddingTop: 54,
  },

  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  homeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },

  homeSubtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 5,
  },

  actionCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },

  actionText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },

  logoutButton: {
    marginTop: "auto",
    paddingVertical: 14,
    alignItems: "center",
  },

  logoutText: {
    color: colors.dangerText,
    fontWeight: "800",
  },
});