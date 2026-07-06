"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Gem,
  Languages,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  elementPercentages,
  elementStyle,
  energyElements,
  gemstoneLibrary,
  type EnergyElement,
  type Gemstone,
} from "@/lib/energy-style";
import {
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";

type GenderStyle = "female" | "male";
type FocusFilter = EnergyElement | "All";

const beadFitMap: Record<GenderStyle, Record<number, number[]>> = {
  female: {
    8: [20, 21, 22, 23],
    10: [17, 18, 19],
    12: [15, 16],
    14: [13, 14],
  },
  male: {
    8: [22, 23, 24],
    10: [18, 19, 20],
    12: [16, 17],
    14: [14, 15],
  },
};

const atelierCopy = {
  en: {
    back: "Back to DestinyPixel",
    eyebrow: "Celestial Atelier",
    title: "Build a bracelet bead by bead.",
    lead:
      "Choose a bead size and wrist style first. The workshop calculates a realistic bead count, then every gemstone tap adds one bead to the board.",
    gender: "Wrist style",
    female: "Soft fit",
    male: "Structured fit",
    beadSize: "Bead size",
    beadCount: "Fit count",
    fitHint: "Auto-fit range",
    filter: "Element",
    all: "All",
    archive: "Gemstone tray",
    creation: "Bracelet board",
    analysis: "Configuration reading",
    balance: "Element balance",
    selected: "Bead sequence",
    empty: "Tap gemstones on the right to place beads into the bracelet.",
    full: "The bracelet is full. Remove one bead before adding another.",
    addStone: "Add bead",
    removeBead: "Remove bead",
    reset: "Clear board",
    download: "Download image",
    downloading: "Rendering...",
    finish: "Complete design",
    shop: "Prepare for shop",
    current: "Current",
    target: "Target",
    size: "Size",
    style: "Style",
  },
  zh: {
    back: "返回 DestinyPixel",
    eyebrow: "灵石工坊",
    title: "像真实配珠盘一样，一颗一颗凑手串。",
    lead:
      "先选珠径和佩戴风格，系统会自动给出合理颗数。点右侧水晶就往上方手串里加一颗，也可以单颗删除，直到凑成一串。",
    gender: "佩戴风格",
    female: "女款",
    male: "男款",
    beadSize: "珠径规格",
    beadCount: "适配颗数",
    fitHint: "按腕围自动推荐",
    filter: "五行筛选",
    all: "全部",
    archive: "晶石盘",
    creation: "配珠盘",
    analysis: "成品解析",
    balance: "五行能量分布",
    selected: "已排珠序",
    empty: "点击右侧晶石，把珠子一颗一颗放入手串。",
    full: "这串已经排满了，先删掉一颗再继续加。",
    addStone: "加一颗",
    removeBead: "删除这颗",
    reset: "清空重排",
    download: "下载图片",
    downloading: "生成中...",
    finish: "完成设计",
    shop: "准备接入商城",
    current: "当前",
    target: "目标",
    size: "珠径",
    style: "款式",
  },
  ru: {
    back: "Назад в DestinyPixel",
    eyebrow: "Celestial Atelier",
    title: "Соберите браслет по одной бусине.",
    lead:
      "Сначала выберите размер и посадку. Мастерская рассчитает реалистичное количество бусин, а каждый камень справа добавит одну бусину.",
    gender: "Стиль запястья",
    female: "Мягкая посадка",
    male: "Структурная посадка",
    beadSize: "Размер бусин",
    beadCount: "Количество",
    fitHint: "Автоподбор",
    filter: "Стихия",
    all: "Все",
    archive: "Поднос камней",
    creation: "Доска браслета",
    analysis: "Анализ сборки",
    balance: "Баланс стихий",
    selected: "Последовательность",
    empty: "Нажмите на камни справа, чтобы добавить бусины в браслет.",
    full: "Браслет заполнен. Удалите одну бусину перед добавлением.",
    addStone: "Добавить",
    removeBead: "Удалить бусину",
    reset: "Очистить",
    download: "Скачать PNG",
    downloading: "Создание...",
    finish: "Завершить",
    shop: "Подготовить магазин",
    current: "Сейчас",
    target: "Цель",
    size: "Размер",
    style: "Стиль",
  },
};

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh" ? "zh-CN" : locale === "ru" ? "ru" : "en";
}

