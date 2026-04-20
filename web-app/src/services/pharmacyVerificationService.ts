import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { auth, functions, storage } from "../config/firebase";

type SubmitPharmacyVerificationInput = {
  ownerName: string;
  guildIdNumber: string;
  notes: string;
  guildFile: File;
};

type SubmitPharmacyVerificationResponse = {
  success: boolean;
  verificationRequestId: string;
};

export type LatestPharmacyVerificationResponse = {
  success: boolean;
  request: {
    id: string;
    createdAt: number | null;
    extractedGuildIdNumber?: string | null;
    extractedOwnerName?: string | null;
    fileName: string;
    geminiDecision?: string | null;
    geminiReason?: string | null;
    failureReason?: string | null;
    guildIdNumber: string;
    mimeType: string;
    notes: string | null;
    ownerName: string;
    pharmacyId: string;
    processedAt?: number | null;
    status: "queued" | "processing" | "verified" | "rejected" | "failed";
    storagePath: string;
    updatedAt?: number | null;
  } | null;
};

export async function submitPharmacyVerification({
  ownerName,
  guildIdNumber,
  notes,
  guildFile,
}: SubmitPharmacyVerificationInput): Promise<SubmitPharmacyVerificationResponse> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const safeName = guildFile.name.replace(/\s+/g, "_");
  const storagePath = `pharmacy-verification/${user.uid}/${Date.now()}-${safeName}`;

  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, guildFile, {
    contentType: guildFile.type,
  });

  const submitCallable = httpsCallable<
    {
      ownerName: string;
      guildIdNumber: string;
      notes: string;
      storagePath: string;
      fileName: string;
      mimeType: string;
    },
    SubmitPharmacyVerificationResponse
  >(functions, "submitPharmacyVerification");

  const result = await submitCallable({
    ownerName,
    guildIdNumber,
    notes,
    storagePath,
    fileName: guildFile.name,
    mimeType: guildFile.type,
  });

  return result.data;
}

export async function getLatestPharmacyVerification(): Promise<LatestPharmacyVerificationResponse> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const getLatestCallable = httpsCallable<void, LatestPharmacyVerificationResponse>(
    functions,
    "getLatestPharmacyVerification"
  );

  const result = await getLatestCallable();

  return result.data;
}

export async function getVerificationFileDownloadUrl(storagePath: string): Promise<string> {
  if (!storagePath) {
    throw new Error("No file path found for this verification request.");
  }

  const fileRef = ref(storage, storagePath);
  return await getDownloadURL(fileRef);
}