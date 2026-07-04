import type { Metadata, Viewport } from "next";
import {
  defaultSeoDescription,
  routeSeo,
  seoKeywordClusters,
  siteName,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: routeSeo.home.title,
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  keywords: seoKeywordClusters,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Lifestyle",
  alternates: {
    canonical: "/",
    languages: {
      en: "/?locale=en",
      zh: "/?locale=zh",
      ru: "/?locale=ru",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: routeSeo.home.title,
    description: defaultSeoDescription,
    siteName,
    locale: "en_US",
    alternateLocale: ["zh_CN", "ru_RU"],
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DestinyPixel multidimensional birth map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: routeSeo.home.title,
    description: defaultSeoDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
