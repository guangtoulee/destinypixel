import type { Metadata } from "next";
import { normalizeReportLocale } from "@/lib/report-i18n";
import {
  celestialCopy,
  celestialHref,
  celestialAlternates,
} from "@/lib/celestial/copy";
import { calculateNatalChart } from "@/lib/celestial/astrology";
import { cities } from "@/lib/geo/cities";
import { CelestialPageFrame } from "@/components/celestial/page-frame";
import AstrologyExperience from "@/components/celestial/astrology-experience";
type Props = { searchParams?: Promise<{ locale?: string }> };
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en"),
    c = celestialCopy(locale);
  return {
    title: { absolute: c.astroTitle },
    description: c.astroDescription,
    alternates: {
      canonical: celestialHref("/astrology", locale),
      languages: celestialAlternates("/astrology"),
    },
    openGraph: {
      type: "website",
      title: c.astroTitle,
      description: c.astroDescription,
      url: celestialHref("/astrology", locale),
      images: ["/astrology/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: c.astroTitle,
      description: c.astroDescription,
      images: ["/astrology/opengraph-image"],
    },
  };
}
export default async function AstrologyPage({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en"),
    copy = celestialCopy(locale),
    demo = calculateNatalChart({
      name: "",
      gender: "female",
      locale: "en",
      birthDate: "1990-05-15",
      birthTime: "12:00",
      city: cities.find((c) => c.id === "london-uk")!,
    });
  return (
    <CelestialPageFrame kind="astrology" locale={locale}>
      <AstrologyExperience locale={locale} copy={copy} demo={demo} />
    </CelestialPageFrame>
  );
}
