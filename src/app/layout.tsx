import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "即幕 JIMU · gpt-image-2 | 文生图 · 图生图",
  description:
    "即幕 JIMU 基于 gpt-image-2：将文字与参考图转为可商用的主视觉与 Banner，秒级出图、自然语言编辑。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
