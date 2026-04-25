import type { Metadata } from "next";
import {
  SITE_NAME_EN,
  SITE_NAME_ZH,
  SITE_TAGLINE,
} from "@/lib/brand";

const DEFAULT_DESCRIPTION = `${SITE_NAME_ZH} 基于 gpt-image-2：将文字与参考图转为可商用的主视觉与 Banner，秒级出图、自然语言编辑。`;

/**
 * 用于 canonical、OG 绝对地址、sitemap。生产环境请设置 NEXT_PUBLIC_SITE_URL
 *（例如 https://你的域名，勿尾斜杠）。
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export const SEO_KEYWORDS = [
  "即幕",
  "JIMU",
  "gpt-image-2",
  "文生图",
  "图生图",
  "AI 绘图",
  "主视觉",
  "Banner",
  "多模态生图",
] as const;

export const defaultPageTitle = `${SITE_NAME_ZH} ${SITE_NAME_EN} · gpt-image-2 | 文生图 · 图生图`;

export function buildDefaultMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultPageTitle,
      template: `%s · ${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: `${SITE_NAME_ZH} ${SITE_NAME_EN}` }],
    generator: "Next.js",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: siteUrl,
      siteName: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
      title: defaultPageTitle,
      description: DEFAULT_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: defaultPageTitle,
      description: DEFAULT_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "technology",
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
  };
}

export function getWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    alternateName: [SITE_NAME_ZH, SITE_NAME_EN],
    description: DEFAULT_DESCRIPTION,
    inLanguage: "zh-CN",
    url: siteUrl,
  } as const;
}

export function getWebApplicationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    description: SITE_TAGLINE,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    url: siteUrl,
  } as const;
}
