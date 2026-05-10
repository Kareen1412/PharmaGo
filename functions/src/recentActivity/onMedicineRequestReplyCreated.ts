import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {createRecentActivity} from "../utils/createRecentActivity";

export const onMedicineRequestReplyCreated = onDocumentCreated(
  {
    region: "europe-west1",
    document: "medicineRequestReplies/{replyId}",
  },
  async (event) => {
    const reply = event.data?.data();

    if (!reply) return;

    const medicineRequestId =
      typeof reply.medicineRequestId === "string" ?
        reply.medicineRequestId :
        "";

    if (!medicineRequestId) return;

    const db = admin.firestore();

    const requestSnap = await db
      .collection("medicineRequests")
      .doc(medicineRequestId)
      .get();

    if (!requestSnap.exists) return;

    const medicineRequest = requestSnap.data();

    if (!medicineRequest) return;

    const userId =
      typeof medicineRequest.userId === "string" ? medicineRequest.userId : "";

    if (!userId) return;

    const pharmacyName =
      typeof reply.pharmacyName === "string" && reply.pharmacyName.trim() ?
        reply.pharmacyName.trim() :
        "A pharmacy";

    const medicineName =
      typeof medicineRequest.medicineName === "string" ?
        medicineRequest.medicineName :
        "your medicine request";

    await createRecentActivity({
      userId,
      type: "medicine_request_reply",
      title: "New medicine reply",
      message: `${pharmacyName} replied to your request for ${medicineName}.`,
      targetType: "medicineRequest",
      targetId: medicineRequestId,
    });
  }
);
