import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PalmReadingGuideExperience } from "@/components/palmistry/PalmReadingGuideExperience";
import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";
import { SITE_NAME_EN, SITE_NAME_ZH } from "@/lib/brand";
import { getSiteUrl } from "@/lib/seo";

const title = "AI 掌相阅读指南生成器";
const description =
  `上传掌心照片，使用 ${DEFAULT_IMAGE_MODEL} 生成极简黑白掌纹轮廓图和完整掌相阅读指南。娱乐向，非专业命理。`;

const ogUrl = `${getSiteUrl()}/palm-reading-guide`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "掌相阅读",
    "手相指南",
    "AI 手相",
    "掌纹轮廓",
    "黑白线稿",
    "gpt-image-2",
    "图生图",
  ],
  alternates: {
    canonical: "/palm-reading-guide",
  },
  openGraph: {
    title: `${title} · ${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    description,
    url: ogUrl,
  },
  twitter: {
    title: `${title} · ${SITE_NAME_ZH}`,
    description,
  },
};

export default function PalmReadingGuidePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <PalmReadingGuideExperience />
      </main>
      <Footer />
    </div>
  );
}
