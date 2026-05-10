import { StyleSheet } from "react-native";

export const medRequestsStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f0f4ed",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 110,
    gap: 16,
  },

  detailsContent: {
    paddingHorizontal: 22,
    paddingBottom: 34,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },

  headerTextBox: {
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

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#4e7e5d",
    alignItems: "center",
    justifyContent: "center",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#e7eee8",
    borderRadius: 18,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  tabButtonActive: {
    backgroundColor: "#ffffff",
  },

  tabText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#66736a",
  },

  tabTextActive: {
    color: "#4e7e5d",
  },

  centerCard: {
    minHeight: 160,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#d9e4dc",
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#1f2a22",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#66736a",
    textAlign: "center",
    lineHeight: 19,
  },

  emptyActionButton: {
    marginTop: 14,
    backgroundColor: "#4e7e5d",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },

  emptyActionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  list: {
    gap: 12,
  },

  requestCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  requestCardPressed: {
    transform: [{ scale: 0.99 }],
  },

  requestTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#edf8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  requestMain: {
    flex: 1,
  },

  medicineName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2a22",
  },

  replyText: {
    marginTop: 3,
    fontSize: 12.5,
    color: "#66736a",
  },

  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff2f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  urgentBadgeText: {
    color: "#9f2a20",
    fontSize: 12,
    fontWeight: "800",
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

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  detailsTopBar: {
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

  detailsTitleBox: {
    flex: 1,
  },

  detailImage: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    backgroundColor: "#e7eee8",
    marginBottom: 14,
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#66736a",
    marginTop: 10,
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1f2a22",
  },

  detailValueMuted: {
    fontSize: 14,
    color: "#66736a",
    lineHeight: 20,
  },

  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    paddingHorizontal: 14,
    color: "#1f2a22",
    backgroundColor: "#ffffff",
    fontSize: 15,
  },

  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },

  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
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

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  switchTextBox: {
    flex: 1,
  },

  switchTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1f2a22",
  },

  switchSubtitle: {
    marginTop: 4,
    fontSize: 12.5,
    color: "#66736a",
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "#e7eee8",
    marginVertical: 16,
  },

  urgentBox: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e7eee8",
  },

  urgentBoxActive: {
    backgroundColor: "#fff2f0",
    borderColor: "#f3b8b2",
  },

  urgentTitle: {
    color: "#9f2a20",
  },

  submitButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: "#4e7e5d",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },

  editActionsRow: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9e4dc",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#66736a",
    fontSize: 15,
    fontWeight: "800",
  },

  saveButton: {
    flex: 1,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#4e7e5d",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#fff2f0",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: "#9f2a20",
    fontSize: 15,
    fontWeight: "800",
  },

  topActionsRow: {
  flexDirection: "row",
  gap: 8,
},

topEditButton: {
  width: 40,
  height: 40,
  borderRadius: 15,
  backgroundColor: "#edf8f0",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#d9e4dc",
},

topDeleteButton: {
  width: 40,
  height: 40,
  borderRadius: 15,
  backgroundColor: "#fff2f0",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#f3b8b2",
},

compactEditActionsRow: {
  flexDirection: "row",
  gap: 10,
},

compactCancelButton: {
  flex: 1,
  height: 44,
  borderRadius: 16,
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#d9e4dc",
  alignItems: "center",
  justifyContent: "center",
},

compactCancelText: {
  color: "#66736a",
  fontSize: 14,
  fontWeight: "800",
},

compactSaveButton: {
  flex: 1,
  height: 44,
  borderRadius: 16,
  backgroundColor: "#4e7e5d",
  alignItems: "center",
  justifyContent: "center",
},

compactSaveText: {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: "800",
},

repliesPlaceholderCard: {
  backgroundColor: "rgba(255, 255, 255, 0.94)",
  borderRadius: 24,
  padding: 18,
  borderWidth: 1,
  borderColor: "#d9e4dc",
},

repliesPlaceholderTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#1f2a22",
},

repliesPlaceholderText: {
  marginTop: 6,
  fontSize: 13,
  color: "#66736a",
  lineHeight: 19,
},

  repliesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  repliesTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1f2a22",
  },

  repliesHint: {
    marginTop: 6,
    fontSize: 13,
    color: "#66736a",
    lineHeight: 19,
  },

  reserveNotice: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#edf8f0",
    padding: 12,
    borderRadius: 16,
  },

  reserveNoticeText: {
    flex: 1,
    color: "#2f6f42",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "700",
  },

  repliesList: {
    marginTop: 14,
    gap: 12,
  },

 replyItem: {
  backgroundColor: "#f0f4ed",
  borderRadius: 18,
  padding: 14,
  borderWidth: 1,
  borderColor: "#e7eee8",
},

replyContentRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 10,
},

 replyMain: {
  flex: 1,
  gap: 8,
},

replyTopRow: {
  gap: 4,
},

replyPharmacyButton: {
  alignSelf: "flex-start",
},

 replyPharmacyName: {
  color: "#1f2a22",
  fontSize: 15,
  fontWeight: "800",
  textDecorationLine: "underline",
},

 replyPrice: {
  color: "#4e7e5d",
  fontSize: 14,
  fontWeight: "900",
},

