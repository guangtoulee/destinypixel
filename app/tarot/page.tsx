import type { Metadata } from "next";
import { normalizeReportLocale } from "@/lib/report-i18n";
import {
  celestialCopy,
  celestialHref,
  celestialAlternates,
} from "@/lib/celestial/copy";
import { tarotCards } from "@/lib/celestial/tarot-meanings";
import { CelestialPageFrame } from "@/components/celestial/page-frame";
import TarotExperience from "@/components/celestial/tarot-experience";
type Props = { searchParams?: Promise<{ locale?: string }> };
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en"),
    c = celestialCopy(locale);
  return {
    title: { absolute: c.tarotTitle },
    description: c.tarotDescription,
    alternates: {
      canonical: celestialHref("/tarot", locale),
      languages: celestialAlternates("/tarot"),
    },
    openGraph: {
      type: "website",
      title: c.tarotTitle,
      description: c.tarotDescription,
      url: celestialHref("/tarot", locale),
      images: ["/tarot/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: c.tarotTitle,
      description: c.tarotDescription,
      images: ["/tarot/opengraph-image"],
    },
  };
}
export default async function TarotPage({ searchParams }: Props) {
  const locale = normalizeReportLocale((await searchParams)?.locale || "en");
  return (
    <CelestialPageFrame kind="tarot" locale={locale}>
      <TarotExperience
        locale={locale}
        copy={celestialCopy(locale)}
        cards={tarotCards(locale)}
      />
    </CelestialPageFrame>
  );
}
