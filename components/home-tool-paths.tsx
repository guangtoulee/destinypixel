import { ArrowRight, BookOpen, Clapperboard, Orbit } from "lucide-react";
import type { ContentLocale } from "@/lib/report-i18n";
import styles from "./home-tool-paths.module.css";

const copy = {
  en: {
    title: "Choose what you want to explore.", all: "Explore all tools", label: "YOUR NEXT STEP",
    paths: [
      { title: "Understand your patterns", body: "Start with an interactive Birth Totem, or read a guide before your first chart.", links: [["Birth Totem", "/tuteng?locale=en"], ["Getting started", "/learn"]] },
      { title: "Make something with AI", body: "Find a prompt example, expand an idea, or turn a story into a production plan. Chinese interfaces.", links: [["Prompt library", "/prompt"], ["Script studio", "/juben"], ["Director studio", "/daoyan"]] },
      { title: "Build a learning habit", body: "Practise English vocabulary with recall and review tools for Chinese learners.", links: [["English practice", "/english"], ["Word practice", "/danci"]] },
    ],
  },
  zh: {
    title: "从你现在想做的事开始。", all: "查看全部工具", label: "下一步，去哪里",
    paths: [
      { title: "看懂自己的图腾", body: "用出生信息生成本命灵构，查看五行与结构解释，也可以先读使用指南。", links: [["生成本命灵构", "/tuteng?locale=zh"], ["使用指南（英文）", "/learn"]] },
      { title: "把想法做成作品", body: "从真实案例寻找提示词，把一句话扩写成画面，或继续准备短剧与导演本。", links: [["Prompt 案例库", "/prompt"], ["短剧剧本", "/juben"], ["导演工作台", "/daoyan"]] },
      { title: "每天练一点英语", body: "按单词范围练习，通过回忆、听写和复习巩固词汇。", links: [["英语练习", "/english"], ["单词训练", "/danci"]] },
    ],
  },
  ru: {
    title: "Выберите, что хотите исследовать.", all: "Все инструменты", label: "СЛЕДУЮЩИЙ ШАГ",
    paths: [
      { title: "Узнайте свои закономерности", body: "Создайте интерактивный тотем по данным рождения или начните с руководства на английском.", links: [["Тотем рождения", "/tuteng?locale=ru"], ["Руководство (EN)", "/learn"]] },
      { title: "Создавайте с ИИ", body: "Найдите пример промпта, развивайте идею или подготовьте сценарий. Интерфейсы на китайском.", links: [["Библиотека промптов", "/prompt"], ["Сценарий", "/juben"], ["Режиссура", "/daoyan"]] },
      { title: "Практикуйте английский", body: "Тренируйте запоминание слов и повторение. Инструменты для китайскоязычных учеников.", links: [["Английский", "/english"], ["Словарная практика", "/danci"]] },
    ],
  },
};
const icons = [Orbit, Clapperboard, BookOpen];

export function HomeToolPaths({ locale }: { locale: ContentLocale }) {
  const text = copy[locale];
  return <section className={styles.section} aria-labelledby="home-paths-title">
    <div className="white-container">
      <div className={styles.heading}>
        <div><p>{text.label}</p><h2 id="home-paths-title">{text.title}</h2></div>
        <a href={locale === "zh" ? "/tools?locale=zh" : "/tools"}>{text.all}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className={styles.grid}>
        {text.paths.map((path, i) => {
          const Icon = icons[i];
          return <article className={styles.card} key={path.title}>
            <Icon size={22} aria-hidden="true" />
            <h3>{path.title}</h3><p>{path.body}</p>
            <div className={styles.links}>{path.links.map(([label, href]) =>
              <a key={href} href={href}>{label}<ArrowRight size={13} aria-hidden="true" /></a>,
            )}</div>
          </article>;
        })}
      </div>
    </div>
  </section>;
}
