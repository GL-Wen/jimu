import { ImageResponse } from "next/og";
import { SITE_NAME_EN, SITE_NAME_ZH, SITE_TAGLINE } from "@/lib/brand";

export const alt = `${SITE_NAME_ZH} — ${SITE_NAME_EN}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #fff7ed 0%, #f4f1ec 45%, #fef3c7 100%)",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 20,
            maxWidth: 900,
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            {SITE_NAME_ZH} {SITE_NAME_EN}
          </p>
          <p
            style={{
              fontSize: 20,
              color: "#57534e",
              lineHeight: 1.5,
            }}
          >
            {SITE_TAGLINE}
          </p>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 16,
              color: "#a16207",
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            gpt-image-2 · 文生图 · 图生图
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
