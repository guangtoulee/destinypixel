import { Brain, BriefcaseBusiness, Heart, Sparkles } from "lucide-react";
import type { DayPillarInsight } from "@/lib/day-pillar-insights";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./day-pillar-reading.module.css";

const copy = {
  en: { label: "YOUR CHARACTER, UP CLOSE", personality: "What drives you", career: "Where your skills can shine", love: "How you connect", growth: "A thought to carry with you", note: "A symbolic reading of your day archetype, shared by people with this card. Your full birth map adds time, place and the other three pillars." },
  zh: { label: "先读懂你的一面", personality: "性格底色", career: "事业发力点", love: "亲密关系", growth: "留给自己的成长提醒", note: "这是同日柱共有的象征性解读。完整出生图谱还会结合时间、地点与另外三柱，进一步展开你的个人故事。" },
  "zh-TW": { label: "先讀懂你的一面", personality: "性格底色", career: "事業發力點", love: "親密關係", growth: "留給自己的成長提醒", note: "這是同日柱共有的象徵性解讀。完整出生圖譜還會結合時間、地點與另外三柱，進一步展開你的個人故事。" },
  ru: { label: "ВАШ ОБРАЗ ВБЛИЗИ", personality: "Что вами движет", career: "Где развивать способности", love: "Как вы сближаетесь", growth: "Небольшой шаг", note: "Это символическое прочтение общего образа дня. Полная карта добавляет время, место и остальные три столпа рождения." },
};

export default function DayPillarReading({ insight, locale, growth }: { insight: DayPillarInsight; locale: ReportLocale; growth?: string }) {
  const text = copy[locale];
  return <section className={styles.reading} aria-label={text.label} data-day-pillar-reading lang={locale === "zh-TW" ? "zh-Hant" : locale === "zh" ? "zh-Hans" : locale}>
    <header className={styles.intro}><p className={styles.eyebrow}><Sparkles size={14} aria-hidden="true" />{text.label}</p><h2>{insight.headline}</h2></header>
    <div className={styles.grid}>
      {([{ key: "personality", Icon: Brain }, { key: "career", Icon: BriefcaseBusiness }, { key: "love", Icon: Heart }] as const).map(({ key, Icon }, index) => <article className={styles.topic} key={key} data-topic={key}><div className={styles.topicHeader}><span className={styles.icon}><Icon size={18} aria-hidden="true" /></span><span className={styles.number}>0{index + 1}</span></div><h3>{text[key]}</h3><p>{insight[key]}</p></article>)}
    </div>
    {growth && <div className={styles.growth}><span>{text.growth}</span><p>{growth}</p></div>}
    <p className={styles.note}>{text.note}</p>
  </section>;
}
