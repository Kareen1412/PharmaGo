import { StyleSheet } from "react-native";

export const createMedRequestStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f0f4ed",
  },

  topBar: {
    paddingTop: 48,
    paddingHorizontal: 22,
    paddingBottom: 18,
    backgroundColor: "#f0f4ed",
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

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1f2a22",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#66736a",
  },

  content: {
    paddingHorizontal: 22,
    paddingBottom: 34,
    gap: 16,
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d9e4dc",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2a22",
    marginBottom: 8,
    marginTop: 10,
  },

  requiredStar: {
    color: "#9f2a20",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    marginBottom: 8,
  },

  labelNoMargin: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2a22",
  },

  optionalText: {
    fontSize: 12.5,
    color: "#66736a",
    fontWeight: "600",
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
    minHeight: 110,
    paddingTop: 12,
  },

  helperText: {
    fontSize: 12.5,
    color: "#66736a",
    lineHeight: 18,
    marginBottom: 8,
  },

  imageButton: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4e7e5d",
    backgroundColor: "#edf8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  imageButtonText: {
    color: "#4e7e5d",
    fontSize: 14,
    fontWeight: "700",
  },

  imagePreviewBox: {
    gap: 10,
  },

  imagePreview: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    backgroundColor: "#e7eee8",
  },

  removeImageButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff2f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  removeImageText: {
    color: "#9f2a20",
    fontWeight: "700",
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f2a22",
    marginBottom: 4,
  },

  sectionNote: {
    fontSize: 12.5,
    color: "#66736a",
    lineHeight: 18,
    marginBottom: 14,
  },

  searchModeGrid: {
    gap: 10,
  },

  searchModeCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  searchModeCardActive: {
    borderColor: "#4e7e5d",
    backgroundColor: "#edf8f0",
  },

  searchModeIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#f0f4ed",
    alignItems: "center",
    justifyContent: "center",
  },

  searchModeIconActive: {
    backgroundColor: "#ffffff",
  },

  searchModeTextBox: {
    flex: 1,
  },

  searchModeTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#1f2a22",
  },

  searchModeTitleActive: {
    color: "#345c42",
  },

  searchModeSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#66736a",
  },

  areaBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e7eee8",
  },

  pickerBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d9e4dc",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  disabledPickerBox: {
    opacity: 0.55,
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

  submitButtonPressed: {
    backgroundColor: "#345c42",
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});