import type { Metadata } from "next";
import {
  SITE_NAME_EN,
  SITE_NAME_ZH,
  SITE_POSITIONING,
  SITE_TAGLINE,
} from "@/lib/brand";

export const DEFAULT_DESCRIPTION = `${SITE_NAME_ZH} ${SITE_NAME_EN} 是面向 gpt-image-2 的 AI 图像工作台，支持文字生图、参考图编辑、多图输入、多尺寸输出和结果继续编辑，用于制作主视觉、Banner、产品图、活动海报和社媒封面。`;

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
  "GPT Image",
  "文生图",
  "图生图",
  "AI 生图",
  "AI 图片生成",
  "AI 图片编辑",
  "AI 绘图",
  "主视觉",
  "Banner",
  "营销素材",
  "社媒配图",
  "产品图",
  "多模态生图",
] as const;

export const defaultPageTitle = `${SITE_NAME_ZH} ${SITE_NAME_EN} - gpt-image-2 文生图与图像编辑工作台`;

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
    appleWebApp: {
      capable: true,
      title: SITE_NAME_ZH,
      statusBarStyle: "default",
    },
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: `${SITE_NAME_ZH} ${SITE_NAME_EN}` }],
    creator: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    publisher: `${SITE_NAME_ZH} ${SITE_NAME_EN}`,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: "/",
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
    description: `${SITE_TAGLINE} ${SITE_POSITIONING}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    url: siteUrl,
    featureList: [
      "AI text-to-image generation",
      "AI image editing",
      "Multi-image reference editing",
      "Aspect ratio presets",
      "Local IndexedDB workspace persistence",
    ],
  } as const;
}
