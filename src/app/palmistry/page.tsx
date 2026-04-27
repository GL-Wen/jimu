import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PalmistryExperience } from "@/components/palmistry/PalmistryExperience";
import { DEFAULT_IMAGE_MODEL } from "@/lib/antmoo-config";
import { SITE_NAME_EN, SITE_NAME_ZH } from "@/lib/brand";
import { getSiteUrl } from "@/lib/seo";

const title = "AI 手相运势卡生成器";
const description =
  `基于 ${DEFAULT_IMAGE_MODEL} 图片编辑能力，上传掌心照片生成竖版手相运势卡，包含掌纹标注、趣味标签和完整卡片版式。娱乐向，非专业命理。`;

const ogUrl = `${getSiteUrl()}/palmistry`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "手相",
    "AI 手相",
    "手相运势卡",
    "手相生成器",
    "gpt-image-2",
    "运势卡",
    "图生图",
    "掌纹",
  ],
  alternates: {
    canonical: "/palmistry",
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

export default function PalmistryPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <PalmistryExperience />
      </main>
      <Footer />
    </div>
  );
}
