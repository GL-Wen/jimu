import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { buildDefaultMetadata } from "@/lib/seo";

export const metadata: Metadata = buildDefaultMetadata();
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d97706" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <SeoJsonLd />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
