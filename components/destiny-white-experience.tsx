"use client";

import { destinySupportEmail, destinySupportHref, destinyTelegramHref } from "@/lib/support-contact";

import Image from "next/image";
import CompatibilityHome from "./compatibility-home";
import { HomeIntroduction, homeIntroductionCopy } from "./home-introduction";
import { OracleHome } from "./oracle-sanctuary";
import { compatibilityCopy } from "@/lib/compatibility/copy";
import "./destiny-editorial.css";
import ArchetypeMotionGallery from "./archetype-motion-gallery";
import ArchetypeMotionPlayer from "./archetype-motion-player";
import { archetypePosterPath, archetypeVideoPath } from "@/lib/archetype-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Gem,
  Hand,
  Languages,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Orbit,
  ScanFace,
  Send,
  ShieldCheck,
  Sparkles,
  Stars,
  SunMoon,
  X,
} from "lucide-react";
import { createFusionReportAction } from "@/app/actions";
import { DeityPortrait } from "@/components/deity-portraits";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay } from "@/lib/bazi-totems";
import { cities } from "@/lib/geo/cities";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import {
  contentLocale,
  normalizeReportLocale,
  reportLanguageOptions,
  type ContentLocale,
  type ReportLocale,
} from "@/lib/report-i18n";

