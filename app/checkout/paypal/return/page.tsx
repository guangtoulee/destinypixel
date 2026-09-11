import type { Metadata } from "next";
import PaypalReturnExperience from "./return-experience";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Payment confirmation | DestinyPixel" }, robots: { index: false, follow: false } };

export default async function PaypalReturnPage({ searchParams }: { searchParams?: Promise<{ order?: string; locale?: string }> }) {
  const params = await searchParams;
  const orderId = typeof params?.order === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.order) ? params.order : "";
  return <PaypalReturnExperience key={orderId} orderId={orderId} locale={params?.locale === "zh" ? "zh" : "en"} />;
}
