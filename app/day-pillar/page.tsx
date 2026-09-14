import { getPillarImagePath } from "@/lib/archetype-assets";
import type { Metadata } from "next";
import DayPillarExperience from "@/components/day-pillar-experience";
import { getDayPillarCards, type DayPillarLocale } from "@/lib/day-pillar-cards";

type Props = { searchParams?: Promise<{ locale?: string; pillar?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const zh = params?.locale === "zh";
  const title = zh ? "免费日柱意象卡｜60甲子与自我观察 | DestinyPixel" : "Free Birthday Character Card | DestinyPixel";
  const description = zh ? "输入公历生日，免费探索六十甲子日柱的性格反差、感情模式与事业发力点，找到你的意象卡。无需登录；出生时间和地点可进一步校准图谱。" : "Find your free birthday character and explore personality, relationship patterns and work strengths. Meet the Oceanic Sequoia, Dewy Rabbit and more. No login needed.";
  const url = zh ? "/day-pillar?locale=zh" : "/day-pillar";
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages: { en: "/day-pillar", "zh-Hans": "/day-pillar?locale=zh", "x-default": "/day-pillar" } },
    openGraph: { title, description, url, type: "website", locale: zh ? "zh_CN" : "en_US", alternateLocale: [zh ? "en_US" : "zh_CN"], images: [{ url: getPillarImagePath("癸卯"), width: 1200, height: 1600, alt: zh ? "癸卯 · 雨露灵兔" : "Gui Mao · The Dewy Rabbit" }] },
    twitter: { card: "summary_large_image", title, description, images: [getPillarImagePath("癸卯")] },
  };
}

export default async function DayPillarPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale: DayPillarLocale = params?.locale === "zh" ? "zh" : "en";
  const cards = getDayPillarCards(locale);
  const sharedCard = cards.find((card) => card.slug === params?.pillar);
  return <DayPillarExperience key={`${locale}:${sharedCard?.slug ?? "sample"}`} locale={locale} cards={cards} initialPillar={sharedCard?.pillar ?? "癸卯"} isShared={Boolean(sharedCard)} />;
}
