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
    title: "PACKOM Sales OS｜销售执行与公司管理系统",
    description: "PACKOM 中国销售人员与公司管理端：账户审批、客户、拜访、订单、团队目标与经营数据一体化。",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "PACKOM Sales OS",
    },
    openGraph: {
      title: "PACKOM Sales OS｜正式销售管理系统",
      description: "注册登录、角色权限、客户、定位拜访、订单审核和团队经营数据一体化。",
      type: "website",
      locale: "zh_CN",
      url: pageUrl,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "PACKOM Sales OS 中国销售执行与公司管理系统",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "PACKOM Sales OS｜正式销售管理系统",
      description: "注册登录、角色权限、客户、定位拜访、订单审核和团队经营数据一体化。",
      images: [socialImage],
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
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
