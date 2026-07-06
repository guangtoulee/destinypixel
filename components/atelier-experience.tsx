"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gem,
  Languages,
  Plus,
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
  normalizeReportLocale,
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";

type GenderStyle = "female" | "male";

const atelierCopy = {
  en: {
    back: "Back to DestinyPixel",
    eyebrow: "Celestial Atelier",
    title: "Build a bracelet for the element you want to strengthen.",
    lead:
      "Choose stones by five-element energy, bead size, wrist style, and intention. The workshop turns your selection into a symbolic energy report for future shop customization.",
    gender: "Wrist style",
    female: "Soft fit",
    male: "Structured fit",
    beadSize: "Bead size",
    beadCount: "Bead count",
    filter: "Filter by element",
    all: "All",
    archive: "Gemstone archive",
    creation: "Current creation",
    alignment: "Aura alignment",
    complete: "Complete soul piece",
    reset: "Reset",
    analysis: "Configuration analysis",
    balance: "Element balance",
    selected: "Selected stones",
    empty: "Choose gemstones to begin the bracelet.",
    save: "Save concept",
    shop: "Prepare for shop",
  },
  zh: {
    back: "返回 DestinyPixel",
    eyebrow: "灵石工坊",
    title: "为你想补强的五行，定制一条手串。",
    lead:
      "按金木水火土、水晶属性、佩戴风格、珠径和颗数组合手串，并生成一份可用于后续商城定制的能量解析。",
    gender: "佩戴风格",
    female: "女款",
    male: "男款",
    beadSize: "珠径规格",
    beadCount: "手串颗数",
    filter: "按五行筛选",
    all: "全部",
    archive: "晶石库",
    creation: "当前作品",
    alignment: "能量校准",
    complete: "完成灵石之作",
    reset: "重置",
    analysis: "成品解析",
    balance: "五行能量分布",
    selected: "已选晶石",
    empty: "先选择晶石，开始组合你的手串。",
    save: "保存概念",
    shop: "准备接入商城",
  },
  ru: {
    back: "Назад в DestinyPixel",
    eyebrow: "Celestial Atelier",
    title: "Соберите браслет для стихии, которую хотите усилить.",
    lead:
      "Выберите камни по пяти стихиям, размеру бусин, стилю посадки и намерению. Мастерская создаст символический отчет для будущего магазина.",
    gender: "Стиль запястья",
    female: "Мягкая посадка",
    male: "Структурная посадка",
    beadSize: "Размер бусин",
    beadCount: "Количество",
    filter: "Фильтр по стихии",
    all: "Все",
    archive: "Архив камней",
    creation: "Текущая работа",
    alignment: "Настройка ауры",
    complete: "Завершить изделие",
    reset: "Сброс",
    analysis: "Анализ сборки",
    balance: "Баланс стихий",
    selected: "Выбранные камни",
    empty: "Выберите камни, чтобы начать браслет.",
    save: "Сохранить концепт",
    shop: "Подготовить магазин",
  },
};

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh" ? "zh-CN" : locale === "ru" ? "ru" : "en";
}

