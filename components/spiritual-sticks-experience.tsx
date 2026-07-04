"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Languages, Loader2, Search, Sparkles, WandSparkles } from "lucide-react";
import { reportLanguageOptions, type ReportLocale } from "@/lib/report-i18n";
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

const systems: Record<
  ReportLocale,
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

const copy: Record<ReportLocale, StickCopy> = {
  en: {
    navHome: "Home",
    heroEyebrow: "Temple sticks · One question · One sign",
    heroTitle: "Draw a stick before you decide.",
    heroLead:
      "Choose the tradition that matches your question. The result is a concise symbolic reading, designed to be direct rather than vague.",
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
    poemLabel: "Traditional verse",
    plainLabel: "Plain reading",
    aiTitle: "AI interpretation",
    aiAction: "Interpret with my question",
    aiLoading: "Reading the sign with DeepSeek...",
    aiEmpty: "Draw or search a stick first, then generate a question-specific interpretation.",
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
    heroEyebrow: "灵签 · 一事一问 · 一签一断",
    heroTitle: "决定之前，先为这件事抽一支签。",
    heroLead:
      "选择与你问题最贴近的签种。这里先给一段现代白话签意，重点是直接、可执行，少一点玄乎其玄的废话。",
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
    poemLabel: "传统签文",
    plainLabel: "白话签意",
    aiTitle: "AI 合参解读",
    aiAction: "结合问题解读",
    aiLoading: "正在结合签文和问题解读...",
    aiEmpty: "先抽签或查签号，再让 AI 结合你的具体问题解读。",
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
    heroTitle: "Вытяните жребий перед решением.",
    heroLead:
      "Выберите традицию под ваш вопрос. Ответ короткий, символический и практичный: меньше тумана, больше направления.",
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
    poemLabel: "Традиционный стих",
    plainLabel: "Простое толкование",
    aiTitle: "AI-толкование",
    aiAction: "Толковать мой вопрос",
    aiLoading: "DeepSeek читает знак...",
    aiEmpty: "Сначала вытяните или найдите жребий, затем получите толкование под вопрос.",
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
  const system = systems[locale][type];
  return getStickSign(type, getRandomInt(system.count) + 1, locale);
}

export default function SpiritualSticksExperience({
  initialLocale = "en",
  initialType = "guanyin",
}: {
  initialLocale?: ReportLocale;
  initialType?: StickType;
}) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [selectedType, setSelectedType] = useState<StickType>(initialType);
  const [topic, setTopic] = useState(copy[initialLocale].topics[0]);
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<StickSign | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lookupNumber, setLookupNumber] = useState("33");
  const [aiText, setAiText] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const text = copy[locale];
  const selectedSystem = systems[locale][selectedType];

  const selectedTopic = useMemo(() => {
    if (text.topics.includes(topic)) return topic;
    return text.topics[0];
  }, [text.topics, topic]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setTopic(copy[nextLocale].topics[0]);
    setAiText("");
    setReading((current) =>
      current ? getStickSign(current.type, current.number, nextLocale) : current,
    );
    window.localStorage.setItem("destinypixel-locale", nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    url.searchParams.set("type", selectedType);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function chooseType(nextType: StickType) {
    setSelectedType(nextType);
    setReading(null);
    setAiText("");
    setIsDrawing(false);

    const url = new URL(window.location.href);
    url.searchParams.set("type", nextType);
    url.searchParams.set("locale", locale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function drawStick() {
    if (isDrawing) return;

    setReading(null);
    setIsDrawing(true);
    window.setTimeout(() => {
      setReading(createReading(locale, selectedType));
      setAiText("");
      setIsDrawing(false);
    }, 950);
  }

  function lookupStick() {
    const number = Number(lookupNumber);
    if (!Number.isFinite(number)) return;

    setReading(getStickSign(selectedType, number, locale));
    setAiText("");
  }

  async function interpretReading() {
    if (!reading || isInterpreting) return;

    setAiText("");
    setIsInterpreting(true);

    try {
      const response = await fetch("/api/sticks/interpret", {
        method: "POST",
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
      setAiText(reading.plain);
    } finally {
      setIsInterpreting(false);
    }
  }

  return (
    <main className="stick-site">
      <header className="white-header stick-header">
        <div className="white-container white-header__inner">
          <a className="white-brand" href={`/?locale=${locale}`}>
            <span aria-hidden="true" />
            DestinyPixel
          </a>
          <a className="white-black-link" href={`/?locale=${locale}`}>
            {text.navHome}
          </a>
          <div className="white-language" aria-label="Language selector">
            <Languages size={14} aria-hidden="true" />
            {reportLanguageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-active={locale === option.value}
                onClick={() => changeLocale(option.value)}
              >
                {option.value === "zh"
                  ? locale === "zh"
                    ? "中文"
                    : "ZH"
                  : option.value === "ru"
                    ? "RU"
                    : "EN"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="stick-hero">
        <div className="white-container stick-hero__grid">
          <div className="stick-hero__copy">
            <p className="white-kicker">
              <Sparkles size={14} aria-hidden="true" />
              {text.heroEyebrow}
            </p>
            <h1>{text.heroTitle}</h1>
            <span>{text.heroLead}</span>
          </div>

          <div className="stick-draw-panel">
            <div className="stick-type-grid">
              {stickTypes.map((type) => {
                const system = systems[locale][type];

                return (
                  <button
                    key={type}
                    type="button"
                    data-active={selectedType === type}
                    onClick={() => chooseType(type)}
                  >
                    <strong>{system.name}</strong>
                    <span>{system.subtitle}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="stick-ritual-visual"
              data-drawing={isDrawing}
              data-revealed={Boolean(reading)}
              aria-hidden="true"
            >
              <div className="stick-cup">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
              <div className="stick-reveal-slip">
                <small>{selectedSystem.name}</small>
                <strong>{reading ? reading.number : "?"}</strong>
                <em>{reading ? reading.level : selectedSystem.count}</em>
              </div>
            </div>

            <p className="stick-ritual-caption" aria-live="polite">
              {isDrawing ? text.drawing : reading ? text.reveal : text.ritualIdle}
            </p>

            <label className="stick-field">
              <span>{text.topicLabel}</span>
              <select
                value={selectedTopic}
                onChange={(event) => setTopic(event.target.value)}
              >
                {text.topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="stick-field">
              <span>{text.questionLabel}</span>
              <textarea
                value={question}
                placeholder={text.questionPlaceholder}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </label>

            <button
              className="stick-draw-button"
              type="button"
              data-drawing={isDrawing}
              disabled={isDrawing}
              onClick={drawStick}
            >
              {isDrawing ? text.drawing : reading ? text.redraw : text.draw}
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            <div className="stick-lookup">
              <div>
                <strong>{text.lookupTitle}</strong>
                <span>{selectedSystem.name}</span>
              </div>
              <label>
                <span>{text.lookupLabel}</span>
                <input
                  type="number"
                  min={1}
                  max={selectedSystem.count}
                  value={lookupNumber}
                  onChange={(event) => setLookupNumber(event.target.value)}
                />
              </label>
              <button type="button" onClick={lookupStick}>
                <Search size={15} aria-hidden="true" />
                {text.lookupAction}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="stick-result-section">
        <div className="white-container stick-result-grid">
          <article className="stick-system-card">
            <small>{selectedSystem.subtitle}</small>
            <h2>{selectedSystem.name}</h2>
            <p>{selectedSystem.body}</p>
            <div>
              {selectedSystem.domains.map((domain) => (
                <em key={domain}>{domain}</em>
              ))}
            </div>
          </article>

          <article className="stick-result-card" data-empty={!reading}>
            {reading ? (
              <>
                <small>{text.result}</small>
                <div className="stick-number">
                  <span>{reading.number}</span>
                  <em>
                    / {selectedSystem.count} · {reading.level}
                  </em>
                </div>
                <div className="stick-result-ticket" aria-hidden="true">
                  <div className="stick-result-slip">
                    <small>{selectedSystem.name}</small>
                    <strong>{reading.number}</strong>
                    <em>{reading.level}</em>
                  </div>
                </div>
                <h2>{reading.title}</h2>
                <div className="stick-poem-block">
                  <small>{text.poemLabel}</small>
                  <p>{reading.poem}</p>
                </div>
                <div className="stick-poem-block">
                  <small>{text.plainLabel}</small>
                  <p>{reading.plain}</p>
                </div>
                <div className="stick-advice">
                  <strong>{text.adviceLabel}</strong>
                  <span>{reading.advice}</span>
                </div>
                <p className="stick-source-note">
                  <strong>{text.sourceLabel}</strong>
                  {reading.sourceNote}
                </p>
                <div className="stick-ai-panel">
                  <div>
                    <strong>{text.aiTitle}</strong>
                    <p>{aiText || text.aiEmpty}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isInterpreting}
                    onClick={interpretReading}
                  >
                    {isInterpreting ? (
                      <Loader2 className="loading-icon" size={15} aria-hidden="true" />
                    ) : (
                      <WandSparkles size={15} aria-hidden="true" />
                    )}
                    {isInterpreting ? text.aiLoading : text.aiAction}
                  </button>
                </div>
              </>
            ) : (
              <>
                <small>{selectedSystem.name}</small>
                <h2>{text.empty}</h2>
                <p>{selectedSystem.body}</p>
              </>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
