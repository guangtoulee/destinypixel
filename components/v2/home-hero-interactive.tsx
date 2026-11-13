"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { ArrowRight, CalendarDays, Compass, ShieldCheck, Sparkles } from "lucide-react";
import ArchetypeMotionPlayer from "@/components/archetype-motion-player";
import { archetypeMotion, archetypePosterPath, archetypeVideoPath } from "@/lib/archetype-motion";
import { trackToolEvent } from "@/lib/analytics";
import { birthDateHandoffEvent, offerBirthDate } from "@/lib/birth-date-handoff";
import { discoveryHref } from "@/lib/discovery";
import { toTraditional } from "@/lib/journal-locales";
import type { ReportLocale } from "@/lib/report-i18n";
import { sectionHref } from "@/lib/section-journeys";
import styles from "@/components/section-journeys.module.css";

export type PillarMiniPreview = {
  pillar: string;
  slug: string;
  name: string;
  image: string;
  master: string;
  animal: string;
  snippet: string;
};

type IntentionKey = "love" | "career" | "clarity";

const launcherCopy = {
  en: {
    modeAria: "Choose how to start",
    tabBirth: "Birth Archetype",
    tabBirthSub: "Date only · Free",
    tabAsk: "Ask a Question",
    tabAskSub: "Tarot · Sticks · I Ching",
    dateLabel: "Pick your Gregorian birth date",
    revealBtn: "Reveal",
    busy: "Reading…",
    tryToday: "Today's pillar",
    privacy: "Calculated locally in your browser · Never uploaded · No account",
    invalidDate: "Please choose a valid birth date between 1800 and today.",
    openPortrait: "Open full portrait",
    continueReport: "Add birth time & city",
    intentionPromptLabel: "Choose what weighs on your mind",
    intentions: {
      love: {
        chip: "Love & Connection",
        guide: "Frame it gently: “What dynamic between us deserves honest attention right now?”",
        recommended: "sticks" as const,
      },
      career: {
        chip: "Work & Decision",
        guide: "Frame it clearly: “What changes if I commit to this path over the next season?”",
        recommended: "iching" as const,
      },
      clarity: {
        chip: "Present Clarity",
        guide: "Frame it openly: “What am I overlooking in my current situation?”",
        recommended: "tarot" as const,
      },
    },
    sanctuaries: [
      {
        key: "tarot" as const,
        path: "/tarot",
        glyph: "☽",
        title: "Mountain-Lake Tarot",
        meta: "78 cards · Free table & spreads",
        desc: "Shuffle, arrange and turn cards to mirror unspoken tension and possibilities.",
      },
      {
        key: "sticks" as const,
        path: "/sticks",
        glyph: "◈",
        title: "Temple Fortune Sticks",
        meta: "Guanyin · Yuelao · Guandi · Lookup",
        desc: "Draw one numbered bamboo stick or look up a sign number you already hold.",
      },
      {
        key: "iching" as const,
        path: "/iching",
        glyph: "☰",
        title: "I Ching · Six Lines",
        meta: "3-Coin toss & Plum Blossom",
        desc: "Cast original and changed hexagrams to observe timing, momentum and turning points.",
      },
    ],
    recommendedBadge: "Suggested",
    motionBadge: "LIVING ARCHETYPE EDITION",
    motionInspect: "Read portrait",
    playLabel: "Play card animation",
    pauseLabel: "Pause card animation",
    switcherAria: "Switch living Day Pillar portrait",
  },
  zh: {
    modeAria: "选择你的探索起点",
    tabBirth: "查生日意象",
    tabBirthSub: "只需公历生日 · 免费",
    tabAsk: "问眼前心事",
    tabAskSub: "塔罗 · 灵签 · 六爻",
    dateLabel: "选择你的公历出生日期，即刻预览日柱意象",
    revealBtn: "揭晓意象",
    busy: "推算中…",
    tryToday: "看看今日干支",
    privacy: "仅在当前浏览器本地推算，不上传生日 · 免费无需登录",
    invalidDate: "请选择 1800 年至今天之间的有效公历日期。",
    openPortrait: "阅读完整意象卡",
    continueReport: "带入生日排完整图谱",
    intentionPromptLabel: "先选一个此刻最挂心的方向",
    intentions: {
      love: {
        chip: "感情走向",
        guide: "提问建议：「在这段关系里，我此刻最需要看清的互动模式与边界是什么？」",
        recommended: "sticks" as const,
      },
      career: {
        chip: "事业抉择",
        guide: "提问建议：「如果选择这条方向推进，接下来需要留意的时机与阻力在哪里？」",
        recommended: "iching" as const,
      },
      clarity: {
        chip: "当下迷茫",
        guide: "提问建议：「眼前的困局中，有哪些被我忽略的线索正在浮现？」",
        recommended: "tarot" as const,
      },
    },
    sanctuaries: [
      {
        key: "tarot" as const,
        path: "/tarot",
        glyph: "☽",
        title: "山湖塔罗牌桌",
        meta: "78 张完整牌组 · 自由摆阵",
        desc: "在静谧山湖暮色间亲手洗牌、抽选与翻牌，映照潜意识里的真实处境。",
      },
      {
        key: "sticks" as const,
        path: "/sticks",
        glyph: "◈",
        title: "灵签小殿",
        meta: "观音 · 月老 · 关帝 · 查签号",
        desc: "五大传统签系在线诚心求签，亦支持直接输入线下抽到的签号查解。",
      },
      {
        key: "iching" as const,
        path: "/iching",
        glyph: "☰",
        title: "易经 · 六爻起卦",
        meta: "三枚铜钱摇卦 · 梅花易数",
        desc: "推演本卦、动爻与之卦，观察一件事的来龙去脉与动变契机。",
      },
    ],
    recommendedBadge: "契合此问",
    motionBadge: "动态典藏意象 · 五选一",
    motionInspect: "查看此柱详解",
    playLabel: "播放意象动画",
    pauseLabel: "暂停意象动画",
    switcherAria: "切换五张动态日柱意象卡",
  },
  ru: {
    modeAria: "Выберите способ начала",
    tabBirth: "Образ по дате",
    tabBirthSub: "Только дата · Бесплатно",
    tabAsk: "Задать вопрос",
    tabAskSub: "Таро · Жребии · И цзин",
    dateLabel: "Выберите дату рождения по григорианскому календарю",
    revealBtn: "Открыть",
    busy: "Расчёт…",
    tryToday: "Столп сегодня",
    privacy: "Расчёт происходит локально в браузере · Без загрузки и аккаунта",
    invalidDate: "Укажите корректную дату рождения от 1800 года до сегодняшнего дня.",
    openPortrait: "Полный портрет",
    continueReport: "Добавить время и город",
    intentionPromptLabel: "О чём ваш сегодняшний вопрос?",
    intentions: {
      love: {
        chip: "Отношения",
        guide: "Подсказка для вопроса: «Какую динамику между нами важно спокойно увидеть сейчас?»",
        recommended: "sticks" as const,
      },
      career: {
        chip: "Работа и выбор",
        guide: "Подсказка для вопроса: «Что изменится, если я выберу это направление в ближайший сезон?»",
        recommended: "iching" as const,
      },
      clarity: {
        chip: "Внутренняя ясность",
        guide: "Подсказка для вопроса: «Какую важную деталь ситуации я сейчас упускаю?»",
        recommended: "tarot" as const,
      },
    },
    sanctuaries: [
      {
        key: "tarot" as const,
        path: "/tarot",
        glyph: "☽",
        title: "Таро горного озера",
        meta: "78 карт · Свободный стол",
        desc: "Перетасуйте и откройте карты в тихой сумеречной студии для самоанализа.",
      },
      {
        key: "sticks" as const,
        path: "/sticks",
        glyph: "◈",
        title: "Храмовые жребии",
        meta: "Гуаньинь · Юэлао · Гуаньди",
        desc: "Вытяните палочку онлайн или проверьте уже известный номер знака.",
      },
      {
        key: "iching" as const,
        path: "/iching",
        glyph: "☰",
        title: "И цзин · Шесть черт",
        meta: "Три монеты и Мэйхуа",
        desc: "Постройте исходную и изменённую гексаграммы для анализа перемен.",
      },
    ],
    recommendedBadge: "Рекомендуем",
    motionBadge: "ОЖИВШИЕ ОБРАЗЫ ДНЯ",
    motionInspect: "Читать портрет",
    playLabel: "Включить анимацию",
    pauseLabel: "Пауза анимации",
    switcherAria: "Переключить оживший образ столпа дня",
  },
};

