"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { OracleStage, oracleSymbols } from "./oracle-sanctuary";
import styles from "./oracle-sanctuary.module.css";
import { journalLanguageTags, toTraditional } from "@/lib/journal-locales";
import { trackToolEvent } from "@/lib/analytics";
import { ArrowRight, Languages, Loader2, Search, WandSparkles } from "lucide-react";
import {
  contentLocale,
  reportLanguageOptions,
  type ContentLocale,
  type ReportLocale,
} from "@/lib/report-i18n";
import {
  getStickSign,
  stickTypeOrder,
  type StickSign,
  type StickType,
} from "@/lib/sticks/catalog";

type StickCopy = {
  navHome: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  questionLabel: string;
  questionPlaceholder: string;
  topicLabel: string;
  draw: string;
  redraw: string;
  drawing: string;
  ritualIdle: string;
  reveal: string;
  lookupTitle: string;
  lookupLabel: string;
  lookupAction: string;
  sourceLabel: string;
  poemLabel: string;
  plainLabel: string;
  aiTitle: string;
  aiAction: string;
  aiLoading: string;
  aiEmpty: string;
  result: string;
  adviceLabel: string;
  empty: string;
  topics: string[];
  levels: string[];
  titles: string[];
  bodies: string[];
  advice: string[];
};

const stickTypes = stickTypeOrder;
const defaultTopicIndex: Record<StickType, number> = { guanyin: 3, guandi: 0, yuelao: 1, wealth: 2, huangdaxian: 4 };

const systems: Record<
  ContentLocale,
  Record<
    StickType,
    {
      name: string;
      subtitle: string;
      count: number;
      body: string;
      domains: string[];
    }
  >
> = {
  en: {
    guanyin: {
      name: "Guanyin Sticks",
      subtitle: "100-stick compassion oracle",
      count: 100,
      body: "For protection, family, health recovery, travel, and emotionally tangled questions.",
      domains: ["Protection", "Family", "Recovery"],
    },
    guandi: {
      name: "Guandi Sticks",
      subtitle: "100-stick career oracle",
      count: 100,
      body: "For work, authority, contracts, exams, reputation, and moments that need a firm decision.",
      domains: ["Career", "Contracts", "Reputation"],
    },
    yuelao: {
      name: "Yuelao Sticks",
      subtitle: "60-stick love oracle",
      count: 60,
      body: "For love timing, dating, reconciliation, attachment, marriage, and emotional distance.",
      domains: ["Love", "Timing", "Marriage"],
    },
    wealth: {
      name: "Five Wealth Gods",
      subtitle: "60-stick money oracle",
      count: 60,
      body: "For money flow, business direction, side income, spending discipline, and opportunity.",
      domains: ["Wealth", "Business", "Discipline"],
    },
    huangdaxian: {
      name: "Wong Tai Sin Sticks",
      subtitle: "100-stick timing oracle",
      count: 100,
      body: "For timing, turning points, public affairs, travel, exams, and questions that need a practical omen.",
      domains: ["Timing", "Turning point", "Omen"],
    },
  },
  zh: {
    guanyin: {
      name: "观音灵签",
      subtitle: "百签慈悲系",
      count: 100,
      body: "适合问平安、家宅、身体恢复、出行、关系缓和与整体方向。",
      domains: ["平安", "家宅", "恢复"],
    },
    guandi: {
      name: "关帝灵签",
      subtitle: "百签事业系",
      count: 100,
      body: "适合问事业、官运、考试、合同、名誉和需要立刻决断的事情。",
      domains: ["事业", "合同", "名誉"],
    },
    yuelao: {
      name: "月老灵签",
      subtitle: "六十签姻缘系",
      count: 60,
      body: "适合问暧昧、复合、婚恋时机、关系走向与彼此距离。",
      domains: ["姻缘", "复合", "婚恋"],
    },
    wealth: {
      name: "五路财神灵签",
      subtitle: "六十签财运系",
      count: 60,
      body: "适合问财运、现金流、生意机会、副业、消费节制与守财能力。",
      domains: ["财运", "生意", "守财"],
    },
    huangdaxian: {
      name: "黄大仙灵签",
      subtitle: "百签时机系",
      count: 100,
      body: "适合问时机、转折、考试、出行、公众事务和需要看趋势的事情。",
      domains: ["时机", "转折", "趋势"],
    },
  },
  ru: {
    guanyin: {
      name: "Жребии Гуаньинь",
      subtitle: "100 жребиев сострадания",
      count: 100,
      body: "Для защиты, семьи, восстановления, дороги и эмоционально запутанных вопросов.",
      domains: ["Защита", "Семья", "Восстановление"],
    },
    guandi: {
      name: "Жребии Гуаньди",
      subtitle: "100 жребиев карьеры",
      count: 100,
      body: "Для работы, власти, договоров, экзаменов, репутации и твердых решений.",
      domains: ["Карьера", "Договоры", "Репутация"],
    },
    yuelao: {
      name: "Жребии Юэлао",
      subtitle: "60 жребиев любви",
      count: 60,
      body: "Для любви, свиданий, примирения, брака, привязанности и эмоциональной дистанции.",
      domains: ["Любовь", "Сроки", "Брак"],
    },
    wealth: {
      name: "Пять богов богатства",
      subtitle: "60 жребиев денег",
      count: 60,
      body: "Для денежного потока, бизнеса, дополнительного дохода, дисциплины и возможностей.",
      domains: ["Деньги", "Бизнес", "Дисциплина"],
    },
    huangdaxian: {
      name: "Жребии Вонг Тай Сина",
      subtitle: "100 жребиев времени",
      count: 100,
      body: "Для сроков, поворотных моментов, дороги, экзаменов и практических предзнаменований.",
      domains: ["Сроки", "Поворот", "Знак"],
    },
  },
};

