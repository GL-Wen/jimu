/** 固定请求域名 */
export const ANTMOO_API_ORIGIN = "https://api.antmoo.com";

/** 生图：与域名拼接为完整 URL */
export const UPSTREAM_PATH_IMAGE_GENERATIONS = "/v1/images/generations";

/** 编辑 / 图生图 */
export const UPSTREAM_PATH_IMAGE_EDITS = "/v1/images/edits";

/** 浏览器直连完整地址（不经 Next 代理） */
export const ANTMOO_IMAGE_GENERATIONS_URL = `${ANTMOO_API_ORIGIN}${UPSTREAM_PATH_IMAGE_GENERATIONS}`;
export const ANTMOO_IMAGE_EDITS_URL = `${ANTMOO_API_ORIGIN}${UPSTREAM_PATH_IMAGE_EDITS}`;

/** 长宽比选项（展示用，与参考 UI 一致） */
export const ASPECT_OPTIONS = [
  "Auto",
  "1:1",
  "3:4",
  "4:3",
  "16:9",
  "9:16",
] as const;
export type AspectOption = (typeof ASPECT_OPTIONS)[number];

/** OpenAI 兼容的图像尺寸映射；Auto 不传 size，由上游决定 */
export const ASPECT_TO_SIZE: Record<string, string> = {
  "1:1": "1024x1024",
  "3:4": "1024x1536",
  "4:3": "1536x1024",
  "16:9": "1536x1024",
  "9:16": "1024x1536",
};

export function aspectToSize(aspect: AspectOption): string | undefined {
  if (aspect === "Auto") {
    return undefined;
  }
  return ASPECT_TO_SIZE[aspect];
}

export const DEFAULT_IMAGE_MODEL = "gpt-image-2";

export type ImageGenPayload = {
  model?: string;
  prompt: string;
  n?: number;
  size?: string;
};
