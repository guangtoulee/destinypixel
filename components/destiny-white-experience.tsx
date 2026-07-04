"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Hand,
  Languages,
  Loader2,
  MapPin,
  MessageCircle,
  Orbit,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Stars,
  SunMoon,
} from "lucide-react";
import { Solar } from "lunar-javascript";
import { createFusionReportAction } from "@/app/actions";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay } from "@/lib/bazi-totems";
import { cities } from "@/lib/geo/cities";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import {
  normalizeReportLocale,
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";

type WhiteCopy = {
  nav: {
    method: string;
    archetypes: string;
    report: string;
    insights: string;
    black: string;
  };
  hero: {
    version: string;
    eyebrow: string;
    title: string;
    lead: string;
    name: string;
    date: string;
    time: string;
    gender: string;
    female: string;
    male: string;
    city: string;
    cityPlaceholder: string;
    submit: string;
    pending: string;
    privacy: string;
  };
  card: {
    sample: string;
    core: string;
    sky: string;
    resonance: string;
  };
  stats: {
    portraits: string;
    signals: string;
    paths: string;
  };
  method: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; body: string }>;
  };
  archetypes: {
    eyebrow: string;
    title: string;
    description: string;
  };
  fusion: {
    eyebrow: string;
    title: string;
    description: string;
    chips: string[];
  };
  insights: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      body: string;
      href: string;
      cta: string;
    }>;
  };
  premium: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
    cta: string;
  };
};

