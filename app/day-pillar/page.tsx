import type { Metadata } from "next";
import DayPillarExperience from "@/components/day-pillar-experience";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getDayPillarCards, type DayPillarLocale } from "@/lib/day-pillar-cards";

type Props = { searchParams?: Promise<{ locale?: string; pillar?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const zh = params?.locale === "zh";
  const locale: DayPillarLocale = zh ? "zh" : "en";
  const cards = getDayPillarCards(locale);
  const sharedCard = params?.pillar ? cards.find(card => card.slug === params.pillar) : undefined;

  const baseTitle = zh
    ? "免费日柱意象卡｜60甲子与自我观察 | DestinyPixel"
    : "Free Birthday Character Card | DestinyPixel";
  const title = sharedCard
    ? `${sharedCard.pillar} · ${sharedCard.name} | DestinyPixel`
    : baseTitle;
  const baseDescription = zh
    ? "输入公历生日，免费探索六十甲子日柱的性格反差、感情模式与事业发力点，找到你的意象卡。无需登录；出生时间和地点可进一步校准图谱。"
    : "Find your free birthday character and explore personality, relationship patterns and work strengths. Meet the Oceanic Sequoia, Dewy Rabbit and more. No login needed.";
  const description = sharedCard
    ? `${sharedCard.essence.slice(0, 145)}…`
    : baseDescription;
  const canonicalUrl = zh ? "/day-pillar?locale=zh" : "/day-pillar";
  const shareUrl = sharedCard
    ? `${canonicalUrl}${zh ? "&" : "?"}pillar=${sharedCard.slug}`
    : canonicalUrl;
  const imageUrl = sharedCard ? sharedCard.image : getPillarImagePath("癸卯");
  const imageAlt = sharedCard
    ? `${sharedCard.pillar} · ${sharedCard.name}`
    : zh
      ? "癸卯 · 雨露灵兔"
      : "Gui Mao · The Dewy Rabbit";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: "/day-pillar",
        "zh-Hans": "/day-pillar?locale=zh",
        "x-default": "/day-pillar",
      },
    },
    openGraph: {
      title,
      description,
      url: shareUrl,
      type: "website",
      locale: zh ? "zh_CN" : "en_US",
      alternateLocale: [zh ? "en_US" : "zh_CN"],
      images: [{ url: imageUrl, width: 1200, height: 1600, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DayPillarPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale: DayPillarLocale = params?.locale === "zh" ? "zh" : "en";
  const cards = getDayPillarCards(locale);
  const sharedCard = cards.find(card => card.slug === params?.pillar);
  return (
    <DayPillarExperience
      key={`${locale}:${sharedCard?.slug ?? "sample"}`}
      locale={locale}
      cards={cards}
      initialPillar={sharedCard?.pillar ?? "癸卯"}
      isShared={Boolean(sharedCard)}
    />
  );
}
