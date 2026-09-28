import type { NatalChart } from "./astrology";
import type { CelestialCopy } from "./copy";
import type { ReportLocale } from "@/lib/report-i18n";
import { toTraditional } from "@/lib/journal-locales";

export const natalGroups = ["core", "planets", "houses", "aspects", "life"] as const;
export type NatalGroup = typeof natalGroups[number];
export type NatalTarget = { id: string; group: NatalGroup; title: string; basis: string };
export type NatalReading = {
  summary: string;
  entries: Array<{ id: string; meaning: string; reading: string; practice: string }>;
  reflection: string;
};

const en = {
  title: "Your birth chart, in depth", cta: "Read my complete chart", busy: "Writing your detailed chapters…",
  wait: "A complete reading can take one to two minutes. Explore the guide below while it is being written.",
  intro: "Start with what each symbol means, then see how its sign, house and connections work together in your chart.",
  groups: ["Sun, Moon & rising", "The other eight planets", "All twelve houses", "Your closest major aspects", "Bringing the chart together"],
  meaning: "What it means", reading: "In your chart", practice: "Something to try", basis: "Chart basis",
  expand: "Expand all", collapse: "Collapse all", contents: "Reading contents", guide: "A quick guide to reading your chart",
  allAspects: "All major aspects are available in the chart list. This chapter explores up to twelve with the smallest orbs; the complete report covers every planet and house.",
  empty: "No planets in this house", synthesis: "A synthesis of your calculated placements, houses and aspects",
  themes: ["Love, closeness & communication", "Work, contribution & direction", "Security, resources & boundaries", "Tensions, strengths & everyday growth"],
  glossary: [
    ["Sun, Moon and rising are different layers", "The Sun symbolizes identity and direction; the Moon, emotional needs and habitual responses. The rising sign describes the eastern horizon at birth and, in astrology, how you approach unfamiliar situations. None describes the whole person on its own."],
    ["Planet = function; sign = style; house = setting", "For example, Mercury concerns thinking and communication. Its sign describes a style, while its house points to a field of experience. The reading combines all three rather than treating a sign as a complete personality label."],
    ["Twelve houses, twelve areas of experience", "Houses describe life areas, from identity and resources to relationships and public work. We use Whole Sign houses: one sign per house. An empty house does not mean that area is absent, unsuccessful or unimportant."],
    ["Aspects are angles, not scores", "Conjunction 0° joins functions; sextile 60° suggests an opening; square 90° asks for adjustment; trine 120° suggests ease; opposition 180° invites balance. These are traditional symbolic interpretations, not guaranteed effects."],
    ["Degrees, orb and retrograde", "A degree records a position inside a sign. Orb is the distance from an exact aspect angle: a 92° separation has a 2° orb from a 90° square. We use a maximum orb of 6°. Retrograde is apparent backward motion, not automatically bad luck."],
  ],
};
const zh: typeof en = {
  title: "读懂你的完整出生星盘", cta: "生成完整星盘解读", busy: "正在逐章整理详细解读…",
  wait: "完整解读可能需要一到两分钟；等待时可以先看下方的术语说明。",
  intro: "先了解每个符号代表什么，再结合你的落座、宫位和相位，逐层读懂它们怎样组成同一张星盘。",
  groups: ["太阳、月亮与上升", "其余八颗星体逐项解读", "十二宫：生活的不同领域", "最紧密的主要相位", "整合：关系、事业与成长"],
  meaning: "它代表什么", reading: "放在你的盘里怎么看", practice: "可以怎样运用", basis: "本段依据",
  expand: "展开全部", collapse: "收起全部", contents: "解读目录", guide: "先看懂星盘的语言",
  allAspects: "图表列表保留全部主要相位。本章详细解读容许度最小的至多十二组关系；十颗星体和十二宫则全部覆盖。",
  empty: "本宫没有星体落入", synthesis: "综合已计算的星体落座、宫位与相位",
  themes: ["感情、亲密与沟通方式", "事业、贡献与发展方向", "安全感、资源与个人边界", "内在张力、优势与日常成长"],
  glossary: [
    ["太阳、月亮、上升不是同一件事", "太阳象征自我认同与想走的方向；月亮对应情绪需要、熟悉的反应和安全感。上升是出生时东方地平线升起的星座，在占星里象征你如何进入陌生环境、向外界呈现自己。三者是不同层面，不能只靠一个给整个人下定义。"],
    ["星体是功能，星座是方式，宫位是场景", "例如水星关注思考与沟通；它落入的星座描述表达方式，所在的宫位提示这些主题在哪个生活领域较常被体验。解读需要把三者连起来，而不是只说某个星座就一定是什么性格。"],
    ["十二宫不是十二个分数", "宫位对应自我、资源、学习、家庭、创造、日常、关系、共享、信念、事业、群体和内在生活等领域。本站采用整宫制，每个星座对应一个完整宫位。空宫只是没有星体落入，不等于这一领域不存在、不重要或发展不好。"],
    ["相位就是星体之间的夹角", "合相约0°，象征功能汇合；六合相（六分相）约60°，象征需要主动运用的合作机会；刑相（四分相）约90°，象征需要协调的差异；三合相（拱相、三分相）约120°，象征较顺手的联系；对冲（冲相）约180°，象征两个方向之间的平衡。这些是传统象征解释，不是好坏打分。"],
    ["度数、容许度和逆行分别是什么", "度数是星体在某星座内的位置；容许度是实际夹角与标准相位角的差值，例如92°与90°刑相相差2°。本站采用6°以内的主要相位。逆行指从地球观察到的视运动方向，并不自动意味着倒霉或能力受损。"],
  ],
};
const ru: typeof en = {
  title: "Подробное чтение вашей натальной карты", cta: "Получить полный разбор", busy: "Готовим подробные главы…",
  wait: "Полный разбор может занять одну-две минуты. Пока можно изучить пояснения ниже.",
  intro: "Сначала — значение символа, затем его знак, дом и связи именно в вашей карте.",
  groups: ["Солнце, Луна и асцендент", "Остальные восемь планет", "Все двенадцать домов", "Самые точные основные аспекты", "Отношения, работа и развитие"],
  meaning: "Что это означает", reading: "В вашей карте", practice: "Что можно попробовать", basis: "Основание в карте",
  expand: "Развернуть всё", collapse: "Свернуть всё", contents: "Содержание разбора", guide: "Как читать язык карты",
  allAspects: "Полный список основных аспектов остаётся в таблице карты. Здесь подробно разобраны до двенадцати аспектов с наименьшим орбисом. Все планеты и дома охвачены полностью.",
  empty: "В этом доме нет планет", synthesis: "Синтез рассчитанных положений, домов и аспектов",
  themes: ["Близость, отношения и общение", "Работа, вклад и направление", "Безопасность, ресурсы и границы", "Противоречия, сильные стороны и развитие"],
  glossary: [
    ["Солнце, Луна и асцендент — разные слои", "Солнце символизирует идентичность и направление, Луна — эмоциональные потребности и привычные реакции. Асцендент — знак восточного горизонта при рождении; в астрологии он описывает подход к незнакомой обстановке. Ни один показатель не определяет человека целиком."],
    ["Планета — функция, знак — стиль, дом — сфера", "Например, Меркурий связан с мышлением и общением. Знак описывает стиль, дом — область опыта. Для чтения соединяют все три уровня, а не сводят личность к одному знаку."],
    ["Двенадцать домов — области жизни", "Дома описывают области от самовыражения и ресурсов до отношений и общественной деятельности. Здесь применяется полнознаковая система: один знак на дом. Пустой дом не означает отсутствия, неудачи или неважности этой области."],
    ["Аспекты — углы, а не оценки", "Соединение 0° объединяет функции; секстиль 60° предлагает возможность; квадрат 90° требует согласования; трин 120° символизирует лёгкость; оппозиция 180° — поиск баланса. Это традиционные символические трактовки, а не гарантированные эффекты."],
    ["Градусы, орбис и ретроградность", "Градус задаёт положение внутри знака. Орбис — отклонение от точного угла: расстояние 92° даёт орбис 2° для квадрата 90°. Здесь предел — 6°. Ретроградность означает видимое обратное движение, а не автоматическое невезение."],
  ],
};
export function natalReadingCopy(locale: ReportLocale): typeof en {
  if (locale === "zh-TW") {
    const convert = (x: unknown): unknown => typeof x === "string" ? toTraditional(x) : Array.isArray(x) ? x.map(convert) : Object.fromEntries(Object.entries(x as object).map(([k,v]) => [k,convert(v)]));
    return convert(zh) as typeof en;
  }
  return locale === "zh" ? zh : locale === "ru" ? ru : en;
}
export function natalReadingTargets(chart: NatalChart, c: CelestialCopy, locale: ReportLocale): NatalTarget[] {
  const labels = natalReadingCopy(locale);
  const position = (lon: number) => `${c.signs[Math.floor(lon / 30)]} ${(lon % 30).toFixed(2)}°`;
  const name = (body: string) => c.planetNames[chart.placements.findIndex(p => p.body === body)];
  const planets: NatalTarget[] = chart.placements.map((p,i) => ({
    id: `planet-${p.body}`, group: i < 2 ? "core" : "planets", title: c.planetNames[i],
    basis: `${position(p.longitude)} · ${c.house} ${p.house} (${c.houseNames[p.house-1]}) · ${p.retrograde ? c.retrograde : c.direct}`,
  }));
  const asc: NatalTarget = { id:"ascendant", group:"core", title:c.rising, basis:position(chart.ascendant) };
  const houses: NatalTarget[] = chart.houses.map((lon,i) => ({
    id:`house-${i+1}`, group:"houses", title:`${c.house} ${i+1} · ${c.houseNames[i]}`,
    basis:`${position(lon)} · ${chart.placements.filter(p=>p.house===i+1).map(p=>name(p.body)).join(" · ") || labels.empty}`,
  }));
  const aspects: NatalTarget[] = chart.aspects.map((a,i)=>({a,i})).sort((x,y)=>x.a.orb-y.a.orb || x.i-y.i).slice(0,12).map(({a,i})=> {
    const p = chart.placements.find(p=>p.body===a.bodies[0])!, q = chart.placements.find(p=>p.body===a.bodies[1])!;
    const angle = Math.abs(p.longitude-q.longitude);
    return {id:`aspect-${i}`,group:"aspects", title:`${a.bodies.map(name).join(" · ")} · ${c.aspectNames[a.type]}`, basis:`${Math.min(angle,360-angle).toFixed(2)}° · ${c.orb} ${a.orb.toFixed(2)}°`};
  });
  return [...planets.slice(0,2), asc, ...planets.slice(2), ...houses, ...aspects,
    ...labels.themes.map((title,i):NatalTarget=>({id:`life-${i}`,group:"life",title,basis:labels.synthesis}))];
}