const whiteCopy: Record<ReportLocale, WhiteCopy> = {
  en: {
    nav: {
      method: "The System",
      archetypes: "Energy Cards",
      report: "Start Reading",
      insights: "Insight Studios",
      black: "Dark mode",
    },
    hero: {
      version: "Multidimensional birth map",
      eyebrow: "Birth energy · Planetary rhythm · Inner guidance",
      title: "Meet the pattern your birthday remembers.",
      lead:
        "DestinyPixel translates your birth moment into a gentle psychological mirror: symbolic animals, planetary rhythms, and AI-guided reflection for clarity, healing, and self-trust.",
      name: "Name",
      date: "Date of birth",
      time: "Birth time",
      gender: "Gender",
      female: "Female",
      male: "Male",
      city: "Birth city",
      cityPlaceholder: "Search city, e.g. Shijiazhuang",
      submit: "Reveal my inner map",
      pending: "Reading your energy field, this may take a moment...",
      privacy: "Your birth data stays private and is used only for this reading",
    },
    card: {
      sample: "Energy sample",
      core: "Core Pattern",
      sky: "Sky Rhythm",
      resonance: "Inner Echo",
    },
    stats: {
      portraits: "energy portraits",
      signals: "planetary signals",
      paths: "guidance paths",
    },
    method: {
      eyebrow: "A guided mirror for the self",
      title: "Your birth moment as a multidimensional field.",
      description:
        "Instead of asking you to decode ancient symbols, DestinyPixel turns them into a calm visual language for emotional patterning, timing, and self-understanding.",
      items: [
        {
          title: "Energy signature",
          body: "Your birth day becomes a symbolic animal portrait: a memorable doorway into temperament, needs, and natural rhythm.",
        },
        {
          title: "Sky resonance",
          body: "Planetary positions add a second layer, revealing where your inner pattern seeks expression, protection, and growth.",
        },
        {
          title: "Healing guidance",
          body: "The reading becomes practical prompts for self-trust, relationships, work, recovery, and the next season of your life.",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 symbolic companions",
      title: "A soft oracle deck for your inner landscape.",
      description:
        "Each card acts like a visual anchor for a different emotional climate, helping overseas users feel the system before they try to analyze it.",
    },
    fusion: {
      eyebrow: "Field reading",
      title: "The Dewy Rabbit meets a Pisces Sun.",
      description:
        "The Dewy Rabbit suggests sensitivity, social grace, and quiet perception. A Pisces Sun echoes imagination, permeability, and a soul that heals through beauty.",
      chips: ["Gentle sensitivity", "Social intuition", "Pisces Sun", "Emotional healing"],
    },
    insights: {
      eyebrow: "Beyond the birth map",
      title: "Palm, face, and one-question readings for the moment you are in.",
      description:
        "When you do not need a full birth report, open a smaller mirror: align a photo, confirm visible signals, or cast the question time into a Liuyao and Tarot reading.",
      items: [
        {
          title: "Palm Studio",
          body: "Guided photo alignment plus confirmed lines and mounts, translated into direct rhythm, relationship, and work advice.",
          href: "/palm",
          cta: "Read palm",
        },
        {
          title: "Face Studio",
          body: "A careful symbolic reading of expression, facial zones, and social signal without identity or beauty scoring.",
          href: "/face",
          cta: "Read face",
        },
        {
          title: "Question Oracle",
          body: "One issue at a time: time-cast Liuyao lines meet a three-card Tarot mirror for a practical next step.",
          href: "/oracle",
          cta: "Ask now",
        },
      ],
    },
    premium: {
      eyebrow: "From a free glimpse to deeper guidance",
      title: "A reading that feels like being understood.",
      description:
        "Start with your birth-day portrait, then open the full map: personality patterns, love language, work rhythm, growth edge, wellbeing, and annual timing.",
      items: [
        "Birth-time energy calibration",
        "Planetary resonance mapping",
        "Streaming reflective guidance",
      ],
      cta: "Begin my reading",
    },
  },
  zh: {
    nav: {
      method: "系统",
      archetypes: "能量卡",
      report: "开始解读",
      insights: "洞察专区",
      black: "深色模式",
    },
    hero: {
      version: "多维出生能量图",
      eyebrow: "出生能量 · 行星节律 · 内在指引",
      title: "看见你出生那天留下的能量纹理。",
      lead:
        "DestinyPixel 将你的出生时刻转译成一张柔和的心理地图：动物象征、行星节律与 AI 引导式洞察，共同帮助你理解自己、修复关系、找回内在秩序。",
      name: "姓名",
      date: "出生日期",
      time: "出生时间",
      gender: "性别",
      female: "女性",
      male: "男性",
      city: "出生城市",
      cityPlaceholder: "搜索城市，例如：石家庄",
      submit: "开启我的内在地图",
      pending: "正在读取你的能量场，这需要一点时间...",
      privacy: "出生资料仅用于本次解读，并保持私密",
    },
    card: {
      sample: "能量样本",
      core: "核心模式",
      sky: "天空节律",
      resonance: "内在回声",
    },
    stats: {
      portraits: "能量画像",
      signals: "行星信号",
      paths: "指引路径",
    },
    method: {
      eyebrow: "一面温柔的自我镜子",
      title: "把出生时刻，看作一个多维能量场。",
      description:
        "我们不要求用户理解古老术语，而是把符号翻译成现代心理语言：看见情绪模式、关系节奏、生命阶段与自我疗愈方向。",
      items: [
        {
          title: "能量签名",
          body: "你的出生之日会生成一个动物画像，成为理解气质、需求与自然节奏的入口。",
        },
        {
          title: "星空共振",
          body: "行星位置提供第二层信息，帮助看见你的表达方式、防御机制、亲密需求与成长方向。",
        },
        {
          title: "疗愈指引",
          body: "解读会落到具体生活：自我信任、关系边界、工作节奏、身心恢复与接下来一年的选择。",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 位象征伙伴",
      title: "一套描绘内在风景的柔光卡牌。",
      description:
        "每张卡都代表一种情绪气候和生命质地，让海外用户先感受到这套系统，再进入更深入的分析。",
    },
    fusion: {
      eyebrow: "场域解读",
      title: "雨露灵兔，遇见双鱼座太阳。",
      description:
        "雨露灵兔象征敏感、柔软、善于感知关系中的细微波动；双鱼座太阳进一步放大想象力、共情力与通过美来疗愈自己的能力。",
      chips: ["细腻感受力", "社交直觉", "太阳双鱼", "情绪疗愈"],
    },
    insights: {
      eyebrow: "出生地图之外",
      title: "手相、面相、一事一问，给当下问题更快的镜子。",
      description:
        "当你暂时不需要完整出生报告时，可以打开更轻的洞察：拍照对齐、确认可见特征，或用起问时间生成六爻和塔罗合参。",
      items: [
        {
          title: "手相专区",
          body: "用定位线拍摄或上传手掌，确认掌纹与掌丘，再生成更直接的关系、工作、节奏建议。",
          href: "/palm",
          cta: "看手相",
        },
        {
          title: "面相专区",
          body: "观察神态、三庭与眉眼鼻口下颌，把外在呈现翻译成心理、社交和压力反应。",
          href: "/face",
          cta: "看面相",
        },
        {
          title: "问事专区",
          body: "一事一问，用起问时间起六爻，再配合塔罗三牌，得到更清楚的下一步。",
          href: "/oracle",
          cta: "马上问",
        },
      ],
    },
    premium: {
      eyebrow: "从免费一瞥，到完整指引",
      title: "一份像被理解一样的阅读体验。",
      description:
        "从出生之日的动物画像开始，继续展开人格模式、亲密关系、事业节奏、成长课题、身心恢复和年度时机。",
      items: ["出生时间能量校准", "行星共振图谱", "流式心理指引模块"],
      cta: "开始我的解读",
    },
  },
  ru: {
    nav: {
      method: "Система",
      archetypes: "Карты энергии",
      report: "Начать",
      insights: "Студии",
      black: "Темный режим",
    },
    hero: {
      version: "Многомерная карта рождения",
      eyebrow: "Энергия рождения · Ритм планет · Внутренний ориентир",
      title: "Увидьте узор, который помнит день вашего рождения.",
      lead:
        "DestinyPixel переводит момент рождения в мягкое психологическое зеркало: символические животные, планетарные ритмы и AI-инсайты для ясности, восстановления и доверия к себе.",
      name: "Имя",
      date: "Дата рождения",
      time: "Время рождения",
      gender: "Пол",
      female: "Женский",
      male: "Мужской",
      city: "Город рождения",
      cityPlaceholder: "Найдите город, например Shijiazhuang",
      submit: "Открыть мою внутреннюю карту",
      pending: "Считываем ваше энергетическое поле...",
      privacy: "Данные рождения используются только для этого чтения",
    },
    card: {
      sample: "Образец энергии",
      core: "Ядро паттерна",
      sky: "Ритм неба",
      resonance: "Внутренний отклик",
    },
    stats: {
      portraits: "портретов энергии",
      signals: "планетарных сигналов",
      paths: "маршрутов",
    },
    method: {
      eyebrow: "Мягкое зеркало для самопонимания",
      title: "Момент рождения как многомерное поле.",
      description:
        "Мы не заставляем пользователя разбирать древние термины. Система переводит символы в современный язык эмоций, ритма, отношений и внутреннего восстановления.",
      items: [
        {
          title: "Энергетическая подпись",
          body: "День рождения становится образом животного: входом в темперамент, потребности и естественный ритм.",
        },
        {
          title: "Небесный резонанс",
          body: "Планетарные позиции добавляют второй слой: как внутренний узор ищет выражение, защиту и рост.",
        },
        {
          title: "Восстанавливающее руководство",
          body: "Чтение превращается в практичные подсказки для доверия к себе, отношений, работы, восстановления и следующего сезона жизни.",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 символических спутников",
      title: "Мягкая колода для внутреннего ландшафта.",
      description:
        "Каждая карта работает как визуальный якорь для эмоционального климата, чтобы пользователь сначала почувствовал систему, а затем углубился в анализ.",
    },
    fusion: {
      eyebrow: "Чтение поля",
      title: "Роса Кролика встречает Солнце в Рыбах.",
      description:
        "Роса Кролика указывает на тонкость, социальную интуицию и мягкое восприятие. Солнце в Рыбах усиливает воображение, эмпатию и исцеление через красоту.",
      chips: ["Тонкая чувствительность", "Социальная интуиция", "Солнце в Рыбах", "Эмоциональное исцеление"],
    },
    insights: {
      eyebrow: "За пределами карты рождения",
      title: "Ладонь, лицо и один вопрос для текущего момента.",
      description:
        "Когда не нужен полный отчет, откройте более быстрые зеркала: фото-направляющие, подтвержденные признаки или вопрос по времени с Лю Яо и Таро.",
      items: [
        {
          title: "Ладонь",
          body: "Выравнивание фото, линии и холмы ладони превращаются в прямые советы о ритме, работе и отношениях.",
          href: "/palm",
          cta: "Читать ладонь",
        },
        {
          title: "Лицо",
          body: "Символическое чтение выражения, зон лица и социального сигнала без оценок личности или красоты.",
          href: "/face",
          cta: "Читать лицо",
        },
        {
          title: "Оракул вопроса",
          body: "Один вопрос: линии Лю Яо по времени плюс три карты Таро для практического следующего шага.",
          href: "/oracle",
          cta: "Задать вопрос",
        },
      ],
    },
    premium: {
      eyebrow: "От первого образа к глубокому руководству",
      title: "Чтение, в котором вас действительно понимают.",
      description:
        "Начните с образа дня рождения, затем откройте полную карту: личные паттерны, язык любви, рабочий ритм, рост, восстановление и годовой тайминг.",
      items: [
        "Калибровка энергии рождения",
        "Карта планетарного резонанса",
        "Потоковое психологическое руководство",
      ],
      cta: "Начать мое чтение",
    },
  },
};

const featuredPillars = ["癸卯", "乙丑", "丁酉", "辛巳"];

function WhiteSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="loading-icon" size={17} aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={17} aria-hidden="true" />
        </>
      )}
    </button>
  );
}

function profileName(profile: PillarProfile, pillar: string, locale: ReportLocale) {
  if (locale === "zh") return profile.name.cn;
  if (locale === "ru") return getPillarDisplay(pillar, "ru").totemName;

  return profile.name.en;
}

function profileEssence(
  profile: PillarProfile,
  pillar: string,
  locale: ReportLocale,
) {
  if (locale === "zh") return profile.essence.cn;
  if (locale === "ru") {
    const display = getPillarDisplay(pillar, "ru");
    return `${display.totemName} соединяет ${display.stemMeaning.toLowerCase()} и ${display.branchMeaning.toLowerCase()} в мягкий, наблюдательный архетип.`;
  }

  return profile.essence.en;
}

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh" ? "zh-CN" : locale === "ru" ? "ru" : "en";
}

export default function DestinyWhiteExperience({
  initialLocale = "en",
}: {
  initialLocale?: ReportLocale;
}) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [birthDate, setBirthDate] = useState("");
  const [pillar, setPillar] = useState("癸卯");
  const text = whiteCopy[locale];
  const profile = useMemo(
    () => (pillarsDB as Record<string, PillarProfile>)[pillar],
    [pillar],
  );
  const display = useMemo(() => getPillarDisplay(pillar, locale), [locale, pillar]);
  const cardName = profileName(profile, pillar, locale);
  const essence = profileEssence(profile, pillar, locale);

  useEffect(() => {
    setDocumentLocale(locale);
    window.localStorage.setItem("destinypixel-locale", locale);
  }, [locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get("locale");

    if (urlLocale) return;

    const storedLocale = normalizeReportLocale(
      window.localStorage.getItem("destinypixel-locale") ?? initialLocale,
    );

    if (storedLocale !== locale) {
      setLocale(storedLocale);
    }
  }, [initialLocale, locale]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    window.localStorage.setItem("destinypixel-locale", nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function updatePreviewFromDate(value: string) {
    setBirthDate(value);

    if (!value) return;

    const [year, month, day] = value.split("-").map(Number);
    const result = Solar.fromYmdHms(year, month, day, 12, 0, 0)
      .getLunar()
      .getDayInGanZhi();

    if (result in pillarsDB) {
      setPillar(result);
    }
  }

  return (
    <main className="white-site">
      <header className="white-header">
        <div className="white-container white-header__inner">
          <a className="white-brand" href="/">
            <span aria-hidden="true" />
            DestinyPixel
          </a>

          <nav className="white-nav" aria-label="Primary navigation">
            <a href="#method">{text.nav.method}</a>
            <a href="#archetypes">{text.nav.archetypes}</a>
            <a href="#insights">{text.nav.insights}</a>
            <a href="#report">{text.nav.report}</a>
          </nav>

          <div className="white-actions">
            <a href={`/black?locale=${locale}`} className="white-black-link">
              {text.nav.black}
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
        </div>
      </header>

      <section className="white-hero">
        <div className="white-ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="white-container white-hero__grid">
          <div className="white-hero__copy">
            <p className="white-kicker">
              <Sparkles size={14} aria-hidden="true" />
              {text.hero.version}
            </p>
            <p className="white-eyebrow">{text.hero.eyebrow}</p>
            <h1>{text.hero.title}</h1>
            <p className="white-lead">{text.hero.lead}</p>

            <div className="white-stats" aria-label="DestinyPixel metrics">
              <span>60</span>
              <p>{text.stats.portraits}</p>
              <span>10</span>
              <p>{text.stats.signals}</p>
              <span>7</span>
              <p>{text.stats.paths}</p>
            </div>
          </div>

          <div className="white-form-panel" id="report">
            <div className="white-form-panel__header">
              <span>
                <SunMoon size={16} aria-hidden="true" />
              </span>
              <div>
                <strong>{text.card.sample}</strong>
                <p>{display.totemName}</p>
              </div>
            </div>

            <form action={createFusionReportAction}>
              <input type="hidden" name="locale" value={locale} />
              <label className="white-field white-field--full">
                <span>{text.hero.name}</span>
                <input
                  name="name"
                  type="text"
                  placeholder={
                    locale === "zh"
                      ? "你的名字"
                      : locale === "ru"
                        ? "Ваше имя"
                        : "Your name"
                  }
                  required
                />
              </label>
              <label className="white-field">
                <span>{text.hero.date}</span>
                <input
                  name="birthDate"
                  type="date"
                  value={birthDate}
                  max="2026-06-25"
                  onChange={(event) => updatePreviewFromDate(event.target.value)}
                  onInput={(event) => updatePreviewFromDate(event.currentTarget.value)}
                  required
                />
              </label>
              <label className="white-field">
                <span>{text.hero.time}</span>
                <input name="birthTime" type="time" required />
              </label>
              <div className="white-field white-field--full">
                <span>{text.hero.gender}</span>
                <div className="white-gender" role="radiogroup" aria-label={text.hero.gender}>
                  <label>
                    <input type="radio" name="gender" value="female" defaultChecked />
                    <span aria-hidden="true">♀</span>
                    {text.hero.female}
                  </label>
                  <label>
                    <input type="radio" name="gender" value="male" />
                    <span aria-hidden="true">♂</span>
                    {text.hero.male}
                  </label>
                </div>
              </div>
              <label className="white-field white-field--full">
                <span>{text.hero.city}</span>
                <input
                  name="birthPlace"
                  type="search"
                  list="white-city-options"
                  placeholder={text.hero.cityPlaceholder}
                  required
                />
              </label>
              <datalist id="white-city-options">
                {cities.map((city) => {
                  const aliases =
                    locale === "zh"
                      ? city.aliases
                      : city.aliases.filter((alias) => !/[\u4e00-\u9fff]/.test(alias));

                  return (
                    <option key={city.id} value={city.label}>
                      {[city.label, ...aliases].join(" / ")}
                    </option>
                  );
                })}
              </datalist>

              <WhiteSubmitButton label={text.hero.submit} pendingLabel={text.hero.pending} />
            </form>

            <p className="white-form-note">
              <ShieldCheck size={14} aria-hidden="true" />
              {text.hero.privacy}
            </p>
          </div>

          <article className="white-card-preview">
            <div className="white-card-preview__image">
              <Image
                key={pillar}
                src={getPillarImagePath(pillar)}
                alt={cardName}
                width={896}
                height={1200}
                sizes="(max-width: 720px) 70vw, 360px"
                quality={95}
                priority
              />
            </div>
            <div className="white-card-preview__body">
              <span>{display.pillarLabel}</span>
              <h2>{cardName}</h2>
              <p>{essence}</p>
            </div>
            <div className="white-signal-strip">
              <span>{text.card.core}</span>
              <i />
              <span>{text.card.sky}</span>
              <i />
              <span>{text.card.resonance}</span>
            </div>
          </article>
        </div>
      </section>

      <section className="white-method" id="method">
        <div className="white-container">
          <div className="white-method-intro">
            <div className="white-geometry-panel" aria-hidden="true">
              <svg viewBox="0 0 560 380" focusable="false">
                <defs>
                  <linearGradient id="white-line-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c9dce7" />
                    <stop offset="48%" stopColor="#d9c3d7" />
                    <stop offset="100%" stopColor="#d0b476" />
                  </linearGradient>
                </defs>
                <path d="M78 284 C158 166 264 224 342 102 S488 116 510 58" />
                <path d="M64 138 L188 82 L324 162 L462 112" />
                <circle cx="188" cy="82" r="48" />
                <circle cx="324" cy="162" r="76" />
                <circle cx="462" cy="112" r="34" />
                <circle cx="78" cy="284" r="10" />
                <circle cx="188" cy="82" r="10" />
                <circle cx="324" cy="162" r="10" />
                <circle cx="462" cy="112" r="10" />
                <circle cx="510" cy="58" r="10" />
              </svg>
              <div className="white-geometry-node white-geometry-node--one">
                <SunMoon size={18} aria-hidden="true" />
                <span>Birth</span>
              </div>
              <div className="white-geometry-node white-geometry-node--two">
                <Orbit size={18} aria-hidden="true" />
                <span>Sky</span>
              </div>
              <div className="white-geometry-node white-geometry-node--three">
                <Sparkles size={18} aria-hidden="true" />
                <span>AI</span>
              </div>
            </div>

            <div className="white-section-heading white-section-heading--method">
              <p>{text.method.eyebrow}</p>
              <h2>{text.method.title}</h2>
              <span>{text.method.description}</span>
            </div>
          </div>

          <div className="white-method-grid">
            {text.method.items.map((item, index) => (
              <article key={item.title}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="white-archetypes" id="archetypes">
        <div className="white-container white-archetypes__grid">
          <div className="white-section-heading">
            <p>{text.archetypes.eyebrow}</p>
            <h2>{text.archetypes.title}</h2>
            <span>{text.archetypes.description}</span>
          </div>

          <div className="white-card-row">
            {featuredPillars.map((featuredPillar) => {
              const itemProfile = (pillarsDB as Record<string, PillarProfile>)[
                featuredPillar
              ];
              const itemDisplay = getPillarDisplay(featuredPillar, locale);
              const itemName = profileName(itemProfile, featuredPillar, locale);

              return (
                <article key={featuredPillar}>
                  <Image
                    src={getPillarImagePath(featuredPillar)}
                    alt={itemName}
                    width={896}
                    height={1200}
                    sizes="(max-width: 720px) 58vw, 240px"
                    quality={95}
                  />
                  <div>
                    <span>{itemDisplay.pillarLabel}</span>
                    <strong>{itemName}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="white-fusion">
        <div className="white-container white-fusion__grid">
          <div className="white-orbit-card">
            <div className="white-orbit-card__ring" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <Stars size={23} aria-hidden="true" />
              <strong>{text.fusion.eyebrow}</strong>
              <p>{text.fusion.description}</p>
            </div>
          </div>

          <div className="white-fusion__copy">
            <p>{text.fusion.eyebrow}</p>
            <h2>{text.fusion.title}</h2>
            <span>{text.fusion.description}</span>
            <div>
              {text.fusion.chips.map((chip) => (
                <em key={chip}>{chip}</em>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="white-insights" id="insights">
        <div className="white-container">
          <div className="white-section-heading">
            <p>{text.insights.eyebrow}</p>
            <h2>{text.insights.title}</h2>
            <span>{text.insights.description}</span>
          </div>

          <div className="white-insight-grid">
            {text.insights.items.map((item, index) => {
              const Icon = index === 0 ? Hand : index === 1 ? ScanFace : MessageCircle;

              return (
                <a
                  href={`${item.href}?locale=${locale}`}
                  className="white-insight-card"
                  key={item.href}
                >
                  <span>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <em>
                    {item.cta}
                    <ArrowRight size={15} aria-hidden="true" />
                  </em>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="white-premium">
        <div className="white-container white-premium__panel">
          <div>
            <p>{text.premium.eyebrow}</p>
            <h2>{text.premium.title}</h2>
            <span>{text.premium.description}</span>
          </div>
          <ul>
            {text.premium.items.map((item) => (
              <li key={item}>
                <Check size={15} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <a href="#report">
            {text.premium.cta}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="white-footer">
        <div className="white-container">
          <span>DestinyPixel · Multidimensional Birth Map</span>
          <a href={`/learn?locale=${locale}`}>
            {locale === "zh" ? "搜索指南" : locale === "ru" ? "Гид" : "Guide"}
          </a>
          <a href={`/palm?locale=${locale}`}>
            {locale === "zh" ? "手相" : locale === "ru" ? "Ладонь" : "Palm"}
          </a>
          <a href={`/face?locale=${locale}`}>
            {locale === "zh" ? "面相" : locale === "ru" ? "Лицо" : "Face"}
          </a>
          <a href={`/oracle?locale=${locale}`}>
            {locale === "zh" ? "问事" : locale === "ru" ? "Оракул" : "Oracle"}
          </a>
          <span>
            <MapPin size={13} aria-hidden="true" />
            /
          </span>
          <span>
            <CalendarDays size={13} aria-hidden="true" />
            2026
          </span>
        </div>
      </footer>
    </main>
  );
}
