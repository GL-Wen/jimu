import { getWebApplicationJsonLd, getWebSiteJsonLd } from "@/lib/seo";

export function SeoJsonLd() {
  const data = [getWebSiteJsonLd(), getWebApplicationJsonLd()];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
