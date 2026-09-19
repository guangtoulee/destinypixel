import Image from "next/image";
import { ArrowRight, Flower2, Heart, Landmark, ShieldCheck, Sun, type LucideIcon } from "lucide-react";
import { contentLocale, type ReportLocale } from "@/lib/report-i18n";
import type { StickType } from "@/lib/sticks/catalog";
import styles from "./oracle-sanctuary.module.css";

export const oracleSymbols: Record<StickType, LucideIcon> = {
  guanyin: Flower2, guandi: ShieldCheck, yuelao: Heart, wealth: Landmark, huangdaxian: Sun,
};

export function OracleStage({ name, caption, drawing = false, number, level, count = 100, compact = false, readLabel }: {
  name: string; caption: string; drawing?: boolean; number?: number; level?: string; count?: number; compact?: boolean; readLabel?: string;
}) {
  return <div id={compact ? undefined : "oracle-vessel"} className={styles.stage} data-drawing={drawing} data-compact={compact} data-revealed={Boolean(number)}>
    <div className={styles.stageHalo} aria-hidden="true" />
    <div className={styles.stageArch} aria-hidden="true" />
    <div className={styles.stageTop}><span>{name}</span><span>{!compact && String(count).padStart(3, "0")} <i>✦</i></span></div>
    <div className={styles.stageArtwork}>
      <Image src="/shrine/oracle-vessel-20260917.webp" alt="" width={960} height={1280} sizes="(max-width: 640px) 245px, 330px" className={styles.vessel} />
      {number && <div className={styles.revealSlip} aria-hidden="true"><small>{name}</small><strong>{String(number).padStart(2, "0")}</strong><em>{level}</em><span>✦</span></div>}
    </div>
    <p className={styles.stageCaption} role="status">{caption}</p>
    {number && readLabel && <a className={styles.stageReadLink} href="#oracle-reading">{readLabel}<ArrowRight size={14} aria-hidden="true" /></a>}
    <span className={styles.stageCorner} aria-hidden="true">✦</span>
  </div>;
}

const homeCopy = {
  en: { kicker: "THE ORACLE SANCTUARY", title: "A quiet moment. A question. A sign.", lead: "Settle your thoughts and draw a bamboo stick. Explore its verse, meaning, and a new perspective on what’s on your mind.", stage: "One question at a time", caption: "Pause. Breathe. Let your question settle.", label: "MAKE SPACE FOR CLARITY", invitation: "What’s on your mind?", body: "A decision, a relationship, a new beginning. Choose the tradition that speaks to your question.", enter: "Draw your first stick", steps: ["Choose a tradition", "Hold a question", "Read your sign"], names: ["Guanyin", "Guandi", "Yuelao", "Wealth Gods", "Wong Tai Sin"], domains: ["Peace & family", "Work & decisions", "Love & connection", "Money & business", "Timing & change"] },
  zh: { kicker: "一念一签 · 求签小殿", title: "把心事放慢，让一支签轻轻回应。", lead: "静下心，想一件挂念的事。从签文与解读里，找一个重新看待它的角度。", stage: "心有所问 · 签有所应", caption: "静心片刻，只为心中这一问。", label: "此刻，你想问些什么？", invitation: "所念之事，慢慢有回响。", body: "是一个决定，一段关系，还是一场新的开始？选择与你心事相合的签，读签诗，也读懂自己的心。", enter: "入殿求一签", steps: ["选择签系", "默念心事", "抽签解意"], names: ["观音灵签", "关帝灵签", "月老灵签", "五路财神", "黄大仙签"], domains: ["平安 · 家宅", "事业 · 决断", "姻缘 · 相伴", "财运 · 生意", "时机 · 转折"] },
  "zh-TW": { kicker: "一念一籤 · 求籤小殿", title: "把心事放慢，讓一支籤輕輕回應。", lead: "靜下心，想一件掛念的事。從籤文與解讀裡，找一個重新看待它的角度。", stage: "心有所問 · 籤有所應", caption: "靜心片刻，只為心中這一問。", label: "此刻，你想問些什麼？", invitation: "所念之事，慢慢有回響。", body: "是一個決定，一段關係，還是一場新的開始？選擇與你心事相合的籤，讀籤詩，也讀懂自己的心。", enter: "入殿求一籤", steps: ["選擇籤系", "默念心事", "抽籤解意"], names: ["觀音靈籤", "關帝靈籤", "月老靈籤", "五路財神", "黃大仙籤"], domains: ["平安 · 家宅", "事業 · 決斷", "姻緣 · 相伴", "財運 · 生意", "時機 · 轉折"] },
  ru: { kicker: "ХРАМ ЖРЕБИЕВ", title: "Момент тишины. Вопрос. Знак.", lead: "Соберитесь с мыслями и вытяните бамбуковый жребий. Его стих и толкование помогут взглянуть на вопрос по-новому.", stage: "Один вопрос за раз", caption: "Остановитесь. Вдохните. Подумайте о важном.", label: "ПРОСТРАНСТВО ДЛЯ ЯСНОСТИ", invitation: "Что у вас на душе?", body: "Решение, отношения или новое начало. Выберите традицию, созвучную вашему вопросу.", enter: "Вытянуть жребий", steps: ["Выберите традицию", "Задайте вопрос", "Прочтите знак"], names: ["Гуаньинь", "Гуаньди", "Юэлао", "Боги богатства", "Вонг Тай Син"], domains: ["Покой и семья", "Работа и решения", "Любовь и близость", "Деньги и бизнес", "Время перемен"] },
};
const types: StickType[] = ["guanyin", "guandi", "yuelao", "wealth", "huangdaxian"];

export function OracleHome({ locale }: { locale: ReportLocale }) {
  const text = homeCopy[locale] ?? homeCopy[contentLocale(locale)];
  return <section className={styles.home} id="sticks">
    <div className={styles.container}>
      <div className={styles.homeHeading}><p className={styles.eyebrow}>{text.kicker}</p><h2>{text.title}</h2><p>{text.lead}</p></div>
      <div className={styles.homeSanctuary}>
        <OracleStage name={text.stage} caption={text.caption} compact />
        <div className={styles.homeInvitation}><p className={styles.eyebrow}>{text.label}</p><h3>{text.invitation}</h3><p>{text.body}</p><ol className={styles.steps}>{text.steps.map((step, i) => <li key={step}><span>0{i + 1}</span>{step}</li>)}</ol><a className={styles.primary} href={`/sticks?locale=${locale}`}>{text.enter}<ArrowRight size={18} /></a></div>
      </div>
      <div className={styles.homeTraditions}>{types.map((type, i) => { const Icon = oracleSymbols[type]; return <a key={type} href={`/sticks?type=${type}&locale=${locale}`} data-tradition={type}><span className={styles.symbol}><Icon size={23} strokeWidth={1.35} /></span><span><strong>{text.names[i]}</strong><small>{text.domains[i]}</small></span><ArrowRight className={styles.traditionArrow} size={15} /></a>; })}</div>
    </div>
  </section>;
}
