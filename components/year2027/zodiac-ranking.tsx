"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { rankedZodiacEntries, zodiacRankingCategories, type ZodiacRankingCategory, type ZodiacRankingLang } from "@/lib/year2027/zodiac-ranking";
import styles from "./zodiac-ranking.module.css";

const copy = {
  zh: {
    eyebrow: "TWELVE ANIMALS · ONE EDITORIAL GUIDE", title: "2027 十二生肖星级参考榜", intro: "先用生肖打开话题，再把答案留给完整的自己。综合、事业、感情、财运各有一条小提醒，可按主题查看并列排行。", boundary: "丁未年专题：八字从 2027 年立春切换；1 月及立春前仍属丙午。它不是公历全年统一的吉凶表，下方个人手册仍从 1 月开始。", categories: { overall: "综合", career: "事业", love: "感情", wealth: "财运" }, sort: "按哪个主题排行", stars: "星", outOf: "满分 5 星", tied: "并列", rank: "位", updated: "排行已按所选主题更新。", basis: "为什么这样编排", method: "星星怎么读？先把口径摊开", methodIntro: "这是本站原创的现代编辑参考分，用来安排“可以主动尝试，还是值得先梳理”的阅读重点，不是传统算命公式。所有生肖从中性的 3 星出发；六合、三合组的联结意象让合作主题用 4 星，冲、害、破让对应的沟通或核对主题用 2 星。具体落在哪一栏是编辑选择，不是古籍给出的事业或财运结论。", methodMore: "1 星＝先重新梳理；2 星＝放慢核对；3 星＝稳步推进；4 星＝主动尝试；5 星＝优先探索。本版只使用 2—4 星，不为凑齐区间制造极端判断。综合星级独立编写，不是三项的平均数；并列保留，不把十二生肖硬排成十二种命运。本命年不扣分。", limits: "生肖只是年支，不能替代四柱、日主、原局、大运与流年的合看；星级没有统计概率或科学预测意义，也不是你的完整个人八字结论。短评都是本站现代建议。", sources: "传统关系出处", classic: "《三命通会》卷二：合、冲、刑、害", breaks: "《六壬大全》：支破表（术数语境不同）", guide: "本命年一定不好吗？把太岁关系讲清楚", personal: "打开免费个人八字＋星盘手册", peace: "点亮一盏平安灯", footer: "“合”也要协商，“冲”也能调整。把星星当成一个问题的开头。",
  },
  en: {
    eyebrow: "TWELVE ANIMALS · ONE EDITORIAL GUIDE", title: "2027 Chinese zodiac star guide", intro: "Start a conversation with your year animal, then leave room for the whole person. Explore overall, career, relationship and money prompts, with shared places in each ranking.", boundary: "This is a Ding–Wei year feature: BaZi changes year at Lichun in 2027. January and the days before Lichun still belong to Bing–Wu. It is not one forecast for the entire calendar year; the personal guide below still starts in January.", categories: { overall: "Overall", career: "Career", love: "Love", wealth: "Money" }, sort: "Choose a ranking theme", stars: "stars", outOf: "out of 5", tied: "Tied", rank: "place", updated: "The ranking has updated to your chosen theme.", basis: "Why this editorial choice", method: "What do the stars mean?", methodIntro: "These are our original editorial ratings: prompts for deciding what to explore actively and what to review first, rather than a traditional calculation. Every animal starts at a neutral 3. The connection imagery of six harmony and the three-harmony grouping inspires 4-star collaboration prompts; clash, harm and break inspire 2-star communication or checking prompts. Assigning those themes to a column is an editorial choice, not a career or money forecast supplied by a classical text.", methodMore: "1 star = rethink first; 2 = slow down and check; 3 = proceed steadily; 4 = try something actively; 5 = explore as a priority. This edition uses only 2–4 stars; limited year-animal information does not justify extremes. Overall ratings are written independently, not averaged from the other columns. Equal places stay equal. A birth-animal year receives no automatic penalty.", limits: "Your zodiac animal is only the year branch. It cannot replace a reading of the Four Pillars, Day Master, natal pattern, luck cycles and annual influence together. These stars are neither statistical probabilities nor scientifically validated predictions or a complete personal BaZi conclusion. All short comments are our modern suggestions.", sources: "Sources for the traditional relationships", classic: "San Ming Tong Hui, vol. 2: harmony, clash, punishment and harm", breaks: "Liu Ren Da Quan: branch-break table (a different divination context)", guide: "Is your zodiac year unlucky? Tai Sui relationships explained", personal: "Open the free personal BaZi + astrology guide", peace: "Light a lamp for peace", footer: "Harmony still takes cooperation. Change still leaves choices. Let a star be the start of a question.",
  },
};