substituteOfferBox: {
  backgroundColor: "#edf8f0",
  borderRadius: 16,
  padding: 10,
  borderWidth: 1,
  borderColor: "#cfe4d5",
},

substituteOfferLabel: {
  color: "#2f6f42",
  fontSize: 11.5,
  fontWeight: "800",
  marginBottom: 3,
},

substituteOfferName: {
  color: "#1f2a22",
  fontSize: 14,
  fontWeight: "900",
},

 


 stockBadge: {
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  backgroundColor: "#fff2f0",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
},

stockBadgeText: {
  color: "#9f2a20",
  fontSize: 12,
  fontWeight: "800",
},

  replyNotes: {
    color: "#66736a",
    fontSize: 13,
    lineHeight: 18,
  },

 reserveButton: {
  minWidth: 82,
  height: 40,
  borderRadius: 15,
  backgroundColor: "#4e7e5d",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 12,
},

 reserveButtonText: {
  color: "#ffffff",
  fontSize: 13,
  fontWeight: "800",
},

reserveModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(31, 42, 34, 0.35)",
  justifyContent: "center",
  padding: 22,
},

reserveModalCard: {
  backgroundColor: "#ffffff",
  borderRadius: 26,
  padding: 20,
  borderWidth: 1,
  borderColor: "#d9e4dc",
},

reserveModalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 14,
  marginBottom: 16,
},

reserveModalTitle: {
  fontSize: 21,
  fontWeight: "800",
  color: "#1f2a22",
},

reserveModalSubtitle: {
  marginTop: 4,
  fontSize: 13,
  color: "#66736a",
},

reserveCloseButton: {
  width: 38,
  height: 38,
  borderRadius: 14,
  backgroundColor: "#f0f4ed",
  alignItems: "center",
  justifyContent: "center",
},

reserveCloseText: {
  fontSize: 24,
  color: "#1f2a22",
  fontWeight: "700",
},

reserveSummaryBox: {
  backgroundColor: "#f0f4ed",
  borderRadius: 18,
  padding: 14,
  marginBottom: 16,
},

reserveLabel: {
  marginTop: 10,
  marginBottom: 6,
  color: "#66736a",
  fontSize: 13,
  fontWeight: "800",
},

reserveValue: {
  color: "#1f2a22",
  fontSize: 15,
  fontWeight: "800",
},

reserveInput: {
  height: 48,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#d9e4dc",
  backgroundColor: "#ffffff",
  paddingHorizontal: 14,
  color: "#1f2a22",
  fontSize: 15,
},

durationRow: {
  flexDirection: "row",
  gap: 8,
},

durationButton: {
  flex: 1,
  height: 42,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: "#d9e4dc",
  backgroundColor: "#ffffff",
  alignItems: "center",
  justifyContent: "center",
},

durationButtonActive: {
  backgroundColor: "#4e7e5d",
  borderColor: "#4e7e5d",
},

durationButtonText: {
  color: "#66736a",
  fontSize: 12.5,
  fontWeight: "800",
},

durationButtonTextActive: {
  color: "#ffffff",
},

reserveError: {
  marginTop: 12,
  color: "#9f2a20",
  fontSize: 13,
  fontWeight: "700",
},

confirmReserveButton: {
  marginTop: 16,
  height: 50,
  borderRadius: 18,
  backgroundColor: "#4e7e5d",
  alignItems: "center",
  justifyContent: "center",
},

confirmReserveText: {
  color: "#ffffff",
  fontSize: 15,
  fontWeight: "800",
},

reservedButton: {
  backgroundColor: "#2f6f42",
},

reserveButtonDisabled: {
  backgroundColor: "#d9e4dc",
},

reserveButtonTextDisabled: {
  color: "#66736a",
},

passcodeText: {
  fontSize: 28,
  fontWeight: "900",
  color: "#4e7e5d",
  letterSpacing: 4,
},

expiryBadge: {
  marginTop: 12,
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  backgroundColor: "#edf8f0",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 999,
},

expiryBadgeText: {
  color: "#2f6f42",
  fontSize: 13,
  fontWeight: "800",
},

cancelReservationButton: {
  height: 52,
  borderRadius: 18,
  backgroundColor: "#fff2f0",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#f3b8b2",
},

cancelReservationText: {
  color: "#9f2a20",
  fontSize: 15,
  fontWeight: "800",
},

onHoldText: {
  fontSize: 14,
  color: "#66736a",
  lineHeight: 20,
  fontWeight: "700",
},

expiredRequestCard: {
  borderColor: "#f3b8b2",
  backgroundColor: "#fff8f7",
},

expiredBadge: {
  backgroundColor: "#fff2f0",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  alignSelf: "flex-start",
},

expiredBadgeText: {
  color: "#9f2a20",
  fontSize: 12,
  fontWeight: "800",
},

expiredText: {
  fontSize: 14,
  color: "#9f2a20",
  lineHeight: 20,
  fontWeight: "800",
},

statusHeaderRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
},

expiredActionsRow: {
  gap: 10,
},

renewReservationButton: {
  height: 52,
  borderRadius: 18,
  backgroundColor: "#4e7e5d",
  alignItems: "center",
  justifyContent: "center",
},

renewReservationText: {
  color: "#ffffff",
  fontSize: 15,
  fontWeight: "800",
},
});