type WhiteCopy = {
  nav: {
    method: string;
    archetypes: string;
    report: string;
    insights: string;
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

const whiteCopy: Record<ContentLocale, WhiteCopy> = {
  "en": {
    "nav": {
      "method": "How it works",
      "archetypes": "The collection",
      "report": "Birth map",
      "insights": "Explore"
    },
    "hero": {
      "version": "THE DESTINYPIXEL COLLECTION",
      "eyebrow": "PERSONALITY · LOVE · DIRECTION",
      "title": "A little wonder.\nA clearer sense of you.",
      "lead": "Meet the character behind your birthday. Discover your strengths, your way of loving and the possibilities waiting to take shape.",
      "name": "Name",
      "date": "Date of birth",
      "time": "Birth time",
      "gender": "Gender",
      "female": "Female",
      "male": "Male",
      "city": "Birth city",
      "cityPlaceholder": "Search your birth city",
      "submit": "Create my birth map",
      "pending": "Preparing your birth map…",
      "privacy": "Your report is private. See how we use your birth details."
    },
    "card": {
      "sample": "Your personal birth map",
      "core": "Core Pattern",
      "sky": "Sky Rhythm",
      "resonance": "Inner Echo"
    },
    "stats": {
      "portraits": "energy portraits",
      "signals": "planetary signals",
      "paths": "guidance paths"
    },
    "method": {
      "eyebrow": "GO A LITTLE DEEPER",
      "title": "Your story has more than one layer.",
      "description": "Add your birth time and place to explore your personality, relationships and life direction in a personal reading.",
      "items": [
        {
          "title": "Your character",
          "body": "Meet the strengths, habits and possibilities behind your birth portrait."
        },
        {
          "title": "Your relationships",
          "body": "Explore what draws you close, what creates friction and what helps you feel understood."
        },
        {
          "title": "Your direction",
          "body": "Connect the wider birth chart with questions about work, growth and the year ahead."
        }
      ]
    },
    "archetypes": {
      "eyebrow": "SIXTY CHARACTERS. WHICH ONE IS YOURS?",
      "title": "Meet a few of the collection.",
      "description": "The Dewy Rabbit. The Oceanic Sequoia. The Solar Stallion. Every character brings a different story of strength, connection and growth."
    },
    "fusion": {
      "eyebrow": "Field reading",
      "title": "The Dewy Rabbit meets a Pisces Sun.",
      "description": "The Dewy Rabbit suggests sensitivity, social grace, and quiet perception. A Pisces Sun echoes imagination, permeability, and a soul that heals through beauty.",
      "chips": [
        "Gentle sensitivity",
        "Social intuition",
        "Pisces Sun",
        "Emotional healing"
      ]
    },
    "insights": {
      "eyebrow": "FOLLOW YOUR CURIOSITY",
      "title": "What is on your mind?",
      "description": "Start with a question, explore a symbolic reading or create something personal.",
      "items": [
        {
          "title": "Palm Studio",
          "body": "Describe the lines you see in your palm and explore their traditional meanings.",
          "href": "/palm",
          "cta": "Read palm"
        },
        {
          "title": "Face Studio",
          "body": "Explore the traditional symbolism of the features and expressions you describe.",
          "href": "/face",
          "cta": "Read face"
        },
        {
          "title": "Question Oracle",
          "body": "Bring one question about love, work or a choice. Explore it through Tarot and a symbolic hexagram.",
          "href": "/oracle",
          "cta": "Ask now"
        },
        {
          "title": "Celestial Atelier",
          "body": "Turn five-element color guidance into a crystal bracelet concept with gemstone balance and wearable intention.",
          "href": "/atelier",
          "cta": "Build bracelet"
        }
      ]
    },
    "sticks": {
      "eyebrow": "Temple oracle",
      "title": "Draw one stick for the question in your hands.",
      "description": "A lighter ritual for moments that need a clear sign: choose a tradition, name the topic, and receive a concise modern reading.",
      "items": [
        {
          "title": "Guanyin Sticks",
          "body": "A gentle all-purpose oracle for protection, family, recovery, travel, and emotional uncertainty.",
          "href": "/sticks?type=guanyin",
          "cta": "Ask Guanyin"
        },
        {
          "title": "Guandi Sticks",
          "body": "A decisive oracle for career, authority, contracts, exams, promotion, and public reputation.",
          "href": "/sticks?type=guandi",
          "cta": "Ask Guandi"
        },
        {
          "title": "Yuelao Sticks",
          "body": "A relationship oracle for love timing, attachment, reconciliation, dating, and marriage questions.",
          "href": "/sticks?type=yuelao",
          "cta": "Ask Yuelao"
        },
        {
          "title": "Five Wealth Gods",
          "body": "A wealth-focused oracle for cash flow, business direction, side income, and money discipline.",
          "href": "/sticks?type=wealth",
          "cta": "Ask wealth"
        },
        {
          "title": "Wong Tai Sin Sticks",
          "body": "A timing-focused oracle for turning points, exams, travel, public affairs, and practical omens.",
          "href": "/sticks?type=huangdaxian",
          "cta": "Ask timing"
        }
      ]
    },
    "blessing": {
      "eyebrow": "Quiet blessing",
      "title": "Light incense for the direction you want to protect.",
      "description": "Take a quiet moment for someone you love, a hope you carry or a new beginning. Choose a tradition and light a symbolic offering.",
      "action": "Light incense",
      "activeAction": "Incense lit",
      "modalTitle": "Incense offered",
      "modalBody": "Take this intention with you as you return to your day.",
      "modalClose": "Return",
      "note": "Blessing is symbolic and reflective; real choices still belong to you.",
      "deities": [
        {
          "key": "guanyin",
          "name": "Guanyin",
          "domain": "Compassion · Protection",
          "body": "For emotional safety, family care, recovery, and a softer way through difficulty."
        },
        {
          "key": "wuye",
          "name": "Wutai Wuye",
          "domain": "Vows · Courage",
          "body": "The Fifth Dragon King of Wutai: for keeping promises, carrying pressure, and moving through a hard gate with steadiness."
        },
        {
          "key": "wen-caishen",
          "name": "Civil Wealth God",
          "domain": "Order · Long money",
          "body": "For planning, accounts, study, professional skills, and stable accumulation."
        },
        {
          "key": "wu-caishen",
          "name": "Martial Wealth God",
          "domain": "Action · Opportunity",
          "body": "For business courage, negotiations, decisive moves, and protecting earned value."
        },
        {
          "key": "mazu",
          "name": "Mazu",
          "domain": "Travel · Safe passage",
          "body": "For journeys, distance, relocation, sea-like uncertainty, and being carried safely home."
        }
      ]
    },
    "premium": {
      "eyebrow": "START WITH YOUR BIRTHDAY",
      "title": "Your character is waiting.",
      "description": "One date, one free card. Take a first look, then decide whether to explore a full birth map.",
      "items": [
        "Free birthday card",
        "No account required",
        "A fuller reading when you are ready"
      ],
      "cta": "Find my free card"
    }
  },
  "zh": {
    "nav": {
      "method": "如何开始",
      "archetypes": "意象卡集",
      "report": "出生图谱",
      "insights": "探索"
    },
    "hero": {
      "version": "DESTINYPIXEL · 认识自己的另一种方式",
      "eyebrow": "性格 · 感情 · 人生方向",
      "title": "遇见你的天赋，\n也读懂你的心事。",
      "lead": "从生日找到属于你的意象卡。看看自己的长处、感情里的习惯，以及那些值得认真探索的可能。",
      "name": "姓名",
      "date": "出生日期",
      "time": "出生时间",
      "gender": "性别",
      "female": "女性",
      "male": "男性",
      "city": "出生城市",
      "cityPlaceholder": "搜索城市，例如：石家庄",
      "submit": "生成我的出生图谱",
      "pending": "正在准备你的出生图谱…",
      "privacy": "你的报告保持私密，出生资料的使用方式见隐私说明。"
    },
    "card": {
      "sample": "你的个人出生图谱",
      "core": "核心模式",
      "sky": "天空节律",
      "resonance": "内在回声"
    },
    "stats": {
      "portraits": "能量画像",
      "signals": "行星信号",
      "paths": "指引路径"
    },
    "method": {
      "eyebrow": "再认识自己多一点",
      "title": "一张卡之后，还有更完整的你。",
      "description": "补充出生时间和城市，结合完整出生图谱，探索性格、亲密关系与人生方向。",
      "items": [
        {
          "title": "性格与天赋",
          "body": "读懂自己的长处、惯性和内在需求，找到更适合发挥的方式。"
        },
        {
          "title": "感情与相处",
          "body": "看见心动的原因、关系里的摩擦，以及让彼此更靠近的可能。"
        },
        {
          "title": "事业与成长",
          "body": "结合完整图谱，整理工作、成长与未来一年的关注方向。"
        }
      ]
    },
    "archetypes": {
      "eyebrow": "六十种意象，哪一张属于你？",
      "title": "先认识几位老朋友。",
      "description": "雨露灵兔、海中神木、烈日天马……每一种意象，都有自己的天赋、心事与成长故事。"
    },
    "fusion": {
      "eyebrow": "场域解读",
      "title": "雨露灵兔，遇见双鱼座太阳。",
      "description": "雨露灵兔象征敏感、柔软、善于感知关系中的细微波动；双鱼座太阳进一步放大想象力、共情力与通过美来疗愈自己的能力。",
      "chips": [
        "细腻感受力",
        "社交直觉",
        "太阳双鱼",
        "情绪疗愈"
      ]
    },
    "insights": {
      "eyebrow": "顺着你的好奇心",
      "title": "此刻，你最想了解什么？",
      "description": "问一件在意的事，探索一种传统解读，或亲手设计一件属于自己的小物。",
      "items": [
        {
          "title": "手相专区",
          "body": "描述你观察到的掌纹，探索传统手相中关于性格与生活节奏的解读。",
          "href": "/palm",
          "cta": "看手相"
        },
        {
          "title": "面相专区",
          "body": "从你描述的五官与神态出发，探索传统面相的象征解读。",
          "href": "/face",
          "cta": "看面相"
        },
        {
          "title": "问事专区",
          "body": "带着一个感情、工作或选择上的问题，通过塔罗与卦象整理思路。",
          "href": "/oracle",
          "cta": "马上问"
        },
        {
          "title": "灵石工坊",
          "body": "把五行补色转换成手串设计：选水晶、珠径、颗数，并生成一份可佩戴的能量解析。",
          "href": "/atelier",
          "cta": "定制手串"
        }
      ]
    },
    "sticks": {
      "eyebrow": "灵签小殿",
      "title": "为手里的这件事，抽一支更直接的签。",
      "description": "选择签种，写下你在意的问题，阅读签文与现代白话解读。",
      "items": [
        {
          "title": "观音灵签",
          "body": "流传最广，适合问平安、家宅、身体恢复、出行、关系缓和与整体方向。",
          "href": "/sticks?type=guanyin",
          "cta": "求观音签"
        },
        {
          "title": "关帝灵签",
          "body": "偏重事业、官运、考试、合同、名誉与需要决断的事情。",
          "href": "/sticks?type=guandi",
          "cta": "求关帝签"
        },
        {
          "title": "月老灵签",
          "body": "专看姻缘爱情，适合问暧昧、复合、婚恋时机与关系走向。",
          "href": "/sticks?type=yuelao",
          "cta": "求月老签"
        },
        {
          "title": "五路财神灵签",
          "body": "专问财运，适合看现金流、生意机会、副业、投资心态与守财能力。",
          "href": "/sticks?type=wealth",
          "cta": "求财神签"
        },
        {
          "title": "黄大仙灵签",
          "body": "适合问时机、转折、考试、出行、公众事务和需要看趋势的事情。",
          "href": "/sticks?type=huangdaxian",
          "cta": "求黄大仙签"
        }
      ]
    },
    "blessing": {
      "eyebrow": "祈福小殿",
      "title": "为在意的人和事，点一炷清香。",
      "description": "为家人、愿望或新的开始，留一刻安静的祝福。选择神明意象，点香祈愿。",
      "action": "点香祈福",
      "activeAction": "已点香",
      "modalTitle": "清香已燃",
      "modalBody": "把愿望收成一句最清楚的话，留给这一刻。仪式负责定心，真正改变局面的，仍是你接下来要做的那一步。",
      "modalClose": "回到页面",
      "note": "祈福是象征性的定心仪式，真正的选择与行动仍然在你手里。",
      "deities": [
        {
          "key": "guanyin",
          "name": "观音",
          "domain": "慈悲 · 平安",
          "body": "适合为家人、健康、关系修复、情绪安稳与渡过难关而祈愿。"
        },
        {
          "key": "wuye",
          "name": "五爷（五龙王）",
          "domain": "愿力 · 贵人",
          "body": "五台山五龙王意象，适合为承诺、事业关口、压力突破、贵人助力和心中所愿而祈愿。"
        },
        {
          "key": "wen-caishen",
          "name": "文财神",
          "domain": "规划 · 正财",
          "body": "适合为长期积累、账目清明、专业技能、学业证书与稳定收入而祈愿。"
        },
        {
          "key": "wu-caishen",
          "name": "武财神",
          "domain": "行动 · 机会",
          "body": "适合为生意胆识、谈判成交、项目推进、守住价值与开拓机会而祈愿。"
        },
        {
          "key": "mazu",
          "name": "妈祖",
          "domain": "远行 · 护航",
          "body": "适合为出行、迁移、远方亲友、跨海跨城的变化与平安归来而祈愿。"
        }
      ]
    },
    "premium": {
      "eyebrow": "就从一个生日开始",
      "title": "你的那张卡，正在等你。",
      "description": "只需生日，免费认识你的意象。喜欢的话，再继续探索完整的出生图谱。",
      "items": [
        "免费生日意象卡",
        "无需注册账号",
        "随时继续深入解读"
      ],
      "cta": "免费测测我的卡片"
    }
  },
  "ru": {
    "nav": {
      "method": "Как начать",
      "archetypes": "Коллекция",
      "report": "Карта рождения",
      "insights": "Исследовать"
    },
    "hero": {
      "version": "КОЛЛЕКЦИЯ DESTINYPIXEL",
      "eyebrow": "ХАРАКТЕР · ЛЮБОВЬ · НАПРАВЛЕНИЕ",
      "title": "Немного чуда.\nБольше понимания себя.",
      "lead": "Познакомьтесь с образом своего дня рождения: сильными сторонами, привычками в любви и возможностями для роста.",
      "name": "Имя",
      "date": "Дата рождения",
      "time": "Время рождения",
      "gender": "Пол",
      "female": "Женский",
      "male": "Мужской",
      "city": "Город рождения",
      "cityPlaceholder": "Найдите город рождения",
      "submit": "Создать мою карту рождения",
      "pending": "Готовим вашу карту рождения…",
      "privacy": "Ваш отчёт личный. Подробнее об использовании данных — в политике конфиденциальности."
    },
    "card": {
      "sample": "Ваша личная карта рождения",
      "core": "Ядро паттерна",
      "sky": "Ритм неба",
      "resonance": "Внутренний отклик"
    },
    "stats": {
      "portraits": "портретов энергии",
      "signals": "планетарных сигналов",
      "paths": "маршрутов"
    },
    "method": {
      "eyebrow": "УЗНАЙТЕ СЕБЯ ГЛУБЖЕ",
      "title": "В вашей истории больше одного слоя.",
      "description": "Добавьте время и место рождения, чтобы изучить характер, отношения и жизненное направление в личном разборе.",
      "items": [
        {
          "title": "Ваш характер",
          "body": "Познакомьтесь со своими сильными сторонами, привычками и возможностями."
        },
        {
          "title": "Ваши отношения",
          "body": "Исследуйте притяжение, трудности в общении и то, что помогает чувствовать близость."
        },
        {
          "title": "Ваш путь",
          "body": "Свяжите карту рождения с вопросами работы, роста и предстоящего года."
        }
      ]
    },
    "archetypes": {
      "eyebrow": "ШЕСТЬДЕСЯТ ОБРАЗОВ. КАКОЙ ВАШ?",
      "title": "Знакомство с коллекцией.",
      "description": "Кролик росы, Секвойя в океане, Солнечный скакун — у каждого образа своя история силы, близости и роста."
    },
    "fusion": {
      "eyebrow": "Чтение поля",
      "title": "Роса Кролика встречает Солнце в Рыбах.",
      "description": "Роса Кролика указывает на тонкость, социальную интуицию и мягкое восприятие. Солнце в Рыбах усиливает воображение, эмпатию и исцеление через красоту.",
      "chips": [
        "Тонкая чувствительность",
        "Социальная интуиция",
        "Солнце в Рыбах",
        "Эмоциональное исцеление"
      ]
    },
    "insights": {
      "eyebrow": "СЛЕДУЙТЕ СВОЕМУ ИНТЕРЕСУ",
      "title": "Что вас сейчас занимает?",
      "description": "Задайте вопрос, познакомьтесь с символическим чтением или создайте что-то личное.",
      "items": [
        {
          "title": "Ладонь",
          "body": "Опишите линии своей ладони и познакомьтесь с их традиционными значениями.",
          "href": "/palm",
          "cta": "Читать ладонь"
        },
        {
          "title": "Лицо",
          "body": "Исследуйте традиционные толкования описанных вами черт и выражений лица.",
          "href": "/face",
          "cta": "Читать лицо"
        },
        {
          "title": "Оракул вопроса",
          "body": "Задайте вопрос о любви, работе или выборе и рассмотрите его через Таро и символическую гексаграмму.",
          "href": "/oracle",
          "cta": "Задать вопрос"
        },
        {
          "title": "Celestial Atelier",
          "body": "Цвет пяти стихий превращается в концепт браслета: камни, размер бусин и символический анализ.",
          "href": "/atelier",
          "cta": "Собрать браслет"
        }
      ]
    },
    "sticks": {
      "eyebrow": "Храмовый оракул",
      "title": "Один жребий для вопроса, который сейчас в руках.",
      "description": "Легкий ритуал для момента, когда нужен ясный знак: выберите традицию, назовите тему и получите современное толкование.",
      "items": [
        {
          "title": "Жребии Гуаньинь",
          "body": "Мягкий универсальный оракул для защиты, семьи, восстановления, дороги и эмоциональной неопределенности.",
          "href": "/sticks?type=guanyin",
          "cta": "Спросить"
        },
        {
          "title": "Жребии Гуаньди",
          "body": "Решительный оракул для карьеры, власти, договоров, экзаменов, повышения и репутации.",
          "href": "/sticks?type=guandi",
          "cta": "Спросить"
        },
        {
          "title": "Жребии Юэлао",
          "body": "Оракул отношений для любви, примирения, свиданий, брака и выбора в близости.",
          "href": "/sticks?type=yuelao",
          "cta": "Спросить"
        },
        {
          "title": "Пять богов богатства",
          "body": "Фокус на деньгах: поток средств, бизнес, дополнительный доход и финансовая дисциплина.",
          "href": "/sticks?type=wealth",
          "cta": "Спросить"
        },
        {
          "title": "Жребии Вонг Тай Сина",
          "body": "Оракул сроков, поворотных моментов, дороги, экзаменов и практических предзнаменований.",
          "href": "/sticks?type=huangdaxian",
          "cta": "Спросить"
        }
      ]
    },
    "blessing": {
      "eyebrow": "Тихое благословение",
      "title": "Зажгите благовоние для того, что хотите защитить.",
      "description": "Небольшой цифровой ритуал для фокуса: выберите образ божества, сформулируйте желание и отметьте намерение на этот визит.",
      "action": "Зажечь",
      "activeAction": "Зажжено",
      "modalTitle": "Благовоние зажжено",
      "modalBody": "Сформулируйте намерение одной ясной фразой. Ритуал собирает внимание, а следующий реальный шаг остается за вами.",
      "modalClose": "Вернуться",
      "note": "Благословение символично; реальные решения все равно остаются за вами.",
      "deities": [
        {
          "key": "guanyin",
          "name": "Гуаньинь",
          "domain": "Сострадание · Защита",
          "body": "Для эмоциональной безопасности, заботы о семье, восстановления и мягкого пути через трудность."
        },
        {
          "key": "wuye",
          "name": "Утайский У Е",
          "domain": "Обет · Смелость",
          "body": "Пятый Царь Драконов Утая: для обещаний, давления, важного порога и устойчивости перед сложной задачей."
        },
        {
          "key": "wen-caishen",
          "name": "Гражданский бог богатства",
          "domain": "Порядок · Долгие деньги",
          "body": "Для планирования, счетов, учебы, профессиональных навыков и стабильного накопления."
        },
        {
          "key": "wu-caishen",
          "name": "Воинственный бог богатства",
          "domain": "Действие · Возможность",
          "body": "Для деловой смелости, переговоров, быстрых решений и защиты заработанной ценности."
        },
        {
          "key": "mazu",
          "name": "Мацзу",
          "domain": "Путь · Безопасность",
          "body": "Для поездок, переезда, дальних близких, неопределенности и возвращения домой."
        }
      ]
    },
    "premium": {
      "eyebrow": "НАЧНИТЕ С ДНЯ РОЖДЕНИЯ",
      "title": "Ваш образ ждёт вас.",
      "description": "Одна дата — одна бесплатная карточка. Начните с неё, а затем решите, хотите ли узнать больше.",
      "items": [
        "Бесплатная карточка",
        "Без регистрации",
        "Полный разбор по желанию"
      ],
      "cta": "Найти свою карточку"
    }
  }
};

const featuredPillars = ["癸卯", "丙午", "乙丑", "辛巳"];

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
  if (contentLocale(locale) === "zh") return profile.name.cn;
  if (locale === "ru") return getPillarDisplay(pillar, "ru").totemName;

  return profile.name.en;
}

function profileEssence(
  profile: PillarProfile,
  pillar: string,
  locale: ReportLocale,
) {
  if (contentLocale(locale) === "zh") return profile.essence.cn;
  if (locale === "ru") {
    const display = getPillarDisplay(pillar, "ru");
    return `${display.totemName} соединяет ${display.stemMeaning.toLowerCase()} и ${display.branchMeaning.toLowerCase()} в мягкий, наблюдательный архетип.`;
  }

  return profile.essence.en;
}

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

export default function DestinyWhiteExperience({
  initialLocale = "en",
  initialError,
}: {
  initialLocale?: ReportLocale;
  initialError?: string;
}) {
  const locale = initialLocale;
  const [birthDate, setBirthDate] = useState("");
  const birthDateRef = useRef("");
  const birthDateInputRef = useRef<HTMLInputElement>(null);
  const [pillar, setPillar] = useState("癸卯");
  const [litBlessings, setLitBlessings] = useState<Record<string, boolean>>({});
  const [selectedDeityKey, setSelectedDeityKey] = useState("guanyin");
  const [blessingMoment, setBlessingMoment] = useState<
    WhiteCopy["blessing"]["deities"][number] | null
  >(null);
  const copyLocale = contentLocale(locale);
  const text = whiteCopy[copyLocale];
  const introduction = homeIntroductionCopy(locale);
  const selectedDeity =
    text.blessing.deities.find((deity) => deity.key === selectedDeityKey) ??
    text.blessing.deities[0];
  const selectedBlessingActive = Boolean(litBlessings[selectedDeity.key]);
  const mobileNavLabels =
    locale === "zh-TW"
      ? { report: "排盤", insights: "洞察", sticks: "抽籤", blessing: "祈福" }
      : copyLocale === "zh"
      ? { report: "排盘", insights: "洞察", sticks: "抽签", blessing: "祈福" }
      : locale === "ru"
        ? { report: "Карта", insights: "Студии", sticks: "Жребий", blessing: "Обряд" }
        : { report: "Map", insights: "Studios", sticks: "Sticks", blessing: "Blessing" };
  const profile = useMemo(
    () => (pillarsDB as Record<string, PillarProfile>)[pillar],
    [pillar],
  );
  const cardName = profileName(profile, pillar, locale);

  useEffect(() => {
    const now = new Date();
    if (birthDateInputRef.current) {
      birthDateInputRef.current.max = `${Math.min(now.getFullYear(), 2100)}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }
  }, []);

  useEffect(() => {
    setDocumentLocale(locale);
    window.localStorage.setItem("destinypixel-locale", locale);
  }, [locale]);

  useEffect(() => {
    if (initialError) document.getElementById("report")?.scrollIntoView({ block: "start" });
  }, [initialError]);

  function changeLocale(nextLocale: ReportLocale) {
    window.localStorage.setItem("destinypixel-locale", nextLocale);
    const url = new URL(window.location.href);
    if (nextLocale === "en") url.searchParams.delete("locale");
    else url.searchParams.set("locale", nextLocale);
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  }

  async function updatePreviewFromDate(value: string) {
    setBirthDate(value);
    birthDateRef.current = value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    try {
      const { Solar } = await import("lunar-javascript");
      if (birthDateRef.current !== value) return;
      const [year, month, day] = value.split("-").map(Number);
      const result = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar().getDayInGanZhi();
      if (result in pillarsDB) setPillar(result);
    } catch {
      // The decorative preview must not prevent submitting a valid birth form.
    }
  }

  const insightIcons = [Hand, ScanFace, MessageCircle, Gem] as const;
  const freeHref = locale === "en" ? "/discover" : `/discover?locale=${locale}`;
  const sticksHref = locale === "en" ? "/sticks" : `/sticks?locale=${locale}`;
  const compatibilityHref = locale === "en" ? "/compatibility" : `/compatibility?locale=${locale}`;
  const freeLabel = copyLocale === "zh" ? "免费测我的意象卡" : locale === "ru" ? "Моя бесплатная карточка" : "Find my free card";


  return (
    <main className="white-site editorial-home">
      <header className="white-header membership-header">
        <div className="white-container white-header__inner">
          <a className="white-brand" href="/">
            <span aria-hidden="true" />
            DestinyPixel
          </a>

          <nav className="white-nav" aria-label={locale === "zh-TW" ? "主導覽" : copyLocale === "zh" ? "主导航" : locale === "ru" ? "Основная навигация" : "Main navigation"}>
            <a href={compatibilityHref}>{compatibilityCopy(locale).nav}</a>
            <a href={sticksHref}>{locale === "en" ? "Draw a stick" : mobileNavLabels.sticks}</a>
            <a href="#archetypes">{text.nav.archetypes}</a>
            <a href="#report">{text.nav.report}</a>
            <a href="#insights">{text.nav.insights}</a>
            <a href={locale === "en" ? "/journal" : `/journal?locale=${locale}`}>{copyLocale === "zh" ? "文章" : locale === "ru" ? "Статьи" : "Journal"}</a>
          </nav>

          <div className="white-actions">
            <a className="editorial-nav-free" href={freeHref}>{copyLocale === "zh" ? "免费测试" : locale === "ru" ? "Бесплатно" : "Try it free"}<ArrowRight size={13} aria-hidden="true" /></a>
            <a href={copyLocale === "zh" ? "/account?locale=zh" : "/account"} style={{ fontSize: 12, whiteSpace: "nowrap" }}>{copyLocale === "zh" ? "我的账号" : "Account"}</a>
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
        </div>
      </header>

      <nav className="white-mobile-dock" aria-label={locale === "zh-TW" ? "行動導覽" : copyLocale === "zh" ? "移动导航" : locale === "ru" ? "Мобильная навигация" : "Mobile navigation"}>
        <a href={freeHref} className="editorial-dock-free">
          <Sparkles size={18} aria-hidden="true" />
          <span>{copyLocale === "zh" ? "免费测试" : locale === "ru" ? "Карточка" : "Free card"}</span>
        </a>
        <a href={compatibilityHref}>
          <Sparkles size={18} aria-hidden="true" />
          <span>{compatibilityCopy(locale).nav}</span>
        </a>
        <a href={sticksHref}>
          <Stars size={18} aria-hidden="true" />
          <span>{mobileNavLabels.sticks}</span>
        </a>
        <a href="#blessing">
          <Orbit size={18} aria-hidden="true" />
          <span>{mobileNavLabels.blessing}</span>
        </a>
      </nav>

      <section className="white-hero" aria-labelledby="home-title">
        <div className="white-container editorial-hero-grid">
          <div className="white-hero__copy">
            <p className="white-kicker"><Sparkles size={14} aria-hidden="true" />{introduction.eyebrow}</p>
            <h1 id="home-title" data-server-localized>{introduction.title}</h1>
            <p className="white-lead">{introduction.lead}</p>
            <div className="editorial-hero-actions"><a className="editorial-primary" href="#start-here">{introduction.start}<ArrowRight size={18} aria-hidden="true" /></a><a className="editorial-secondary" href={freeHref}>{introduction.free}<ArrowRight size={15} aria-hidden="true" /></a></div>
            <p className="editorial-free-note"><ShieldCheck size={14} aria-hidden="true" />{introduction.note}</p>
            <div className="editorial-collection-note"><span>60</span><p>{copyLocale === "zh" ? "一种生日，一段独特故事。" : locale === "ru" ? "Образы, в которых можно узнать себя." : "Distinct characters. A story to call your own."}</p></div>
          </div>
          <div className="editorial-card-stage" aria-label={text.archetypes.title}>
            <div className="editorial-orbit" aria-hidden="true" />
            {(["乙丑", "丙午", "癸卯"] as const).map((key,index)=><div key={key} className={`editorial-display-card editorial-display-card--${index}`}>
              {index===2 ? <ArchetypeMotionPlayer className="editorial-hero-motion" src={archetypeVideoPath("gui_mao")} poster={archetypePosterPath("gui_mao")} label={profileName(pillarsDB[key],key,locale)} playLabel={copyLocale === "zh" ? "播放卡片动画" : locale === "ru" ? "Включить анимацию" : "Play card animation"} pauseLabel={copyLocale === "zh" ? "暂停卡片动画" : locale === "ru" ? "Приостановить анимацию" : "Pause card animation"}/> : <a href={freeHref}><Image src={getPillarImagePath(key)} alt={profileName(pillarsDB[key],key,locale)} width={1200} height={1600} sizes="(max-width: 650px) 48vw, 230px" /></a>}
              <a href={freeHref}><span>{profileName(pillarsDB[key],key,locale)}</span></a>
            </div>)}
            <span className="editorial-stage-label">{copyLocale === "zh" ? "你的故事，会是哪一种？" : locale === "ru" ? "Какой образ — ваш?" : "Which story feels like you?"}</span>
          </div>
        </div>
      </section>

      <HomeIntroduction locale={locale} />

      <CompatibilityHome locale={locale} />

      <section className="white-archetypes" id="archetypes">
        <div className="white-container editorial-collection">
          <div className="editorial-collection-heading">
            <p>{text.archetypes.eyebrow}</p>
            <h2>{text.archetypes.title}</h2>
            <span>{text.archetypes.description}</span>
          </div>

          <div className="editorial-collection-cards">
            {featuredPillars.map((featuredPillar) => {
              const itemProfile = (pillarsDB as Record<string, PillarProfile>)[
                featuredPillar
              ];
              const itemDisplay = getPillarDisplay(featuredPillar, locale);
              const itemName = profileName(itemProfile, featuredPillar, locale);

              return (
                <a key={featuredPillar} href={freeHref} className="editorial-collection-card">
                  <Image
                    src={getPillarImagePath(featuredPillar)}
                    alt={itemName}
                    width={1200}
                    height={1600}
                    sizes="(max-width: 650px) 44vw, 280px"
                    quality={95}
                  />
                  <div>
                    <span>{copyLocale === "zh" ? itemDisplay.pillarLabel : text.card.core}</span>
                    <strong>{itemName}</strong>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <ArchetypeMotionGallery locale={locale} />

      <section className="editorial-report white-container" id="report">
        <div className="editorial-report-copy"><p className="white-kicker">{text.method.eyebrow}</p><h2>{text.method.title}</h2><p>{text.method.description}</p><div className="editorial-report-benefits">{text.method.items.map((item,i)=><article key={item.title}><span>0{i+1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div><a className="editorial-text-link" href={`/tuteng?locale=${locale}`}>{copyLocale === "zh" ? "也可以探索你的本命灵构" : locale === "ru" ? "Исследовать тотем рождения" : "Explore your interactive Birth Totem"}<ArrowRight size={16} aria-hidden="true" /></a></div>
          <div className="white-form-panel">
            <div className="white-form-panel__header">
              <span>
                <SunMoon size={16} aria-hidden="true" />
              </span>
              <div>
                <strong>{text.card.sample}</strong>
                <p>{birthDate ? cardName : copyLocale === "zh" ? "填写出生日期、时间与城市" : locale === "ru" ? "Дата, время и город рождения" : "Your birth date, time and place"}</p>
              </div>
            </div>

            <form action={createFusionReportAction} data-analytics-form="birth_report">
              {initialError && <p role="alert" className="white-field white-field--full" style={{ color: "#9e3434", lineHeight: 1.7 }}>{initialError}</p>}
              <input type="hidden" name="locale" value={locale} />
              <label className="white-field white-field--full">
                <span>{text.hero.name}</span>
                <input
                  name="name"
                  type="text"
                  placeholder={
                    copyLocale === "zh"
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
                  min="1800-01-01"
                  max="2100-12-31"
                  value={birthDate}
                  ref={birthDateInputRef}
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
                    copyLocale === "zh"
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
              {text.hero.privacy} <a href={copyLocale === "zh" ? "/privacy?locale=zh" : "/privacy"}>{copyLocale === "zh" ? "数据说明" : "Data use"}</a> · <a href={copyLocale === "zh" ? "/service?locale=zh" : "/service"}>{copyLocale === "zh" ? "报告说明" : "Report guide"}</a>
            </p>
            <a className="white-totem-entry" href={`/tuteng?locale=${locale}`}>
              <Orbit size={15} aria-hidden="true" />
              {copyLocale === "zh"
                ? "生成可交互本命图腾"
                : locale === "ru"
                  ? "Создать интерактивный тотем"
                  : "Generate an interactive Birth Totem"}
              <ArrowRight size={14} aria-hidden="true" />
            </a>
            <a className="white-totem-entry" href={freeHref}>
              <CalendarDays size={15} aria-hidden="true" />
              {copyLocale === "zh"
                ? "只记得生日？先免费测日柱卡"
                : "Only know your birthday? Find your free character card"}
              <ArrowRight size={14} aria-hidden="true" />
            </a>
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

      <OracleHome locale={locale} />

      <section className="white-blessing" id="blessing">
        <div className="white-container">
          <div className="white-section-heading">
            <p>{text.blessing.eyebrow}</p>
            <h2>{text.blessing.title}</h2>
            <span>{text.blessing.description}</span>
          </div>

          <div className="white-blessing-stage">
            <div className="white-deity-selector" role="tablist" aria-label={text.blessing.title}>
              {text.blessing.deities.map((deity, index) => {
                const selected = deity.key === selectedDeity.key;
                const active = Boolean(litBlessings[deity.key]);

                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    data-selected={selected}
                    data-lit={active}
                    key={deity.key}
                    onClick={() => setSelectedDeityKey(deity.key)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{deity.name}</strong>
                      <small>{deity.domain}</small>
                    </div>
                    {active ? <Check size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <article className="white-shrine" data-deity={selectedDeity.key} data-active={selectedBlessingActive}>
              <div className="white-shrine__visual">
                <DeityPortrait deityKey={selectedDeity.key} active={selectedBlessingActive} />
              </div>
              <div className="white-shrine__copy">
                <small>{selectedDeity.domain}</small>
                <h3>{selectedDeity.name}</h3>
                <p>{selectedDeity.body}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLitBlessings((current) => ({
                      ...current,
                      [selectedDeity.key]: true,
                    }));
                    setBlessingMoment(selectedDeity);
                  }}
                >
                  <Sparkles size={16} aria-hidden="true" />
                  {selectedBlessingActive ? text.blessing.activeAction : text.blessing.action}
                </button>
              </div>
            </article>
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
            <DeityPortrait deityKey={blessingMoment.key} ritual />
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
          <a href={freeHref}>
            {text.premium.cta}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="white-footer">
        <div className="white-container">
          <span>DestinyPixel · Birthday characters & personal readings</span>
          <a href={copyLocale === "zh" ? "/tools?locale=zh" : "/tools"}>
            {copyLocale === "zh" ? "探索入口" : locale === "ru" ? "Практики" : "Explore the practices"}
          </a>
          <a href="/learn">
            {copyLocale === "zh" ? "使用指南（英文）" : locale === "ru" ? "Гид (EN)" : "Guide"}
          </a>
          <a href={locale === "en" ? "/journal" : `/journal?locale=${locale}`}>
            {copyLocale === "zh" ? "原创文章" : locale === "ru" ? "Статьи" : "Journal"}
          </a>
          <a href={`/palm?locale=${locale}`}>
            {copyLocale === "zh" ? "手相" : locale === "ru" ? "Ладонь" : "Palm"}
          </a>
          <a href={`/face?locale=${locale}`}>
            {copyLocale === "zh" ? "面相" : locale === "ru" ? "Лицо" : "Face"}
          </a>
          <a href={`/oracle?locale=${locale}`}>
            {copyLocale === "zh" ? "问事" : locale === "ru" ? "Оракул" : "Oracle"}
          </a>
          <a href={`/sticks?locale=${locale}`}>
            {copyLocale === "zh" ? "求签" : locale === "ru" ? "Жребии" : "Sticks"}
          </a>
          <a href={`/tuteng?locale=${locale}`}>
            {copyLocale === "zh" ? "本命灵构" : locale === "ru" ? "Тотем" : "Birth Totem"}
          </a>
          <a href={freeHref}>
            {copyLocale === "zh" ? "免费日柱卡" : "Free character card"}
          </a>
          <a href="#blessing">
            {copyLocale === "zh" ? "祈福" : locale === "ru" ? "Благословение" : "Blessing"}
          </a>
          <a
            className="white-footer__contact"
            href={destinySupportHref}
            aria-label={copyLocale === "zh" ? "联系 DestinyPixel" : "Contact DestinyPixel"}
          >
            <Mail size={13} aria-hidden="true" />
            {destinySupportEmail}
          </a>
          <a
            className="white-footer__contact"
            href={destinyTelegramHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send size={13} aria-hidden="true" />
            {copyLocale === "zh" ? "Telegram 咨询" : locale === "ru" ? "Telegram" : "Chat on Telegram"}
          </a>

          <span>
            <CalendarDays size={13} aria-hidden="true" />
            2026
          </span>
        </div>
      </footer>
      <a
        className="telegram-contact"
        href={destinyTelegramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copyLocale === "zh" ? "在 Telegram 联系 DestinyPixel" : "Contact DestinyPixel on Telegram"}
      >
        <Send size={17} aria-hidden="true" />
        <span>{copyLocale === "zh" ? "Telegram 咨询" : locale === "ru" ? "Telegram" : "Telegram chat"}</span>
      </a>
    </main>
  );
}
