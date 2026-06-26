"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Languages,
  Loader2,
  LockKeyhole,
  Moon,
  Orbit,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import { Solar } from "lunar-javascript";
import { createFusionReportAction } from "@/app/actions";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { cities } from "@/lib/geo/cities";
import {
  type PillarProfile,
  pillarsDB,
} from "@/lib/pillars";
import {
  normalizeReportLocale,
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";
import { getPillarDisplay } from "@/lib/bazi-totems";

type Copy = {
  nav: {
    method: string;
    archetypes: string;
    premium: string;
    signIn: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    statement: string;
    description: string;
    nameLabel: string;
    dateLabel: string;
    timeLabel: string;
    genderLabel: string;
    genderOptions: {
      male: string;
      female: string;
    };
    placeLabel: string;
    placePlaceholder: string;
    dateHint: string;
    button: string;
    pendingButton: string;
    privacy: string;
  };
  result: {
    sample: string;
    reading: string;
    dayPillar: string;
    stem: string;
    branch: string;
    strength: string;
    growth: string;
    premiumLabel: string;
    premiumTitle: string;
    premiumDescription: string;
    premiumButton: string;
  };
  method: {
    eyebrow: string;
    title: string;
    description: string;
    coreTitle: string;
    coreCopy: string;
    skyTitle: string;
    skyCopy: string;
    synthesisTitle: string;
    synthesisCopy: string;
  };
  example: {
    eyebrow: string;
    title: string;
    description: string;
    core: string;
    solar: string;
    aspect: string;
    synthesis: string;
    synthesisCopy: string;
  };
  deck: {
    eyebrow: string;
    title: string;
    description: string;
  };
  premium: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
    button: string;
    note: string;
  };
  stats: {
    archetypes: string;
    planetary: string;
    unified: string;
  };
  usage: string;
  footer: string;
};

