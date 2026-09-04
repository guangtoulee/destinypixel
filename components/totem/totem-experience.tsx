"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  FileCode2,
  Focus,
  Languages,
  Layers3,
  MapPin,
  Network,
  Orbit,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
} from "react";
import BrandSymbol from "@/components/brand-symbol";
import { calculateBaziEngine } from "@/lib/engines/bazi";
import { cities } from "@/lib/geo/cities";
import {
  contentLocale,
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";
import {
  downloadTotemPng,
  downloadTotemSvg,
  shareTotem,
} from "@/lib/totem/export.client";
import {
  elementNames,
  functionNames,
  getTotemCopy,
  pillarNames,
  resonanceNames,
} from "@/lib/totem/copy";
import {
  buildTotemModel,
  defaultCalibration,
  elementColors,
  stableHash,
} from "@/lib/totem/model";
import { decodeTotemSnapshot } from "@/lib/totem/share";
import {
  resonanceKeys,
  totemLayers,
  type PillarKey,
  type ResonanceKey,
  type TotemCalibration,
  type TotemLayer,
  type TotemPart,
  type TotemPhase,
  type TotemSource,
} from "@/lib/totem/types";
import TotemCalibrationPanel from "./totem-calibration";
import TotemInspector from "./totem-inspector";
import TotemSvg from "./totem-svg";
import styles from "./totem.module.css";

type TotemExperienceProps = {
  initialLocale: ReportLocale;
  maxBirthDate: string;
};

type BirthFormState = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  cityId: string;
};

const initialForm: BirthFormState = {
  name: "",
  birthDate: "",
  birthTime: "",
  gender: "female",
  cityId: "",
};

const metricIcons = {
  complexity: Layers3,
  connectivity: Network,
  stability: Orbit,
  depth: Focus,
} as const;

const exportHighlights = new Set<string>();

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh-TW"
      ? "zh-TW"
      : locale === "zh"
        ? "zh-CN"
        : locale === "ru"
          ? "ru"
          : "en";
}

function readLocalValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing and hardened browsers may deny storage; the page stays usable.
  }
}

function removeLocalValue(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage is optional.
  }
}

function calibrationStorageKey(source: TotemSource, fingerprint: string) {
  if (!source.trueSolarTime?.isoLike) return null;
  const localIdentity = stableHash(
    `totem-calibration-v1|${source.trueSolarTime.isoLike}|${source.pillars.year}|${source.pillars.month}|${source.pillars.day}|${source.pillars.hour}`,
  ).toString(36);
  return `destinypixel:tuteng:v1:${fingerprint}:${localIdentity}`;
}

function validStoredCalibration(value: unknown): value is TotemCalibration {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length !== resonanceKeys.length ||
    !Object.keys(record).every((key) => resonanceKeys.includes(key as ResonanceKey))
  ) {
    return false;
  }
  return resonanceKeys.every(
    (key) =>
      typeof record[key] === "number" &&
      Number.isFinite(record[key]) &&
      (record[key] as number) >= 0 &&
      (record[key] as number) <= 100,
  );
}

function validBirthDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 1900 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validBirthTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export default function TotemExperience({
  initialLocale,
  maxBirthDate,
}: TotemExperienceProps) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [form, setForm] = useState<BirthFormState>(initialForm);
  const [formError, setFormError] = useState("");
  const [bazi, setBazi] = useState<TotemSource | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phase, setPhase] = useState<TotemPhase>("natal");
  const [activeLayer, setActiveLayer] = useState<TotemLayer>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [calibrationDraft, setCalibrationDraft] =
    useState<TotemCalibration>(defaultCalibration);
  const [appliedCalibration, setAppliedCalibration] =
    useState<TotemCalibration | null>(null);
  const [ritualActive, setRitualActive] = useState(false);
  const [ritualStage, setRitualStage] = useState(0);
  const [revealComplete, setRevealComplete] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const exportSvgRef = useRef<SVGSVGElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const lastTriggerRef = useRef<HTMLElement | SVGElement | null>(null);
  const sharedResultRef = useRef(false);
  const copy = getTotemCopy(locale);
  const language = locale === "ru" ? "ru" : locale === "en" ? "en" : "zh";
  const copyLocale = contentLocale(locale);

  const natalModel = useMemo(
    () => (bazi ? buildTotemModel(bazi) : null),
    [bazi],
  );
  const currentModel = useMemo(
    () =>
      bazi && appliedCalibration
        ? buildTotemModel(bazi, appliedCalibration)
        : null,
    [appliedCalibration, bazi],
  );
  const model = phase === "current" && currentModel ? currentModel : natalModel;
  const selectedPart =
    model?.parts.find((part) => part.id === selectedId) ?? null;
  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedPart) return ids;
    ids.add(selectedPart.id);
    selectedPart.relatedIds.forEach((id) => ids.add(id));
    if (selectedPart.resonance) ids.add(`practice:${selectedPart.resonance}`);
    return ids;
  }, [selectedPart]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawLocale = params.get("locale");
    const hasValidExplicitLocale =
      rawLocale !== null &&
      ["en", "zh", "cn", "zh-TW", "zh-Hant", "tw", "ru"].includes(rawLocale);
    const storedLocale = hasValidExplicitLocale
      ? initialLocale
      : readLocalValue("destinypixel-locale") ?? initialLocale;
    const nextLocale = reportLanguageOptions.some((option) => option.value === storedLocale)
      ? (storedLocale as ReportLocale)
      : initialLocale;

    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    writeLocalValue("destinypixel-locale", nextLocale);
  }, [initialLocale]);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const snapshot = decodeTotemSnapshot(fragment.get("totem"));
    if (snapshot) {
      const sharedSource: TotemSource = {
        pillars: snapshot.pillars,
      };
      // Validate the derived payload through the same model boundary before it
      // can reach the interactive renderer.
      try {
        buildTotemModel(sharedSource, snapshot.calibration);
        sharedResultRef.current = true;
        setBazi(sharedSource);
        setAppliedCalibration(snapshot.calibration ?? null);
        setCalibrationDraft(snapshot.calibration ?? defaultCalibration);
        setPhase(snapshot.calibration ? "current" : "natal");
        setRevealComplete(true);
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() =>
            resultRef.current?.scrollIntoView({ behavior: "auto", block: "start" }),
          ),
        );
      } catch {
        // An invalid or future-version share is ignored; the birth form remains usable.
      }
    }
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 720px)");
    const sync = () => {
      setReducedMotion(motionQuery.matches);
      setMobile(mobileQuery.matches);
    };
    sync();
    motionQuery.addEventListener("change", sync);
    mobileQuery.addEventListener("change", sync);
    return () => {
      motionQuery.removeEventListener("change", sync);
      mobileQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!ritualActive) return;
    if (reducedMotion) {
      setRevealComplete(true);
      setRitualActive(false);
      return;
    }
    const timers = [650, 1350, 2150].map((delay, index) =>
      window.setTimeout(() => setRitualStage(index + 1), delay),
    );
    timers.push(
      window.setTimeout(() => {
        setRevealComplete(true);
        setRitualActive(false);
      }, 3200),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reducedMotion, ritualActive]);

  useEffect(() => {
    if (!bazi || !natalModel || sharedResultRef.current) return;
    const storageKey = calibrationStorageKey(bazi, natalModel.fingerprint);
    if (!storageKey) return;
    try {
      const stored = JSON.parse(readLocalValue(storageKey) ?? "null");
      if (validStoredCalibration(stored)) {
        setCalibrationDraft(stored);
        setAppliedCalibration(stored);
      }
    } catch {
      removeLocalValue(storageKey);
    }
  }, [bazi, natalModel]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && selectedId) {
        setSelectedId(null);
        window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedId]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    writeLocalValue("destinypixel-locale", nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const city = cities.find((candidate) => candidate.id === form.cityId);

    if (!form.birthDate || !form.birthTime || !form.gender || !form.cityId) {
      setFormError(copy.form.errors.missing);
      return;
    }
    if (!validBirthDate(form.birthDate) || !validBirthTime(form.birthTime)) {
      setFormError(copy.form.errors.range);
      return;
    }
    if (form.birthDate > maxBirthDate) {
      setFormError(copy.form.errors.future);
      return;
    }
    if (!city) {
      setFormError(copy.form.errors.city);
      return;
    }

    try {
      const result = calculateBaziEngine({
        name: form.name.trim() || "Guest",
        gender: form.gender,
        locale,
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        city,
      });
      sharedResultRef.current = false;
      const currentUrl = new URL(window.location.href);
      const fragment = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
      if (fragment.has("totem")) {
        fragment.delete("totem");
        const nextFragment = fragment.toString();
        currentUrl.hash = nextFragment ? `#${nextFragment}` : "";
        window.history.replaceState(
          null,
          "",
          `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
        );
      }
      setBazi(result);
      setDisplayName(form.name.trim());
      setPhase("natal");
      setActiveLayer("overview");
      setSelectedId(null);
      setZoom(1);
      setCalibrationDraft(defaultCalibration);
      setAppliedCalibration(null);
      setRitualStage(0);
      setActionStatus("");
      if (reducedMotion) {
        setRevealComplete(true);
        setRitualActive(false);
      } else {
        setRevealComplete(false);
        setRitualActive(true);
      }
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    } catch {
      setFormError(copy.form.errors.calculate);
    }
  }

  function selectPart(part: TotemPart, trigger: HTMLElement | SVGElement) {
    lastTriggerRef.current = trigger;
    setSelectedId(part.id);
  }

  function closeInspector() {
    setSelectedId(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }

  function skipRitual() {
    setRevealComplete(true);
    setRitualActive(false);
  }

  function changeCalibration(key: ResonanceKey, value: number) {
    setCalibrationDraft((current) => ({ ...current, [key]: value }));
  }

  function applyCalibration() {
    if (!natalModel) return;
    const next = { ...calibrationDraft };
    setAppliedCalibration(next);
    setPhase("current");
    setActiveLayer("resonance");
    setSelectedId(null);
    if (bazi && !sharedResultRef.current) {
      const storageKey = calibrationStorageKey(bazi, natalModel.fingerprint);
      if (storageKey) writeLocalValue(storageKey, JSON.stringify(next));
    }
  }

  function resetCalibration() {
    if (bazi && natalModel && !sharedResultRef.current) {
      const storageKey = calibrationStorageKey(bazi, natalModel.fingerprint);
      if (storageKey) removeLocalValue(storageKey);
    }
    setCalibrationDraft(defaultCalibration);
    setAppliedCalibration(null);
    setPhase("natal");
    setSelectedId(null);
  }

  async function withExport(action: () => Promise<void> | void) {
    if (!exportSvgRef.current || !model) return;
    setExporting(true);
    setActionStatus("");
    try {
      await action();
    } catch {
      setActionStatus(copy.toolbar.exportError);
    } finally {
      setExporting(false);
    }
  }

  async function handleShare() {
    if (!exportSvgRef.current || !model || !bazi) return;
    await withExport(async () => {
      const result = await shareTotem(
        exportSvgRef.current!,
        model.fingerprint,
        locale,
        {
          version: 1,
          pillars: bazi.pillars,
          calibration:
            phase === "current" && appliedCalibration
              ? appliedCalibration
              : undefined,
        },
      );
      setActionStatus(
        result === "shared"
          ? copy.toolbar.shared
          : result === "copied"
            ? copy.toolbar.copied
            : "",
      );
    });
  }

  function handleParallax(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${qTilt(-y * 2.2)}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${qTilt(x * 2.6)}deg`);
  }

  function resetParallax(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a href={`/?locale=${locale}`} className={styles.brand}>
          <BrandSymbol />
          <span>
            <strong>DestinyPixel</strong>
            <small>{copy.original}</small>
          </span>
        </a>
        <div className={styles.headerActions}>
          <a href={`/?locale=${locale}`} className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            {copy.backHome}
          </a>
          <div className={styles.localeSwitch} aria-label={copy.languageLabel}>
            <Languages size={15} aria-hidden="true" />
            {reportLanguageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-active={locale === option.value}
                onClick={() => changeLocale(option.value)}
              >
                {option.value === "zh"
                  ? "简"
                  : option.value === "zh-TW"
                    ? "繁"
                    : option.value === "ru"
                      ? "RU"
                      : "EN"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroAtmosphere} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p className={styles.heroLead}>{copy.heroLead}</p>
          <blockquote>{copy.heroQuote}</blockquote>
          <p className={styles.philosophy}>{copy.philosophy}</p>
          <div className={styles.disclaimer}>
            <ShieldCheck size={18} aria-hidden="true" />
            <p>{copy.disclaimer}</p>
          </div>
        </div>

        <form className={styles.birthForm} onSubmit={generate} noValidate>
          <div className={styles.formHeading}>
            <span>
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <h2>{copy.form.title}</h2>
              <p>{copy.form.lead}</p>
            </div>
          </div>

          <label className={styles.fieldFull}>
            <span>
              <UserRound size={14} aria-hidden="true" />
              {copy.form.name}
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={copy.form.namePlaceholder}
              autoComplete="name"
            />
          </label>

          <label>
            <span>
              <CalendarDays size={14} aria-hidden="true" />
              {copy.form.date}
            </span>
            <input
              type="date"
              value={form.birthDate}
              min="1900-01-01"
              max={maxBirthDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  birthDate: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            <span>
              <Clock3 size={14} aria-hidden="true" />
              {copy.form.time}
            </span>
            <input
              type="time"
              value={form.birthTime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  birthTime: event.target.value,
                }))
              }
              required
            />
          </label>

          <fieldset className={styles.fieldFull}>
            <legend>{copy.form.gender}</legend>
            <div className={styles.genderOptions}>
              {(["female", "male"] as const).map((gender) => (
                <label key={gender}>
                  <input
                    type="radio"
                    name="totem-gender"
                    value={gender}
                    checked={form.gender === gender}
                    onChange={() =>
                      setForm((current) => ({ ...current, gender }))
                    }
                  />
                  <span aria-hidden="true">{gender === "female" ? "♀" : "♂"}</span>
                  {gender === "female" ? copy.form.female : copy.form.male}
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.fieldFull}>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {copy.form.city}
            </span>
            <select
              value={form.cityId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cityId: event.target.value,
                }))
              }
              required
            >
              <option value="">{copy.form.cityPlaceholder}</option>
              {cities.map((city) => {
                const chineseAlias = city.aliases.find((alias) =>
                  /[\u4e00-\u9fff]/.test(alias),
                );
                return (
                  <option key={city.id} value={city.id}>
                    {copyLocale === "zh" && chineseAlias
                      ? `${chineseAlias} · ${city.label}`
                      : city.label}
                  </option>
                );
              })}
            </select>
          </label>

          <p className={styles.cityNote}>{copy.form.cityNote}</p>
          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}
          <button type="submit" className={styles.generateButton}>
            <span>{copy.form.submit}</span>
            <i aria-hidden="true" />
          </button>
          <p className={styles.privacyNote}>
            <ShieldCheck size={14} aria-hidden="true" />
            {copy.form.privacy}
          </p>
        </form>
      </section>

      {model && bazi && (
        <section ref={resultRef} className={styles.result} aria-labelledby="totem-result-title">
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.kicker}>TOTEM MATRIX · {model.fingerprint}</p>
              <h2 id="totem-result-title">
                {displayName ? `${displayName} · ` : ""}
                {copy.chart.title}
              </h2>
              <p>{copy.chart.instruction}</p>
            </div>
            <div className={styles.phaseSwitch}>
              <button
                type="button"
                data-active={phase === "natal"}
                onClick={() => setPhase("natal")}
              >
                {copy.phases.natal}
              </button>
              <button
                type="button"
                data-active={phase === "current"}
                disabled={!currentModel}
                onClick={() => currentModel && setPhase("current")}
              >
                {copy.phases.current}
              </button>
              <small>{copy.phaseNote[phase]}</small>
            </div>
          </div>

          <div className={styles.layerTabs} aria-label={copy.chart.title}>
            {totemLayers.map((layer) => (
              <button
                key={layer}
                type="button"
                aria-pressed={activeLayer === layer}
                data-active={activeLayer === layer}
                onClick={() => {
                  setActiveLayer(layer);
                  setSelectedId(null);
                }}
              >
                {copy.layers[layer]}
              </button>
            ))}
          </div>

          <div className={styles.visualGrid}>
            <div
              className={styles.totemStage}
              onPointerMove={handleParallax}
              onPointerLeave={resetParallax}
              style={{ "--tilt-x": "0deg", "--tilt-y": "0deg" } as CSSProperties}
            >
              <div className={styles.svgFrame}>
                <TotemSvg
                  model={model}
                  locale={locale}
                  layer={activeLayer}
                  selectedId={selectedId}
                  highlightedIds={highlightedIds}
                  revealComplete={revealComplete}
                  zoom={zoom}
                  mobileLabels={mobile}
                  onSelect={selectPart}
                />
              </div>

              {ritualActive && (
                <div className={styles.ritual} role="status" aria-live="polite">
                  <div className={styles.ritualCore} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <p>{copy.ritual.title}</p>
                  <strong>{copy.ritual.stages[ritualStage]}</strong>
                  <span>
                    {copy.ritual.stages.map((_, index) => (
                      <i key={index} data-active={index <= ritualStage} />
                    ))}
                  </span>
                  <button type="button" onClick={skipRitual}>
                    {copy.ritual.skip}
                  </button>
                </div>
              )}

              <div className={styles.viewTools} data-ui-only="true">
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.min(1.42, value + 0.12))}
                  aria-label={copy.toolbar.zoomIn}
                >
                  <ZoomIn size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.max(0.82, value - 0.12))}
                  aria-label={copy.toolbar.zoomOut}
                >
                  <ZoomOut size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label={copy.toolbar.reset}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                </button>
                <output>{Math.round(zoom * 100)}%</output>
              </div>
            </div>

            <TotemInspector
              part={selectedPart}
              locale={locale}
              dayPillar={bazi.pillars.day}
              mobile={mobile}
              onClose={closeInspector}
            />
          </div>

          <div className={styles.exportSource} aria-hidden="true">
            <TotemSvg
              ref={exportSvgRef}
              model={model}
              locale={locale}
              layer="overview"
              selectedId={null}
              highlightedIds={exportHighlights}
              revealComplete
              zoom={1}
              onSelect={() => undefined}
            />
          </div>

          <div className={styles.exportBar}>
            <div>
              <span>{copy.chart.fingerprint}</span>
              <strong>{model.fingerprint}</strong>
            </div>
            <div>
              <span>{copy.chart.trueSolar}</span>
              <strong>
                {bazi.trueSolarTime
                  ? `${bazi.trueSolarTime.date} · ${bazi.trueSolarTime.time}`
                  : copy.chart.derivedShare}
              </strong>
            </div>
            <div className={styles.exportActions}>
              <button
                type="button"
                disabled={exporting}
                onClick={() =>
                  withExport(() => downloadTotemPng(exportSvgRef.current!, model.fingerprint))
                }
              >
                <Download size={16} aria-hidden="true" />
                {exporting ? copy.toolbar.exporting : copy.toolbar.png}
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={() =>
                  withExport(() => downloadTotemSvg(exportSvgRef.current!, model.fingerprint))
                }
              >
                <FileCode2 size={16} aria-hidden="true" />
                {copy.toolbar.svg}
              </button>
              <button type="button" disabled={exporting} onClick={handleShare}>
                <Share2 size={16} aria-hidden="true" />
                {copy.toolbar.share}
              </button>
            </div>
            {actionStatus && <p role="status">{actionStatus}</p>}
          </div>

          <div className={styles.birthFacts}>
            <span>{copy.chart.pillars}</span>
            {Object.entries(bazi.pillars).map(([key, value]) => (
              <div key={key}>
                <small>{pillarNames[language][key as PillarKey]}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <section className={styles.metricsSection} aria-labelledby="totem-metrics-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>STRUCTURAL READOUT</p>
                <h2 id="totem-metrics-title">{copy.metricsTitle}</h2>
              </div>
              <p>{copy.metricsLead}</p>
            </div>
            <div className={styles.metricGrid}>
              {Object.entries(model.metrics).map(([key, value]) => {
                const metricKey = key as keyof typeof model.metrics;
                const Icon = metricIcons[metricKey];
                return (
                  <article key={key}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{copy.metrics[metricKey].label}</span>
                    <strong>{value}</strong>
                    <i aria-hidden="true">
                      <span style={{ width: `${value}%` }} />
                    </i>
                    <p>{copy.metrics[metricKey].note}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.signalSection}>
            <div className={styles.elementPanel}>
              <p className={styles.kicker}>FIVE-ELEMENT MATERIAL</p>
              <h2>{copy.layers.elements}</h2>
              <div>
                {Object.entries(model.elementWeights).map(([element, value]) => (
                  <button
                    key={element}
                    type="button"
                    onClick={(event) => {
                      setActiveLayer("elements");
                      const part = model.parts.find(
                        (candidate) => candidate.element === element,
                      );
                      if (part) selectPart(part, event.currentTarget);
                    }}
                  >
                    <span>
                      <i style={{ background: elementColors[element as keyof typeof elementColors] }} />
                      {elementNames[language][element as keyof typeof model.elementWeights]}
                    </span>
                    <strong>{Math.round(value)}</strong>
                    <em>
                      <i style={{ width: `${value}%`, background: elementColors[element as keyof typeof elementColors] }} />
                    </em>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.functionPanel}>
              <p className={styles.kicker}>TEN-GOD FUNCTION LAYER</p>
              <h2>{copy.layers.functions}</h2>
              <div>
                {model.functions.map((module) => (
                  <button
                    key={module.key}
                    type="button"
                    onClick={(event) => {
                      const part = model.parts.find(
                        (candidate) => candidate.id === `function:${module.key}`,
                      );
                      if (!part) return;
                      setActiveLayer("functions");
                      selectPart(part, event.currentTarget);
                    }}
                  >
                    <span>{functionNames[language][module.key]}</span>
                    <strong>{module.score}</strong>
                    <small>{module.tenGods.join(" · ") || "—"}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.resonanceSection} aria-labelledby="resonance-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>ORBITAL PORTS</p>
                <h2 id="resonance-title">{copy.resonanceTitle}</h2>
              </div>
              <p>{copy.resonanceLead}</p>
            </div>
            <div className={styles.resonanceGrid}>
              {model.resonances.map((resonance, index) => {
                const part = model.parts.find(
                  (candidate) => candidate.id === `resonance:${resonance.key}`,
                );
                return (
                  <button
                    key={resonance.key}
                    type="button"
                    data-state={resonance.state}
                    onClick={(event) => {
                      if (!part) return;
                      setActiveLayer("resonance");
                      selectPart(part, event.currentTarget);
                    }}
                  >
                    <i aria-hidden="true" style={{ "--orbit-index": index } as CSSProperties} />
                    <span>{resonanceNames[language][resonance.key]}</span>
                    <strong>
                      {phase === "current" ? resonance.currentScore : resonance.natalScore}
                    </strong>
                    <small>{copy.states[resonance.state]}</small>
                  </button>
                );
              })}
            </div>
          </section>

          <TotemCalibrationPanel
            locale={locale}
            values={calibrationDraft}
            applied={Boolean(appliedCalibration)}
            onChange={changeCalibration}
            onApply={applyCalibration}
            onReset={resetCalibration}
          />
        </section>
      )}

      <footer className={styles.footer}>
        <BrandSymbol />
        <p>{copy.footer}</p>
        <a href={`/?locale=${locale}`}>DestinyPixel</a>
      </footer>
    </main>
  );
}

function qTilt(value: number) {
  return Math.round(value * 100) / 100;
}
