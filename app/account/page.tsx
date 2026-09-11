import type { Metadata } from "next";
import AccountExperience from "@/components/account-experience";
import { safeAccountReturnTo } from "./return-to";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Your account | DestinyPixel" },
  description: "Manage your DestinyPixel reports and purchases.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account" },
};

export default async function AccountPage({ searchParams }: {
  searchParams?: Promise<{ locale?: string; returnTo?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const locale = params?.locale === "zh" ? "zh" : "en";
  return <AccountExperience key={locale} locale={locale} returnTo={safeAccountReturnTo(params?.returnTo, locale)} initialResetToken={typeof params?.reset === "string" ? params.reset.slice(0, 512) : ""} />;
}
