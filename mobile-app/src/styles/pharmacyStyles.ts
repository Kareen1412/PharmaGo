import { StyleSheet } from "react-native";

export const pharmacyStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f0f4ed",
  },

  topBar: {
    paddingTop: 48,
    paddingHorizontal: 22,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  titleBox: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2a22",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#66736a",
    lineHeight: 18,
  },

  content: {
    paddingHorizontal: 22,
    paddingBottom: 34,
    gap: 14,
  },

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    gap: 12,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
  },

  filterButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  filterButtonActive: {
    backgroundColor: "#4e7e5d",
    borderColor: "#4e7e5d",
  },

  filterButtonText: {
    color: "#66736a",
    fontSize: 12.5,
    fontWeight: "800",
  },

  filterButtonTextActive: {
    color: "#ffffff",
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#d9e4dc",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  disabledPickerBox: {
    opacity: 0.55,
  },

  list: {
    gap: 12,
  },

  pharmacyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  pharmacyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  pharmacyIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
  },

  pharmacyInfo: {
    flex: 1,
  },

  pharmacyName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2a22",
  },

  pharmacyMeta: {
    marginTop: 3,
    fontSize: 12.5,
    color: "#66736a",
  },

  starButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#f0f4ed",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  softBadge: {
    backgroundColor: "#edf8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  softBadgeText: {
    color: "#2f6f42",
    fontSize: 12,
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

  detailsHeroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  detailsHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  detailsIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#eef5ef",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsMain: {
    flex: 1,
  },

  detailsName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1f2a22",
  },

  detailsMeta: {
    marginTop: 5,
    color: "#66736a",
    fontSize: 13,
    lineHeight: 18,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#66736a",
    marginBottom: 6,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1f2a22",
    lineHeight: 21,
  },

  detailMuted: {
    fontSize: 14,
    color: "#66736a",
    lineHeight: 20,
  },

  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  infoPill: {
    flex: 1,
    backgroundColor: "#f0f4ed",
    borderRadius: 16,
    padding: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#66736a",
    fontWeight: "700",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 13.5,
    color: "#1f2a22",
    fontWeight: "800",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  phoneText: {
    color: "#1f2a22",
    fontSize: 14,
    fontWeight: "700",
  },
});