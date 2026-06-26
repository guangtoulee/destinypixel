"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Languages,
  Loader2,
  MapPin,
  Orbit,
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
      method: "Method",
      archetypes: "Archetypes",
      report: "Report",
      black: "V black 1.0",
    },
    hero: {
      version: "V white 1.0",
      eyebrow: "Bazi archetypes · Natal sky · Soft intelligence",
      title: "A lighter way to read destiny.",
      lead:
        "DestinyPixel White keeps the same dual-engine core, then presents it through a calm, luminous interface built for overseas users.",
      name: "Name",
      date: "Date of birth",
      time: "Birth time",
      gender: "Gender",
      female: "Female",
      male: "Male",
      city: "Birth city",
      cityPlaceholder: "Search city, e.g. Shijiazhuang",
      submit: "Generate my fusion report",
      pending: "Reading your chart, this may take a moment...",
      privacy: "Bazi and Astrology are calculated separately",
    },
    card: {
      sample: "Soft sample",
      core: "Day Pillar",
      sky: "Sky Layer",
      resonance: "Resonance",
    },
    method: {
      eyebrow: "A premium white-space system",
      title: "A brighter product language for the same metaphysical engine.",
      description:
        "The black version feels cosmic and mysterious. White 1.0 keeps the depth, but shifts into porcelain, mist, and editorial clarity.",
      items: [
        {
          title: "Elemental animal",
          body: "The 60 Jiazi cards become soft visual anchors instead of cryptic characters.",
        },
        {
          title: "Planetary translation",
          body: "The day master maps into a planet, then the natal sky adds timing and psychological movement.",
        },
        {
          title: "Readable insight",
          body: "The report is designed as calm modules: core, persona, deep self, career, love, growth, and health.",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 cards, one visual language",
      title: "Pastel archetypes with cultural depth.",
      description:
        "Each pillar is shown as a collectible animal card, surrounded by quiet Morandi gradients and soft UI layers.",
    },
    fusion: {
      eyebrow: "Example reading",
      title: "The Dewy Rabbit meets a Pisces Sun.",
      description:
        "Gui Mao carries Yin Water sensitivity and Rabbit social intelligence. Pisces repeats the same permeability, imagination, and emotional attunement.",
      chips: ["Yin Water", "Wood Rabbit", "Pisces Sun", "Jupiter resonance"],
    },
    premium: {
      eyebrow: "From free day pillar to full fusion",
      title: "A report that feels calm enough to read deeply.",
      description:
        "White 1.0 is designed for users who want mystery without visual heaviness: softer color, larger spacing, clearer modules.",
      items: [
        "True solar time Bazi engine",
        "Independent astrology engine",
        "Streaming AI report modules",
      ],
      cta: "Start the white report",
    },
  },
  zh: {
    nav: {
      method: "方法",
      archetypes: "原型",
      report: "报告",
      black: "黑版 1.0",
    },
    hero: {
      version: "V white 1.0",
      eyebrow: "八字原型 · 出生星盘 · 柔和洞察",
      title: "用更轻盈的方式阅读命运。",
      lead:
        "DestinyPixel White 保留同一套双引擎底层，用更明亮、克制、面向海外用户的白色界面重新呈现。",
      name: "姓名",
      date: "出生日期",
      time: "出生时间",
      gender: "性别",
      female: "女性",
      male: "男性",
      city: "出生城市",
      cityPlaceholder: "搜索城市，例如：石家庄",
      submit: "生成融合报告",
      pending: "正在洞察星盘，这需要一点时间...",
      privacy: "八字与星盘底层独立计算",
    },
    card: {
      sample: "柔光示例",
      core: "日柱",
      sky: "星空层",
      resonance: "共振",
    },
    method: {
      eyebrow: "高级留白系统",
      title: "同一个命理引擎，换一种更明亮的产品语言。",
      description:
        "黑版偏宇宙和神秘，白版 1.0 保留深度，但把视觉切换到瓷白、雾感和编辑型清晰度。",
      items: [
        {
          title: "元素动物",
          body: "60 甲子卡牌成为柔和的视觉锚点，不再依赖晦涩字符。",
        },
        {
          title: "行星翻译",
          body: "日主映射到星体，再由出生星盘补充心理动力与时间感。",
        },
        {
          title: "模块阅读",
          body: "报告拆成命盘核心、外在形象、深层自我、事业、感情、成长与健康。",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 张卡牌，一套视觉语言",
      title: "带有文化厚度的淡彩原型。",
      description:
        "每个柱都以动物卡牌呈现，搭配莫兰迪渐变、柔和玻璃层和更舒服的留白。",
    },
    fusion: {
      eyebrow: "解读示例",
      title: "雨露灵兔，遇见双鱼座太阳。",
      description:
        "癸卯带有阴水感受力与兔的社交直觉，双鱼座太阳再次强调想象力、渗透性和情绪共鸣。",
      chips: ["阴水", "木兔", "太阳双鱼", "木星共振"],
    },
    premium: {
      eyebrow: "从免费日柱到完整融合",
      title: "一份能让人安静读下去的报告。",
      description:
        "白版 1.0 面向喜欢轻盈高级感的用户：更柔的色彩、更大的呼吸感、更清晰的模块。",
      items: ["真太阳时八字引擎", "独立占星引擎", "流式 AI 报告模块"],
      cta: "开始白版报告",
    },
  },
  ru: {
    nav: {
      method: "Метод",
      archetypes: "Архетипы",
      report: "Отчет",
      black: "V black 1.0",
    },
    hero: {
      version: "V white 1.0",
      eyebrow: "Ба-цзы · Натальное небо · Мягкий интеллект",
      title: "Более светлый способ читать судьбу.",
      lead:
        "DestinyPixel White сохраняет тот же двойной движок, но подает его через спокойный, светлый интерфейс для международной аудитории.",
      name: "Имя",
      date: "Дата рождения",
      time: "Время рождения",
      gender: "Пол",
      female: "Женский",
      male: "Мужской",
      city: "Город рождения",
      cityPlaceholder: "Найдите город, например Shijiazhuang",
      submit: "Создать мой отчет",
      pending: "Читаем вашу карту, это займет немного времени...",
      privacy: "Ба-цзы и астрология считаются отдельно",
    },
    card: {
      sample: "Светлый пример",
      core: "Дневной столп",
      sky: "Небесный слой",
      resonance: "Резонанс",
    },
    method: {
      eyebrow: "Премиальная система с воздухом",
      title: "Тот же метафизический движок в более светлом языке продукта.",
      description:
        "Черная версия звучит космично и мистически. White 1.0 сохраняет глубину, но добавляет фарфоровую мягкость и редакционную ясность.",
      items: [
        {
          title: "Стихийное животное",
          body: "60 карт Цзя-цзы становятся мягкими визуальными якорями вместо сложных символов.",
        },
        {
          title: "Планетарный перевод",
          body: "Дневной мастер переводится в планету, а натальное небо добавляет психологическое движение.",
        },
        {
          title: "Модульное чтение",
          body: "Отчет делится на ядро, образ, глубинное Я, карьеру, любовь, рост и здоровье.",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 карт, один визуальный язык",
      title: "Пастельные архетипы с культурной глубиной.",
      description:
        "Каждый столп показан как коллекционная карта животного в мягких градиентах и светлых слоях интерфейса.",
    },
    fusion: {
      eyebrow: "Пример чтения",
      title: "Роса Кролика встречает Солнце в Рыбах.",
      description:
        "Gui Mao несет чувствительность иньской воды и социальный интеллект Кролика. Рыбы повторяют воображение, проницаемость и эмоциональную настройку.",
      chips: ["Иньская вода", "Кролик", "Солнце в Рыбах", "Резонанс Юпитера"],
    },
    premium: {
      eyebrow: "От дневного столпа к полному синтезу",
      title: "Отчет, который хочется читать спокойно.",
      description:
        "White 1.0 создан для пользователей, которым нужна мистика без визуальной тяжести: мягкий цвет, воздух и ясные модули.",
      items: [
        "Истинное солнечное время",
        "Независимый астрологический движок",
        "Потоковые AI-модули отчета",
      ],
      cta: "Начать белый отчет",
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
          <a className="white-brand" href="/white">
            <span aria-hidden="true" />
            DestinyPixel
          </a>

          <nav className="white-nav" aria-label="White version navigation">
            <a href="#method">{text.nav.method}</a>
            <a href="#archetypes">{text.nav.archetypes}</a>
            <a href="#report">{text.nav.report}</a>
          </nav>

          <div className="white-actions">
            <a href="/" className="white-black-link">
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
              <p>Jiazi cards</p>
              <span>10</span>
              <p>Planets</p>
              <span>7</span>
              <p>Modules</p>
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
                width={309}
                height={418}
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
          <div className="white-section-heading">
            <p>{text.method.eyebrow}</p>
            <h2>{text.method.title}</h2>
            <span>{text.method.description}</span>
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
                    width={309}
                    height={418}
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
          <span>DestinyPixel · V white 1.0</span>
          <span>
            <MapPin size={13} aria-hidden="true" />
            /white
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
