"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import { tarotLearningCopy } from "@/lib/tarot-learning/copy";
import { tarotCardMatches } from "@/lib/tarot-learning/search";
import { tarotLearningHref } from "@/lib/tarot-learning/paths";
import learn from "@/app/journal/tarot-learning.module.css";
import search from "./tarot-card-directory.module.css";

type Card = { cardId: string; number: string; arcana: string; suit: string | null; nameLocalized: string; quickTake: { upright: string; reversed: string }; image: string; aliases: string[] };
const groups = ["major", "wands", "cups", "swords", "pentacles"];
const copy = {
  en: { label: "Find a card by name", hint: "English, Chinese or Russian names. Try Star, 钱币一 or Ace of Pentacles.", placeholder: "Card name or suit", clear: "Clear search", results: (n: number) => `${n} of 78 cards`, none: "No cards match that name. Try another name or clear the search.", noJs: "Search requires JavaScript. All 78 cards and their guides are listed below." },
  zh: { label: "按牌名找牌", hint: "支持中英俄牌名。例如：星星、钱币一、Ace of Pentacles。", placeholder: "输入牌名或花色", clear: "清空搜索", results: (n: number) => `找到 ${n} / 78 张牌`, none: "没有匹配的牌名。换个名称，或清空搜索查看全部牌。", noJs: "搜索需要启用 JavaScript。下方仍列出全部 78 张牌和全文入口。" },
  "zh-TW": { label: "按牌名找牌", hint: "支援中英俄牌名。例如：星星、錢幣一、Ace of Pentacles。", placeholder: "輸入牌名或花色", clear: "清空搜尋", results: (n: number) => `找到 ${n} / 78 張牌`, none: "沒有符合的牌名。換個名稱，或清空搜尋查看全部牌。", noJs: "搜尋需要啟用 JavaScript。下方仍列出全部 78 張牌和全文入口。" },
  ru: { label: "Найти карту по названию", hint: "Названия на русском, английском и китайском. Например: Звезда, 钱币一 или Ace of Pentacles.", placeholder: "Название карты или масти", clear: "Очистить поиск", results: (n: number) => `${n} из 78 карт`, none: "Карт с таким названием нет. Попробуйте другое название или очистите поиск.", noJs: "Для поиска нужен JavaScript. Все 78 карт и ссылки на статьи доступны ниже." },
};

export function TarotCardDirectory({ cards, locale }: { cards: Card[]; locale: ReportLocale }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const c = tarotLearningCopy(locale), ui = copy[locale];
  const found = cards.filter(card => tarotCardMatches(card.aliases, query));
  return <>
    <section className={search.search} aria-label={ui.label}>
      <label htmlFor="tarot-card-search">{ui.label}</label>
      <p id="tarot-search-hint">{ui.hint}</p>
      <div className={search.controls}>
        <input ref={input} id="tarot-card-search" type="search" value={query} onChange={event => setQuery(event.target.value)} aria-describedby="tarot-search-hint" placeholder={ui.placeholder} autoComplete="off" spellCheck={false}/>
        <button type="button" data-clear-card-search disabled={!query} onClick={() => { setQuery(""); input.current?.focus(); }}>{ui.clear}</button>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" data-card-search-status>{ui.results(found.length)}</p>
      <noscript>{ui.noJs}</noscript>
    </section>
    <nav className={learn.jump} aria-label={c.directory}>{groups.map((group, i) => found.some(card => group === "major" ? card.arcana === "major" : card.suit === group) && <a href={`#${group}`} key={group}>{c.groups[i]}</a>)}</nav>
    <div className={learn.collection}>
      {found.length === 0 && <p className={search.empty}>{ui.none}</p>}
      {groups.map((group, i) => {
        const entries = found.filter(card => group === "major" ? card.arcana === "major" : card.suit === group);
        return entries.length > 0 && <section key={group} id={group} className={learn.group}>
          <h2>{c.groups[i]}</h2><div className={learn.grid}>{entries.map(card => <article className={learn.tile} key={card.cardId} data-card-id={card.cardId}>
            <a href={tarotLearningHref(card.cardId, locale)} className={learn.tileLink}>
              <Image src={card.image} alt="" width={280} height={480} sizes="(max-width:650px) 42vw, 180px"/>
              <span className={learn.number}>{card.number}</span><h3>{card.nameLocalized}</h3>
              <dl className={search.quick}><div><dt>{c.upright}</dt><dd>{card.quickTake.upright}</dd></div><div><dt>{c.reversed}</dt><dd>{card.quickTake.reversed}</dd></div></dl>
              <span className={learn.read}>{c.read} →</span>
            </a>
          </article>)}</div>
        </section>;
      })}
    </div>
  </>;
}
