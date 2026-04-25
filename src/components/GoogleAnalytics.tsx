import Script from "next/script";

const GA_ID = "G-M1DZK79HST";

/**
 * 生产环境注入 Google Analytics (gtag)。开发环境不加载，避免污染报表。
 */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