const copy: Record<ContentLocale, StickCopy> = {
  en: {
    navHome: "Home",
    heroEyebrow: "Free Chinese fortune sticks · Kau Cim online",
    heroTitle: "A quiet moment for your question.",
    heroLead:
      "A relationship, a difficult choice, a change at work. Bring one question to this Chinese fortune-stick ritual, read the selected verse and its meaning, then consider what deserves your attention. AI interpretation is optional.",
    questionLabel: "Your question",
    questionPlaceholder: "Write one clear question. Example: Should I accept this offer?",
    topicLabel: "Topic",
    draw: "Draw my stick",
    redraw: "Draw again",
    drawing: "Shaking the oracle cup...",
    ritualIdle: "Focus on one question, then draw one stick.",
    reveal: "The stick has landed.",
    lookupTitle: "Already drew offline?",
    lookupLabel: "Stick number",
    lookupAction: "Find this stick",
    sourceLabel: "Source note",
    poemLabel: "Sign text",
    plainLabel: "Plain reading",
    aiTitle: "AI interpretation",
    aiAction: "Interpret with my question",
    aiLoading: "Reading the sign with DeepSeek...",
    aiEmpty: "Explore how this sign relates to your question, with a personalized interpretation.",
    result: "Your stick",
    adviceLabel: "Practical advice",
    empty: "Keep the question concrete. One stick works best for one issue.",
    topics: ["Career", "Love", "Money", "Family", "Timing", "Wellbeing"],
    levels: ["Great Blessing", "Good", "Steady", "Blocked", "Wait"],
    titles: [
      "A door opens, but only if you move cleanly.",
      "The sign favors patience and a smaller first step.",
      "There is help nearby, but pride can block it.",
      "The timing is not wrong; the method needs correction.",
      "Do not chase the loud answer. Watch what repeats.",
    ],
    bodies: [
      "This sign points to movement after a pause. You may already know the answer, but you still need a cleaner plan and fewer emotional reactions.",
      "The matter can improve, yet it asks for restraint. If you force the outcome too early, you may spend energy proving something that could resolve with time.",
      "The useful person, message, or opening is not far away. Your task is to show enough sincerity and enough structure that help can land.",
      "The difficulty is real, but not fatal. A weak part of the plan is asking to be repaired before the next move.",
      "This is a sign of observation. Wait for one more piece of evidence before committing your money, heart, or reputation.",
    ],
    advice: [
      "Write the next action in one sentence and do it within 48 hours.",
      "Delay the irreversible part, but keep gathering facts.",
      "Ask directly for the support or answer you need.",
      "Fix the weakest link before expanding the plan.",
      "Do less, watch more, and let the pattern reveal itself.",
    ],
  },
  zh: {
    navHome: "返回首页",
    heroEyebrow: "免费在线抽签 · 求签小殿",
    heroTitle: "静心一刻，为心事求一签。",
    heroLead:
      "一段关系、一个难下的决定，或工作里的变化。带着一件具体的心事，静心求签，读签文与解意，再想想此刻值得留意的是什么。也可选择 AI 结合问题进一步解读。",
    questionLabel: "你想问的事",
    questionPlaceholder: "写一个具体问题，例如：这个合作要不要继续推进？",
    topicLabel: "问题类型",
    draw: "开始求签",
    redraw: "再求一签",
    drawing: "签筒正在摇动...",
    ritualIdle: "心里只留一个问题，然后抽一支签。",
    reveal: "这一支签已经落下。",
    lookupTitle: "线下已经抽到签？",
    lookupLabel: "签号",
    lookupAction: "查这支签",
    sourceLabel: "签文来源",
    poemLabel: "本签签文",
    plainLabel: "白话签意",
    aiTitle: "AI 合参解读",
    aiAction: "结合问题解读",
    aiLoading: "正在结合签文和问题解读...",
    aiEmpty: "让这支签与你的心事相连，结合具体问题，读出更贴近当下的启发。",
    result: "你的签",
    adviceLabel: "行动建议",
    empty: "问题越具体，签意越有用。一支签最好只问一件事。",
    topics: ["事业", "姻缘", "财运", "家宅", "时机", "健康"],
    levels: ["上上", "上吉", "中吉", "中平", "小阻"],
    titles: [
      "门已开，但要干净利落地动。",
      "宜缓不宜急，先走小步。",
      "贵人不远，姿态要放低。",
      "不是不成，是方法要修。",
      "别追响动，先看重复出现的信号。",
    ],
    bodies: [
      "这支签的气象偏向先停后动。你其实已经摸到答案，但还缺一个更清楚的计划，也需要少一点情绪化反应。",
      "事情不是没有转机，只是不能硬推。越急越容易把本来能成的局面推乱，先把不可逆的动作往后放。",
      "有用的人、消息或机会离你并不远。关键在于你要把诚意和结构拿出来，让别人知道该怎么帮你。",
      "眼前的阻力是真的，但不是死局。它更像是在提醒你：方案里最薄的那一环，需要先补上再继续扩大。",
      "这是一支观察签。现在不要急着投入钱、感情或名誉，再等一个证据，局势会自己露出真实方向。",
    ],
    advice: [
      "把下一步行动写成一句话，并在 48 小时内完成。",
      "不可逆的决定先缓一缓，但继续收集事实。",
      "直接开口问你需要的支持或答案。",
      "先修补计划里最薄弱的一环，再谈扩张。",
      "少做一点，多观察一点，让模式自己浮出来。",
    ],
  },
  ru: {
    navHome: "На главную",
    heroEyebrow: "Храмовые жребии · Один вопрос · Один знак",
    heroTitle: "Момент тишины для вашего вопроса.",
    heroLead:
      "Отношения, сложный выбор или перемены на работе. Задайте один конкретный вопрос, вытяните китайский храмовый жребий и прочтите его толкование. Подумайте, что заслуживает внимания; при желании добавьте разбор ИИ.",
    questionLabel: "Ваш вопрос",
    questionPlaceholder: "Напишите один конкретный вопрос. Например: стоит ли принимать это предложение?",
    topicLabel: "Тема",
    draw: "Вытянуть жребий",
    redraw: "Вытянуть снова",
    drawing: "Чаша со жребиями движется...",
    ritualIdle: "Удержите один вопрос и вытяните один жребий.",
    reveal: "Жребий выпал.",
    lookupTitle: "Уже вытянули офлайн?",
    lookupLabel: "Номер жребия",
    lookupAction: "Найти жребий",
    sourceLabel: "Источник",
    poemLabel: "Текст жребия",
    plainLabel: "Простое толкование",
    aiTitle: "AI-толкование",
    aiAction: "Толковать мой вопрос",
    aiLoading: "DeepSeek читает знак...",
    aiEmpty: "Узнайте, как этот знак связан с вашим вопросом, в персональном толковании.",
    result: "Ваш жребий",
    adviceLabel: "Практический совет",
    empty: "Чем конкретнее вопрос, тем полезнее знак. Один жребий лучше работает для одного вопроса.",
    topics: ["Карьера", "Любовь", "Деньги", "Семья", "Сроки", "Здоровье"],
    levels: ["Большая удача", "Хорошо", "Ровно", "Препятствие", "Ждать"],
    titles: [
      "Дверь открыта, если действовать чисто.",
      "Знак просит терпения и малого шага.",
      "Помощь рядом, но гордость мешает.",
      "Время не плохое, метод требует правки.",
      "Не гонитесь за громким ответом. Смотрите, что повторяется.",
    ],
    bodies: [
      "Знак указывает на движение после паузы. Ответ уже чувствуется, но нужен более чистый план и меньше эмоциональной реакции.",
      "Ситуация может улучшиться, если не давить. Слишком раннее усилие может потратить силы на то, что решится временем.",
      "Полезный человек, сообщение или возможность недалеко. Нужны искренность и структура, чтобы помощь смогла прийти.",
      "Трудность реальна, но не окончательна. Слабое место плана просит ремонта перед следующим шагом.",
      "Это знак наблюдения. Подождите еще один факт перед тем, как вкладывать деньги, сердце или репутацию.",
    ],
    advice: [
      "Запишите следующий шаг одним предложением и сделайте его за 48 часов.",
      "Отложите необратимое, но продолжайте собирать факты.",
      "Прямо попросите поддержку или ответ, который нужен.",
      "Исправьте самое слабое место до расширения плана.",
      "Делайте меньше, наблюдайте больше, пусть узор проявится.",
    ],
  },
};

