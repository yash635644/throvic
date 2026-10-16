import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { JsonLd, siteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.founder.name, url: SITE.founder.url }],
  creator: SITE.founder.name,
  publisher: SITE.name,
  category: "education",
  classification: "Education, Reference, Knowledge graph",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: "/", types: { "text/plain": [{ url: "/llms.txt", title: "Throvic for AI assistants (llms.txt)" }] } },
  // Defaults only: every page sets its own title, address and card (lib/share-cards.tsx).
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description, images: ["/og/home.png"] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Icons: app/favicon.ico, app/icon.svg and app/apple-icon.png are added automatically; PNG app icons are in the manifest.
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "black-translucent" },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: SITE.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: page changes jump straight to the top; smooth scrolling stays for in-page links.
    <html lang={SITE.language} className={manrope.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Search suggestions, summaries and photos come from Wikipedia: open those connections early. */}
        <link rel="preconnect" href="https://en.wikipedia.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://upload.wikimedia.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://en.wikipedia.org" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <JsonLd data={siteJsonLd()} />
        {SITE.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
