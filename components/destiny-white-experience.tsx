"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Hand,
  Languages,
  Loader2,
  MapPin,
  MessageCircle,
  Orbit,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Stars,
  SunMoon,
  X,
} from "lucide-react";
import { Solar } from "lunar-javascript";
import { createFusionReportAction } from "@/app/actions";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay } from "@/lib/bazi-totems";
import { cities } from "@/lib/geo/cities";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import {
  normalizeReportLocale,
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";

type WhiteCopy = {
  nav: {
    method: string;
    archetypes: string;
    report: string;
    insights: string;
    black: string;
  };
  hero: {
    version: string;
    eyebrow: string;
    title: string;
    lead: string;
    name: string;
    date: string;
    time: string;
    gender: string;
    female: string;
    male: string;
    city: string;
    cityPlaceholder: string;
    submit: string;
    pending: string;
    privacy: string;
  };
  card: {
    sample: string;
    core: string;
    sky: string;
    resonance: string;
  };
  stats: {
    portraits: string;
    signals: string;
    paths: string;
  };
  method: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; body: string }>;
  };
  archetypes: {
    eyebrow: string;
    title: string;
    description: string;
  };
  fusion: {
    eyebrow: string;
    title: string;
    description: string;
    chips: string[];
  };
  insights: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      body: string;
      href: string;
      cta: string;
    }>;
  };
  sticks: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      body: string;
      href: string;
      cta: string;
    }>;
  };
  blessing: {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    activeAction: string;
    modalTitle: string;
    modalBody: string;
    modalClose: string;
    note: string;
    deities: Array<{
      key: string;
      name: string;
      domain: string;
      body: string;
    }>;
  };
  premium: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
    cta: string;
  };
};