const copy: Record<ReportLocale, Copy> = {
  en: {
    nav: {
      method: "The Method",
      archetypes: "60 Archetypes",
      premium: "Full Fusion",
      signIn: "Sign in",
    },
    hero: {
      eyebrow: "Eastern timing · Western sky · One human story",
      title: "DestinyPixel",
      statement: "Your birth has two ancient languages. We translate both.",
      description:
        "Start with your Day Pillar: a vivid elemental animal archetype. Then layer in the Sun, Moon, planets, and aspects to reveal where two systems describe the same person.",
      nameLabel: "Name",
      dateLabel: "Date of birth",
      timeLabel: "Birth time",
      genderLabel: "Gender",
      genderOptions: {
        male: "Male",
        female: "Female",
      },
      placeLabel: "Birth city",
      placePlaceholder: "Search city, e.g. Shijiazhuang",
      dateHint:
        "The backend runs Bazi and Astrology separately, then fuses their signals in the report.",
      button: "Generate my fusion report",
      pendingButton: "Reading your chart, this may take a moment...",
      privacy: "Your birth data stays private",
    },
    result: {
      sample: "Fusion example",
      reading: "Your free reading",
      dayPillar: "Day Pillar",
      stem: "Elemental self",
      branch: "Animal field",
      strength: "Natural expression",
      growth: "Growth edge",
      premiumLabel: "Your sky layer",
      premiumTitle: "Add time and place to complete the picture",
      premiumDescription:
        "See how your Sun, Moon, ten planetary drives, houses, and aspects amplify or challenge this core archetype.",
      premiumButton: "Explore the full fusion",
    },
    method: {
      eyebrow: "Not two readings side by side",
      title: "One identity, viewed through two coordinate systems.",
      description:
        "DestinyPixel treats the Day Pillar as your elemental core and the natal sky as its living context. The synthesis looks for repeated themes, meaningful tension, and traits neither map explains alone.",
      coreTitle: "Elemental core",
      coreCopy:
        "Ten Heavenly Stems become ten approachable modes of energy; the twelve Earthly Branches become memorable animal fields.",
      skyTitle: "Planetary drives",
      skyCopy:
        "The Sun, Moon, planets, signs, houses, and aspects show how that core seeks, feels, acts, bonds, and matures.",
      synthesisTitle: "Resonance",
      synthesisCopy:
        "Shared signals become the headline. Contradictions become the most useful part of the reading.",
    },
    example: {
      eyebrow: "A fusion in practice",
      title: "The Dewy Rabbit meets a Pisces Sun.",
      description:
        "Gui Mao combines Yin Water's sensitivity with the Rabbit's refined social awareness. A late Pisces Sun echoes permeability, imagination, and emotional intelligence.",
      core: "Gui Mao · Yin Water Rabbit",
      solar: "Sun in Pisces · 29°",
      aspect: "Sun trine Jupiter · 3.2°",
      synthesis: "Unified signal",
      synthesisCopy:
        "A gentle intuitive who reads the room before speaking, creates through atmosphere, and needs boundaries strong enough to protect a highly receptive inner world.",
    },
    deck: {
      eyebrow: "A visual language for the 60 pillars",
      title: "No cryptic characters required.",
      description:
        "Each pillar becomes an elemental animal with a memorable name, visual identity, strength, shadow, and path of growth.",
    },
    premium: {
      eyebrow: "The complete personal map",
      title: "Go beyond your Day Archetype.",
      description:
        "Your premium report combines the full Four Pillars with a precise natal chart, then translates both into one coherent personality and timing narrative.",
      items: [
        "Four Pillars, ten gods, and elemental balance",
        "Sun, Moon, planets, houses, and major aspects",
        "Repeated traits, inner contradictions, and timing windows",
      ],
      button: "Build my full profile",
      note: "Exact birth time and birthplace required",
    },
    stats: {
      archetypes: "elemental animal archetypes",
      planetary: "planetary drives",
      unified: "unified profile",
    },
    usage: "For self-reflection and entertainment",
    footer: "Two traditions. One clearer view of you.",
  },
  zh: {
    nav: {
      method: "融合方法",
      archetypes: "六十原型",
      premium: "完整报告",
      signIn: "登录",
    },
    hero: {
      eyebrow: "东方时间 · 西方星空 · 同一个人的故事",
      title: "DestinyPixel",
      statement: "你的出生，拥有两种古老语言。我们把它们翻译成同一幅人格图景。",
      description:
        "先从日柱开始：一个有画面、有性格的元素动物原型；再叠加太阳、月亮、行星与相位，看两套体系如何描述同一个你。",
      nameLabel: "姓名",
      dateLabel: "出生日期",
      timeLabel: "出生时间",
      genderLabel: "性别",
      genderOptions: {
        male: "男性",
        female: "女性",
      },
      placeLabel: "出生城市",
      placePlaceholder: "搜索城市，例如：石家庄",
      dateHint: "后端独立计算八字与星盘，再在报告页提取交集与互补信号。",
      button: "生成融合报告",
      pendingButton: "正在洞察星盘，这需要一点时间...",
      privacy: "你的出生信息仅用于本次测算",
    },
    result: {
      sample: "融合示例",
      reading: "你的免费解读",
      dayPillar: "日柱",
      stem: "元素自我",
      branch: "动物场域",
      strength: "自然表达",
      growth: "成长方向",
      premiumLabel: "你的星空层",
      premiumTitle: "加入时间与地点，补全人格图景",
      premiumDescription:
        "太阳、月亮、十大行星驱力、宫位与相位，会如何放大、修饰或挑战你的核心原型。",
      premiumButton: "探索完整融合报告",
    },
    method: {
      eyebrow: "不是两份报告并排摆放",
      title: "同一个人格，两套坐标系统。",
      description:
        "DestinyPixel 把日柱视为元素核心，把出生星空视为它所处的动态语境。融合解读寻找重复主题、有意义的张力，以及任何单一体系无法独立解释的部分。",
      coreTitle: "元素核心",
      coreCopy:
        "十天干被翻译为十种易于理解的能量模式，十二地支则成为十二个有记忆点的动物场域。",
      skyTitle: "行星驱力",
      skyCopy:
        "太阳、月亮、行星、星座、宫位与相位，描述核心人格如何追求、感受、行动、连接与成熟。",
      synthesisTitle: "共振关系",
      synthesisCopy:
        "重复出现的信号成为人格主线；彼此矛盾的部分，则成为最有价值的洞察。",
    },
    example: {
      eyebrow: "一次真实的融合示意",
      title: "雨露灵兔，遇见双鱼座太阳。",
      description:
        "癸卯融合了阴水的感受力与兔的细腻社交直觉；双鱼座末度太阳再次强调渗透性、想象力与情绪智慧。",
      core: "癸卯 · 阴水灵兔",
      solar: "太阳双鱼座 · 29°",
      aspect: "太阳拱木星 · 3.2°",
      synthesis: "统一信号",
      synthesisCopy:
        "一个先感知氛围、再选择表达的温柔直觉者。擅长通过情绪与审美创造，也需要足够清晰的边界来保护高度开放的内在世界。",
    },
    deck: {
      eyebrow: "六十甲子的视觉语言",
      title: "无需先读懂晦涩汉字。",
      description:
        "每个日柱都成为一个有名字、有形象、有优势、有阴影与成长路径的元素动物原型。",
    },
    premium: {
      eyebrow: "完整个人图谱",
      title: "从日柱原型，走向完整的你。",
      description:
        "高级报告融合完整四柱与精确出生星盘，再把两者翻译为一套连贯的人格、关系与时间叙事。",
      items: [
        "四柱、十神与五行能量平衡",
        "太阳、月亮、行星、宫位与主要相位",
        "重复特质、内在矛盾与重要时间窗口",
      ],
      button: "生成完整个人图谱",
      note: "需要准确出生时间与出生地点",
    },
    stats: {
      archetypes: "个元素动物原型",
      planetary: "种行星驱力",
      unified: "份统一画像",
    },
    usage: "用于自我探索与娱乐参考",
    footer: "两种传统，一幅更清晰的自我图景。",
  },
  ru: {
    nav: {
      method: "Метод",
      archetypes: "60 архетипов",
      premium: "Полный синтез",
      signIn: "Войти",
    },
    hero: {
      eyebrow: "Восточное время · Западное небо · Одна история",
      title: "DestinyPixel",
      statement: "У вашего рождения два древних языка. Мы переводим их в одну карту.",
      description:
        "Начните с дневного столпа: яркого стихийного животного архетипа. Затем добавьте Солнце, Луну, планеты и аспекты, чтобы увидеть, где две системы описывают одного и того же человека.",
      nameLabel: "Имя",
      dateLabel: "Дата рождения",
      timeLabel: "Время рождения",
      genderLabel: "Пол",
      genderOptions: {
        male: "Мужской",
        female: "Женский",
      },
      placeLabel: "Город рождения",
      placePlaceholder: "Найдите город, например Shijiazhuang",
      dateHint:
        "Механики Ба-цзы и астрологии считаются отдельно, а затем их сигналы соединяются в отчете.",
      button: "Создать мой отчет",
      pendingButton: "Читаем вашу карту, это займет немного времени...",
      privacy: "Данные рождения остаются приватными",
    },
    result: {
      sample: "Пример синтеза",
      reading: "Ваше бесплатное чтение",
      dayPillar: "Дневной столп",
      stem: "Стихийное Я",
      branch: "Животное поле",
      strength: "Естественное выражение",
      growth: "Точка роста",
      premiumLabel: "Ваш небесный слой",
      premiumTitle: "Добавьте время и место, чтобы завершить картину",
      premiumDescription:
        "Солнце, Луна, десять планетарных импульсов, дома и аспекты показывают, как небо усиливает или проверяет ваш базовый архетип.",
      premiumButton: "Открыть полный синтез",
    },
    method: {
      eyebrow: "Не две отдельные трактовки",
      title: "Одна личность, увиденная через две системы координат.",
      description:
        "DestinyPixel рассматривает дневной столп как стихийное ядро, а натальное небо как живой контекст. Синтез ищет повторяющиеся темы, значимые напряжения и качества, которые одна система не объясняет полностью.",
      coreTitle: "Стихийное ядро",
      coreCopy:
        "Десять небесных стволов становятся понятными режимами энергии, а двенадцать земных ветвей — запоминающимися животными полями.",
      skyTitle: "Планетарные импульсы",
      skyCopy:
        "Солнце, Луна, планеты, знаки, дома и аспекты показывают, как ядро ищет, чувствует, действует, соединяется и взрослеет.",
      synthesisTitle: "Резонанс",
      synthesisCopy:
        "Повторяющиеся сигналы становятся главной линией. Противоречия превращаются в самую полезную часть чтения.",
    },
    example: {
      eyebrow: "Синтез на практике",
      title: "Роса Кролика встречает Солнце в Рыбах.",
      description:
        "Gui Mao соединяет чувствительность иньской воды с тонкой социальной интуицией Кролика. Позднее Солнце в Рыбах усиливает воображение, проницаемость и эмоциональный интеллект.",
      core: "Gui Mao · Иньская Вода и Кролик",
      solar: "Солнце в Рыбах · 29°",
      aspect: "Солнце тригон Юпитер · 3.2°",
      synthesis: "Единый сигнал",
      synthesisCopy:
        "Мягкий интуит, который сначала считывает атмосферу, затем говорит. Творит через настроение и нуждается в ясных границах, чтобы защитить восприимчивый внутренний мир.",
    },
    deck: {
      eyebrow: "Визуальный язык 60 столпов",
      title: "Без криптических символов.",
      description:
        "Каждый столп становится стихийным животным с именем, образом, силой, тенью и путем роста.",
    },
    premium: {
      eyebrow: "Полная личная карта",
      title: "Выйдите за пределы дневного архетипа.",
      description:
        "Премиальный отчет объединяет все четыре столпа с точной натальной картой и переводит их в цельную историю личности и времени.",
      items: [
        "Четыре столпа, десять богов и баланс стихий",
        "Солнце, Луна, планеты, дома и главные аспекты",
        "Повторяющиеся черты, внутренние противоречия и окна времени",
      ],
      button: "Построить полный профиль",
      note: "Требуются точное время и место рождения",
    },
    stats: {
      archetypes: "стихийных животных архетипов",
      planetary: "планетарных импульсов",
      unified: "единый профиль",
    },
    usage: "Для самопознания и развлечения",
    footer: "Две традиции. Более ясный взгляд на вас.",
  },
};

