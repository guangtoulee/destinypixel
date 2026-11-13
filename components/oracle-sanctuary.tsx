import Image from "next/image";
import {
  ArrowRight,
  Flower2,
  Heart,
  Landmark,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { contentLocale, type ReportLocale } from "@/lib/report-i18n";
import type { StickType } from "@/lib/sticks/catalog";
import styles from "./oracle-sanctuary.module.css";

export const oracleSymbols: Record<StickType, LucideIcon> = {
  guanyin: Flower2,
  guandi: ShieldCheck,
  yuelao: Heart,
  wealth: Landmark,
  huangdaxian: Sun,
};

function IncenseSmokeSvg() {
  return (
    <svg
      className={styles.incenseSmoke}
      viewBox="0 0 140 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sticks-incense-a" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#8CA395" stopOpacity="0" />
          <stop offset="35%" stopColor="#8CA395" stopOpacity="0.42" />
          <stop offset="80%" stopColor="#B99C6B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#B99C6B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className={styles.smokeWispA}
        d="M68 188 C 52 156, 86 128, 64 94 C 46 66, 82 38, 66 10"
        stroke="url(#sticks-incense-a)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        className={styles.smokeWispB}
        d="M82 192 C 98 162, 66 132, 86 98 C 102 70, 72 42, 84 14"
        stroke="url(#sticks-incense-a)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function JiaobeiMoonblocks({ revealed, drawing }: { revealed: boolean; drawing: boolean }) {
  return (
    <div
      className={styles.jiaobei}
      data-revealed={revealed}
      data-drawing={drawing}
      aria-hidden="true"
    >
      <svg viewBox="0 0 76 44" fill="none" focusable="false">
        {/* Yang flat-up crescent block */}
        <path
          d="M 8 28 C 12 10, 32 8, 37 22 C 29 20, 18 22, 8 28 Z"
          fill="#9E4238"
          stroke="#C89B62"
          strokeWidth="1.1"
        />
        <path
          d="M 11 26 C 16 15, 29 14, 34 21"
          stroke="#F4DEC0"
          strokeWidth="0.9"
          strokeOpacity="0.65"
          strokeLinecap="round"
        />
        {/* Yin rounded-up crescent block (Shengbei confirmation pair) */}
        <path
          d="M 39 24 C 46 11, 65 13, 69 31 C 58 26, 47 25, 39 24 Z"
          fill="#84332A"
          stroke="#C89B62"
          strokeWidth="1.1"
        />
        <path
          d="M 43 23 C 50 16, 61 18, 65 28"
          stroke="#E5B98A"
          strokeWidth="0.8"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function OracleStage({
  name,
  caption,
  drawing = false,
  number,
  level,
  count = 100,
  compact = false,
  readLabel,
}: {
  name: string;
  caption: string;
  drawing?: boolean;
  number?: number;
  level?: string;
  count?: number;
  compact?: boolean;
  readLabel?: string;
}) {
  return (
    <div
      id={compact ? undefined : "oracle-vessel"}
      className={styles.stage}
      data-drawing={drawing}
      data-compact={compact}
      data-revealed={Boolean(number)}
    >
      <div className={styles.stageHalo} aria-hidden="true" />
      <div className={styles.stageJadeRing} aria-hidden="true" />
      <div className={styles.stageArch} aria-hidden="true" />
      <IncenseSmokeSvg />

      <div className={styles.stageTop}>
        <span>{name}</span>
        <span>
          {!compact && String(count).padStart(3, "0")} <i>✦</i>
        </span>
      </div>

      <div className={styles.stageArtwork}>
        <Image
          src="/shrine/oracle-vessel-20260917.webp"
          alt=""
          width={960}
          height={1280}
          sizes="(max-width: 640px) 180px, 310px"
          className={styles.vessel}
        />
        <JiaobeiMoonblocks revealed={Boolean(number)} drawing={drawing} />
        {number && (
          <div className={styles.revealSlip} aria-hidden="true">
            <small>{name}</small>
            <strong>{String(number).padStart(2, "0")}</strong>
            <em>{level}</em>
            <span>✦</span>
          </div>
        )}
      </div>

      <p className={styles.stageCaption} role="status">
        {caption}
      </p>
      {number && readLabel && (
        <a className={styles.stageReadLink} href="#oracle-reading">
          {readLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      )}
      <span className={styles.stageCorner} aria-hidden="true">
        ✦
      </span>
    </div>
  );
}

const homeCopy = {
  en: {
    kicker: "THE ORACLE SANCTUARY",
    title: "A quiet moment. A question. A sign.",
    lead: "When you keep circling the same question, pause with a Chinese fortune-stick ritual. Read a verse and its meaning, and notice what it brings to mind about your situation.",
    stage: "One question at a time",
    caption: "Pause. Breathe. Let your question settle.",
    label: "MAKE SPACE FOR CLARITY",
    invitation: "What’s on your mind?",
    body: "Try a specific question: “What am I overlooking in this decision?” You will receive a randomly selected stick and its reading, with optional AI interpretation. No birth details needed.",
    enter: "Draw your first stick",
    steps: ["Choose a tradition", "Hold a question", "Read your sign"],
    names: ["Guanyin", "Guandi", "Yuelao", "Wealth Gods", "Wong Tai Sin"],
    domains: [
      "Peace & family",
      "Work & decisions",
      "Love & connection",
      "Money & business",
      "Timing & change",
    ],
  },
  zh: {
    kicker: "一念一签 · 求签小殿",
    title: "把心事放慢，让一支签轻轻回应。",
    lead: "当一件事在心里绕了很久，不妨先慢下来。带着问题求一支签，读签文与解意，也留意自己被哪句话触动。",
    stage: "心有所问 · 签有所应",
    caption: "静心片刻，只为心中这一问。",
    label: "此刻，你想问些什么？",
    invitation: "所念之事，慢慢有回响。",
    body: "比如：“这个决定里，有什么是我还没看见的？”选一处签堂，随机抽取一支签，查看签文与解读，也可选择 AI 解签。不需要出生资料。",
    enter: "入殿求一签",
    steps: ["选择签系", "默念心事", "抽签解意"],
    names: ["观音灵签", "关帝灵签", "月老灵签", "五路财神", "黄大仙签"],
    domains: ["平安 · 家宅", "事业 · 决断", "姻缘 · 相伴", "财运 · 生意", "时机 · 转折"],
  },
  "zh-TW": {
    kicker: "一念一籤 · 求籤小殿",
    title: "把心事放慢，讓一支籤輕輕回應。",
    lead: "當一件事在心裡繞了很久，不妨先慢下來。帶著問題求一支籤，讀籤文與解意，也留意自己被哪句話觸動。",
    stage: "心有所問 · 籤有所應",
    caption: "靜心片刻，只為心中這一問。",
    label: "此刻，你想問些什麼？",
    invitation: "所念之事，慢慢有回響。",
    body: "比如：「這個決定裡，有什麼是我還沒看見的？」選一處籤堂，隨機抽取一支籤，查看籤文與解讀，也可選擇 AI 解籤。不需要出生資料。",
    enter: "入殿求一籤",
    steps: ["選擇籤系", "默念心事", "抽籤解意"],
    names: ["觀音靈籤", "關帝靈籤", "月老靈籤", "五路財神", "黃大仙籤"],
    domains: ["平安 · 家宅", "事業 · 決斷", "姻緣 · 相伴", "財運 · 生意", "時機 · 转折".replace("转", "轉")],
  },
  ru: {
    kicker: "ХРАМ ЖРЕБИЕВ",
    title: "Момент тишины. Вопрос. Знак.",
    lead: "Если мысли снова возвращаются к одному вопросу, сделайте паузу с китайским храмовым жребием. Прочтите текст и толкование, замечая, что они напоминают о вашей ситуации.",
    stage: "Один вопрос за раз",
    caption: "Остановитесь. Вдохните. Подумайте о важном.",
    label: "ПРОСТРАНСТВО ДЛЯ ЯСНОСТИ",
    invitation: "Что у вас на душе?",
    body: "Например: «Что я упускаю в этом решении?» Вы получите случайно выбранный жребий и толкование; разбор ИИ доступен по желанию. Данные рождения не нужны.",
    enter: "Вытянуть жребий",
    steps: ["Выберите традицию", "Задайте вопрос", "Прочтите знак"],
    names: ["Гуаньинь", "Гуаньди", "Юэлао", "Боги богатства", "Вонг Тай Син"],
    domains: [
      "Покой и семья",
      "Работа и решения",
      "Любовь и близость",
      "Деньги и бизнес",
      "Время перемен",
    ],
  },
};

const types: StickType[] = ["guanyin", "guandi", "yuelao", "wealth", "huangdaxian"];

export function OracleHome({ locale }: { locale: ReportLocale }) {
  const text = homeCopy[locale] ?? homeCopy[contentLocale(locale)];
  return (
    <section className={styles.home} id="sticks">
      <div className={styles.container}>
        <div className={styles.homeHeading}>
          <p className={styles.eyebrow}>{text.kicker}</p>
          <h2>{text.title}</h2>
          <p>{text.lead}</p>
        </div>
        <div className={styles.homeSanctuary}>
          <OracleStage name={text.stage} caption={text.caption} compact />
          <div className={styles.homeInvitation}>
            <p className={styles.eyebrow}>{text.label}</p>
            <h3>{text.invitation}</h3>
            <p>{text.body}</p>
            <ol className={styles.steps}>
              {text.steps.map((step, i) => (
                <li key={step}>
                  <span>0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <a className={styles.primary} href={`/sticks?locale=${locale}`}>
              {text.enter}
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className={styles.homeTraditions}>
          {types.map((type, i) => {
            const Icon = oracleSymbols[type];
            return (
              <a key={type} href={`/sticks?type=${type}&locale=${locale}`} data-tradition={type}>
                <span className={styles.symbol}>
                  <Icon size={23} strokeWidth={1.35} />
                </span>
                <span>
                  <strong>{text.names[i]}</strong>
                  <small>{text.domains[i]}</small>
                </span>
                <ArrowRight className={styles.traditionArrow} size={15} />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
