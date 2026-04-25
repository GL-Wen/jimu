import {
  ANTMOO_IMAGE_EDITS_URL,
  ANTMOO_IMAGE_GENERATIONS_URL,
  type ImageGenPayload,
} from "./antmoo-config";

function authHeaders(apiKey: string): HeadersInit {
  const t = apiKey.trim();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${t}`,
  };
}

export type GenImageItem = { url?: string; b64_json?: string; revised_prompt?: string };

export type GenerationsResponse = {
  data?: GenImageItem[];
  error?: { message?: string; type?: string; code?: string };
};

export async function generateImages(
  apiKey: string,
  payload: ImageGenPayload
): Promise<GenerationsResponse> {
  const b: Record<string, unknown> = {
    prompt: payload.prompt,
    n: payload.n,
  };
  if (payload.model != null && payload.model !== "") {
    b.model = payload.model;
  }
  if (payload.size != null && payload.size !== "") {
    b.size = payload.size;
  }
  const res = await fetch(ANTMOO_IMAGE_GENERATIONS_URL, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify(b),
  });
  return (await res.json()) as GenerationsResponse;
}

export async function editImage(
  apiKey: string,
  formData: FormData
): Promise<GenerationsResponse> {
  const res = await fetch(ANTMOO_IMAGE_EDITS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: formData,
  });
  return (await res.json()) as GenerationsResponse;
}

export function dataUrlFromB64(mime: string, b64: string): string {
  return `data:${mime};base64,${b64}`;
}