function Stars({ value, lang }: { value: number; lang: ZodiacRankingLang }) {
  return <span className={styles.starRating} role="img" aria-label={lang === "zh" ? `${value} 星，满分 5 星` : `${value} out of 5 stars`}>
    <span aria-hidden="true"><span>{"★".repeat(value)}</span><span className={styles.emptyStars}>{"☆".repeat(5 - value)}</span></span>
    <span className={styles.starNumber} aria-hidden="true">{value}/5</span>
  </span>;
}

export function ZodiacRanking({ lang }: { lang: ZodiacRankingLang }) {
  const [category, setCategory] = useState<ZodiacRankingCategory>("overall");
  const [changed, setChanged] = useState(false);
  const c = copy[lang], query = lang === "zh" ? "?locale=zh" : "";
  const ranked = rankedZodiacEntries(category);
  return <section className={styles.section} id="zodiac-ranking" aria-labelledby="zodiac-ranking-title" data-zodiac-ranking>
    <div className={styles.heading}><div><p className={styles.eyebrow}>{c.eyebrow}</p><h2 id="zodiac-ranking-title">{c.title}</h2><p className={styles.intro}>{c.intro}</p></div><span className={styles.headingMark} aria-hidden="true">未<span>2027</span></span></div>
    <p className={styles.boundary}>{c.boundary}</p>
    <div className={styles.sort} role="group" aria-label={c.sort}>{zodiacRankingCategories.map(key => <button key={key} type="button" aria-pressed={category === key} onClick={() => { setCategory(key); setChanged(true); }}>{c.categories[key]}</button>)}</div>
    <p className={styles.srOnly} role="status" aria-live="polite">{changed ? `${c.categories[category]} · ${c.updated}` : ""}</p>
    <ol className={styles.grid} aria-label={`${c.categories[category]} · ${c.title}`}>
      {ranked.map(entry => <li key={entry.id} className={styles.card} data-zodiac={entry.id}>
        <div className={styles.cardTop}><span className={styles.place}>{lang === "zh" ? `${entry.tied ? c.tied : ""}第 ${entry.rank} ${c.rank}` : `${entry.tied ? `${c.tied} · ` : ""}${c.rank} ${entry.rank}`}</span><span className={styles.branch} aria-hidden="true">{entry.branch}</span></div>
        <div className={styles.animal}><h3>{entry.name[lang]}</h3><span>{entry.relation[lang]}</span></div>
        <dl className={styles.ratings}>{zodiacRankingCategories.map(key => <div key={key} data-selected={key === category || undefined}><dt>{c.categories[key]}</dt><dd><Stars value={entry.ratings[key].stars} lang={lang} /><p>{entry.ratings[key].note[lang]}</p></dd></div>)}</dl>
        <details className={styles.basis}><summary>{c.basis}<span aria-hidden="true">+</span></summary><p>{entry.basis[lang]}</p></details>
      </li>)}
    </ol>
    <details className={styles.method} open><summary>{c.method}<span aria-hidden="true">+</span></summary><div><p>{c.methodIntro}</p><p>{c.methodMore}</p><p className={styles.limits}>{c.limits}</p><div className={styles.sourceLinks}><strong>{c.sources}</strong><a href="https://zh.wikisource.org/wiki/三命通會/卷二" target="_blank" rel="noreferrer">{c.classic} <ArrowUpRight size={12} aria-hidden="true" /></a><a href="https://zh.wikisource.org/wiki/六壬大全/1" target="_blank" rel="noreferrer">{c.breaks} <ArrowUpRight size={12} aria-hidden="true" /></a></div></div></details>
    <div className={styles.next}><p>{c.footer}</p><nav aria-label={lang === "zh" ? "继续探索 2027" : "Explore 2027 further"}><a href={`/journal/ben-ming-nian-tai-sui${query}`} data-analytics-entry="taisui_guide">{c.guide}<span aria-hidden="true"><ArrowUpRight size={16} /></span></a><a href="#your-year" data-analytics-entry="year_2027_personal">{c.personal}<span aria-hidden="true"><ArrowUpRight size={16} /></span></a><a href={`/taisui${query}`} data-analytics-entry="taisui_peace">{c.peace}<span aria-hidden="true"><ArrowUpRight size={16} /></span></a></nav></div>
  </section>;
}