function getCopy(locale: ReportLocale) {
  if (locale === "zh-TW") {
    return JSON.parse(toTraditional(JSON.stringify(launcherCopy.zh))) as (typeof launcherCopy)["zh"];
  }
  return locale === "zh" ? launcherCopy.zh : locale === "ru" ? launcherCopy.ru : launcherCopy.en;
}

function localTodayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function HomeQuickLauncher({
  locale,
  pillars,
}: {
  locale: ReportLocale;
  pillars: PillarMiniPreview[];
}) {
  const copy = getCopy(locale);
  const [mode, setMode] = useState<"birth" | "ask">("birth");
  const [dateValue, setDateValue] = useState("");
  const [matched, setMatched] = useState<PillarMiniPreview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [intention, setIntention] = useState<IntentionKey>("clarity");
  const calcRequestId = useRef(0);

  async function evaluateDate(rawDate: string, trackStart = false) {
    setDateValue(rawDate);
    setError("");
    if (!rawDate) {
      setMatched(null);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return;

    const reqId = ++calcRequestId.current;
    setBusy(true);
    if (trackStart) trackToolEvent("tool_start", "day_pillar");

    try {
      const { calculateDateDayPillar } = await import("@/lib/day-pillar");
      if (calcRequestId.current !== reqId) return;
      const result = calculateDateDayPillar(rawDate, localTodayIso());
      if (!result.ok) {
        setMatched(null);
        setError(copy.invalidDate);
        trackToolEvent("tool_error", "day_pillar");
        return;
      }
      const found = pillars.find(item => item.pillar === result.pillar) ?? null;
      if (!found) {
        setMatched(null);
        setError(copy.invalidDate);
        return;
      }
      setMatched(found);
      trackToolEvent("tool_success", "day_pillar");
    } catch {
      if (calcRequestId.current === reqId) {
        setError(copy.invalidDate);
      }
    } finally {
      if (calcRequestId.current === reqId) {
        setBusy(false);
      }
    }
  }

  function handleBirthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void evaluateDate(dateValue, true);
  }

  function handleContinueToReport() {
    try {
      if (dateValue) {
        offerBirthDate(window.sessionStorage, dateValue);
        window.dispatchEvent(new Event(birthDateHandoffEvent));
      }
    } catch {
      /* Ignore storage blocks */
    }
    const detailsEl = document.getElementById("report") as HTMLDetailsElement | null;
    if (detailsEl) {
      detailsEl.open = true;
      detailsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const discoverBase = discoveryHref(locale);
  const activeIntention = copy.intentions[intention];

  return (
    <div className={styles.launcherShell}>
      <div className={styles.launcherTabs} role="tablist" aria-label={copy.modeAria}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "birth"}
          className={styles.launcherTab}
          data-active={mode === "birth"}
          onClick={() => setMode("birth")}
        >
          <span className={styles.launcherTabTitle}>
            <CalendarDays size={15} aria-hidden="true" />
            {copy.tabBirth}
          </span>
          <small>{copy.tabBirthSub}</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "ask"}
          className={styles.launcherTab}
          data-active={mode === "ask"}
          onClick={() => setMode("ask")}
        >
          <span className={styles.launcherTabTitle}>
            <Compass size={15} aria-hidden="true" />
            {copy.tabAsk}
          </span>
          <small>{copy.tabAskSub}</small>
        </button>
      </div>

      {mode === "birth" ? (
        <div className={styles.launcherPanel}>
          <form onSubmit={handleBirthSubmit} className={styles.birthQuickForm} data-analytics-form="day_pillar" noValidate>
            <div className={styles.birthLabelRow}>
              <label htmlFor="home-quick-birthday">{copy.dateLabel}</label>
              <button
                type="button"
                className={styles.sampleDateChip}
                onClick={() => {
                  const today = localTodayIso();
                  void evaluateDate(today, true);
                }}
              >
                <Sparkles size={12} aria-hidden="true" />
                {copy.tryToday}
              </button>
            </div>
            <div className={styles.birthInputGroup}>
              <input
                id="home-quick-birthday"
                name="birthday"
                type="date"
                min="1800-01-01"
                max="2100-12-31"
                value={dateValue}
                onFocus={() => {
                  void import("@/lib/day-pillar");
                }}
                onChange={event => {
                  void evaluateDate(event.currentTarget.value, false);
                }}
                aria-invalid={Boolean(error)}
                required
              />
              <button type="submit" className={styles.birthSubmitBtn} disabled={busy}>
                <span>{busy ? copy.busy : copy.revealBtn}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
            {error ? (
              <p className={styles.launcherError} role="alert">
                {error}
              </p>
            ) : null}
            <p className={styles.launcherPrivacy}>
              <ShieldCheck size={13} aria-hidden="true" />
              <span>{copy.privacy}</span>
            </p>
          </form>

          {matched ? (
            <div className={styles.miniPreviewCard} aria-live="polite">
              <div className={styles.miniPreviewThumb}>
                <Image
                  src={matched.image}
                  alt={`${matched.pillar} · ${matched.name}`}
                  width={96}
                  height={128}
                  sizes="96px"
                />
              </div>
              <div className={styles.miniPreviewBody}>
                <div className={styles.miniPreviewBadges}>
                  <span className={styles.ganzhiSeal}>{matched.pillar}</span>
                  <span className={styles.elementTag}>
                    {matched.master} · {matched.animal}
                  </span>
                </div>
                <h3>{matched.name}</h3>
                <p>{matched.snippet}</p>
                <div className={styles.miniPreviewActions}>
                  <a
                    className={styles.miniPrimaryLink}
                    href={`${discoverBase}${locale === "en" ? "?" : "&"}pillar=${matched.slug}`}
                  >
                    <span>{copy.openPortrait}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                  <a
                    className={styles.miniSecondaryLink}
                    href="#report"
                    onClick={handleContinueToReport}
                  >
                    <span>{copy.continueReport}</span>
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.launcherPanel}>
          <p className={styles.intentionHeading}>{copy.intentionPromptLabel}</p>
          <div className={styles.intentionChips} role="group" aria-label={copy.intentionPromptLabel}>
            {(["love", "career", "clarity"] as const).map(key => (
              <button
                key={key}
                type="button"
                className={styles.intentionChip}
                aria-pressed={intention === key}
                onClick={() => setIntention(key)}
              >
                {copy.intentions[key].chip}
              </button>
            ))}
          </div>
          <p className={styles.intentionPromptBox}>{activeIntention.guide}</p>
          <div className={styles.sanctuaryQuickGrid}>
            {copy.sanctuaries.map(item => {
              const isSuggested = activeIntention.recommended === item.key;
              return (
                <a
                  key={item.key}
                  href={sectionHref(item.path, locale)}
                  className={styles.sanctuaryQuickCard}
                  data-suggested={isSuggested}
                >
                  <div className={styles.sanctuaryQuickTop}>
                    <span className={styles.sanctuaryGlyph} aria-hidden="true">
                      {item.glyph}
                    </span>
                    {isSuggested ? <span className={styles.suggestedPill}>{copy.recommendedBadge}</span> : null}
                  </div>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                  <p>{item.desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroMotionShowcase({
  locale,
  pillarMeta,
}: {
  locale: ReportLocale;
  pillarMeta: Record<string, { master: string; animal: string; cycleIndex: number }>;
}) {
  const copy = getCopy(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);

  const active = archetypeMotion[activeIndex] ?? archetypeMotion[0];
  const localizedName = (item: (typeof archetypeMotion)[number]) =>
    locale === "zh-TW"
      ? toTraditional(item.name.zh)
      : locale === "zh"
        ? item.name.zh
        : locale === "ru"
          ? item.name.ru
          : item.name.en;

  const meta = pillarMeta[active.pillar];
  const discoverBase = discoveryHref(locale);
  const activeInspectHref = `${discoverBase}${locale === "en" ? "?" : "&"}pillar=${active.slug}`;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `${((0.5 - py) * 9).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${((px - 0.5) * 10).toFixed(2)}deg`);
    el.style.setProperty("--foil-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--foil-y", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--foil-opacity", "1");
  }

  function handlePointerLeave() {
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--foil-x", "50%");
    el.style.setProperty("--foil-y", "28%");
    el.style.setProperty("--foil-opacity", "0.45");
  }

  return (
    <div className={styles.showcaseColumn}>
      <div
        className={styles.showcasePerspective}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div
          ref={frameRef}
          className={styles.showcaseFrame}
          data-landscape={active.landscape}
        >
          <div className={styles.showcaseHeaderBar}>
            <span className={styles.showcaseEdition}>{copy.motionBadge}</span>
            <span className={styles.showcaseCycleNo}>
              No.{String(meta?.cycleIndex ?? 40).padStart(2, "0")} / 60
            </span>
          </div>

          <div className={styles.showcaseMediaStage} data-landscape={active.landscape}>
            <ArchetypeMotionPlayer
              key={active.slug}
              className={styles.showcasePlayer}
              src={archetypeVideoPath(active.slug)}
              poster={archetypePosterPath(active.slug)}
              label={`${active.pillar} · ${localizedName(active)}`}
              playLabel={copy.playLabel}
              pauseLabel={copy.pauseLabel}
            />
            <div className={styles.holographicFoil} aria-hidden="true" />
          </div>

          <div className={styles.showcaseCaptionBar}>
            <div>
              <div className={styles.showcaseTitleRow}>
                <span className={styles.showcasePillarSeal}>{active.pillar}</span>
                <strong>{localizedName(active)}</strong>
              </div>
              {meta ? (
                <p className={styles.showcaseSubMeta}>
                  {meta.master} · {meta.animal}
                </p>
              ) : null}
            </div>
            <a className={styles.showcaseInspectLink} href={activeInspectHref}>
              <span>{copy.motionInspect}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.motionPillStrip} role="group" aria-label={copy.switcherAria}>
        {archetypeMotion.map((item, idx) => {
          const selected = idx === activeIndex;
          return (
            <button
              key={item.slug}
              type="button"
              className={styles.motionThumbPill}
              aria-pressed={selected}
              onClick={() => setActiveIndex(idx)}
            >
              <img
                src={archetypePosterPath(item.slug)}
                alt=""
                width={34}
                height={44}
                loading="lazy"
              />
              <span className={styles.motionThumbText}>
                <strong>{item.pillar}</strong>
                <small>{localizedName(item)}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