function getRandomInt(max: number) {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] % max;
}

function createReading(locale: ReportLocale, type: StickType): StickSign {
  const system = systems[contentLocale(locale)][type];
  return getStickSign(type, getRandomInt(system.count) + 1, locale);
}

export default function SpiritualSticksExperience({
  initialLocale = "en",
  initialType = "guanyin",
  children,
}: {
  initialLocale?: ReportLocale;
  initialType?: StickType;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [changingLanguage, startLanguageChange] = useTransition();
  const locale = initialLocale;
  const localized = <T,>(value: T): T => locale === "zh-TW" ? JSON.parse(toTraditional(JSON.stringify(value))) : value;
  const [selectedType, setSelectedType] = useState<StickType>(initialType);
  const [topicIndex, setTopicIndex] = useState(defaultTopicIndex[initialType]);
  const [question, setQuestion] = useState("");
  const [rawReading, setReading] = useState<StickSign | null>(null);
  const reading = localized(rawReading);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lookupNumber, setLookupNumber] = useState("33");
  const [aiText, setAiText] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  useEffect(() => {
    document.documentElement.lang = journalLanguageTags[locale];
    setReading(current => current ? getStickSign(current.type, current.number, locale) : null);
    setAiText("");
  }, [locale]);
  const drawTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interpretation = useRef<AbortController | null>(null);
  useEffect(() => () => {
    if (drawTimer.current) clearTimeout(drawTimer.current);
    interpretation.current?.abort();
  }, []);
  const busy = isDrawing || isInterpreting || changingLanguage;
  const rawUi = locale === "zh" || locale === "zh-TW" ? {
    select: "01 · 选择签堂", question: "02 · 安放心事", title: "此刻，心中所问", optional: "可以写下问题，也可以静静默念。", read: "查看这支签的解意", footnote: "签意是一种文化体验，也是一份自我思考的邀请。",
  } : locale === "ru" ? {
    select: "01 · Выберите традицию", question: "02 · Ваш вопрос", title: "Что у вас на душе?", optional: "Запишите вопрос или просто подумайте о нём.", read: "Прочитать толкование", footnote: "Символический ритуал и приглашение к размышлению.",
  } : {
    select: "01 · Choose your tradition", question: "02 · Hold your question", title: "What’s on your mind?", optional: "Write it here, or simply hold it in your thoughts.", read: "Read your sign", footnote: "A symbolic ritual. A little space for reflection.",
  };
  const copyLocale = contentLocale(locale);
  const ui = localized(rawUi);
  const text = localized(copy[copyLocale]);
  const localizedSystems = localized(systems[copyLocale]);
  const selectedSystem = localizedSystems[selectedType];

  const selectedTopic = text.topics[topicIndex];

  function chooseType(nextType: StickType) {
    if (busy) return;
    setSelectedType(nextType);
    setTopicIndex(defaultTopicIndex[nextType]);
    setReading(null);
    setAiText("");
    setIsDrawing(false);

    const url = new URL(window.location.href);
    url.searchParams.set("type", nextType);
    url.searchParams.set("locale", locale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function drawStick() {
    if (busy) return;

    trackToolEvent("tool_start", "temple_sticks");
    setReading(null);
    setIsDrawing(true);
    if (window.matchMedia("(max-width: 640px)").matches) {
      document.getElementById("oracle-vessel")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    }
    drawTimer.current = setTimeout(() => {
      setReading(createReading(locale, selectedType));
      trackToolEvent("tool_success", "temple_sticks");
      setAiText("");
      setIsDrawing(false);
      drawTimer.current = null;
    }, 1250);
  }

  function lookupStick() {
    if (busy || !lookupNumber.trim()) return;
    const number = Number(lookupNumber);
    if (!Number.isInteger(number) || number < 1 || number > selectedSystem.count) return;

    trackToolEvent("tool_start", "temple_sticks");
    setReading(getStickSign(selectedType, number, locale));
    trackToolEvent("tool_success", "temple_sticks");
    setAiText("");
  }

  async function interpretReading() {
    if (!reading || busy) return;

    setAiText("");
    setIsInterpreting(true);
    const controller = new AbortController();
    interpretation.current = controller;

    try {
      const response = await fetch("/api/sticks/interpret", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          locale,
          number: reading.number,
          topic: selectedTopic,
          question,
          sign: reading,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to generate interpretation.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let nextText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        nextText += decoder.decode(value, { stream: true });
        setAiText(nextText);
      }
    } catch {
      if (!controller.signal.aborted) {
        setAiText(reading.plain);
        trackToolEvent("tool_fallback", "temple_sticks");
      }
    } finally {
      if (!controller.signal.aborted) setIsInterpreting(false);
    }
  }

  return (
    <main className={styles.page} lang={journalLanguageTags[locale]} data-server-localized>
      <header className="white-header stick-header">
        <div className="white-container white-header__inner">
          <a className="white-brand" href={`/?locale=${locale}`}><span aria-hidden="true" />DestinyPixel</a>
          <a className="white-black-link" href={`/?locale=${locale}`}>{text.navHome}</a>
          <div className="white-language" aria-label="Language selector">
            <Languages size={14} aria-hidden="true" />
            {reportLanguageOptions.map((option) => <a key={option.value} className={styles.languageLink} href={`/sticks?locale=${option.value}&type=${selectedType}`} aria-current={locale === option.value ? "page" : undefined} aria-disabled={busy || undefined} onClick={(event) => {
              if (busy) { event.preventDefault(); return; }
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
              event.preventDefault();
              window.localStorage.setItem("destinypixel-locale", option.value);
              // Next navigation refreshes the translated server content and metadata,
              // while this mounted tool keeps the question and the drawn sign in memory.
              startLanguageChange(() => router.push(event.currentTarget.href, { scroll: false }));
            }}>{option.value === "zh" ? "简" : option.value === "zh-TW" ? "繁" : option.value === "ru" ? "RU" : "EN"}</a>)}
          </div>
        </div>
      </header>
      <div className={styles.container}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{text.heroEyebrow}</p>
          <h1>{text.heroTitle}</h1>
          <p>{text.heroLead}</p>
        </div>
        <section className={styles.ritual} aria-label={text.heroEyebrow}>
          <div className={styles.traditions} role="group" aria-label={ui.select}>
            {stickTypes.map((type) => {
              const system = localizedSystems[type];
              const Icon = oracleSymbols[type];
              return <button key={type} type="button" disabled={busy} data-tradition={type} aria-pressed={selectedType === type} onClick={() => chooseType(type)}>
                <span className={styles.symbol}><Icon size={22} strokeWidth={1.4} aria-hidden="true" /></span>
                <span><strong>{system.name}</strong><small>{system.domains.slice(0, 2).join(" · ")}</small></span>
              </button>;
            })}
          </div>
          <div className={styles.ritualBody}>
            <OracleStage name={selectedSystem.name} count={selectedSystem.count} caption={isDrawing ? text.drawing : reading ? text.reveal : text.ritualIdle} drawing={isDrawing} number={reading?.number} level={reading?.level} readLabel={ui.read} />
            <div className={styles.form}>
              <p className={styles.eyebrow}>{ui.question}</p>
              <h2>{ui.title}</h2>
              <p className={styles.systemNote}>{selectedSystem.body}</p>
              <div className={styles.field}>
                <span id="oracle-topic-label">{text.topicLabel}</span>
                <div className={styles.topicChoices} role="group" aria-labelledby="oracle-topic-label">
                  {text.topics.map((item, index) => <button key={item} type="button" disabled={busy} aria-pressed={selectedTopic === item} onClick={() => setTopicIndex(index)}>{item}</button>)}
                </div>
              </div>
              <label className={styles.field}>
                <span>{text.questionLabel}</span>
                <textarea value={question} disabled={busy} maxLength={1500} placeholder={text.questionPlaceholder} onChange={(event) => setQuestion(event.target.value)} />
              </label>
              <button className={styles.primary} type="button" disabled={busy} onClick={drawStick}>
                {isDrawing ? text.drawing : reading ? text.redraw : text.draw}
                {isDrawing ? <Loader2 className="loading-icon" size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
              </button>
              <p className={styles.formFootnote}>{ui.optional}</p>
              {reading && <a className={styles.readLink} href="#oracle-reading">{ui.read}<ArrowRight size={14} aria-hidden="true" /></a>}
            </div>
          </div>
          <details className={styles.lookup}>
            <summary>{text.lookupTitle} · {text.lookupAction}</summary>
            <form className={styles.lookupFields} onSubmit={(event) => { event.preventDefault(); lookupStick(); }}>
              <label><span>{text.lookupLabel} · 1–{selectedSystem.count}</span><input type="number" required step={1} min={1} max={selectedSystem.count} value={lookupNumber} disabled={busy} onChange={(event) => setLookupNumber(event.target.value)} /></label>
              <button className={styles.secondary} disabled={busy} type="submit"><Search size={15} aria-hidden="true" />{text.lookupAction}</button>
            </form>
          </details>
        </section>
        <p className={styles.formFootnote}>{ui.footnote}</p>
        {reading && <section className={styles.result} id="oracle-reading" aria-label={text.result}>
          <div className={styles.resultHeading}>
            <div className={styles.resultSeal}><strong>{String(reading.number).padStart(2, "0")}</strong><small>{reading.level}</small></div>
            <div><p>{selectedSystem.name} · {text.result} {reading.number} / {selectedSystem.count}</p><h2>{reading.title}</h2></div>
          </div>
          <div className={styles.readingColumns}>
            <div className={styles.poem}><small>{text.poemLabel}</small><p>{reading.poem}</p></div>
            <div className={styles.plain}><small>{text.plainLabel}</small><p>{reading.plain}</p></div>
          </div>
          <div className={styles.advice}><strong>{text.adviceLabel}</strong><span>{reading.advice}</span></div>
          <div className={styles.ai}>
            <strong>{text.aiTitle}</strong>
            <p aria-live="polite" aria-busy={isInterpreting}>{localized(aiText) || text.aiEmpty}</p>
            <button className={styles.secondary} type="button" disabled={busy} onClick={interpretReading}>
              {isInterpreting ? <Loader2 className="loading-icon" size={15} aria-hidden="true" /> : <WandSparkles size={15} aria-hidden="true" />}
              {isInterpreting ? text.aiLoading : text.aiAction}
            </button>
          </div>
          <p className={styles.source}><strong>{text.sourceLabel}</strong>{reading.sourceNote}</p>
        </section>}
        {children}
      </div>
    </main>
  );
}