function buildBraceletPattern(stones: Gemstone[], count: number) {
  if (stones.length === 0) return [];

  return Array.from({ length: count }, (_, index) => stones[index % stones.length]);
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

function buildAnalysis(
  locale: ReportLocale,
  stones: Gemstone[],
  focus: EnergyElement,
  beadSize: number,
  count: number,
) {
  const focusName = elementStyle[focus].label[locale];
  const names = stones.map((stone) => stone.name[locale]).join(locale === "zh" ? "、" : ", ");

  if (stones.length === 0) return atelierCopy[locale].empty;

  if (locale === "zh") {
    return `这条 ${beadSize}mm · ${count} 颗的组合以「${focusName}」为主轴，当前选入 ${names}。它不是把好运玄学化承诺给你，而是把颜色、材质和心理暗示变成一个可佩戴的提醒：什么时候该稳，什么时候该动，什么时候该收住情绪。`;
  }

  if (locale === "ru") {
    return `Эта сборка ${beadSize} мм · ${count} бусин поддерживает стихию ${focusName}. Выбраны: ${names}. Это не обещание удачи, а носимый символический якорь для настроя, цвета и намерения.`;
  }

  return `This ${beadSize}mm · ${count}-bead configuration supports ${focusName}. Selected stones: ${names}. It is not a promise of luck; it is a wearable symbolic anchor for color, material, and intention.`;
}

export default function AtelierExperience({
  initialLocale = "en",
  initialFocus = "Water",
}: {
  initialLocale?: ReportLocale;
  initialFocus?: EnergyElement;
}) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [focus, setFocus] = useState<EnergyElement>(initialFocus);
  const [gender, setGender] = useState<GenderStyle>("female");
  const [beadSize, setBeadSize] = useState(10);
  const [beadCount, setBeadCount] = useState(18);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "clear-quartz",
    "lapis",
    "green-aventurine",
  ]);
  const copy = atelierCopy[locale];
  const selectedStones = useMemo(
    () =>
      selectedIds
        .map((id) => gemstoneLibrary.find((stone) => stone.id === id))
        .filter(Boolean) as Gemstone[],
    [selectedIds],
  );
  const visibleStones = useMemo(
    () =>
      focus
        ? gemstoneLibrary.filter((stone) => stone.element === focus)
        : gemstoneLibrary,
    [focus],
  );
  const bracelet = buildBraceletPattern(selectedStones, beadCount);
  const percentages = elementPercentages(balanceFromStones(bracelet));
  const analysis = buildAnalysis(locale, selectedStones, focus, beadSize, beadCount);

  useEffect(() => {
    setDocumentLocale(locale);
    window.localStorage.setItem("destinypixel-locale", locale);
  }, [locale]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    window.localStorage.setItem("destinypixel-locale", nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function toggleStone(stone: Gemstone) {
    setSelectedIds((current) =>
      current.includes(stone.id)
        ? current.filter((id) => id !== stone.id)
        : [...current, stone.id],
    );
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

      <section className="atelier-hero">
        <div className="atelier-aura" aria-label={copy.creation}>
          <div className="atelier-aura__ring">
            {bracelet.length > 0 ? (
              bracelet.map((stone, index) => {
                const angle = (index / bracelet.length) * 360;

                return (
                  <span
                    key={`${stone.id}-${index}`}
                    style={{
                      "--angle": `${angle}deg`,
                      "--bead": `${Math.max(9, beadSize * 1.25)}px`,
                      "--stone": stone.color,
                      "--shine": stone.accent,
                    } as CSSProperties}
                    title={stone.name[locale]}
                  />
                );
              })
            ) : (
              <em>{copy.empty}</em>
            )}
          </div>
        </div>

        <div className="atelier-hero__copy">
          <p>
            <Sparkles size={14} aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1>{copy.title}</h1>
          <span>{copy.lead}</span>
        </div>
      </section>

      <section className="atelier-builder">
        <div className="atelier-controls">
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
            <div className="atelier-options">
              {[8, 10, 12, 14].map((size) => (
                <button
                  type="button"
                  key={size}
                  data-active={beadSize === size}
                  onClick={() => setBeadSize(size)}
                >
                  <i style={{ width: size * 1.3, height: size * 1.3 }} />
                  {size}mm
                </button>
              ))}
            </div>
          </div>

          <div>
            <span>{copy.beadCount}</span>
            <div className="atelier-options">
              {[15, 16, 18, 20].map((count) => (
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

        <div className="atelier-library">
          <div className="atelier-library__heading">
            <div>
              <p>{copy.archive}</p>
              <h2>{copy.filter}</h2>
            </div>
            <div className="atelier-element-filter" role="group" aria-label={copy.filter}>
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

          <div className="atelier-stone-grid">
            {visibleStones.map((stone) => {
              const active = selectedIds.includes(stone.id);

              return (
                <button
                  type="button"
                  className="atelier-stone-card"
                  key={stone.id}
                  data-active={active}
                  onClick={() => toggleStone(stone)}
                >
                  <span
                    style={{
                      background: `radial-gradient(circle at 30% 25%, ${stone.accent}, ${stone.color} 58%, #1d1b18)`,
                    }}
                  />
                  <small>
                    {elementStyle[stone.element].label[locale]} · {stone.aura[locale]}
                  </small>
                  <strong>{stone.name[locale]}</strong>
                  <p>{stone.meaning[locale]}</p>
                  <em>{active ? <Check size={14} /> : <Plus size={14} />}</em>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="atelier-analysis">
          <span>
            <Gem size={15} aria-hidden="true" />
            {copy.analysis}
          </span>
          <h2>{copy.creation}</h2>
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

          <div className="atelier-selected">
            <strong>{copy.selected}</strong>
            {selectedStones.length ? (
              selectedStones.map((stone) => (
                <span key={stone.id}>
                  <i style={{ background: stone.color }} />
                  {stone.name[locale]}
                </span>
              ))
            ) : (
              <p>{copy.empty}</p>
            )}
          </div>

          <div className="atelier-actions">
            <button type="button">{copy.save}</button>
            <button type="button" data-primary>
              {copy.shop}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