const deckPillars = ["甲子", "丙午", "戊辰", "庚申", "癸卯"];

function getProfileLocale(locale: ReportLocale) {
  return locale === "zh" ? "cn" : "en";
}

function getLocalizedProfileName(
  profile: PillarProfile,
  pillar: string,
  locale: ReportLocale,
) {
  if (locale === "zh") return profile.name.cn;
  if (locale === "ru") return getPillarDisplay(pillar, "ru").totemName;

  return profile.name.en;
}

function getRussianPreviewText(pillar: string) {
  const display = getPillarDisplay(pillar, "ru");

  return {
    essence: `${display.totemName} соединяет ${display.stemMeaning.toLowerCase()} с полем ${display.branchMeaning.toLowerCase()}. Это архетип тонкой реакции, внутренней памяти и точного выбора момента.`,
    strength: `Вы сильнее всего проявляетесь там, где можно превратить интуицию в форму, а наблюдение — в зрелое решение.`,
    growth:
      "Рост начинается с ясных границ: меньше распыления, больше ритма, выбора и устойчивого действия.",
  };
}

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh" ? "zh-CN" : locale === "ru" ? "ru" : "en";
}

function FusionSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-live="polite">
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

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__core" />
      <span className="brand-mark__orbit" />
    </span>
  );
}