const whiteCopy: Record<ReportLocale, WhiteCopy> = {
  en: {
    nav: {
      method: "The System",
      archetypes: "Energy Cards",
      report: "Start Reading",
      insights: "Insight Studios",
      black: "Dark mode",
    },
    hero: {
      version: "Multidimensional birth map",
      eyebrow: "Birth energy · Planetary rhythm · Inner guidance",
      title: "Meet the pattern your birthday remembers.",
      lead:
        "DestinyPixel translates your birth moment into a gentle psychological mirror: symbolic animals, planetary rhythms, and AI-guided reflection for clarity, healing, and self-trust.",
      name: "Name",
      date: "Date of birth",
      time: "Birth time",
      gender: "Gender",
      female: "Female",
      male: "Male",
      city: "Birth city",
      cityPlaceholder: "Search city, e.g. Shijiazhuang",
      submit: "Reveal my inner map",
      pending: "Reading your energy field, this may take a moment...",
      privacy: "Your birth data stays private and is used only for this reading",
    },
    card: {
      sample: "Energy sample",
      core: "Core Pattern",
      sky: "Sky Rhythm",
      resonance: "Inner Echo",
    },
    stats: {
      portraits: "energy portraits",
      signals: "planetary signals",
      paths: "guidance paths",
    },
    method: {
      eyebrow: "A guided mirror for the self",
      title: "Your birth moment as a multidimensional field.",
      description:
        "Instead of asking you to decode ancient symbols, DestinyPixel turns them into a calm visual language for emotional patterning, timing, and self-understanding.",
      items: [
        {
          title: "Energy signature",
          body: "Your birth day becomes a symbolic animal portrait: a memorable doorway into temperament, needs, and natural rhythm.",
        },
        {
          title: "Sky resonance",
          body: "Planetary positions add a second layer, revealing where your inner pattern seeks expression, protection, and growth.",
        },
        {
          title: "Healing guidance",
          body: "The reading becomes practical prompts for self-trust, relationships, work, recovery, and the next season of your life.",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 symbolic companions",
      title: "A soft oracle deck for your inner landscape.",
      description:
        "Each card acts like a visual anchor for a different emotional climate, helping overseas users feel the system before they try to analyze it.",
    },
    fusion: {
      eyebrow: "Field reading",
      title: "The Dewy Rabbit meets a Pisces Sun.",
      description:
        "The Dewy Rabbit suggests sensitivity, social grace, and quiet perception. A Pisces Sun echoes imagination, permeability, and a soul that heals through beauty.",
      chips: ["Gentle sensitivity", "Social intuition", "Pisces Sun", "Emotional healing"],
    },
    insights: {
      eyebrow: "Beyond the birth map",
      title: "Palm, face, and one-question readings for the moment you are in.",
      description:
        "When you do not need a full birth report, open a smaller mirror: align a photo, confirm visible signals, or cast the question time into a Liuyao and Tarot reading.",
      items: [
        {
          title: "Palm Studio",
          body: "Guided photo alignment plus confirmed lines and mounts, translated into direct rhythm, relationship, and work advice.",
          href: "/palm",
          cta: "Read palm",
        },
        {
          title: "Face Studio",
          body: "A careful symbolic reading of expression, facial zones, and social signal without identity or beauty scoring.",
          href: "/face",
          cta: "Read face",
        },
        {
          title: "Question Oracle",
          body: "One issue at a time: time-cast Liuyao lines meet a three-card Tarot mirror for a practical next step.",
          href: "/oracle",
          cta: "Ask now",
        },
        {
          title: "Temple Sticks",
          body: "Choose a blessing tradition, set one clear intention, and draw a concise stick for love, wealth, career, or protection.",
          href: "/sticks",
          cta: "Draw a stick",
        },
      ],
    },
    sticks: {
      eyebrow: "Temple oracle",
      title: "Draw one stick for the question in your hands.",
      description:
        "A lighter ritual for moments that need a clear sign: choose a tradition, name the topic, and receive a concise modern reading.",
      items: [
        {
          title: "Guanyin Sticks",
          body: "A gentle all-purpose oracle for protection, family, recovery, travel, and emotional uncertainty.",
          href: "/sticks?type=guanyin",
          cta: "Ask Guanyin",
        },
        {
          title: "Guandi Sticks",
          body: "A decisive oracle for career, authority, contracts, exams, promotion, and public reputation.",
          href: "/sticks?type=guandi",
          cta: "Ask Guandi",
        },
        {
          title: "Yuelao Sticks",
          body: "A relationship oracle for love timing, attachment, reconciliation, dating, and marriage questions.",
          href: "/sticks?type=yuelao",
          cta: "Ask Yuelao",
        },
        {
          title: "Five Wealth Gods",
          body: "A wealth-focused oracle for cash flow, business direction, side income, and money discipline.",
          href: "/sticks?type=wealth",
          cta: "Ask wealth",
        },
      ],
    },
    blessing: {
      eyebrow: "Quiet blessing",
      title: "Light incense for the direction you want to protect.",
      description:
        "A small digital ritual for focus. Choose a deity archetype, make one clean wish, and let the page mark the intention for this visit.",
      action: "Light incense",
      activeAction: "Incense lit",
      modalTitle: "Incense offered",
      modalBody:
        "Hold one clean intention for this direction. The ritual is quiet, but the next action should be concrete.",
      modalClose: "Return",
      note: "Blessing is symbolic and reflective; real choices still belong to you.",
      deities: [
        {
          key: "guanyin",
          name: "Guanyin",
          domain: "Compassion · Protection",
          body: "For emotional safety, family care, recovery, and a softer way through difficulty.",
        },
        {
          key: "wuye",
          name: "Wuye",
          domain: "Vows · Courage",
          body: "For keeping promises, carrying pressure, and moving through a hard gate with steadiness.",
        },
        {
          key: "wen-caishen",
          name: "Civil Wealth God",
          domain: "Order · Long money",
          body: "For planning, accounts, study, professional skills, and stable accumulation.",
        },
        {
          key: "wu-caishen",
          name: "Martial Wealth God",
          domain: "Action · Opportunity",
          body: "For business courage, negotiations, decisive moves, and protecting earned value.",
        },
        {
          key: "mazu",
          name: "Mazu",
          domain: "Travel · Safe passage",
          body: "For journeys, distance, relocation, sea-like uncertainty, and being carried safely home.",
        },
      ],
    },
    premium: {
      eyebrow: "From a free glimpse to deeper guidance",
      title: "A reading that feels like being understood.",
      description:
        "Start with your birth-day portrait, then open the full map: personality patterns, love language, work rhythm, growth edge, wellbeing, and annual timing.",
      items: [
        "Birth-time energy calibration",
        "Planetary resonance mapping",
        "Streaming reflective guidance",
      ],
      cta: "Begin my reading",
    },
  },
  zh: {
    nav: {
      method: "系统",
      archetypes: "能量卡",
      report: "开始解读",
      insights: "洞察专区",
      black: "深色模式",
    },
    hero: {
      version: "多维出生能量图",
      eyebrow: "出生能量 · 行星节律 · 内在指引",
      title: "看见你出生那天留下的能量纹理。",
      lead:
        "DestinyPixel 将你的出生时刻转译成一张柔和的心理地图：动物象征、行星节律与 AI 引导式洞察，共同帮助你理解自己、修复关系、找回内在秩序。",
      name: "姓名",
      date: "出生日期",
      time: "出生时间",
      gender: "性别",
      female: "女性",
      male: "男性",
      city: "出生城市",
      cityPlaceholder: "搜索城市，例如：石家庄",
      submit: "开启我的内在地图",
      pending: "正在读取你的能量场，这需要一点时间...",
      privacy: "出生资料仅用于本次解读，并保持私密",
    },
    card: {
      sample: "能量样本",
      core: "核心模式",
      sky: "天空节律",
      resonance: "内在回声",
    },
    stats: {
      portraits: "能量画像",
      signals: "行星信号",
      paths: "指引路径",
    },
    method: {
      eyebrow: "一面温柔的自我镜子",
      title: "把出生时刻，看作一个多维能量场。",
      description:
        "我们不要求用户理解古老术语，而是把符号翻译成现代心理语言：看见情绪模式、关系节奏、生命阶段与自我疗愈方向。",
      items: [
        {
          title: "能量签名",
          body: "你的出生之日会生成一个动物画像，成为理解气质、需求与自然节奏的入口。",
        },
        {
          title: "星空共振",
          body: "行星位置提供第二层信息，帮助看见你的表达方式、防御机制、亲密需求与成长方向。",
        },
        {
          title: "疗愈指引",
          body: "解读会落到具体生活：自我信任、关系边界、工作节奏、身心恢复与接下来一年的选择。",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 位象征伙伴",
      title: "一套描绘内在风景的柔光卡牌。",
      description:
        "每张卡都代表一种情绪气候和生命质地，让海外用户先感受到这套系统，再进入更深入的分析。",
    },
    fusion: {
      eyebrow: "场域解读",
      title: "雨露灵兔，遇见双鱼座太阳。",
      description:
        "雨露灵兔象征敏感、柔软、善于感知关系中的细微波动；双鱼座太阳进一步放大想象力、共情力与通过美来疗愈自己的能力。",
      chips: ["细腻感受力", "社交直觉", "太阳双鱼", "情绪疗愈"],
    },
    insights: {
      eyebrow: "出生地图之外",
      title: "手相、面相、一事一问，给当下问题更快的镜子。",
      description:
        "当你暂时不需要完整出生报告时，可以打开更轻的洞察：拍照对齐、确认可见特征，或用起问时间生成六爻和塔罗合参。",
      items: [
        {
          title: "手相专区",
          body: "用定位线拍摄或上传手掌，确认掌纹与掌丘，再生成更直接的关系、工作、节奏建议。",
          href: "/palm",
          cta: "看手相",
        },
        {
          title: "面相专区",
          body: "观察神态、三庭与眉眼鼻口下颌，把外在呈现翻译成心理、社交和压力反应。",
          href: "/face",
          cta: "看面相",
        },
        {
          title: "问事专区",
          body: "一事一问，用起问时间起六爻，再配合塔罗三牌，得到更清楚的下一步。",
          href: "/oracle",
          cta: "马上问",
        },
        {
          title: "求签专区",
          body: "选择观音、关帝、月老或财神签，把当下最想问的一件事交给一支签来提示方向。",
          href: "/sticks",
          cta: "去求签",
        },
      ],
    },
    sticks: {
      eyebrow: "灵签小殿",
      title: "为手里的这件事，抽一支更直接的签。",
      description:
        "比完整命盘更轻，也比泛泛鸡汤更清楚。选择签种、写下问题，得到一段现代白话签意。",
      items: [
        {
          title: "观音灵签",
          body: "流传最广，适合问平安、家宅、身体恢复、出行、关系缓和与整体方向。",
          href: "/sticks?type=guanyin",
          cta: "求观音签",
        },
        {
          title: "关帝灵签",
          body: "偏重事业、官运、考试、合同、名誉与需要决断的事情。",
          href: "/sticks?type=guandi",
          cta: "求关帝签",
        },
        {
          title: "月老灵签",
          body: "专看姻缘爱情，适合问暧昧、复合、婚恋时机与关系走向。",
          href: "/sticks?type=yuelao",
          cta: "求月老签",
        },
        {
          title: "五路财神灵签",
          body: "专问财运，适合看现金流、生意机会、副业、投资心态与守财能力。",
          href: "/sticks?type=wealth",
          cta: "求财神签",
        },
      ],
    },
    blessing: {
      eyebrow: "祈福小殿",
      title: "给想守护的方向，点一炷电子清香。",
      description:
        "这不是替你决定命运，而是帮你把愿望说清楚。选择一位神明意象，点香、定心、把今天最重要的愿望留下。",
      action: "点香祈福",
      activeAction: "已点香",
      modalTitle: "清香已燃",
      modalBody:
        "把愿望收成一句最清楚的话，留给这一刻。仪式负责定心，真正改变局面的，仍是你接下来要做的那一步。",
      modalClose: "回到页面",
      note: "祈福是象征性的定心仪式，真正的选择与行动仍然在你手里。",
      deities: [
        {
          key: "guanyin",
          name: "观音",
          domain: "慈悲 · 平安",
          body: "适合为家人、健康、关系修复、情绪安稳与渡过难关而祈愿。",
        },
        {
          key: "wuye",
          name: "五爷",
          domain: "愿力 · 贵人",
          body: "适合为承诺、事业关口、压力突破、贵人助力和心中所愿而祈愿。",
        },
        {
          key: "wen-caishen",
          name: "文财神",
          domain: "规划 · 正财",
          body: "适合为长期积累、账目清明、专业技能、学业证书与稳定收入而祈愿。",
        },
        {
          key: "wu-caishen",
          name: "武财神",
          domain: "行动 · 机会",
          body: "适合为生意胆识、谈判成交、项目推进、守住价值与开拓机会而祈愿。",
        },
        {
          key: "mazu",
          name: "妈祖",
          domain: "远行 · 护航",
          body: "适合为出行、迁移、远方亲友、跨海跨城的变化与平安归来而祈愿。",
        },
      ],
    },
    premium: {
      eyebrow: "从免费一瞥，到完整指引",
      title: "一份像被理解一样的阅读体验。",
      description:
        "从出生之日的动物画像开始，继续展开人格模式、亲密关系、事业节奏、成长课题、身心恢复和年度时机。",
      items: ["出生时间能量校准", "行星共振图谱", "流式心理指引模块"],
      cta: "开始我的解读",
    },
  },
  ru: {
    nav: {
      method: "Система",
      archetypes: "Карты энергии",
      report: "Начать",
      insights: "Студии",
      black: "Темный режим",
    },
    hero: {
      version: "Многомерная карта рождения",
      eyebrow: "Энергия рождения · Ритм планет · Внутренний ориентир",
      title: "Увидьте узор, который помнит день вашего рождения.",
      lead:
        "DestinyPixel переводит момент рождения в мягкое психологическое зеркало: символические животные, планетарные ритмы и AI-инсайты для ясности, восстановления и доверия к себе.",
      name: "Имя",
      date: "Дата рождения",
      time: "Время рождения",
      gender: "Пол",
      female: "Женский",
      male: "Мужской",
      city: "Город рождения",
      cityPlaceholder: "Найдите город, например Shijiazhuang",
      submit: "Открыть мою внутреннюю карту",
      pending: "Считываем ваше энергетическое поле...",
      privacy: "Данные рождения используются только для этого чтения",
    },
    card: {
      sample: "Образец энергии",
      core: "Ядро паттерна",
      sky: "Ритм неба",
      resonance: "Внутренний отклик",
    },
    stats: {
      portraits: "портретов энергии",
      signals: "планетарных сигналов",
      paths: "маршрутов",
    },
    method: {
      eyebrow: "Мягкое зеркало для самопонимания",
      title: "Момент рождения как многомерное поле.",
      description:
        "Мы не заставляем пользователя разбирать древние термины. Система переводит символы в современный язык эмоций, ритма, отношений и внутреннего восстановления.",
      items: [
        {
          title: "Энергетическая подпись",
          body: "День рождения становится образом животного: входом в темперамент, потребности и естественный ритм.",
        },
        {
          title: "Небесный резонанс",
          body: "Планетарные позиции добавляют второй слой: как внутренний узор ищет выражение, защиту и рост.",
        },
        {
          title: "Восстанавливающее руководство",
          body: "Чтение превращается в практичные подсказки для доверия к себе, отношений, работы, восстановления и следующего сезона жизни.",
        },
      ],
    },
    archetypes: {
      eyebrow: "60 символических спутников",
      title: "Мягкая колода для внутреннего ландшафта.",
      description:
        "Каждая карта работает как визуальный якорь для эмоционального климата, чтобы пользователь сначала почувствовал систему, а затем углубился в анализ.",
    },
    fusion: {
      eyebrow: "Чтение поля",
      title: "Роса Кролика встречает Солнце в Рыбах.",
      description:
        "Роса Кролика указывает на тонкость, социальную интуицию и мягкое восприятие. Солнце в Рыбах усиливает воображение, эмпатию и исцеление через красоту.",
      chips: ["Тонкая чувствительность", "Социальная интуиция", "Солнце в Рыбах", "Эмоциональное исцеление"],
    },
    insights: {
      eyebrow: "За пределами карты рождения",
      title: "Ладонь, лицо и один вопрос для текущего момента.",
      description:
        "Когда не нужен полный отчет, откройте более быстрые зеркала: фото-направляющие, подтвержденные признаки или вопрос по времени с Лю Яо и Таро.",
      items: [
        {
          title: "Ладонь",
          body: "Выравнивание фото, линии и холмы ладони превращаются в прямые советы о ритме, работе и отношениях.",
          href: "/palm",
          cta: "Читать ладонь",
        },
        {
          title: "Лицо",
          body: "Символическое чтение выражения, зон лица и социального сигнала без оценок личности или красоты.",
          href: "/face",
          cta: "Читать лицо",
        },
        {
          title: "Оракул вопроса",
          body: "Один вопрос: линии Лю Яо по времени плюс три карты Таро для практического следующего шага.",
          href: "/oracle",
          cta: "Задать вопрос",
        },
        {
          title: "Храмовые жребии",
          body: "Выберите традицию, сформулируйте намерение и вытяните короткий знак для любви, денег, работы или защиты.",
          href: "/sticks",
          cta: "Тянуть жребий",
        },
      ],
    },
    sticks: {
      eyebrow: "Храмовый оракул",
      title: "Один жребий для вопроса, который сейчас в руках.",
      description:
        "Легкий ритуал для момента, когда нужен ясный знак: выберите традицию, назовите тему и получите современное толкование.",
      items: [
        {
          title: "Жребии Гуаньинь",
          body: "Мягкий универсальный оракул для защиты, семьи, восстановления, дороги и эмоциональной неопределенности.",
          href: "/sticks?type=guanyin",
          cta: "Спросить",
        },
        {
          title: "Жребии Гуаньди",
          body: "Решительный оракул для карьеры, власти, договоров, экзаменов, повышения и репутации.",
          href: "/sticks?type=guandi",
          cta: "Спросить",
        },
        {
          title: "Жребии Юэлао",
          body: "Оракул отношений для любви, примирения, свиданий, брака и выбора в близости.",
          href: "/sticks?type=yuelao",
          cta: "Спросить",
        },
        {
          title: "Пять богов богатства",
          body: "Фокус на деньгах: поток средств, бизнес, дополнительный доход и финансовая дисциплина.",
          href: "/sticks?type=wealth",
          cta: "Спросить",
        },
      ],
    },
    blessing: {
      eyebrow: "Тихое благословение",
      title: "Зажгите благовоние для того, что хотите защитить.",
      description:
        "Небольшой цифровой ритуал для фокуса: выберите образ божества, сформулируйте желание и отметьте намерение на этот визит.",
      action: "Зажечь",
      activeAction: "Зажжено",
      modalTitle: "Благовоние зажжено",
      modalBody:
        "Сформулируйте намерение одной ясной фразой. Ритуал собирает внимание, а следующий реальный шаг остается за вами.",
      modalClose: "Вернуться",
      note: "Благословение символично; реальные решения все равно остаются за вами.",
      deities: [
        {
          key: "guanyin",
          name: "Гуаньинь",
          domain: "Сострадание · Защита",
          body: "Для эмоциональной безопасности, заботы о семье, восстановления и мягкого пути через трудность.",
        },
        {
          key: "wuye",
          name: "У Е",
          domain: "Обет · Смелость",
          body: "Для обещаний, давления, важного порога и устойчивости перед сложной задачей.",
        },
        {
          key: "wen-caishen",
          name: "Гражданский бог богатства",
          domain: "Порядок · Долгие деньги",
          body: "Для планирования, счетов, учебы, профессиональных навыков и стабильного накопления.",
        },
        {
          key: "wu-caishen",
          name: "Воинственный бог богатства",
          domain: "Действие · Возможность",
          body: "Для деловой смелости, переговоров, быстрых решений и защиты заработанной ценности.",
        },
        {
          key: "mazu",
          name: "Мацзу",
          domain: "Путь · Безопасность",
          body: "Для поездок, переезда, дальних близких, неопределенности и возвращения домой.",
        },
      ],
    },
    premium: {
      eyebrow: "От первого образа к глубокому руководству",
      title: "Чтение, в котором вас действительно понимают.",
      description:
        "Начните с образа дня рождения, затем откройте полную карту: личные паттерны, язык любви, рабочий ритм, рост, восстановление и годовой тайминг.",
      items: [
        "Калибровка энергии рождения",
        "Карта планетарного резонанса",
        "Потоковое психологическое руководство",
      ],
      cta: "Начать мое чтение",
    },
  },
};

const featuredPillars = ["癸卯", "乙丑", "丁酉", "辛巳"];

function WhiteSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="loading-icon" size={17} aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={17} aria-hidden="true" />
        </>
      )}
    </button>
  );
}

