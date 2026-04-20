import {GoogleGenAI} from "@google/genai";

export type GeminiVerificationDecision = {
  decision: "verified" | "rejected";
  reason: string | null;
  extractedOwnerName: string | null;
  extractedGuildIdNumber: string | null;
};

/**
 * Verifies an uploaded pharmacy guild ID document with Gemini.
 * @param {Object} params
 * @param {string} params.apiKey
 * @param {Buffer} params.fileBytes
 * @param {string} params.mimeType
 * @param {string} params.ownerName
 * @param {string} params.guildIdNumber
 * @return {Promise<GeminiVerificationDecision>}
 */
export async function verifyWithGemini(params: {
  apiKey: string;
  fileBytes: Buffer;
  mimeType: string;
  ownerName: string;
  guildIdNumber: string;
}): Promise<GeminiVerificationDecision> {
  const ai = new GoogleGenAI({
    apiKey: params.apiKey,
  });

  const prompt = `
You are verifying whether an uploaded pharmacy guild ID document
appears to be a real pharmacist/pharmacy licensing or guild-related
document.

Given:
- Claimed licensed pharmacist name: ${params.ownerName}
- Claimed guild ID number: ${params.guildIdNumber}

Your task:
1. Inspect the uploaded document.
2. Decide whether it plausibly represents an authentic
   pharmacy/pharmacist guild, licensing, syndicate, or professional
   registration document.
3. Compare the visible document information to the claimed owner name
   and guild ID number if possible.
4. Return strict JSON only.

Rules:
- Return "verified" only if the document clearly appears to be a
  pharmacy/pharmacist credential and the details do not conflict
  with the claimed data.
- Return "rejected" if the document is unrelated, unreadable,
  obviously inconsistent, or missing enough evidence.
- Be conservative. If uncertain, reject.
- Do not include markdown fences.

Return exactly this JSON shape:
{
  "decision": "verified" | "rejected",
  "reason": "short explanation",
  "extractedOwnerName": "string or null",
  "extractedGuildIdNumber": "string or null"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {text: prompt},
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.fileBytes.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed: GeminiVerificationDecision;

  try {
    parsed = JSON.parse(text) as GeminiVerificationDecision;
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (
    parsed.decision !== "verified" &&
    parsed.decision !== "rejected"
  ) {
    throw new Error("Gemini returned an invalid decision.");
  }

  return {
    decision: parsed.decision,
    reason: parsed.reason ?? null,
    extractedOwnerName: parsed.extractedOwnerName ?? null,
    extractedGuildIdNumber: parsed.extractedGuildIdNumber ?? null,
  };
}