function FusionOrbit({ locked = false }: { locked?: boolean }) {
  return (
    <div className="fusion-orbit" aria-hidden="true">
      <span className="fusion-orbit__ring fusion-orbit__ring--outer" />
      <span className="fusion-orbit__ring fusion-orbit__ring--middle" />
      <span className="fusion-orbit__axis fusion-orbit__axis--one" />
      <span className="fusion-orbit__axis fusion-orbit__axis--two" />
      <span className="fusion-orbit__planet fusion-orbit__planet--sun">
        <Sun size={13} />
      </span>
      <span className="fusion-orbit__planet fusion-orbit__planet--moon">
        <Moon size={11} />
      </span>
      <span className="fusion-orbit__planet fusion-orbit__planet--star">
        <Star size={10} fill="currentColor" />
      </span>
      {locked ? (
        <span className="fusion-orbit__lock">
          <LockKeyhole size={15} />
        </span>
      ) : null}
    </div>
  );
}

export default function DestinyExperience({
  initialLocale = "en",
}: {
  initialLocale?: ReportLocale;
}) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [birthDate, setBirthDate] = useState("");
  const [pillar, setPillar] = useState("癸卯");
  const [isSample, setIsSample] = useState(true);
  const [isWeChatBrowser, setIsWeChatBrowser] = useState(false);
  const text = copy[locale];

  const profile = useMemo(
    () => (pillarsDB as Record<string, PillarProfile>)[pillar],
    [pillar],
  );
  const display = useMemo(() => getPillarDisplay(pillar, locale), [locale, pillar]);
  const profileLocale = getProfileLocale(locale);
  const profileName = getLocalizedProfileName(profile, pillar, locale);
  const russianPreview = useMemo(() => getRussianPreviewText(pillar), [pillar]);

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

  useEffect(() => {
    setIsWeChatBrowser(/MicroMessenger/i.test(window.navigator.userAgent));
  }, []);

  function updatePreviewFromDate(value: string) {
    setBirthDate(value);
    if (!value) {
      return;
    }

    const [year, month, day] = value.split("-").map(Number);
    const result = Solar.fromYmdHms(year, month, day, 12, 0, 0)
      .getLunar()
      .getDayInGanZhi();

    if (result in pillarsDB) {
      setPillar(result);
      setIsSample(false);
    }
  }

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    window.localStorage.setItem("destinypixel-locale", nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <main className="destiny-site">
      <div className="cosmic-backdrop" aria-hidden="true">
        <Image
          src="/destinypixel-deep-space.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <span />
      </div>

      <header className="site-header">
        <div className="page-container header-inner">
          <a className="brand" href="#" aria-label="DestinyPixel home">
            <BrandMark />
            <span>DestinyPixel</span>
          </a>

          <nav className="primary-nav" aria-label="Primary navigation">
            <a href="#method">{text.nav.method}</a>
            <a href="#archetypes">{text.nav.archetypes}</a>
            <a href="#premium">{text.nav.premium}</a>
          </nav>

          <div className="header-actions">
            <a className="sign-in" href="#signin">
              {text.nav.signIn}
            </a>
            <div className="language-switch" aria-label="Language selector">
              <Languages size={15} aria-hidden="true" />
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

      <section className="hero-section" id="birth">
        <div className="page-container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              {text.hero.eyebrow}
            </p>
            <h1>{text.hero.title}</h1>
            <p className="hero-statement">{text.hero.statement}</p>
            <p className="hero-description">{text.hero.description}</p>

            <form className="birth-form advanced-birth-form" action={createFusionReportAction}>
              <input type="hidden" name="locale" value={locale} />
              <div className="birth-form__grid">
                <label className="form-field form-field--name">
                  <span>{text.hero.nameLabel}</span>
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
                <label className="form-field">
                  <span>{text.hero.dateLabel}</span>
                  <input
                    id="birth-date"
                    name="birthDate"
                    type="date"
                    value={birthDate}
                    max="2026-06-25"
                    onChange={(event) => updatePreviewFromDate(event.target.value)}
                    onInput={(event) =>
                      updatePreviewFromDate(event.currentTarget.value)
                    }
                    required
                  />
                </label>
                <label className="form-field">
                  <span>{text.hero.timeLabel}</span>
                  <input name="birthTime" type="time" required />
                </label>
                <div className="form-field form-field--gender">
                  <span>{text.hero.genderLabel}</span>
                  <div className="gender-choice" role="radiogroup" aria-label={text.hero.genderLabel}>
                    <label>
                      <input type="radio" name="gender" value="female" defaultChecked />
                      <span aria-hidden="true">♀</span>
                      {text.hero.genderOptions.female}
                    </label>
                    <label>
                      <input type="radio" name="gender" value="male" />
                      <span aria-hidden="true">♂</span>
                      {text.hero.genderOptions.male}
                    </label>
                  </div>
                </div>
                <label className="form-field form-field--place">
                  <span>{text.hero.placeLabel}</span>
                  <input
                    name="birthPlace"
                    type="search"
                    list="city-options"
                    placeholder={text.hero.placePlaceholder}
                    required
                  />
                </label>
                <datalist id="city-options">
                  {cities.map((city) => {
                    const aliases =
                      locale === "zh"
                        ? city.aliases
                        : city.aliases.filter(
                            (alias) => !/[\u4e00-\u9fff]/.test(alias),
                          );

                    return (
                      <option key={city.id} value={city.label}>
                        {[city.label, ...aliases].join(" / ")}
                      </option>
                    );
                  })}
                </datalist>
              </div>
              <div className="birth-form__submit">
                <FusionSubmitButton
                  label={text.hero.button}
                  pendingLabel={text.hero.pendingButton}
                />
              </div>
              {isWeChatBrowser ? (
                <div className="wechat-browser-warning" role="status">
                  <span aria-hidden="true">💡</span>
                  <p>
                    微信内测算可能由于网络限制导致无法加载。为了确保您能顺畅读取万字深度流年报告，强烈建议点击右上角 [...] 选择‘在浏览器打开’。
                  </p>
                </div>
              ) : null}
              <div className="birth-form__meta">
                <span>{text.hero.dateHint}</span>
                <span>
                  <ShieldCheck size={13} aria-hidden="true" />
                  {text.hero.privacy}
                </span>
              </div>
            </form>
          </div>

          <article className="archetype-result">
            <div className="archetype-result__visual">
              <Image
                key={pillar}
                src={getPillarImagePath(pillar)}
                alt={profileName}
                fill
                priority
                sizes="(max-width: 768px) 82vw, 370px"
                className="object-cover"
              />
              <span className="archetype-result__shade" />
              <div className="archetype-result__badge">
                {isSample ? text.result.sample : text.result.reading}
              </div>
              <div className="archetype-result__identity">
                <p>{display.pillarLabel}</p>
                <h2>{profileName}</h2>
                <span>
                  {display.stemMeaning} · {display.branchMeaning}
                </span>
              </div>
            </div>

            <div className="archetype-result__body">
              <p className="result-essence">
                {locale === "ru" ? russianPreview.essence : profile.essence[profileLocale]}
              </p>

              <div className="result-traits">
                <div>
                  <span>{text.result.strength}</span>
                  <p>
                    {locale === "ru"
                      ? russianPreview.strength
                      : profile.career.style[profileLocale]}
                  </p>
                </div>
                <div>
                  <span>{text.result.growth}</span>
                  <p>
                    {locale === "ru" ? russianPreview.growth : profile.growth[profileLocale]}
                  </p>
                </div>
              </div>

              <a className="result-upgrade" href="#premium">
                <span className="result-upgrade__orbit">
                  <FusionOrbit locked />
                </span>
                <span>
                  <small>{text.result.premiumLabel}</small>
                  <strong>{text.result.premiumTitle}</strong>
                  <p>{text.result.premiumDescription}</p>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
        <div className="page-container hero-footnote">
          <span>60</span>
          <p>{text.stats.archetypes}</p>
          <i />
          <span>10</span>
          <p>{text.stats.planetary}</p>
          <i />
          <span>1</span>
          <p>{text.stats.unified}</p>
        </div>
      </section>

      <section className="method-section" id="method">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">{text.method.eyebrow}</p>
            <h2>{text.method.title}</h2>
            <p>{text.method.description}</p>
          </div>

          <div className="method-flow">
            <article>
              <span className="method-number">01</span>
              <span className="method-icon">
                <Image
                  src="/archetypes/gui_mao.webp"
                  alt=""
                  width={68}
                  height={92}
                />
              </span>
              <h3>{text.method.coreTitle}</h3>
              <p>{text.method.coreCopy}</p>
            </article>
            <span className="method-connector" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <article>
              <span className="method-number">02</span>
              <span className="method-icon method-icon--orbit">
                <FusionOrbit />
              </span>
              <h3>{text.method.skyTitle}</h3>
              <p>{text.method.skyCopy}</p>
            </article>
            <span className="method-connector" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <article>
              <span className="method-number">03</span>
              <span className="method-icon method-icon--synthesis">
                <Orbit size={29} aria-hidden="true" />
              </span>
              <h3>{text.method.synthesisTitle}</h3>
              <p>{text.method.synthesisCopy}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="fusion-example">
        <div className="page-container fusion-example__layout">
          <div className="fusion-example__visual">
            <Image
              src="/archetypes/gui_mao.webp"
              alt={
                locale === "zh"
                  ? "雨露灵兔卡牌"
                  : locale === "ru"
                    ? "Карта Вода Кролик"
                    : "The Dewy Rabbit card"
              }
              width={309}
              height={418}
            />
            <div className="fusion-example__orbit">
              <FusionOrbit />
              <span className="fusion-tag fusion-tag--sun">
                <Sun size={13} aria-hidden="true" />
                {text.example.solar}
              </span>
              <span className="fusion-tag fusion-tag--aspect">
                <Orbit size={13} aria-hidden="true" />
                {text.example.aspect}
              </span>
            </div>
          </div>

          <div className="fusion-example__copy">
            <p className="eyebrow">{text.example.eyebrow}</p>
            <h2>{text.example.title}</h2>
            <p>{text.example.description}</p>

            <div className="fusion-signals">
              <div>
                <span>01</span>
                <strong>{text.example.core}</strong>
              </div>
              <div>
                <span>02</span>
                <strong>{text.example.solar}</strong>
              </div>
              <div>
                <span>03</span>
                <strong>{text.example.aspect}</strong>
              </div>
            </div>

            <div className="synthesis-note">
              <span>{text.example.synthesis}</span>
              <p>{text.example.synthesisCopy}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="deck-section" id="archetypes">
        <div className="page-container">
          <div className="section-intro section-intro--deck">
            <p className="eyebrow">{text.deck.eyebrow}</p>
            <h2>{text.deck.title}</h2>
            <p>{text.deck.description}</p>
          </div>

          <div className="archetype-deck">
            {deckPillars.map((deckPillar, index) => {
              const deckProfile = (
                pillarsDB as Record<string, PillarProfile>
              )[deckPillar];
              const deckDisplay = getPillarDisplay(deckPillar, locale);
              const deckName = getLocalizedProfileName(
                deckProfile,
                deckPillar,
                locale,
              );
              return (
                <article key={deckPillar} style={{ "--card-index": index } as React.CSSProperties}>
                  <Image
                    src={getPillarImagePath(deckPillar)}
                    alt={deckName}
                    width={309}
                    height={418}
                  />
                  <div>
                    <span>{deckDisplay.pillarLabel}</span>
                    <strong>{deckName}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="premium-section" id="premium">
        <div className="page-container premium-layout">
          <div>
            <p className="eyebrow">{text.premium.eyebrow}</p>
            <h2>{text.premium.title}</h2>
          </div>
          <div>
            <p className="premium-description">{text.premium.description}</p>
            <ul>
              {text.premium.items.map((item) => (
                <li key={item}>
                  <span>
                    <Check size={13} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a className="premium-button" href="#birth">
              {text.premium.button}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <p className="premium-note">
              <CalendarDays size={13} aria-hidden="true" />
              {text.premium.note}
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-main">
            <a className="brand" href="#" aria-label="DestinyPixel home">
              <BrandMark />
              <span>DestinyPixel</span>
            </a>
            <p>{text.footer}</p>
          </div>
          <div className="footer-bottom">
            <span>© 2026 DestinyPixel</span>
            <span>{text.usage}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
