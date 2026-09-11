import type { Metadata } from "next";
import DayPillarExperience from "@/components/day-pillar-experience";
import { getDayPillarCards, type DayPillarLocale } from "@/lib/day-pillar-cards";

type Props = { searchParams?: Promise<{ locale?: string; pillar?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const zh = params?.locale === "zh";
  const title = zh ? "免费日柱意象卡｜60甲子与自我观察 | DestinyPixel" : "Free Day Pillar Card | 60 Bazi Archetypes | DestinyPixel";
  const description = zh ? "用公历生日探索一张免费的日柱意象卡，无需登录。按公历日期、午夜换日初算；补充出生时间和地点后，可在主站校准完整出生图谱。" : "Explore a free symbolic day pillar card from your Gregorian birth date. No login needed. This midnight-based date preview can be calibrated with your birth time and city in a full birth map.";
  const url = zh ? "/day-pillar?locale=zh" : "/day-pillar";
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages: { en: "/day-pillar", "zh-Hans": "/day-pillar?locale=zh", "x-default": "/day-pillar" } },
    openGraph: { title, description, url, type: "website", locale: zh ? "zh_CN" : "en_US", alternateLocale: [zh ? "en_US" : "zh_CN"], images: [{ url: "/archetypes/gui_mao.jpg", width: 896, height: 1200, alt: zh ? "癸卯 · 雨露灵兔" : "Gui Mao · The Dewy Rabbit" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/archetypes/gui_mao.jpg"] },
  };
}

export default async function DayPillarPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale: DayPillarLocale = params?.locale === "zh" ? "zh" : "en";
  const cards = getDayPillarCards(locale);
  const sharedCard = cards.find((card) => card.slug === params?.pillar);
  return <DayPillarExperience key={`${locale}:${sharedCard?.slug ?? "sample"}`} locale={locale} cards={cards} initialPillar={sharedCard?.pillar ?? "癸卯"} isShared={Boolean(sharedCard)} />;
}
