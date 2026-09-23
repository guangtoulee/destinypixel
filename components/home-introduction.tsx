import { ArrowRight, Heart, MessageCircle, Sparkles } from "lucide-react";
import { toTraditional } from "@/lib/journal-locales";
import type { ReportLocale } from "@/lib/report-i18n";

const en = {
  eyebrow: "CHINESE ASTROLOGY · EVERYDAY QUESTIONS",
  title: "Understand yourself.\nConnect with what matters.",
  lead: "Why do you keep falling into the same patterns? Why do two people show love so differently? Explore everyday questions through BaZi, birth charts and Chinese fortune sticks—with clear readings you can relate to your own life.",
  start: "Start with what's on my mind", free: "Find my Day Pillar", note: "Three free ways to begin · No account needed",
  choose: "What would you like to understand?", chooseLead: "No astrology knowledge needed. Choose a question and see what each experience offers.",
  cards: [
    { title: "My patterns and strengths", question: "Why do I keep reacting this way?", body: "Turn your birth date into one of 60 animal portraits, inspired by the BaZi Day Pillar. Read about personality, relationships and work, then see what fits your experience.", input: "Your birth date", action: "Find my Day Pillar & card", href: "/discover" },
    { title: "The way we connect", question: "I want reassurance. They offer solutions. Sound familiar?", body: "Compare two birth charts through five-element symbolism and astrology. Get a free comparison of communication, affection and everyday rhythm, plus prompts to discuss together.", input: "Both birth dates, known times and cities", action: "Compare our BaZi & birth charts", href: "/compatibility" },
    { title: "A question I can't put down", question: "What am I overlooking in this decision?", body: "Pause with a Chinese fortune-stick ritual. Draw a verse, read its meaning and consider what it brings to your question. Choose AI interpretation for more context.", input: "One question · No birth details needed", action: "Try Chinese fortune sticks", href: "/sticks" },
  ],
  perspective: "Ancient symbols. Room for your own judgment.",
  perspectiveLead: "In spiritual traditions, a reading may be understood as a moment of connection. You can approach these practices through belief, cultural curiosity or reflection. Take time to notice what resonates—and what does not.",
  about: "What comes from tradition, calculation and AI?",
  boundaries: [
    "BaZi and astrology use birth details to calculate chart positions; the meanings attached to them come from interpretive traditions. Our 60 animal portraits are DestinyPixel's own visual expression of Day Pillar symbolism.",
    "This site's fortune-stick draw randomly selects a number. The reading distinguishes source material from modern interpretation; optional AI adds context to your question. A meaningful response is not, by itself, evidence that the software detected a future event.",
    "DestinyPixel does not present readings as scientifically validated predictions. Compare them with real examples and counterexamples from your life. Use them to open a conversation, while keeping decisions in your hands.",
  ],
};
const zh: typeof en = {
  eyebrow: "东方玄学 · 生活里的真实问题",
  title: "更懂自己，\n更懂眼前的关系与选择。",
  lead: "为什么我总在同一种情境里纠结？明明在意彼此，为什么表达爱却不同？从八字、五行与星盘，到一支承载心事的签，把古老的象征读成与你生活有关的启发。",
  start: "从我关心的事开始", free: "免费查询我的日柱", note: "三个免费入口 · 无需注册",
  choose: "此刻，你想多懂一点什么？", chooseLead: "不用先学会玄学术语。带着一个与你有关的问题，选一种适合的探索方式。",
  cards: [
    { title: "更了解自己", question: "为什么一遇到这类事情，我就会这样？", body: "用生日找到六十动物中对应的日柱意象，阅读性格、感情与事业中的不同侧面，再与你真实的经历对照。", input: "只需公历生日", action: "免费查日柱与五行", href: "/discover" },
    { title: "更懂彼此", question: "我想要安慰，TA 却一直在讲道理？", body: "结合两人的八字五行与星盘，比较沟通、感情表达和日常节奏。免费查看相处图谱，也找到一个可以一起聊的话题。", input: "双方生日、已知出生时间与城市", action: "免费八字五行与星盘配对", href: "/compatibility" },
    { title: "给心事一个新角度", question: "这个决定里，有什么是我还没看见的？", body: "静下心，为挂念的事求一支签。读签文、看解意，再留意哪句话让你想到自己的处境；也可选择 AI 进一步解读。", input: "一个具体问题 · 不需要出生资料", action: "在线抽签，看看签意", href: "/sticks" },
  ],
  perspective: "让古老的象征，走进真实的生活。",
  perspectiveLead: "在信仰传统中，一次占问可以被理解为感应与相遇。你也可以带着文化好奇，或想理清心事的愿望来体验。留意有共鸣的地方，也保留自己的疑问。",
  about: "传统、计算与 AI，各自在做什么？",
  boundaries: [
    "八字与星盘按出生资料计算历法与天体位置；性格与运势的含义来自各自的解释传统。六十动物卡是 DestinyPixel 对日柱象征的原创视觉表达。",
    "本站抽签由程序随机选取签号，签文来源与现代解读分别标注；可选的 AI 解签再结合问题展开。某次解读让人觉得贴切，本身并不能证明程序捕捉到了未来事件。",
    "我们尊重这些实践的信仰背景，也不把解读包装成已获科学验证的预测。可以拿真实经历来对照，同时留意不符合的地方；让它开启一次思考或交流，决定仍由你来做。",
  ],
};
const ru: typeof en = {
  eyebrow: "КИТАЙСКАЯ АСТРОЛОГИЯ · ВОПРОСЫ ЖИЗНИ",
  title: "Понять себя.\nСтать ближе друг к другу.",
  lead: "Почему повторяются одни и те же реакции? Почему близкие люди по-разному выражают любовь? Взгляните на знакомые вопросы через Ба-цзы, натальные карты и китайские храмовые жребии — с понятными толкованиями, которые можно сопоставить со своим опытом.",
  start: "Начать со своего вопроса", free: "Узнать свой столп дня", note: "Три бесплатных способа начать · Без регистрации",
  choose: "Что вы хотите понять лучше?", chooseLead: "Знание астрологии не требуется. Выберите близкий вам вопрос и узнайте, что предлагает каждый инструмент.",
  cards: [
    { title: "Мои привычки и сильные стороны", question: "Почему в таких ситуациях я реагирую именно так?", body: "Найдите один из 60 образов животных по столпу дня Ба-цзы. Прочтите о характере, отношениях и работе, а затем сравните со своим опытом.", input: "Только дата рождения", action: "Узнать свой образ", href: "/discover" },
    { title: "Как мы понимаем друг друга", question: "Мне нужна поддержка, а мне предлагают решение?", body: "Сравните две карты рождения через пять элементов и астрологию. Получите бесплатное сопоставление общения, выражения чувств и повседневного ритма, а также темы для разговора.", input: "Даты, известное время и города рождения обоих", action: "Узнать о наших отношениях", href: "/compatibility" },
    { title: "Вопрос, который не отпускает", question: "Что я упускаю, принимая это решение?", body: "Остановитесь на минуту и вытяните китайский храмовый жребий. Прочтите текст и толкование, соотнесите их со своим вопросом. При желании добавьте разбор ИИ.", input: "Один вопрос · Данные рождения не нужны", action: "Обратиться к жребию", href: "/sticks" },
  ],
  perspective: "Древние символы. Место для вашего суждения.",
  perspectiveLead: "В духовных традициях гадание может восприниматься как момент связи. К этим практикам можно прийти с верой, культурным интересом или желанием разобраться в себе. Замечайте и созвучное вам, и то, что вызывает вопросы.",
  about: "Где традиция, где расчёт, а где ИИ?",
  boundaries: [
    "Ба-цзы и астрология рассчитывают календарные и небесные положения по данным рождения; их значения принадлежат традициям толкования. Наши 60 животных — авторские образы DestinyPixel на основе символики столпов дня.",
    "На этом сайте номер жребия выбирается случайно. Источники текста отделены от современного толкования; дополнительный разбор ИИ учитывает вопрос. Ощущение точного совпадения само по себе не доказывает, что программа обнаружила будущее событие.",
    "DestinyPixel не представляет толкования как научно подтверждённые прогнозы. Сравнивайте их с примерами и контрпримерами из жизни. Они могут стать поводом для размышления и разговора; решение остаётся за вами.",
  ],
};
const traditional = JSON.parse(toTraditional(JSON.stringify(zh))) as typeof en;
export function homeIntroductionCopy(locale: ReportLocale) {
  return ({ en, zh, "zh-TW": traditional, ru })[locale];
}
const icons = [Sparkles, Heart, MessageCircle];
export function HomeIntroduction({ locale }: { locale: ReportLocale }) {
  const c = homeIntroductionCopy(locale);
  return <section id="start-here" className="white-container editorial-introduction" aria-labelledby="start-here-heading" data-server-localized>
    <div className="editorial-introduction-heading"><h2 id="start-here-heading">{c.choose}</h2><p>{c.chooseLead}</p></div>
    <div className="editorial-intent-grid">{c.cards.map((card, i) => { const Icon = icons[i]; return <a key={card.href} className="editorial-intent-card" data-intent={i} href={`${card.href}${locale === "en" ? "" : `?locale=${locale}`}`}><Icon size={23} aria-hidden="true" /><h3>{card.title}</h3><p className="editorial-intent-question">{card.question}</p><p>{card.body}</p><small>{card.input}</small><span>{card.action}<ArrowRight size={16} aria-hidden="true" /></span></a>; })}</div>
    <div className="editorial-perspective"><h3>{c.perspective}</h3><p>{c.perspectiveLead}</p><details><summary>{c.about}</summary>{c.boundaries.map(p => <p key={p}>{p}</p>)}</details></div>
  </section>;
}
