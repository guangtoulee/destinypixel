"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  AlertCircle,
  BookOpenText,
  CalendarClock,
  ChevronDown,
  Check,
  Download,
  FileImage,
  Gem,
  LogIn,
  Loader2,
  Orbit,
  Palette,
  Save,
  Shirt,
  Sparkles,
} from "lucide-react";
import type { NatalBookSections } from "@/lib/ai/report";
import type { ReportGenerationContext } from "@/lib/ai/streaming";
import {
  elementPercentages,
  elementStyle,
  getDailyElement,
  getGemstonesForElement,
  sceneAdvice,
  strongestElement,
  targetElement,
} from "@/lib/energy-style";
import { reportCopy } from "@/lib/report-i18n";
import {
  getTransitMonthDisplay,
  getTransitOverviewDisplay,
  transitMonthSections,
  transitOverviewSection,
  type TransitMonthKey,
  type TransitSectionKey,
} from "@/lib/report-timing";

type StreamStatus = "idle" | "loading" | "ready" | "error";
type ActiveTab = "natal" | "transits";
type NatalKey = keyof NatalBookSections;
type TransitKey = TransitSectionKey;
type AuthMode = "login" | "register";
type ActionTone = "neutral" | "success" | "error";

type MemberSummary = {
  id: string;
  email: string;
  name: string | null;
  plan: "free" | "vip";
};