function profileName(profile: PillarProfile, pillar: string, locale: ReportLocale) {
  if (locale === "zh") return profile.name.cn;
  if (locale === "ru") return getPillarDisplay(pillar, "ru").totemName;

  return profile.name.en;
}

function profileEssence(
  profile: PillarProfile,
  pillar: string,
  locale: ReportLocale,
) {
  if (locale === "zh") return profile.essence.cn;
  if (locale === "ru") {
    const display = getPillarDisplay(pillar, "ru");
    return `${display.totemName} соединяет ${display.stemMeaning.toLowerCase()} и ${display.branchMeaning.toLowerCase()} в мягкий, наблюдательный архетип.`;
  }

  return profile.essence.en;
}

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh" ? "zh-CN" : locale === "ru" ? "ru" : "en";
}

export default function DestinyWhiteExperience({
  initialLocale = "en",
}: {
  initialLocale?: ReportLocale;
}) {
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [birthDate, setBirthDate] = useState("");
  const [pillar, setPillar] = useState("癸卯");
  const [litBlessings, setLitBlessings] = useState<Record<string, boolean>>({});
  const [blessingMoment, setBlessingMoment] = useState<
    WhiteCopy["blessing"]["deities"][number] | null
  >(null);
  const text = whiteCopy[locale];
  const profile = useMemo(
    () => (pillarsDB as Record<string, PillarProfile>)[pillar],
    [pillar],
  );
  const display = useMemo(() => getPillarDisplay(pillar, locale), [locale, pillar]);
  const cardName = profileName(profile, pillar, locale);
  const essence = profileEssence(profile, pillar, locale);

  useEffect(() => {
    setDocumentLocale(locale);
    window.localStorage.setItem("destinypixel-locale", locale);
  }, [locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get("locale");

    if (urlLocale) return;

    const storedLocale = normalizeReportLocale(
      window.localStorage.getItem("destinypixel-locale") ?? initialLocale,
    );

    if (storedLocale !== locale) {
      setLocale(storedLocale);
    }
  }, [initialLocale, locale]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    setDocumentLocale(nextLocale);
    window.localStorage.setItem("destinypixel-locale", nextLocale);

    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function updatePreviewFromDate(value: string) {
    setBirthDate(value);

    if (!value) return;

    const [year, month, day] = value.split("-").map(Number);
    const result = Solar.fromYmdHms(year, month, day, 12, 0, 0)
      .getLunar()
      .getDayInGanZhi();

    if (result in pillarsDB) {
      setPillar(result);
    }
  }

  const insightIcons = [Hand, ScanFace, MessageCircle, Sparkles] as const;

  return (
    <main className="white-site">
      <header className="white-header">
        <div className="white-container white-header__inner">
          <a className="white-brand" href="/">
            <span aria-hidden="true" />
            DestinyPixel
          </a>

          <nav className="white-nav" aria-label="Primary navigation">
            <a href="#method">{text.nav.method}</a>
            <a href="#archetypes">{text.nav.archetypes}</a>
            <a href="#insights">{text.nav.insights}</a>
            <a href="#report">{text.nav.report}</a>
          </nav>

          <div className="white-actions">
            <a href={`/black?locale=${locale}`} className="white-black-link">
              {text.nav.black}
            </a>
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
          </div>
        </div>
      </header>

      <section className="white-hero">
        <div className="white-ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="white-container white-hero__grid">
          <div className="white-hero__copy">
            <p className="white-kicker">
              <Sparkles size={14} aria-hidden="true" />
              {text.hero.version}
            </p>
            <p className="white-eyebrow">{text.hero.eyebrow}</p>
            <h1>{text.hero.title}</h1>
            <p className="white-lead">{text.hero.lead}</p>

            <div className="white-stats" aria-label="DestinyPixel metrics">
              <span>60</span>
              <p>{text.stats.portraits}</p>
              <span>10</span>
              <p>{text.stats.signals}</p>
              <span>7</span>
              <p>{text.stats.paths}</p>
            </div>
          </div>

          <div className="white-form-panel" id="report">
            <div className="white-form-panel__header">
              <span>
                <SunMoon size={16} aria-hidden="true" />
              </span>
              <div>
                <strong>{text.card.sample}</strong>
                <p>{display.totemName}</p>
              </div>
            </div>

            <form action={createFusionReportAction}>
              <input type="hidden" name="locale" value={locale} />
              <label className="white-field white-field--full">
                <span>{text.hero.name}</span>
                <input
                  name="name"
                  type="text"
                  placeholder={
                    locale === "zh"
                      ? "你的名字"
                      : locale === "ru"
                        ? "Ваше имя"
                        : "Your name"
                  }
                  required
                />
              </label>
              <label className="white-field">
                <span>{text.hero.date}</span>
                <input
                  name="birthDate"
                  type="date"
                  value={birthDate}
                  max="2026-06-25"
                  onChange={(event) => updatePreviewFromDate(event.target.value)}
                  onInput={(event) => updatePreviewFromDate(event.currentTarget.value)}
                  required
                />
              </label>
              <label className="white-field">
                <span>{text.hero.time}</span>
                <input name="birthTime" type="time" required />
              </label>
              <div className="white-field white-field--full">
                <span>{text.hero.gender}</span>
                <div className="white-gender" role="radiogroup" aria-label={text.hero.gender}>
                  <label>
                    <input type="radio" name="gender" value="female" defaultChecked />
                    <span aria-hidden="true">♀</span>
                    {text.hero.female}
                  </label>
                  <label>
                    <input type="radio" name="gender" value="male" />
                    <span aria-hidden="true">♂</span>
                    {text.hero.male}
                  </label>
                </div>
              </div>
              <label className="white-field white-field--full">
                <span>{text.hero.city}</span>
                <input
                  name="birthPlace"
                  type="search"
                  list="white-city-options"
                  placeholder={text.hero.cityPlaceholder}
                  required
                />
              </label>
              <datalist id="white-city-options">
                {cities.map((city) => {
                  const aliases =
                    locale === "zh"
                      ? city.aliases
                      : city.aliases.filter((alias) => !/[\u4e00-\u9fff]/.test(alias));

                  return (
                    <option key={city.id} value={city.label}>
                      {[city.label, ...aliases].join(" / ")}
                    </option>
                  );
                })}
              </datalist>

              <WhiteSubmitButton label={text.hero.submit} pendingLabel={text.hero.pending} />
            </form>

            <p className="white-form-note">
              <ShieldCheck size={14} aria-hidden="true" />
              {text.hero.privacy}
            </p>
          </div>

          <article className="white-card-preview">
            <div className="white-card-preview__image">
              <Image
                key={pillar}
                src={getPillarImagePath(pillar)}
                alt={cardName}
                width={896}
                height={1200}
                sizes="(max-width: 720px) 70vw, 360px"
                quality={95}
                priority
              />
            </div>
            <div className="white-card-preview__body">
              <span>{display.pillarLabel}</span>
              <h2>{cardName}</h2>
              <p>{essence}</p>
            </div>
            <div className="white-signal-strip">
              <span>{text.card.core}</span>
              <i />
              <span>{text.card.sky}</span>
              <i />
              <span>{text.card.resonance}</span>
            </div>
          </article>
        </div>
      </section>

      <section className="white-insights white-insights--priority" id="insights">
        <div className="white-container">
          <div className="white-section-heading">
            <p>{text.insights.eyebrow}</p>
            <h2>{text.insights.title}</h2>
            <span>{text.insights.description}</span>
          </div>

          <div className="white-insight-grid">
            {text.insights.items.map((item, index) => {
              const Icon = insightIcons[index] ?? Sparkles;

              return (
                <a
                  href={`${item.href}?locale=${locale}`}
                  className="white-insight-card"
                  key={item.href}
                >
                  <span>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <em>
                    {item.cta}
                    <ArrowRight size={15} aria-hidden="true" />
                  </em>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="white-sticks" id="sticks">
        <div className="white-container">
          <div className="white-section-heading">
            <p>{text.sticks.eyebrow}</p>
            <h2>{text.sticks.title}</h2>
            <span>{text.sticks.description}</span>
          </div>

          <div className="white-stick-grid">
            {text.sticks.items.map((item, index) => (
              <a
                className="white-stick-card"
                href={`${item.href}${item.href.includes("?") ? "&" : "?"}locale=${locale}`}
                key={item.href}
              >
                <span className="white-stick-seal" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <em>
                  {item.cta}
                  <ArrowRight size={15} aria-hidden="true" />
                </em>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="white-method" id="method">
        <div className="white-container">
          <div className="white-method-intro">
            <div className="white-geometry-panel" aria-hidden="true">
              <svg viewBox="0 0 560 380" focusable="false">
                <defs>
                  <linearGradient id="white-line-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c9dce7" />
                    <stop offset="48%" stopColor="#d9c3d7" />
                    <stop offset="100%" stopColor="#d0b476" />
                  </linearGradient>
                </defs>
                <path d="M78 284 C158 166 264 224 342 102 S488 116 510 58" />
                <path d="M64 138 L188 82 L324 162 L462 112" />
                <circle cx="188" cy="82" r="48" />
                <circle cx="324" cy="162" r="76" />
                <circle cx="462" cy="112" r="34" />
                <circle cx="78" cy="284" r="10" />
                <circle cx="188" cy="82" r="10" />
                <circle cx="324" cy="162" r="10" />
                <circle cx="462" cy="112" r="10" />
                <circle cx="510" cy="58" r="10" />
              </svg>
              <div className="white-geometry-node white-geometry-node--one">
                <SunMoon size={18} aria-hidden="true" />
                <span>Birth</span>
              </div>
              <div className="white-geometry-node white-geometry-node--two">
                <Orbit size={18} aria-hidden="true" />
                <span>Sky</span>
              </div>
              <div className="white-geometry-node white-geometry-node--three">
                <Sparkles size={18} aria-hidden="true" />
                <span>AI</span>
              </div>
            </div>

            <div className="white-section-heading white-section-heading--method">
              <p>{text.method.eyebrow}</p>
              <h2>{text.method.title}</h2>
              <span>{text.method.description}</span>
            </div>
          </div>

          <div className="white-method-grid">
            {text.method.items.map((item, index) => (
              <article key={item.title}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="white-archetypes" id="archetypes">
        <div className="white-container white-archetypes__grid">
          <div className="white-section-heading">
            <p>{text.archetypes.eyebrow}</p>
            <h2>{text.archetypes.title}</h2>
            <span>{text.archetypes.description}</span>
          </div>

          <div className="white-card-row">
            {featuredPillars.map((featuredPillar) => {
              const itemProfile = (pillarsDB as Record<string, PillarProfile>)[
                featuredPillar
              ];
              const itemDisplay = getPillarDisplay(featuredPillar, locale);
              const itemName = profileName(itemProfile, featuredPillar, locale);

              return (
                <article key={featuredPillar}>
                  <Image
                    src={getPillarImagePath(featuredPillar)}
                    alt={itemName}
                    width={896}
                    height={1200}
                    sizes="(max-width: 720px) 58vw, 240px"
                    quality={95}
                  />
                  <div>
                    <span>{itemDisplay.pillarLabel}</span>
                    <strong>{itemName}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="white-fusion">
        <div className="white-container white-fusion__grid">
          <div className="white-orbit-card">
            <div className="white-orbit-card__ring" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <Stars size={23} aria-hidden="true" />
              <strong>{text.fusion.eyebrow}</strong>
              <p>{text.fusion.description}</p>
            </div>
          </div>

          <div className="white-fusion__copy">
            <p>{text.fusion.eyebrow}</p>
            <h2>{text.fusion.title}</h2>
            <span>{text.fusion.description}</span>
            <div>
              {text.fusion.chips.map((chip) => (
                <em key={chip}>{chip}</em>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="white-blessing" id="blessing">
        <div className="white-container">
          <div className="white-section-heading">
            <p>{text.blessing.eyebrow}</p>
            <h2>{text.blessing.title}</h2>
            <span>{text.blessing.description}</span>
          </div>

          <div className="white-deity-grid">
            {text.blessing.deities.map((deity) => {
              const active = Boolean(litBlessings[deity.key]);

              return (
                <article className="white-deity-card" key={deity.key} data-active={active}>
                  <div
                    className={`white-deity-line white-deity-line--${deity.key}`}
                    aria-hidden="true"
                  >
                    <span className="white-deity-mark white-deity-mark--halo" />
                    <span className="white-deity-mark white-deity-mark--head" />
                    <span className="white-deity-mark white-deity-mark--body" />
                    <span className="white-deity-mark white-deity-mark--sleeve" />
                    <span className="white-deity-feature white-deity-feature--one" />
                    <span className="white-deity-feature white-deity-feature--two" />
                    <span className="white-deity-incense" />
                    <span className="white-deity-smoke white-deity-smoke--one" />
                    <span className="white-deity-smoke white-deity-smoke--two" />
                  </div>
                  <div>
                    <small>{deity.domain}</small>
                    <strong>{deity.name}</strong>
                    <p>{deity.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      {
                        setLitBlessings((current) => ({
                          ...current,
                          [deity.key]: true,
                        }));
                        setBlessingMoment(deity);
                      }
                    }
                  >
                    <Sparkles size={15} aria-hidden="true" />
                    {active ? text.blessing.activeAction : text.blessing.action}
                  </button>
                </article>
              );
            })}
          </div>

          <p className="white-blessing-note">{text.blessing.note}</p>
        </div>
      </section>

      {blessingMoment ? (
        <div
          className="white-ritual-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="white-ritual-title"
        >
          <div className="white-ritual-modal__panel">
            <button
              className="white-ritual-modal__close"
              type="button"
              aria-label={text.blessing.modalClose}
              onClick={() => setBlessingMoment(null)}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div
              className={`white-ritual-deity white-deity-line white-deity-line--${blessingMoment.key}`}
              aria-hidden="true"
            >
              <span className="white-deity-mark white-deity-mark--halo" />
              <span className="white-deity-mark white-deity-mark--head" />
              <span className="white-deity-mark white-deity-mark--body" />
              <span className="white-deity-mark white-deity-mark--sleeve" />
              <span className="white-deity-feature white-deity-feature--one" />
              <span className="white-deity-feature white-deity-feature--two" />
              <span className="white-deity-incense" />
              <span className="white-deity-smoke white-deity-smoke--one" />
              <span className="white-deity-smoke white-deity-smoke--two" />
            </div>
            <p>{text.blessing.modalTitle}</p>
            <h2 id="white-ritual-title">{blessingMoment.name}</h2>
            <span>{text.blessing.modalBody}</span>
            <small>{blessingMoment.domain}</small>
            <button type="button" onClick={() => setBlessingMoment(null)}>
              {text.blessing.modalClose}
            </button>
          </div>
        </div>
      ) : null}

      <section className="white-premium">
        <div className="white-container white-premium__panel">
          <div>
            <p>{text.premium.eyebrow}</p>
            <h2>{text.premium.title}</h2>
            <span>{text.premium.description}</span>
          </div>
          <ul>
            {text.premium.items.map((item) => (
              <li key={item}>
                <Check size={15} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <a href="#report">
            {text.premium.cta}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="white-footer">
        <div className="white-container">
          <span>DestinyPixel · Multidimensional Birth Map</span>
          <a href={`/learn?locale=${locale}`}>
            {locale === "zh" ? "搜索指南" : locale === "ru" ? "Гид" : "Guide"}
          </a>
          <a href={`/palm?locale=${locale}`}>
            {locale === "zh" ? "手相" : locale === "ru" ? "Ладонь" : "Palm"}
          </a>
          <a href={`/face?locale=${locale}`}>
            {locale === "zh" ? "面相" : locale === "ru" ? "Лицо" : "Face"}
          </a>
          <a href={`/oracle?locale=${locale}`}>
            {locale === "zh" ? "问事" : locale === "ru" ? "Оракул" : "Oracle"}
          </a>
          <a href={`/sticks?locale=${locale}`}>
            {locale === "zh" ? "求签" : locale === "ru" ? "Жребии" : "Sticks"}
          </a>
          <a href="#blessing">
            {locale === "zh" ? "祈福" : locale === "ru" ? "Благословение" : "Blessing"}
          </a>
          <span>
            <MapPin size={13} aria-hidden="true" />
            /
          </span>
          <span>
            <CalendarDays size={13} aria-hidden="true" />
            2026
          </span>
        </div>
      </footer>
    </main>
  );
}
