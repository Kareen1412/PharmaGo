import { StyleSheet } from "react-native";

export const questionStyles = StyleSheet.create({
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

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    paddingHorizontal: 14,
    color: "#1f2a22",
    backgroundColor: "#ffffff",
    fontSize: 15,
  },

  textArea: {
    minHeight: 150,
    paddingTop: 12,
    textAlignVertical: "top",
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

  imageButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#edf8f0",
    borderWidth: 1,
    borderColor: "#cfe4d5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  imageButtonText: {
    color: "#4e7e5d",
    fontSize: 14,
    fontWeight: "800",
  },

  imagePreviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  imagePreviewBox: {
    width: 92,
    height: 92,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e7eee8",
    position: "relative",
  },

  imagePreview: {
    width: "100%",
    height: "100%",
  },

  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(31, 42, 34, 0.75)",
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

  questionCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  questionCardPressed: {
    transform: [{ scale: 0.99 }],
  },

  questionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  questionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#edf8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  questionMain: {
    flex: 1,
  },

  questionText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1f2a22",
    lineHeight: 20,
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

  detailImage: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    backgroundColor: "#e7eee8",
    marginBottom: 10,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2a22",
    lineHeight: 22,
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#66736a",
    marginTop: 10,
    marginBottom: 5,
  },

  detailValueMuted: {
    fontSize: 14,
    color: "#66736a",
    lineHeight: 20,
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

  commentAuthorRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 5,
},

replyingToName: {
  color: "#4e7e5d",
  fontSize: 12.5,
  fontWeight: "800",
},

  repliesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  repliesPlainSection: {
    paddingHorizontal: 2,
    paddingBottom: 24,
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

  commentsList: {
    marginTop: 14,
    gap: 12,
  },

  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  nestedCommentRow: {
    marginLeft: 34,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#edf8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  commentBubble: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  commentAuthor: {
    color: "#1f2a22",
    fontSize: 13,
    fontWeight: "900",
  },

  commentText: {
    marginTop: 4,
    color: "#1f2a22",
    fontSize: 13.5,
    lineHeight: 19,
  },

  commentMetaRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  replyMetaSpacer: {
    flex: 1,
  },

  commentMeta: {
    color: "#66736a",
    fontSize: 12,
    fontWeight: "700",
  },

  replyInputBox: {
    marginTop: 14,
    marginBottom: 18,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  replyInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    backgroundColor: "#ffffff",
    paddingHorizontal: 13,
    paddingVertical: 10,
    color: "#1f2a22",
    fontSize: 14,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#4e7e5d",
    alignItems: "center",
    justifyContent: "center",
  },

  replyingToBox: {
    marginTop: 12,
    backgroundColor: "#edf8f0",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  replyingToText: {
    flex: 1,
    color: "#2f6f42",
    fontSize: 12.5,
    fontWeight: "800",
  },

  cancelReplyText: {
    color: "#9f2a20",
    fontSize: 12.5,
    fontWeight: "900",
  },
});