type SavedReportSummary = {
  id: string;
  reportId: string;
  title: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

type SectionConfig<Key extends string> = {
  key: Key;
  marker: string;
  title: string;
  kicker: string;
};

const natalSections: Array<SectionConfig<NatalKey>> = [
  {
    key: "dayMaster",
    marker: "DAY_MASTER",
    title: "Day Master",
    kicker: "命盘核心",
  },
  {
    key: "outerPersona",
    marker: "OUTER_PERSONA",
    title: "Outer Persona",
    kicker: "外在形象",
  },
  {
    key: "deepSelf",
    marker: "DEEP_SELF",
    title: "Deep Self",
    kicker: "深层自我",
  },
  {
    key: "career",
    marker: "CAREER",
    title: "Career",
    kicker: "事业",
  },
  {
    key: "love",
    marker: "LOVE",
    title: "Love",
    kicker: "感情",
  },
  {
    key: "growth",
    marker: "GROWTH",
    title: "Growth",
    kicker: "成长",
  },
  {
    key: "health",
    marker: "HEALTH",
    title: "Health",
    kicker: "健康",
  },
];

const transitSections: Array<SectionConfig<TransitKey>> = [
  {
    key: transitOverviewSection.key,
    marker: transitOverviewSection.marker,
    title: "Overview",
    kicker: "Annual Frame",
  },
  ...transitMonthSections.map((section) => ({
    key: section.key,
    marker: section.marker,
    title: section.enTitle,
    kicker: section.enKicker,
  })),
];

const reportActionCopy = {
  en: {
    save: "Save to account",
    saved: "Report saved to your account.",
    saveBusy: "Saving...",
    image: "Save long PNG",
    imageBusy: "Rendering image...",
    pdf: "Download PDF",
    pdfBusy: "Preparing PDF...",
    loginNeeded: "Log in or create an account to save this report.",
    signedIn: "Signed in",
    savedCount: "Saved reports",
    logout: "Log out",
    authTitle: "Save this report",
    authSubtitle: "Create a private test account now. Social login can be added later.",
    login: "Log in",
    register: "Create account",
    name: "Name",
    namePlaceholder: "Optional display name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    authBusy: "Processing...",
    authDone: "Account ready. You can save the report now.",
    exportHint:
      "Tip: open Monthly Timing and wait for it to finish if you want the export to include annual timing.",
    exportError: "Export failed. Please try again after the report finishes loading.",
  },
  zh: {
    save: "保存到账号",
    saved: "报告已保存到你的账号。",
    saveBusy: "正在保存...",
    image: "保存长图 PNG",
    imageBusy: "正在生成长图...",
    pdf: "下载 PDF",
    pdfBusy: "正在生成 PDF...",
    loginNeeded: "登录或注册后即可把这份报告保存到账号。",
    signedIn: "已登录",
    savedCount: "已保存报告",
    logout: "退出",
    authTitle: "保存这份报告",
    authSubtitle: "先用邮箱搭建测试账号；微信、Google 登录后面可以继续接。",
    login: "登录",
    register: "注册账号",
    name: "姓名",
    namePlaceholder: "可选显示名",
    email: "邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    authBusy: "处理中...",
    authDone: "账号已就绪，现在可以保存报告。",
    exportHint: "提示：如果要把年运月令也导出，请先打开年运月令并等待生成完成。",
    exportError: "导出失败，请等报告加载完成后再试一次。",
  },
  ru: {
    save: "Сохранить в аккаунт",
    saved: "Отчет сохранен в аккаунте.",
    saveBusy: "Сохранение...",
    image: "Сохранить PNG",
    imageBusy: "Создание изображения...",
    pdf: "Скачать PDF",
    pdfBusy: "Подготовка PDF...",
    loginNeeded: "Войдите или создайте аккаунт, чтобы сохранить отчет.",
    signedIn: "Вход выполнен",
    savedCount: "Сохраненные отчеты",
    logout: "Выйти",
    authTitle: "Сохранить отчет",
    authSubtitle:
      "Пока это тестовый аккаунт по email; Google и WeChat можно добавить позже.",
    login: "Войти",
    register: "Создать аккаунт",
    name: "Имя",
    namePlaceholder: "Необязательное имя",
    email: "Email",
    password: "Пароль",
    confirmPassword: "Повторите пароль",
    authBusy: "Обработка...",
    authDone: "Аккаунт готов. Теперь можно сохранить отчет.",
    exportHint:
      "Совет: откройте месячный прогноз и дождитесь завершения, если хотите включить его в экспорт.",
    exportError: "Экспорт не удался. Попробуйте после полной загрузки отчета.",
  },
} satisfies Record<
  keyof typeof reportCopy,
  Record<string, string>
>;

const energyStyleCopy = {
  en: {
    eyebrow: "Energy styling",
    title: "Color, outfit and daily field",
    subtitle:
      "A practical layer for clothes, accessories, meetings, dates, and bracelet choices. Treat it as symbolic styling guidance, not a guaranteed result.",
    target: "Element to supplement",
    strongest: "Dominant signal",
    palette: "Recommended palette",
    wardrobe: "How to wear it",
    daily: "Today",
    scenes: "Use by scene",
    stones: "Bracelet stones",
    atelier: "Open bracelet workshop",
  },
  zh: {
    eyebrow: "颜色穿搭",
    title: "五行补色与今日能量",
    subtitle:
      "把命盘里的五行转换成日常能用的穿搭、配饰、谈判和手串建议。它是象征性的心理与风格指引，不承诺直接改变结果。",
    target: "建议补的元素",
    strongest: "当前主气场",
    palette: "适合颜色",
    wardrobe: "穿搭方式",
    daily: "今日运势",
    scenes: "场景用法",
    stones: "手串水晶",
    atelier: "打开手串工坊",
  },
  ru: {
    eyebrow: "Цветовой стиль",
    title: "Стихии, одежда и энергия дня",
    subtitle:
      "Практичный слой для одежды, встреч, отношений, переговоров и браслетов. Это символическая стилистика, а не гарантия результата.",
    target: "Стихия для поддержки",
    strongest: "Доминирующий сигнал",
    palette: "Палитра",
    wardrobe: "Как носить",
    daily: "Сегодня",
    scenes: "По ситуациям",
    stones: "Камни браслета",
    atelier: "Открыть мастерскую",
  },
} satisfies Record<
  keyof typeof reportCopy,
  Record<string, string>
>;

const allNatalSectionsOpen = {
  dayMaster: true,
  outerPersona: true,
  deepSelf: true,
  career: true,
  love: true,
  growth: true,
  health: true,
} satisfies Record<NatalKey, boolean>;

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function safeFileName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 90);

  return cleaned || "destinypixel-report";
}

