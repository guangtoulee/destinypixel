"use client";
import { ArrowUpRight } from "lucide-react";
import { CardBack } from "./card-back";
import type { ReportLocale } from "@/lib/report-i18n";
import styles from "./home-portals.module.css";
const copy = {
  en: {
    eyebrow: "TWO MORE WAYS TO EXPLORE",
    title: "Read the sky. Follow a question.",
    astro: "Free birth chart calculator",
    astroBody:
      "Sun, Moon, rising sign and the patterns between them. A personal sky, made clear.",
    astroCta: "Calculate my birth chart",
    tarot: "Free online tarot reading",
    tarotBody:
      "Shuffle 78 cards, choose your own, and turn them over. Follow a spread or find your own way.",
    tarotCta: "Shuffle and choose tarot cards",
    tag: "Free · no account needed",
  },
  zh: {
    eyebrow: "从另一种角度，认识自己",
    title: "一片星空，一个问题。",
    astro: "免费星盘查询与解读",
    astroBody:
      "月亮、上升、十颗星体与它们的联系，组成一张可以逐层探索的出生星盘。",
    astroCta: "查询太阳、月亮与上升",
    tarot: "免费在线塔罗牌",
    tarotBody:
      "78张经典塔罗牌，亲手洗牌、挑选、摆放、翻开。跟随排阵，也可以随心摆一桌。",
    tarotCta: "选牌阵，亲手抽牌",
    tag: "免费体验 · 无需注册",
  },
  "zh-TW": {
    eyebrow: "從另一種角度，認識自己",
    title: "一片星空，一個問題。",
    astro: "免費星盤查詢與解讀",
    astroBody:
      "月亮、上升、十顆星體與它們的聯繫，組成一張可以逐層探索的出生星盤。",
    astroCta: "查詢太陽、月亮與上升",
    tarot: "免費線上塔羅牌",
    tarotBody:
      "78張經典塔羅牌，親手洗牌、挑選、擺放、翻開。跟隨排陣，也可以隨心擺一桌。",
    tarotCta: "選牌陣，親手抽牌",
    tag: "免費體驗 · 無需註冊",
  },
  ru: {
    eyebrow: "ЕЩЁ ДВА СПОСОБА ИССЛЕДОВАТЬ",
    title: "Взгляд на небо. Место для вопроса.",
    astro: "Натальная карта бесплатно",
    astroBody:
      "Солнце, Луна, асцендент и связи между планетами. Личное небо, шаг за шагом.",
    astroCta: "Рассчитать натальную карту",
    tarot: "Таро онлайн бесплатно",
    tarotBody:
      "Перемешайте 78 карт, выберите и откройте их сами. Готовые расклады или свободный стол.",
    tarotCta: "Выбрать расклад Таро",
    tag: "Бесплатно · без регистрации",
  },
};
export function HomePortals({ locale }: { locale: ReportLocale }) {
  const c = copy[locale],
    href = (path: string) =>
      locale === "en" ? path : `${path}?locale=${locale}`;
  return (
    <section className={styles.section} id="sky-and-tarot">
      <div className="white-container">
        <div className={styles.heading}>
          <p>{c.eyebrow}</p>
          <h2>{c.title}</h2>
        </div>
        <div className={styles.grid}>
          <a
            className={`${styles.portal} ${styles.sky}`}
            href={href("/astrology")}
          >
            <div className={styles.visual} aria-hidden="true">
              <svg viewBox="0 0 400 340">
                <g
                  transform="translate(200 175) rotate(-15)"
                  fill="none"
                  stroke="#b4a3c3"
                >
                  <circle r="143" stroke="#b59b76" />
                  <circle r="137" opacity=".4" />
                  <circle r="113" />
                  <circle r="86" opacity=".5" />
                  {Array.from({ length: 72 }, (_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="-126"
                      x2="0"
                      y2={i % 6 === 0 ? -137 : -132}
                      transform={`rotate(${i * 5})`}
                      strokeWidth=".7"
                    />
                  ))}
                  {[
                    "♈",
                    "♉",
                    "♊",
                    "♋",
                    "♌",
                    "♍",
                    "♎",
                    "♏",
                    "♐",
                    "♑",
                    "♒",
                    "♓",
                  ].map((s, i) => {
                    const a = ((i * 30 - 75) * Math.PI) / 180;
                    return (
                      <text
                        key={s}
                        x={Number((99 * Math.cos(a)).toFixed(3))}
                        y={Number((99 * Math.sin(a) + 5).toFixed(3))}
                        fontSize="15"
                        textAnchor="middle"
                        fill={i % 2 ? "#9a8faa" : "#b49777"}
                        stroke="none"
                      >
                        {s + "\uFE0E"}
                      </text>
                    );
                  })}
                  <path
                    d="M-70 10L45-50L10 73L-51-38L75 15L-70 10"
                    stroke="#a791b5"
                    opacity=".55"
                  />
                  <path d="M-51-38L45-50L75 15L10 73" stroke="#c6a599" />
                  {[
                    [-70, 10],
                    [45, -50],
                    [10, 73],
                    [-51, -38],
                    [75, 15],
                  ].map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="7"
                      fill="#fcfaf6"
                      stroke="#bca486"
                    />
                  ))}
                  <text
                    y="12"
                    textAnchor="middle"
                    fontSize="38"
                    fill="#b29a77"
                    stroke="none"
                  >
                    ✧
                  </text>
                </g>
              </svg>
            </div>
            <div className={styles.text}>
              <span>{c.tag}</span>
              <h3>{c.astro}</h3>
              <p>{c.astroBody}</p>
              <strong>
                {c.astroCta}
                <ArrowUpRight size={18} />
              </strong>
            </div>
          </a>
          <a
            className={`${styles.portal} ${styles.tarot}`}
            href={href("/tarot")}
          >
            <div
              className={`${styles.visual} ${styles.cards}`}
              aria-hidden="true"
            >
              <div>
                <CardBack />
              </div>
              <img
                src="/tarot/rws/star.webp"
                alt=""
                loading="lazy"
                width={560}
                height={960}
              />
              <img
                src="/tarot/rws/sun.webp"
                alt=""
                loading="lazy"
                width={560}
                height={960}
              />
            </div>
            <div className={styles.text}>
              <span>{c.tag}</span>
              <h3>{c.tarot}</h3>
              <p>{c.tarotBody}</p>
              <strong>
                {c.tarotCta}
                <ArrowUpRight size={18} />
              </strong>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
