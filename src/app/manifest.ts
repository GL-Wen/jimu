import type { MetadataRoute } from "next";
import { SITE_NAME_EN, SITE_NAME_ZH, SITE_TAGLINE } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME_ZH} ${SITE_NAME_EN} - gpt-image-2 图像工作台`,
    short_name: SITE_NAME_ZH,
    description: `${SITE_TAGLINE} 基于 gpt-image-2 生成、编辑和下载可发布图片。`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f1ec",
    theme_color: "#d97706",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