function buildReportTitle(context: ReportGenerationContext) {
  return `${context.profile.displayName} x ${context.astrology.sunSign} ${context.birth.birthDate}`;
}

function getExportTarget() {
  const target = document.querySelector<HTMLElement>("[data-report-export]");

  if (!target) throw new Error("Report export target was not found.");

  return target;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseMarkedSections<Key extends string>(
  raw: string,
  sections: Array<SectionConfig<Key>>,
) {
  const result = Object.fromEntries(
    sections.map((section) => [section.key, ""]),
  ) as Record<Key, string>;

  if (!raw.trim()) {
    return result;
  }

  const markerPattern = new RegExp(
    `\\[(${sections.map((section) => section.marker).join("|")})\\]`,
    "g",
  );
  const matches = Array.from(raw.matchAll(markerPattern));

  if (matches.length === 0) {
    result[sections[0].key] = raw.trim();
    return result;
  }

  matches.forEach((match, index) => {
    const marker = match[1];
    const config = sections.find((section) => section.marker === marker);

    if (!config || match.index === undefined) return;

    const next = matches[index + 1];
    const start = match.index + match[0].length;
    const end = next?.index ?? raw.length;
    result[config.key] = raw.slice(start, end).trim();
  });

  return result;
}

function StatusPill({
  status,
  idleLabel,
  labels,
}: {
  status: StreamStatus;
  idleLabel: string;
  labels: (typeof reportCopy)[keyof typeof reportCopy]["status"];
}) {
  const label =
    status === "loading"
      ? labels.loading
      : status === "ready"
        ? labels.ready
        : status === "error"
          ? labels.error
          : idleLabel;

  return (
    <span className="stream-status-pill" data-status={status}>
      {status === "loading" ? (
        <Loader2 size={13} className="loading-icon" aria-hidden="true" />
      ) : (
        <Sparkles size={13} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

function splitInsightText(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function InsightText({ content }: { content: string }) {
  const paragraphs = splitInsightText(content);

  if (paragraphs.length === 0) return null;

  return (
    <div className="insight-copy">
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function formatMonthlyRange(
  key: TransitMonthKey,
  targetYear: number | undefined,
  range: string,
) {
  if (!targetYear) return range;
  if (key === "month11") return `${targetYear}/12/07-${targetYear + 1}/01/05`;
  if (key === "month12") return `${targetYear + 1} · ${range}`;

  return `${targetYear} · ${range}`;
}


function AccordionSection({
  title,
  kicker,
  content,
  isOpen,
  isLoading,
  loadingLabel,
  queuedLabel,
  onToggle,
}: {
  title: string;
  kicker: string;
  content: string;
  isOpen: boolean;
  isLoading?: boolean;
  loadingLabel: string;
  queuedLabel: string;
  onToggle: () => void;
}) {
  return (
    <article className="report-accordion-card" data-open={isOpen}>
      <button type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span>
          <small>{kicker}</small>
          <strong>{title}</strong>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="report-accordion-card__body">
          {content ? (
            <InsightText content={content} />
          ) : (
            <div className="insight-skeleton">
              <span>{isLoading ? loadingLabel : queuedLabel}</span>
              <i />
              <i />
              <i />
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

function EnergyStylePanel({ context }: { context: ReportGenerationContext }) {
  const copy = energyStyleCopy[context.locale];
  const target = targetElement(
    context.bazi.elementBalance,
    context.bazi.missingElements,
  );
  const dominant = strongestElement(context.bazi.elementBalance);
  const dailyElement = getDailyElement();
  const targetMeta = elementStyle[target];
  const dominantMeta = elementStyle[dominant];
  const dailyMeta = elementStyle[dailyElement];
  const stones = getGemstonesForElement(target).slice(0, 3);
  const percentages = elementPercentages(context.bazi.elementBalance);
  const colorChips = targetMeta.colors[context.locale];
  const sceneEntries = Object.entries(sceneAdvice) as Array<
    [keyof typeof sceneAdvice, (typeof sceneAdvice)[keyof typeof sceneAdvice]]
  >;

  return (
    <article className="energy-style-panel">
      <div className="energy-style-panel__header">
        <div>
          <span>
            <Palette size={15} aria-hidden="true" />
            {copy.eyebrow}
          </span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <a href={`/atelier?locale=${context.locale}&focus=${target}`}>
          <Gem size={15} aria-hidden="true" />
          {copy.atelier}
        </a>
      </div>

      <div className="energy-style-summary">
        <div>
          <small>{copy.target}</small>
          <strong>{targetMeta.label[context.locale]}</strong>
          <p>{targetMeta.tone[context.locale]}</p>
        </div>
        <div>
          <small>{copy.strongest}</small>
          <strong>{dominantMeta.label[context.locale]}</strong>
          <p>{dominantMeta.tone[context.locale]}</p>
        </div>
        <div>
          <small>{copy.daily}</small>
          <strong>{dailyMeta.label[context.locale]}</strong>
          <p>{dailyMeta.daily[context.locale]}</p>
        </div>
      </div>

      <div className="energy-style-grid">
        <section>
          <h3>
            <Shirt size={15} aria-hidden="true" />
            {copy.palette}
          </h3>
          <div className="energy-color-row">
            {colorChips.map((color, index) => (
              <span key={color}>
                <i data-color-index={index} />
                {color}
              </span>
            ))}
          </div>
          <p>{targetMeta.wardrobe[context.locale]}</p>
        </section>

        <section>
          <h3>{copy.scenes}</h3>
          <div className="energy-scene-list">
            {sceneEntries.map(([scene, advice]) => (
              <p key={scene}>{advice[context.locale]}</p>
            ))}
          </div>
        </section>
      </div>

      <div className="energy-style-footer">
        <div className="energy-bars-mini">
          {percentages.map(({ element, percent }) => (
            <span key={element}>
              <i>
                <b style={{ height: `${Math.max(4, percent)}%` }} />
              </i>
              <em>{elementStyle[element].label[context.locale]}</em>
            </span>
          ))}
        </div>
        <div className="energy-stone-list">
          <strong>{copy.stones}</strong>
          {stones.map((stone) => (
            <span key={stone.id}>
              <i style={{ background: stone.color, boxShadow: `0 0 0 5px ${stone.accent}` }} />
              {stone.name[context.locale]} · {stone.aura[context.locale]}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ReportExperience({
  context,
  initialNatal,
}: {
  context: ReportGenerationContext;
  initialNatal: NatalBookSections;
}) {
  const copy = reportCopy[context.locale];
  const actionCopy = reportActionCopy[context.locale];
  const reportTitle = useMemo(() => buildReportTitle(context), [context]);
  const luck = context.bazi.luck;
  const startAgeDisplay = luck
    ? context.locale === "zh"
      ? `${luck.startAge}岁`
      : context.locale === "ru"
        ? `${luck.startAge} лет`
        : `age ${luck.startAge}`
    : "";
  const [activeTab, setActiveTab] = useState<ActiveTab>("natal");
  const [natalRaw, setNatalRaw] = useState("");
  const [transitRaw, setTransitRaw] = useState("");
  const [natalStatus, setNatalStatus] = useState<StreamStatus>("idle");
  const [transitStatus, setTransitStatus] = useState<StreamStatus>("idle");
  const [exportMode, setExportMode] = useState(false);
  const [exportBusy, setExportBusy] = useState<"idle" | "image" | "pdf">("idle");
  const [member, setMember] = useState<MemberSummary | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReportSummary[]>([]);
  const [saveBusy, setSaveBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionTone, setActionTone] = useState<ActionTone>("neutral");
  const [openNatal, setOpenNatal] = useState<Record<NatalKey, boolean>>({
    dayMaster: true,
    outerPersona: false,
    deepSelf: false,
    career: false,
    love: false,
    growth: false,
    health: false,
  });
  const streamEndpoint = useCallback(
    async (
      endpoint: "/api/generate-natal" | "/api/generate-transit",
      setRaw: Dispatch<SetStateAction<string>>,
      setStatus: Dispatch<SetStateAction<StreamStatus>>,
    ) => {
      setStatus("loading");
      setRaw("");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(context),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          setRaw((current) => current + decoder.decode(value, { stream: true }));
        }

        setStatus("ready");
      } catch {
        setStatus("error");
      }
    },
    [context],
  );

  useEffect(() => {
    let isMounted = true;

    void fetch("/api/members/me", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) => {
        if (!isMounted || !response.ok) return;

        const result = (await response.json()) as {
          member?: MemberSummary | null;
          reports?: SavedReportSummary[];
        };

        setMember(result.member ?? null);
        setSavedReports(result.reports ?? []);
      })
      .catch(() => {
        // Silent by design: account entry is optional at this stage.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void streamEndpoint("/api/generate-natal", setNatalRaw, setNatalStatus);
  }, [streamEndpoint]);

  const natalContent = useMemo(() => {
    const parsed = parseMarkedSections(natalRaw, natalSections);

    return {
      dayMaster: parsed.dayMaster || initialNatal.dayMaster,
      outerPersona: parsed.outerPersona || initialNatal.outerPersona,
      deepSelf: parsed.deepSelf || initialNatal.deepSelf,
      career: parsed.career || initialNatal.career,
      love: parsed.love || initialNatal.love,
      growth: parsed.growth || initialNatal.growth,
      health: parsed.health || initialNatal.health,
    };
  }, [initialNatal, natalRaw]);

  const transitContent = useMemo(
    () => parseMarkedSections(transitRaw, transitSections),
    [transitRaw],
  );
  const transitOverview = getTransitOverviewDisplay(context.locale);

  function buildReportSnapshot() {
    return {
      context,
      natal: natalContent,
      transits: transitContent,
      raw: {
        natal: natalRaw,
        transits: transitRaw,
      },
      statuses: {
        natal: natalStatus,
        transits: transitStatus,
      },
      savedFrom: "report-page",
    };
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setActionMessage("");

    try {
      const response = await fetch(`/api/members/auth/${authMode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          passwordConfirm: authPasswordConfirm,
        }),
      });
      const result = (await response.json()) as {
        member?: MemberSummary;
        error?: string;
      };

      if (!response.ok || !result.member) {
        throw new Error(result.error ?? actionCopy.loginNeeded);
      }

      setMember(result.member);
      setAuthOpen(false);
      setAuthPassword("");
      setAuthPasswordConfirm("");
      setActionTone("success");
      setActionMessage(actionCopy.authDone);
    } catch (error) {
      setActionTone("error");
      setActionMessage(error instanceof Error ? error.message : actionCopy.loginNeeded);
    } finally {
      setAuthBusy(false);
    }
  }

  async function logoutMember() {
    await fetch("/api/members/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    setMember(null);
    setSavedReports([]);
  }

  async function saveReport() {
    if (saveBusy) return;

    if (!member) {
      setAuthOpen(true);
      setActionTone("neutral");
      setActionMessage(actionCopy.loginNeeded);
      return;
    }

    setActionTone("neutral");
    setActionMessage(actionCopy.saveBusy);
    setSaveBusy(true);

    try {
      const response = await fetch("/api/members/saved-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reportId: context.reportId,
          title: reportTitle,
          locale: context.locale,
          snapshot: buildReportSnapshot(),
        }),
      });
      const result = (await response.json()) as {
        report?: SavedReportSummary;
        error?: string;
      };

      if (!response.ok || !result.report) {
        if (response.status === 401) setAuthOpen(true);
        throw new Error(result.error ?? actionCopy.loginNeeded);
      }

      setSavedReports((current) => [
        result.report!,
        ...current.filter((report) => report.reportId !== result.report!.reportId),
      ]);
      setActionTone("success");
      setActionMessage(actionCopy.saved);
    } catch (error) {
      setActionTone("error");
      setActionMessage(error instanceof Error ? error.message : actionCopy.loginNeeded);
    } finally {
      setSaveBusy(false);
    }
  }

  async function captureReportCanvas() {
    const { default: html2canvas } = await import("html2canvas");
    const previousOpenNatal = openNatal;

    setExportMode(true);
    setOpenNatal(allNatalSectionsOpen);
    document.body.classList.add("report-exporting");

    try {
      await waitForPaint();

      const target = getExportTarget();

      return await html2canvas(target, {
        allowTaint: false,
        backgroundColor: "#fffdf8",
        imageTimeout: 15000,
        logging: false,
        scale: Math.min(1.5, window.devicePixelRatio || 1),
        scrollX: 0,
        scrollY: -window.scrollY,
        useCORS: true,
        windowHeight: Math.max(target.scrollHeight, window.innerHeight),
        windowWidth: Math.max(target.scrollWidth, window.innerWidth),
      });
    } finally {
      document.body.classList.remove("report-exporting");
      setExportMode(false);
      setOpenNatal(previousOpenNatal);
    }
  }

  async function downloadLongImage() {
    if (exportBusy !== "idle") return;

    setExportBusy("image");
    setActionTone("neutral");
    setActionMessage(actionCopy.exportHint);

    try {
      const canvas = await captureReportCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) resolve(value);
          else reject(new Error("Canvas export failed."));
        }, "image/png");
      });

      downloadBlob(blob, `${safeFileName(reportTitle)}.png`);
      setActionTone("success");
      setActionMessage(actionCopy.image);
    } catch {
      setActionTone("error");
      setActionMessage(actionCopy.exportError);
    } finally {
      setExportBusy("idle");
    }
  }

  async function downloadPdf() {
    if (exportBusy !== "idle") return;

    setExportBusy("pdf");
    setActionTone("neutral");
    setActionMessage(actionCopy.exportHint);

    try {
      const [{ jsPDF }, canvas] = await Promise.all([
        import("jspdf"),
        captureReportCanvas(),
      ]);
      const pdf = new jsPDF({
        compress: true,
        format: "a4",
        orientation: "portrait",
        unit: "mm",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const imageData = canvas.toDataURL("image/jpeg", 0.92);
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "JPEG", 0, position, pageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, position, pageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${safeFileName(reportTitle)}.pdf`);
      setActionTone("success");
      setActionMessage(actionCopy.pdf);
    } catch {
      setActionTone("error");
      setActionMessage(actionCopy.exportError);
    } finally {
      setExportBusy("idle");
    }
  }

  function activateTab(tab: ActiveTab) {
    setActiveTab(tab);

    if (tab === "transits" && transitStatus === "idle") {
      void streamEndpoint(
        "/api/generate-transit",
        setTransitRaw,
        setTransitStatus,
      );
    }
  }

  return (
    <section className="report-workspace" data-exporting={exportMode}>
      <div className="report-action-bar" data-export-hide>
        <div className="report-account-state">
          {member ? (
            <>
              <Check size={15} aria-hidden="true" />
              <span>
                {actionCopy.signedIn} · {member.email}
              </span>
              <small>
                {actionCopy.savedCount}: {savedReports.length}
              </small>
              <button type="button" onClick={logoutMember}>
                {actionCopy.logout}
              </button>
            </>
          ) : (
            <>
              <LogIn size={15} aria-hidden="true" />
              <span>{actionCopy.loginNeeded}</span>
            </>
          )}
        </div>

        <div className="report-action-buttons">
          <button type="button" onClick={saveReport} disabled={saveBusy}>
            {saveBusy ? (
              <Loader2 size={15} className="loading-icon" aria-hidden="true" />
            ) : (
              <Save size={15} aria-hidden="true" />
            )}
            {saveBusy ? actionCopy.saveBusy : actionCopy.save}
          </button>
          <button
            type="button"
            onClick={downloadLongImage}
            disabled={exportBusy !== "idle"}
          >
            {exportBusy === "image" ? (
              <Loader2 size={15} className="loading-icon" aria-hidden="true" />
            ) : (
              <FileImage size={15} aria-hidden="true" />
            )}
            {exportBusy === "image" ? actionCopy.imageBusy : actionCopy.image}
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={exportBusy !== "idle"}
          >
            {exportBusy === "pdf" ? (
              <Loader2 size={15} className="loading-icon" aria-hidden="true" />
            ) : (
              <Download size={15} aria-hidden="true" />
            )}
            {exportBusy === "pdf" ? actionCopy.pdfBusy : actionCopy.pdf}
          </button>
        </div>
      </div>

      {authOpen ? (
        <form className="member-auth-panel" onSubmit={submitAuth} data-export-hide>
          <div className="member-auth-panel__heading">
            <div>
              <span>{actionCopy.authTitle}</span>
              <p>{actionCopy.authSubtitle}</p>
            </div>
            <div className="member-auth-switch" role="group" aria-label={actionCopy.authTitle}>
              <button
                type="button"
                data-active={authMode === "login"}
                onClick={() => setAuthMode("login")}
              >
                {actionCopy.login}
              </button>
              <button
                type="button"
                data-active={authMode === "register"}
                onClick={() => setAuthMode("register")}
              >
                {actionCopy.register}
              </button>
            </div>
          </div>

          <div className="member-auth-grid">
            {authMode === "register" ? (
              <label>
                <span>{actionCopy.name}</span>
                <input
                  type="text"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  placeholder={actionCopy.namePlaceholder}
                  autoComplete="name"
                />
              </label>
            ) : null}
            <label>
              <span>{actionCopy.email}</span>
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              <span>{actionCopy.password}</span>
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>
            {authMode === "register" ? (
              <label>
                <span>{actionCopy.confirmPassword}</span>
                <input
                  type="password"
                  value={authPasswordConfirm}
                  onChange={(event) => setAuthPasswordConfirm(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
            ) : null}
          </div>

          <button className="member-auth-submit" type="submit" disabled={authBusy}>
            {authBusy ? (
              <Loader2 size={15} className="loading-icon" aria-hidden="true" />
            ) : (
              <LogIn size={15} aria-hidden="true" />
            )}
            {authBusy
              ? actionCopy.authBusy
              : authMode === "register"
                ? actionCopy.register
                : actionCopy.login}
          </button>
        </form>
      ) : null}

      {actionMessage ? (
        <p className="report-action-message" data-tone={actionTone} data-export-hide>
          {actionTone === "success" ? (
            <Check size={14} aria-hidden="true" />
          ) : actionTone === "error" ? (
            <AlertCircle size={14} aria-hidden="true" />
          ) : (
            <Sparkles size={14} aria-hidden="true" />
          )}
          {actionMessage}
        </p>
      ) : null}

      <div
        className="report-tabs"
        role="tablist"
        aria-label={copy.tabs.aria}
        data-export-hide
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "natal"}
          onClick={() => activateTab("natal")}
        >
          <BookOpenText size={16} aria-hidden="true" />
          {copy.tabs.natal}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "transits"}
          onClick={() => activateTab("transits")}
        >
          <CalendarClock size={16} aria-hidden="true" />
          {copy.tabs.transits}
        </button>
      </div>

      {exportMode || activeTab === "natal" ? (
        <div className="report-tab-panel" role="tabpanel">
          <div className="report-panel-heading">
            <div>
              <span>{copy.natalPanel.eyebrow}</span>
              <h2>{copy.natalPanel.title}</h2>
            </div>
            <StatusPill
              status={natalStatus}
              idleLabel={copy.status.idleNatal}
              labels={copy.status}
            />
          </div>

          <EnergyStylePanel context={context} />

          <div className="report-accordion">
            {natalSections.map((section) => (
              <AccordionSection
                key={section.key}
                title={copy.accordion[section.key].title}
                kicker={copy.accordion[section.key].kicker}
                content={natalContent[section.key]}
                isOpen={exportMode || openNatal[section.key]}
                isLoading={natalStatus === "loading"}
                loadingLabel={copy.status.generating}
                queuedLabel={copy.status.queued}
                onToggle={() =>
                  setOpenNatal((current) => ({
                    ...current,
                    [section.key]: !current[section.key],
                  }))
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {exportMode || activeTab === "transits" ? (
        <div className="report-tab-panel" role="tabpanel">
          <div className="report-panel-heading">
            <div>
              <span>{copy.transitPanel.eyebrow}</span>
              <h2>{copy.transitPanel.title}</h2>
            </div>
            <StatusPill
              status={transitStatus}
              idleLabel={copy.status.idleTransit}
              labels={copy.status}
            />
          </div>

          {luck ? (
            <div className="transit-context-grid" aria-label={copy.transitPanel.title}>
              <div>
                <span>{copy.transitContext.targetYear}</span>
                <strong>
                  {luck.targetYear} · {luck.currentYearPillarDisplay}
                </strong>
              </div>
              <div>
                <span>{copy.transitContext.previousYear}</span>
                <strong>
                  {luck.previousYear} · {luck.previousYearPillarDisplay}
                </strong>
              </div>
              <div>
                <span>{copy.transitContext.tenYearLuck}</span>
                <strong>
                  {luck.activeTenYearLuck
                    ? `${luck.activeTenYearLuck.pillarDisplay} · ${luck.activeTenYearLuck.startYear}-${luck.activeTenYearLuck.endYear}`
                    : copy.status.queued}
                </strong>
              </div>
              <div>
                <span>{copy.transitContext.direction}</span>
                <strong>
                  {luck.directionLabel} · {copy.transitContext.starts} {startAgeDisplay}
                </strong>
              </div>
            </div>
          ) : null}

          <article className="transit-overview-card">
            <div className="transit-overview-card__head">
              <span>{transitOverview.kicker}</span>
              <strong>{transitOverview.title}</strong>
            </div>
            {transitContent.overview ? (
              <InsightText content={transitContent.overview} />
            ) : (
              <div className="insight-skeleton">
                <span>{copy.status.generating}</span>
                <i />
                <i />
                <i />
              </div>
            )}
          </article>

          <div className="monthly-timing-grid">
            {transitMonthSections.map((section, index) => {
              const content = transitContent[section.key as TransitMonthKey];
              const display = getTransitMonthDisplay(section, context.locale);

              return (
                <article className="season-card monthly-timing-card" key={section.key}>
                  <span className="monthly-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="monthly-card-head">
                    <span>{display.kicker}</span>
                    <strong>{display.title}</strong>
                    <em>{formatMonthlyRange(section.key, luck?.targetYear, display.range)}</em>
                  </div>
                  {content ? (
                    <InsightText content={content} />
                  ) : (
                    <div className="insight-skeleton">
                      <span>{copy.status.generating}</span>
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="vip-panel">
            <div>
              <span>
                <Orbit size={17} aria-hidden="true" />
              </span>
              <div>
                <h2>{copy.vip.title}</h2>
                <p>{copy.vip.description}</p>
              </div>
            </div>
            <a href="#vip">{copy.vip.action}</a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