function balanceFromStones(stones: Gemstone[]) {
  return stones.reduce<Record<EnergyElement, number>>(
    (balance, stone) => ({
      ...balance,
      [stone.element]: balance[stone.element] + 1,
    }),
    { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 },
  );
}

function getFitOptions(gender: GenderStyle, beadSize: number) {
  return beadFitMap[gender][beadSize] ?? beadFitMap[gender][10];
}

function getDefaultCount(gender: GenderStyle, beadSize: number) {
  const options = getFitOptions(gender, beadSize);

  return options[Math.floor(options.length / 2)];
}

function stoneBackground(stone: Gemstone) {
  const shine = `radial-gradient(circle at 28% 22%, ${stone.accent}, transparent 22%)`;
  const base = `radial-gradient(circle at 60% 74%, rgba(0, 0, 0, 0.2), transparent 34%), ${stone.color}`;

  if (stone.texture === "clear") {
    return `${shine}, radial-gradient(circle at 68% 18%, rgba(255,255,255,.7), transparent 12%), ${base}`;
  }

  if (stone.texture === "cloud") {
    return `${shine}, radial-gradient(circle at 62% 38%, rgba(255,255,255,.42), transparent 24%), radial-gradient(circle at 36% 72%, rgba(255,255,255,.25), transparent 22%), ${base}`;
  }

  if (stone.texture === "silk") {
    return `${shine}, repeating-linear-gradient(135deg, rgba(255,255,255,.2) 0 5px, rgba(0,0,0,.08) 6px 12px), ${base}`;
  }

  if (stone.texture === "grain") {
    return `${shine}, repeating-radial-gradient(circle at 42% 58%, rgba(255,255,255,.18) 0 2px, rgba(0,0,0,.08) 3px 7px), ${base}`;
  }

  if (stone.texture === "metallic") {
    return `${shine}, linear-gradient(135deg, rgba(255,255,255,.44), rgba(0,0,0,.2) 42%, rgba(255,255,255,.22)), ${base}`;
  }

  return `${shine}, ${base}`;
}

function buildAnalysis(
  locale: ReportLocale,
  stones: Gemstone[],
  focus: FocusFilter,
  beadSize: number,
  targetCount: number,
) {
  const uniqueNames = Array.from(new Set(stones.map((stone) => stone.name[locale])));
  const names = uniqueNames.join(locale === "zh" ? "、" : ", ");
  const focusName = focus === "All" ? atelierCopy[locale].all : elementStyle[focus].label[locale];

  if (stones.length === 0) return atelierCopy[locale].empty;

  if (locale === "zh") {
    return `这条 ${beadSize}mm · ${targetCount} 颗的手串当前已排入 ${stones.length} 颗，主调偏向「${focusName}」。已选 ${names}。它更接近真实配珠逻辑：每一颗珠子都占据一个腕围位置，颜色会直接影响整串的视觉气场。完成后可作为商城定制草稿，也可以先下载图片给店家或朋友参考。`;
  }

  if (locale === "ru") {
    return `Эта сборка ${beadSize} мм рассчитана на ${targetCount} бусин; сейчас размещено ${stones.length}. Фокус: ${focusName}. Камни: ${names}. Каждая бусина занимает реальное место на запястье, поэтому размер и количество связаны.`;
  }

  return `This ${beadSize}mm bracelet is fitted for ${targetCount} beads; ${stones.length} are placed now. Focus: ${focusName}. Stones: ${names}. Each bead occupies a real wrist position, so bead size and count are linked.`;
}

function safeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "destinypixel-bracelet";
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AtelierExperience({
  initialLocale = "en",
  initialFocus = "Water",
}: {
  initialLocale?: ReportLocale;
  initialFocus?: EnergyElement;
}) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [focus, setFocus] = useState<FocusFilter>(initialFocus);
  const [gender, setGender] = useState<GenderStyle>("female");
  const [beadSize, setBeadSize] = useState(10);
  const [beadCount, setBeadCount] = useState(getDefaultCount("female", 10));
  const [beadIds, setBeadIds] = useState<string[]>([]);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const previewRef = useRef<HTMLElement | null>(null);
  const copy = atelierCopy[locale];
  const fitOptions = useMemo(() => getFitOptions(gender, beadSize), [beadSize, gender]);
  const currentBeads = useMemo(
    () =>
      beadIds
        .map((id) => gemstoneLibrary.find((stone) => stone.id === id))
        .filter(Boolean) as Gemstone[],
    [beadIds],
  );
  const visibleStones = useMemo(
    () =>
      focus === "All"
        ? gemstoneLibrary
        : gemstoneLibrary.filter((stone) => stone.element === focus),
    [focus],
  );
  const percentages = elementPercentages(balanceFromStones(currentBeads));
  const analysis = buildAnalysis(locale, currentBeads, focus, beadSize, beadCount);
  const isFull = beadIds.length >= beadCount;

  useEffect(() => {
    setDocumentLocale(locale);
    window.localStorage.setItem("destinypixel-locale", locale);
  }, [locale]);

  useEffect(() => {
    if (fitOptions.includes(beadCount)) return;

    setBeadCount(getDefaultCount(gender, beadSize));
  }, [beadCount, beadSize, fitOptions, gender]);

  useEffect(() => {
    setBeadIds((current) => current.slice(0, beadCount));
  }, [beadCount]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    window.localStorage.setItem("destinypixel-locale", nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function addStone(stone: Gemstone) {
    setBeadIds((current) => {
      if (current.length >= beadCount) return current;

      return [...current, stone.id];
    });
  }

  function removeBead(index: number) {
    setBeadIds((current) => current.filter((_, beadIndex) => beadIndex !== index));
  }

  async function downloadImage() {
    if (!previewRef.current) return;

    setDownloadBusy(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#fbf7ef",
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/png", 0.95);
      });

      if (blob) {
        downloadBlob(
          blob,
          `${safeFileName(`destinypixel-${beadSize}mm-${beadCount}`)}.png`,
        );
      }
    } finally {
      setDownloadBusy(false);
    }
  }

  return (
    <main className="atelier-site">
      <header className="atelier-header">
        <Link href={`/?locale=${locale}`}>
          <ArrowLeft size={16} aria-hidden="true" />
          {copy.back}
        </Link>
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
      </header>

      <section className="atelier-workbench">
        <aside className="atelier-preview-card" ref={previewRef} data-atelier-export>
          <div className="atelier-preview-card__copy">
            <p>
              <Sparkles size={14} aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <h1>{copy.title}</h1>
            <span>{copy.lead}</span>
          </div>

          <div className="atelier-aura atelier-aura--board" aria-label={copy.creation}>
            <div className="atelier-aura__ring atelier-aura__ring--board">
              {Array.from({ length: beadCount }, (_, index) => {
                const stone = currentBeads[index];
                const angle = (index / beadCount) * 360;

                if (!stone) {
                  return (
                    <span
                      className="atelier-slot"
                      key={`slot-${index}`}
                      style={{ "--angle": `${angle}deg`, "--bead": `${Math.max(11, beadSize * 1.35)}px` } as CSSProperties}
                    />
                  );
                }

                return (
                  <button
                    type="button"
                    className="atelier-bead"
                    key={`${stone.id}-${index}`}
                    style={{
                      "--angle": `${angle}deg`,
                      "--bead": `${Math.max(11, beadSize * 1.35)}px`,
                      "--stone-bg": stoneBackground(stone),
                    } as CSSProperties}
                    title={`${copy.removeBead}: ${stone.name[locale]}`}
                    onClick={() => removeBead(index)}
                  >
                    <Minus size={10} aria-hidden="true" />
                  </button>
                );
              })}
              <em>
                {beadIds.length}/{beadCount}
              </em>
            </div>
          </div>

          <div className="atelier-board-meta">
            <span>
              <small>{copy.current}</small>
              <strong>{beadIds.length}</strong>
            </span>
            <span>
              <small>{copy.target}</small>
              <strong>{beadCount}</strong>
            </span>
            <span>
              <small>{copy.size}</small>
              <strong>{beadSize}mm</strong>
            </span>
            <span>
              <small>{copy.style}</small>
              <strong>{gender === "female" ? copy.female : copy.male}</strong>
            </span>
          </div>

          <div className="atelier-sequence">
            <strong>{copy.selected}</strong>
            <div>
              {currentBeads.length ? (
                currentBeads.map((stone, index) => (
                  <button
                    type="button"
                    key={`${stone.id}-strip-${index}`}
                    onClick={() => removeBead(index)}
                    title={`${copy.removeBead}: ${stone.name[locale]}`}
                  >
                    <i style={{ background: stoneBackground(stone) }} />
                    {index + 1}
                  </button>
                ))
              ) : (
                <p>{copy.empty}</p>
              )}
            </div>
            {isFull ? <small>{copy.full}</small> : null}
          </div>

          <div className="atelier-analysis-card">
            <span>
              <Gem size={15} aria-hidden="true" />
              {copy.analysis}
            </span>
            <p>{analysis}</p>

            <div className="atelier-energy-bars">
              <strong>{copy.balance}</strong>
              {percentages.map(({ element, percent }) => (
                <label key={element}>
                  <span>{elementStyle[element].label[locale]}</span>
                  <i>
                    <b style={{ width: `${Math.max(4, percent)}%` }} />
                  </i>
                  <em>{percent}%</em>
                </label>
              ))}
            </div>
          </div>

          <div className="atelier-actions">
            <button type="button" onClick={() => setBeadIds([])}>
              <RotateCcw size={15} aria-hidden="true" />
              {copy.reset}
            </button>
            <button type="button" onClick={downloadImage} disabled={downloadBusy}>
              <Download size={15} aria-hidden="true" />
              {downloadBusy ? copy.downloading : copy.download}
            </button>
            <button type="button" data-primary>
              {copy.finish}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <section className="atelier-config-panel">
          <div className="atelier-controls atelier-controls--compact">
            <div>
              <span>{copy.gender}</span>
              <div className="atelier-segments">
                <button type="button" data-active={gender === "female"} onClick={() => setGender("female")}>
                  {copy.female}
                </button>
                <button type="button" data-active={gender === "male"} onClick={() => setGender("male")}>
                  {copy.male}
                </button>
              </div>
            </div>

            <div>
              <span>{copy.beadSize}</span>
              <div className="atelier-options atelier-options--fit">
                {[8, 10, 12, 14].map((size) => (
                  <button
                    type="button"
                    key={size}
                    data-active={beadSize === size}
                    onClick={() => setBeadSize(size)}
                  >
                    <i style={{ width: size * 1.25, height: size * 1.25 }} />
                    <strong>{size}mm</strong>
                    <small>
                      {getFitOptions(gender, size)[0]}-{getFitOptions(gender, size).at(-1)}
                    </small>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span>{copy.beadCount}</span>
              <small className="atelier-fit-note">{copy.fitHint}</small>
              <div className="atelier-options">
                {fitOptions.map((count) => (
                  <button
                    type="button"
                    key={count}
                    data-active={beadCount === count}
                    onClick={() => setBeadCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="atelier-library atelier-library--tray">
            <div className="atelier-library__heading">
              <div>
                <p>{copy.archive}</p>
                <h2>{copy.filter}</h2>
              </div>
              <div className="atelier-element-filter" role="group" aria-label={copy.filter}>
                <button
                  type="button"
                  data-active={focus === "All"}
                  onClick={() => setFocus("All")}
                >
                  {copy.all}
                </button>
                {energyElements.map((element) => (
                  <button
                    type="button"
                    key={element}
                    data-active={focus === element}
                    onClick={() => setFocus(element)}
                  >
                    {elementStyle[element].label[locale]}
                  </button>
                ))}
              </div>
            </div>

            <div className="atelier-stone-grid atelier-stone-grid--dense">
              {visibleStones.map((stone) => (
                <button
                  type="button"
                  className="atelier-stone-card atelier-stone-card--dense"
                  key={stone.id}
                  data-disabled={isFull}
                  onClick={() => addStone(stone)}
                >
                  <span style={{ background: stoneBackground(stone) }} />
                  <small>
                    {elementStyle[stone.element].label[locale]} · {stone.aura[locale]}
                  </small>
                  <strong>{stone.name[locale]}</strong>
                  <p>{stone.meaning[locale]}</p>
                  <em>
                    {isFull ? <Check size={14} /> : <Plus size={14} />}
                    <span>{copy.addStone}</span>
                  </em>
                </button>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
