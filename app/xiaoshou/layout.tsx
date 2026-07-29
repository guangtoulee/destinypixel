import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./sales.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const pageUrl = `${protocol}://${host}/xiaoshou`;
  const socialImage = `${protocol}://${host}/xiaoshou/sales-og.png`;

  return {
    title: "PACKOM 销售通｜中英双语销售执行系统",
    description: "面向中国市场的中英双语门店、拜访、订单与销售活动移动执行系统。",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "PACKOM 销售通",
    },
    openGraph: {
      title: "PACKOM 销售通｜中英双语销售执行系统",
      description: "门店、计划、签到、陈列、订单和复盘一体化的中英双语移动销售执行系统。",
      type: "website",
      locale: "zh_CN",
      url: pageUrl,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "PACKOM 销售通中国销售执行系统",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "PACKOM 销售通｜中英双语销售执行系统",
      description: "门店、计划、签到、陈列、订单和复盘一体化的中英双语移动销售执行系统。",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#10283f",
};

export default function SalesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
