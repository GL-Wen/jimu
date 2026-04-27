import { ImageResponse } from "next/og";
import {
  SITE_NAME_EN,
  SITE_NAME_ZH,
  SITE_POSITIONING,
  SITE_TAGLINE,
} from "@/lib/brand";
import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";

export const alt = `${SITE_NAME_ZH} ${SITE_NAME_EN} - gpt-image-2 图像工作台`;
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
          background:
            "linear-gradient(140deg, #fff7ed 0%, #f4f1ec 48%, #e0f2fe 100%)",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "2px solid rgba(120, 113, 108, 0.18)",
            borderRadius: 36,
            background: "rgba(255, 254, 251, 0.72)",
            padding: 56,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 720,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fffefb",
                  fontSize: 34,
                  fontWeight: 800,
                }}
              >
                幕
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 38,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.05,
                  }}
                >
                  {SITE_NAME_ZH} {SITE_NAME_EN}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 18,
                    color: "#78716c",
                    marginTop: 8,
                    letterSpacing: 1,
                  }}
                >
                  {DEFAULT_IMAGE_MODEL} IMAGE WORKSPACE
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.08,
              }}
            >
              文生图、参考图编辑与多尺寸输出
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 24,
                color: "#57534e",
                lineHeight: 1.45,
              }}
            >
              <span>{SITE_TAGLINE}</span>
              <span>{SITE_POSITIONING}</span>
            </div>
          </div>
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: 28,
              background: "#fffefb",
              border: "1px solid rgba(120, 113, 108, 0.22)",
              boxShadow: "0 24px 60px rgba(15,23,42,.12)",
              display: "flex",
              flexDirection: "column",
              padding: 22,
              gap: 16,
            }}
          >
            {["主视觉", "Banner", "社媒封面", "产品图"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  background: "#f5f5f4",
                  padding: "14px 16px",
                  color: "#292524",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                <span>{item}</span>
                <span style={{ color: "#d97706" }}>可发布</span>
              </div>
            ))}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                color: "#a16207",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              <span>生成</span>
              <span>编辑</span>
              <span>下载</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
