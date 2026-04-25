import type { MetadataRoute } from "next";
import { SITE_NAME_EN, SITE_NAME_ZH } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    short_name: SITE_NAME_ZH,
    description:
      "文字与参考图，秒成可商用主视觉与 Banner — gpt-image-2 文生图、图生图。",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ec",
    theme_color: "#d97706",
  };
}
