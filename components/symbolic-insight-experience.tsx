"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  Camera,
  Check,
  CircleDot,
  Clock3,
  Eye,
  Hand,
  HelpCircle,
  Loader2,
  MessageCircle,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  normalizeInsightMode,
  type InsightMode,
} from "@/lib/ai/insights";
import {
  normalizeReportLocale,
  reportLanguageOptions,
  type ReportLocale,
} from "@/lib/report-i18n";

type InsightStatus = "idle" | "loading" | "ready" | "error";
type ReadingDomain = "general" | "career" | "love" | "money" | "wellbeing";

type Option = {
  value: string;
  label: string;
};

type InsightCopy = {
  nav: {
    home: string;
    black: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  modes: Record<
    InsightMode,
    {
      title: string;
      short: string;
      body: string;
      cta: string;
    }
  >;
  upload: {
    title: string;
    photo: string;
    capture: string;
    remove: string;
    localOnly: string;
    alignment: string;
  };
  fields: {
    handSide: string;
    dominantHand: string;
    lineClarity: string;
    heartLine: string;
    headLine: string;
    lifeLine: string;
    fateLine: string;
    mounts: string;
    faceShape: string;
    browEye: string;
    nose: string;
    mouth: string;
    jaw: string;
    expression: string;
    notes: string;
    question: string;
    questionPlaceholder: string;
    questionTime: string;
    birthDate: string;
    birthTime: string;
    domain: string;
  };
  buttons: {
    generate: string;
    generating: string;
    learn: string;
    clear: string;
  };
  result: {
    idle: string;
    loading: string;
    ready: string;
    error: string;
    title: string;
  };
  oracle: {
    seedTitle: string;
    upper: string;
    lower: string;
    moving: string;
    tarot: string;
    situation: string;
    obstacle: string;
    advice: string;
  };
  education: Record<
    InsightMode,
    {
      title: string;
      body: string[];
    }
  >;
};

const insightCopy: Record<ReportLocale, InsightCopy> = {
  en: {
    nav: {
      home: "Birth Map",
      black: "Dark mode",
    },
    hero: {
      eyebrow: "Palm · Face · Question Oracle",
      title: "Three quick mirrors for the question in front of you.",
      lead:
        "Use a simple photo reference or a time-cast question to turn subtle signals into direct, practical insight. The tone is conversational, but the structure is disciplined.",
    },
    modes: {
      palm: {
        title: "Palm Studio",
        short: "Lines, mounts, and hand rhythm",
        body:
          "Upload or capture your palm as an optional reference, confirm the visible signs, then generate a detailed reading.",
        cta: "Read my palm",
      },
      face: {
        title: "Face Studio",
        short: "Expression, zones, and social signal",
        body:
          "Use a clean front-facing photo as an optional reference, then translate confirmed features into psychological reflection.",
        cta: "Read my face",
      },
      oracle: {
        title: "Question Oracle",
        short: "Time-cast Liuyao plus Tarot",
        body:
          "Ask one clear question. The page casts six lines from the question time and pairs them with a three-card Tarot mirror.",
        cta: "Ask one question",
      },
    },
    upload: {
      title: "Photo reference",
      photo: "Upload photo",
      capture: "Take photo",
      remove: "Remove photo",
      localOnly:
        "The photo stays in this browser preview. DeepSeek receives only the confirmed observations below.",
      alignment: "The photo is only a local reference. Confirm the visible details below.",
    },
    fields: {
      handSide: "Palm side",
      dominantHand: "Dominant hand",
      lineClarity: "Overall line clarity",
      heartLine: "Heart line",
      headLine: "Head line",
      lifeLine: "Life line",
      fateLine: "Fate line",
      mounts: "Mounts / palm fullness",
      faceShape: "Face structure",
      browEye: "Brows and eyes",
      nose: "Nose bridge / center",
      mouth: "Mouth and lips",
      jaw: "Jaw and chin",
      expression: "Default expression",
      notes: "Extra visible notes",
      question: "Your question",
      questionPlaceholder: "Ask one concrete question, e.g. Should I change jobs this year?",
      questionTime: "Question time",
      birthDate: "Birth date (optional)",
      birthTime: "Birth time (optional)",
      domain: "Question domain",
    },
    buttons: {
      generate: "Generate detailed insight",
      generating: "Generating detailed insight...",
      learn: "Learn how this works",
      clear: "Clear result",
    },
    result: {
      idle: "Your reading will stream here after you submit.",
      loading: "Streaming the reading...",
      ready: "Insight ready",
      error: "Fallback reading shown",
      title: "Reading report",
    },
    oracle: {
      seedTitle: "Local cast preview",
      upper: "Upper trigram",
      lower: "Lower trigram",
      moving: "Moving lines",
      tarot: "Tarot mirror",
      situation: "Situation",
      obstacle: "Obstacle",
      advice: "Advice",
    },
    education: {
      palm: {
        title: "Palm reading notes",
        body: [
          "The palm is treated as a symbolic map. Heart line reflects affection style, head line reflects decision rhythm, life line reflects vitality rhythm, and fate line reflects how strongly life feels shaped by outer structure.",
          "This product does not diagnose health or promise lifespan. It turns confirmed visual signs into practical self-observation.",
        ],
      },
      face: {
        title: "Face reading notes",
        body: [
          "Face reading here is not identity judgment. It looks at expression, tension, three facial zones, and the balance between social presentation and emotional pressure.",
          "The system avoids protected traits, beauty scoring, health diagnosis, and moral labels. It is a reflective mirror, not biometric truth.",
        ],
      },
      oracle: {
        title: "Question oracle notes",
        body: [
          "The six-line cast is generated from the question time and read from bottom to top. Moving lines show where the situation is changing.",
          "Tarot adds a Western mirror: situation, obstacle, and advice. The useful output is not certainty; it is a sharper next move.",
        ],
      },
    },
  },
  zh: {
    nav: {
      home: "出生地图",
      black: "深色模式",
    },
    hero: {
      eyebrow: "手相 · 面相 · 一事一问",
      title: "给眼前的问题，多三面镜子。",
      lead:
        "手相和面相用照片作本地参考，问事用起问时间生成六爻与塔罗。它不是玄乎的安慰，而是把细微信号转成更直接的判断和行动建议。",
    },
    modes: {
      palm: {
        title: "手相专区",
        short: "掌纹、掌丘与手部节奏",
        body:
          "上传或自拍手掌作为参考，确认可见掌纹与掌丘特征，再生成一份口语化但足够细的手相解读。",
        cta: "看手相",
      },
      face: {
        title: "面相专区",
        short: "神态、三庭与社交信号",
        body:
          "上传一张正面清晰照作为参考，确认结构特征后，把外在呈现翻译成心理与关系模式。",
        cta: "看面相",
      },
      oracle: {
        title: "问事专区",
        short: "时间起卦 + 塔罗三牌",
        body:
          "一事一问。输入问题和起问时间，系统先起六爻，再抽三张塔罗，最后交给 AI 做东西方合参。",
        cta: "问一件事",
      },
    },
    upload: {
      title: "照片参考",
      photo: "上传照片",
      capture: "拍一张",
      remove: "移除照片",
      localOnly:
        "照片只在本页预览参考；发送给 DeepSeek 的只有你确认的观察项。",
      alignment: "照片只做本地参考；请直接确认下面的可见特征。",
    },
    fields: {
      handSide: "手掌",
      dominantHand: "惯用手",
      lineClarity: "整体掌纹清晰度",
      heartLine: "感情线",
      headLine: "智慧线",
      lifeLine: "生命线",
      fateLine: "事业/命运线",
      mounts: "掌丘与掌心饱满度",
      faceShape: "面部结构",
      browEye: "眉眼",
      nose: "鼻梁与中庭",
      mouth: "嘴唇与表达",
      jaw: "下颌与下巴",
      expression: "默认神态",
      notes: "补充可见特征",
      question: "你要问的事",
      questionPlaceholder: "尽量具体，例如：今年适不适合换工作？",
      questionTime: "起问时间",
      birthDate: "生日（可选）",
      birthTime: "出生时间（可选）",
      domain: "问题类型",
    },
    buttons: {
      generate: "生成详细解读",
      generating: "正在生成详细解读...",
      learn: "科普一下",
      clear: "清空结果",
    },
    result: {
      idle: "提交后，解读会在这里流式生成。",
      loading: "正在流式生成...",
      ready: "解读完成",
      error: "已显示本地兜底解读",
      title: "解读报告",
    },
    oracle: {
      seedTitle: "本地起卦预览",
      upper: "上卦",
      lower: "下卦",
      moving: "动爻",
      tarot: "塔罗镜像",
      situation: "现状",
      obstacle: "阻碍",
      advice: "建议",
    },
    education: {
      palm: {
        title: "手相怎么读",
        body: [
          "这里把手掌当成一张象征地图：感情线看亲密表达，智慧线看思考与决策节奏，生命线看精力恢复方式，事业线看外部结构对人生的牵引。",
          "它不做寿命、疾病和绝对事件判断，只把你确认的可见特征转译成更实际的自我观察。",
        ],
      },
      face: {
        title: "面相怎么读",
        body: [
          "这里的面相不是给人贴标签，而是观察表情张力、三庭比例、眉眼鼻口下颌等外在信号，理解一个人的社交呈现和压力反应。",
          "系统会避开身份、年龄、健康、颜值、道德等不该判断的内容，只做心理和关系层面的象征解读。",
        ],
      },
      oracle: {
        title: "问事怎么读",
        body: [
          "六爻按起问时间生成，从下往上看六条线，动爻代表事情正在变化的位置。它更像一张当下局势图。",
          "塔罗补充西方镜像：现状、阻碍、建议。最后的重点不是保证结果，而是帮你看清下一步该做什么、该避开什么。",
        ],
      },
    },
  },
  ru: {
    nav: {
      home: "Карта рождения",
      black: "Темный режим",
    },
    hero: {
      eyebrow: "Ладонь · Лицо · Один вопрос",
      title: "Три быстрых зеркала для текущего вопроса.",
      lead:
        "Используйте фото как локальный ориентир или время вопроса, чтобы превратить тонкие сигналы в ясный и практичный разбор.",
    },
    modes: {
      palm: {
        title: "Ладонь",
        short: "Линии, холмы и ритм руки",
        body:
          "Загрузите или снимите ладонь как ориентир и подтвердите видимые признаки.",
        cta: "Прочитать ладонь",
      },
      face: {
        title: "Лицо",
        short: "Выражение, зоны и социальный сигнал",
        body:
          "Используйте фронтальное фото как ориентир и переведите подтвержденные признаки в психологическое отражение.",
        cta: "Прочитать лицо",
      },
      oracle: {
        title: "Оракул вопроса",
        short: "Лю Яо по времени и три карты Таро",
        body:
          "Задайте один вопрос. Система строит шесть линий по времени вопроса и добавляет зеркало Таро.",
        cta: "Задать вопрос",
      },
    },
    upload: {
      title: "Фото-ориентир",
      photo: "Загрузить фото",
      capture: "Сделать фото",
      remove: "Удалить фото",
      localOnly:
        "Фото остается в браузере. DeepSeek получает только подтвержденные наблюдения.",
      alignment: "Фото используется только как локальный ориентир. Подтвердите видимые признаки ниже.",
    },
    fields: {
      handSide: "Ладонь",
      dominantHand: "Ведущая рука",
      lineClarity: "Четкость линий",
      heartLine: "Линия сердца",
      headLine: "Линия головы",
      lifeLine: "Линия жизни",
      fateLine: "Линия судьбы",
      mounts: "Холмы ладони",
      faceShape: "Форма лица",
      browEye: "Брови и глаза",
      nose: "Нос и центр",
      mouth: "Рот и губы",
      jaw: "Челюсть и подбородок",
      expression: "Базовое выражение",
      notes: "Дополнительные признаки",
      question: "Ваш вопрос",
      questionPlaceholder: "Задайте один конкретный вопрос",
      questionTime: "Время вопроса",
      birthDate: "Дата рождения (опционально)",
      birthTime: "Время рождения (опционально)",
      domain: "Тема вопроса",
    },
    buttons: {
      generate: "Создать подробный разбор",
      generating: "Создаем подробный разбор...",
      learn: "Как это работает",
      clear: "Очистить",
    },
    result: {
      idle: "После отправки разбор появится здесь потоково.",
      loading: "Идет потоковая генерация...",
      ready: "Разбор готов",
      error: "Показан локальный резервный текст",
      title: "Отчет",
    },
    oracle: {
      seedTitle: "Локальный расклад",
      upper: "Верхняя триграмма",
      lower: "Нижняя триграмма",
      moving: "Движущиеся линии",
      tarot: "Зеркало Таро",
      situation: "Ситуация",
      obstacle: "Препятствие",
      advice: "Совет",
    },
    education: {
      palm: {
        title: "Как читается ладонь",
        body: [
          "Ладонь рассматривается как символическая карта: линия сердца отражает стиль близости, линия головы — мышление, линия жизни — ритм энергии, линия судьбы — влияние внешней структуры.",
          "Это не медицинский диагноз и не обещание событий. Это перевод подтвержденных признаков в практическое самонаблюдение.",
        ],
      },
      face: {
        title: "Как читается лицо",
        body: [
          "Здесь лицо не используется для ярлыков. Мы смотрим на выражение, напряжение, зоны лица и социальную подачу.",
          "Система избегает идентичности, возраста, здоровья, красоты и моральных оценок. Это зеркало, а не биометрическая правда.",
        ],
      },
      oracle: {
        title: "Как работает оракул",
        body: [
          "Шесть линий строятся по времени вопроса и читаются снизу вверх. Движущиеся линии показывают, где ситуация меняется.",
          "Таро добавляет западное зеркало: ситуация, препятствие и совет. Цель — не гарантия, а более точный следующий шаг.",
        ],
      },
    },
  },
};

const optionSets: Record<string, Record<ReportLocale, Option[]>> = {
  handSide: {
    en: [
      { value: "left palm", label: "Left palm" },
      { value: "right palm", label: "Right palm" },
      { value: "both palms compared", label: "Both palms" },
    ],
    zh: [
      { value: "left palm", label: "左手" },
      { value: "right palm", label: "右手" },
      { value: "both palms compared", label: "双手对比" },
    ],
    ru: [
      { value: "left palm", label: "Левая" },
      { value: "right palm", label: "Правая" },
      { value: "both palms compared", label: "Обе" },
    ],
  },
  dominantHand: {
    en: [
      { value: "right dominant", label: "Right" },
      { value: "left dominant", label: "Left" },
      { value: "uncertain", label: "Not sure" },
    ],
    zh: [
      { value: "right dominant", label: "右手" },
      { value: "left dominant", label: "左手" },
      { value: "uncertain", label: "不确定" },
    ],
    ru: [
      { value: "right dominant", label: "Правая" },
      { value: "left dominant", label: "Левая" },
      { value: "uncertain", label: "Не знаю" },
    ],
  },
  lineClarity: {
    en: [
      { value: "clear and deep", label: "Clear and deep" },
      { value: "fine and many lines", label: "Fine, many lines" },
      { value: "light and broken", label: "Light or broken" },
    ],
    zh: [
      { value: "clear and deep", label: "清晰较深" },
      { value: "fine and many lines", label: "细碎纹多" },
      { value: "light and broken", label: "浅淡或断续" },
    ],
    ru: [
      { value: "clear and deep", label: "Четкие и глубокие" },
      { value: "fine and many lines", label: "Много тонких линий" },
      { value: "light and broken", label: "Слабые или прерывистые" },
    ],
  },
  heartLine: {
    en: [
      { value: "long curved heart line", label: "Long and curved" },
      { value: "straight heart line", label: "Straighter" },
      { value: "fragmented heart line", label: "Fragmented" },
    ],
    zh: [
      { value: "long curved heart line", label: "较长上扬" },
      { value: "straight heart line", label: "偏直克制" },
      { value: "fragmented heart line", label: "断续细碎" },
    ],
    ru: [
      { value: "long curved heart line", label: "Длинная и изогнутая" },
      { value: "straight heart line", label: "Более прямая" },
      { value: "fragmented heart line", label: "Прерывистая" },
    ],
  },
  headLine: {
    en: [
      { value: "long straight head line", label: "Long and straight" },
      { value: "sloping head line", label: "Sloping" },
      { value: "forked head line", label: "Forked" },
    ],
    zh: [
      { value: "long straight head line", label: "长而偏直" },
      { value: "sloping head line", label: "向下倾斜" },
      { value: "forked head line", label: "末端分叉" },
    ],
    ru: [
      { value: "long straight head line", label: "Длинная прямая" },
      { value: "sloping head line", label: "Наклонная" },
      { value: "forked head line", label: "Раздвоенная" },
    ],
  },
  lifeLine: {
    en: [
      { value: "wide clear life line", label: "Wide and clear" },
      { value: "close to thumb", label: "Close to thumb" },
      { value: "chained or interrupted", label: "Chained / interrupted" },
    ],
    zh: [
      { value: "wide clear life line", label: "弧度宽且清晰" },
      { value: "close to thumb", label: "贴近拇指" },
      { value: "chained or interrupted", label: "链状或中断" },
    ],
    ru: [
      { value: "wide clear life line", label: "Широкая и четкая" },
      { value: "close to thumb", label: "Близко к большому пальцу" },
      { value: "chained or interrupted", label: "Цепочка / разрывы" },
    ],
  },
  fateLine: {
    en: [
      { value: "strong central fate line", label: "Strong central" },
      { value: "light fate line", label: "Light" },
      { value: "absent or unclear fate line", label: "Absent / unclear" },
    ],
    zh: [
      { value: "strong central fate line", label: "中轴明显" },
      { value: "light fate line", label: "较淡" },
      { value: "absent or unclear fate line", label: "不明显" },
    ],
    ru: [
      { value: "strong central fate line", label: "Сильная центральная" },
      { value: "light fate line", label: "Слабая" },
      { value: "absent or unclear fate line", label: "Нет / неясная" },
    ],
  },
  mounts: {
    en: [
      { value: "full Venus and Moon mounts", label: "Venus/Moon fuller" },
      { value: "balanced mounts", label: "Balanced" },
      { value: "flat or tense palm", label: "Flat or tense" },
    ],
    zh: [
      { value: "full Venus and Moon mounts", label: "金星/月丘饱满" },
      { value: "balanced mounts", label: "整体均衡" },
      { value: "flat or tense palm", label: "偏平或紧" },
    ],
    ru: [
      { value: "full Venus and Moon mounts", label: "Холмы Венеры/Луны полные" },
      { value: "balanced mounts", label: "Сбалансированные" },
      { value: "flat or tense palm", label: "Плоская или напряженная" },
    ],
  },
  faceShape: {
    en: [
      { value: "oval or soft face structure", label: "Oval / soft" },
      { value: "angular face structure", label: "Angular" },
      { value: "round fuller face structure", label: "Round / fuller" },
    ],
    zh: [
      { value: "oval or soft face structure", label: "椭圆柔和" },
      { value: "angular face structure", label: "线条分明" },
      { value: "round fuller face structure", label: "圆润饱满" },
    ],
    ru: [
      { value: "oval or soft face structure", label: "Овальная / мягкая" },
      { value: "angular face structure", label: "Угловатая" },
      { value: "round fuller face structure", label: "Округлая" },
    ],
  },
  browEye: {
    en: [
      { value: "focused brows and steady eyes", label: "Focused / steady" },
      { value: "soft brows and gentle eyes", label: "Soft / gentle" },
      { value: "tense brows or guarded eyes", label: "Tense / guarded" },
    ],
    zh: [
      { value: "focused brows and steady eyes", label: "眉眼聚焦稳定" },
      { value: "soft brows and gentle eyes", label: "眉眼柔和" },
      { value: "tense brows or guarded eyes", label: "眉眼紧或防御" },
    ],
    ru: [
      { value: "focused brows and steady eyes", label: "Сфокусированные" },
      { value: "soft brows and gentle eyes", label: "Мягкие" },
      { value: "tense brows or guarded eyes", label: "Напряженные" },
    ],
  },
  nose: {
    en: [
      { value: "straight defined nose center", label: "Defined center" },
      { value: "soft rounded nose center", label: "Soft rounded" },
      { value: "narrow or tense center", label: "Narrow / tense" },
    ],
    zh: [
      { value: "straight defined nose center", label: "中庭清晰" },
      { value: "soft rounded nose center", label: "圆润柔和" },
      { value: "narrow or tense center", label: "偏窄或紧" },
    ],
    ru: [
      { value: "straight defined nose center", label: "Четкий центр" },
      { value: "soft rounded nose center", label: "Мягкий округлый" },
      { value: "narrow or tense center", label: "Узкий / напряженный" },
    ],
  },
  mouth: {
    en: [
      { value: "relaxed expressive mouth", label: "Relaxed / expressive" },
      { value: "thin controlled mouth", label: "Controlled" },
      { value: "downturned or tense mouth", label: "Tense / downturned" },
    ],
    zh: [
      { value: "relaxed expressive mouth", label: "放松有表达" },
      { value: "thin controlled mouth", label: "偏克制" },
      { value: "downturned or tense mouth", label: "紧或下压" },
    ],
    ru: [
      { value: "relaxed expressive mouth", label: "Расслабленный" },
      { value: "thin controlled mouth", label: "Сдержанный" },
      { value: "downturned or tense mouth", label: "Напряженный" },
    ],
  },
  jaw: {
    en: [
      { value: "firm jaw and chin", label: "Firm" },
      { value: "soft jaw and chin", label: "Soft" },
      { value: "narrow or retreating jaw", label: "Narrow / softer" },
    ],
    zh: [
      { value: "firm jaw and chin", label: "下颌有力" },
      { value: "soft jaw and chin", label: "下颌柔和" },
      { value: "narrow or retreating jaw", label: "偏窄或弱" },
    ],
    ru: [
      { value: "firm jaw and chin", label: "Крепкая" },
      { value: "soft jaw and chin", label: "Мягкая" },
      { value: "narrow or retreating jaw", label: "Узкая / мягкая" },
    ],
  },
  expression: {
    en: [
      { value: "calm and open expression", label: "Calm / open" },
      { value: "serious controlled expression", label: "Serious / controlled" },
      { value: "tired or guarded expression", label: "Tired / guarded" },
    ],
    zh: [
      { value: "calm and open expression", label: "平和开放" },
      { value: "serious controlled expression", label: "严肃克制" },
      { value: "tired or guarded expression", label: "疲惫或防御" },
    ],
    ru: [
      { value: "calm and open expression", label: "Спокойное" },
      { value: "serious controlled expression", label: "Серьезное" },
      { value: "tired or guarded expression", label: "Усталое / закрытое" },
    ],
  },
  domain: {
    en: [
      { value: "general", label: "General" },
      { value: "career", label: "Career" },
      { value: "love", label: "Love" },
      { value: "money", label: "Money" },
      { value: "wellbeing", label: "Wellbeing" },
    ],
    zh: [
      { value: "general", label: "综合" },
      { value: "career", label: "事业" },
      { value: "love", label: "感情" },
      { value: "money", label: "财务" },
      { value: "wellbeing", label: "身心" },
    ],
    ru: [
      { value: "general", label: "Общее" },
      { value: "career", label: "Карьера" },
      { value: "love", label: "Любовь" },
      { value: "money", label: "Деньги" },
      { value: "wellbeing", label: "Состояние" },
    ],
  },
};

const trigramData = [
  { key: "qian", en: "Qian / Heaven", zh: "乾 / 天", ru: "Цянь / Небо" },
  { key: "dui", en: "Dui / Lake", zh: "兑 / 泽", ru: "Дуй / Озеро" },
  { key: "li", en: "Li / Fire", zh: "离 / 火", ru: "Ли / Огонь" },
  { key: "zhen", en: "Zhen / Thunder", zh: "震 / 雷", ru: "Чжэнь / Гром" },
  { key: "xun", en: "Xun / Wind", zh: "巽 / 风", ru: "Сюнь / Ветер" },
  { key: "kan", en: "Kan / Water", zh: "坎 / 水", ru: "Кань / Вода" },
  { key: "gen", en: "Gen / Mountain", zh: "艮 / 山", ru: "Гэнь / Гора" },
  { key: "kun", en: "Kun / Earth", zh: "坤 / 地", ru: "Кунь / Земля" },
];

const tarotCards = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

function languageLabel(locale: ReportLocale) {
  if (locale === "zh") return "中文";
  if (locale === "ru") return "RU";

  return "EN";
}

function setDocumentLocale(locale: ReportLocale) {
  document.documentElement.lang =
    locale === "zh" ? "zh-CN" : locale === "ru" ? "ru" : "en";
}

function formatDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 16);
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function localizeTrigram(index: number, locale: ReportLocale) {
  const trigram = trigramData[index % trigramData.length];

  return trigram[locale];
}

function buildOracleSeed({
  question,
  questionTime,
  birthDate,
  domain,
  locale,
}: {
  question: string;
  questionTime: string;
  birthDate: string;
  domain: ReadingDomain;
  locale: ReportLocale;
}) {
  const seed = hashString(`${question}|${questionTime}|${birthDate}|${domain}`);
  const lines = Array.from({ length: 6 }, (_, index) => {
    const value = (seed >> (index * 4)) + index * 17;

    return {
      index: index + 1,
      yang: value % 2 === 0,
      moving: value % 5 === 0 || value % 7 === 0,
    };
  });
  const lowerIndex = lines
    .slice(0, 3)
    .reduce((sum, line, index) => sum + (line.yang ? 1 << index : 0), 0);
  const upperIndex = lines
    .slice(3, 6)
    .reduce((sum, line, index) => sum + (line.yang ? 1 << index : 0), 0);
  const tarot = [0, 1, 2].map((index) => {
    const cardIndex = (seed + index * 7 + question.length * (index + 1)) % tarotCards.length;

    return tarotCards[cardIndex];
  });

  return {
    seed,
    lowerTrigram: localizeTrigram(lowerIndex, locale),
    upperTrigram: localizeTrigram(upperIndex, locale),
    lines,
    movingLines: lines.filter((line) => line.moving).map((line) => line.index),
    tarot,
  };
}

function getDefaultObservation(key: string, locale: ReportLocale) {
  return optionSets[key][locale][0]?.value ?? "";
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="insight-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PhotoGuide({
  mode,
  previewUrl,
  copy,
  onPhoto,
  onClear,
}: {
  mode: "palm" | "face";
  previewUrl: string | null;
  copy: InsightCopy;
  onPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  const inputId = `insight-photo-${mode}`;
  const captureId = `insight-capture-${mode}`;

  return (
    <section className="insight-photo-card">
      <div className="insight-photo-card__header">
        <div>
          <p>{copy.upload.title}</p>
          <span>{copy.upload.alignment}</span>
        </div>
        {mode === "palm" ? <Hand size={24} aria-hidden="true" /> : <ScanFace size={24} aria-hidden="true" />}
      </div>

      <div className="insight-photo-frame" data-mode={mode}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" />
        ) : (
          <div className="insight-photo-placeholder">
            {mode === "palm" ? <Hand size={46} aria-hidden="true" /> : <Eye size={46} aria-hidden="true" />}
          </div>
        )}
      </div>

      <div className="insight-photo-actions">
        <label htmlFor={inputId}>
          <Upload size={16} aria-hidden="true" />
          {copy.upload.photo}
        </label>
        <input id={inputId} type="file" accept="image/*" onChange={onPhoto} />
        <label htmlFor={captureId}>
          <Camera size={16} aria-hidden="true" />
          {copy.upload.capture}
        </label>
        <input
          id={captureId}
          type="file"
          accept="image/*"
          capture={mode === "face" ? "user" : "environment"}
          onChange={onPhoto}
        />
        {previewUrl && (
          <button type="button" onClick={onClear}>
            <X size={16} aria-hidden="true" />
            {copy.upload.remove}
          </button>
        )}
      </div>

      <p className="insight-privacy-note">
        <ShieldCheck size={14} aria-hidden="true" />
        {copy.upload.localOnly}
      </p>
    </section>
  );
}

function ResultText({ text }: { text: string }) {
  if (!text.trim()) return null;

  return (
    <div className="insight-result-text">
      {text
        .split(/\n{2,}/)
        .map((paragraph) =>
          paragraph
            .trim()
            .replace(/^#{1,6}\s*/, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/^\s*[-*]\s+/gm, ""),
        )
        .filter(Boolean)
        .map((paragraph, index) => {
          const isHeading = paragraph.length < 32 && !/[。.!?？]/.test(paragraph);

          return isHeading ? (
            <h3 key={`${paragraph}-${index}`}>{paragraph}</h3>
          ) : (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          );
        })}
    </div>
  );
}

export default function SymbolicInsightExperience({
  initialMode = "palm",
  initialLocale = "en",
}: {
  initialMode?: InsightMode;
  initialLocale?: ReportLocale;
}) {
  const [mode, setMode] = useState<InsightMode>(initialMode);
  const [locale, setLocale] = useState<ReportLocale>(initialLocale);
  const [status, setStatus] = useState<InsightStatus>("idle");
  const [result, setResult] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [educationOpen, setEducationOpen] = useState(false);
  const [palm, setPalm] = useState({
    handSide: getDefaultObservation("handSide", initialLocale),
    dominantHand: getDefaultObservation("dominantHand", initialLocale),
    lineClarity: getDefaultObservation("lineClarity", initialLocale),
    heartLine: getDefaultObservation("heartLine", initialLocale),
    headLine: getDefaultObservation("headLine", initialLocale),
    lifeLine: getDefaultObservation("lifeLine", initialLocale),
    fateLine: getDefaultObservation("fateLine", initialLocale),
    mounts: getDefaultObservation("mounts", initialLocale),
    notes: "",
  });
  const [face, setFace] = useState({
    faceShape: getDefaultObservation("faceShape", initialLocale),
    browEye: getDefaultObservation("browEye", initialLocale),
    nose: getDefaultObservation("nose", initialLocale),
    mouth: getDefaultObservation("mouth", initialLocale),
    jaw: getDefaultObservation("jaw", initialLocale),
    expression: getDefaultObservation("expression", initialLocale),
    notes: "",
  });
  const [oracle, setOracle] = useState({
    question: "",
    questionTime: formatDateTimeLocal(new Date()),
    birthDate: "",
    birthTime: "",
    domain: "general" as ReadingDomain,
  });
  const copy = insightCopy[locale];
  const activeModeCopy = copy.modes[mode];
  const oracleSeed = useMemo(
    () =>
      buildOracleSeed({
        question: oracle.question,
        questionTime: oracle.questionTime,
        birthDate: oracle.birthDate,
        domain: oracle.domain,
        locale,
      }),
    [locale, oracle.birthDate, oracle.domain, oracle.question, oracle.questionTime],
  );

  useEffect(() => {
    setDocumentLocale(locale);
    window.localStorage.setItem("destinypixel-locale", locale);
  }, [locale]);

  useEffect(() => {
    const storedLocale = normalizeReportLocale(
      window.localStorage.getItem("destinypixel-locale") ?? initialLocale,
    );

    if (storedLocale !== locale) {
      setLocale(storedLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function changeLocale(nextLocale: ReportLocale) {
    setLocale(nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("locale", nextLocale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function changeMode(nextMode: InsightMode) {
    setMode(nextMode);
    setResult("");
    setStatus("idle");
    setEducationOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    url.searchParams.set("locale", locale);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);

      return URL.createObjectURL(file);
    });
    event.target.value = "";
  }

  function clearPhoto() {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);

      return null;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setResult("");

    const payload =
      mode === "palm"
        ? { ...palm, hasPhotoReference: Boolean(previewUrl) }
        : mode === "face"
          ? { ...face, hasPhotoReference: Boolean(previewUrl) }
          : {
              ...oracle,
              oracleSeed,
            };

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, locale, payload }),
      });

      if (!response.ok || !response.body) throw new Error("Insight stream failed.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        setResult((current) => current + decoder.decode(value, { stream: true }));
      }

      setStatus("ready");
    } catch {
      setStatus("error");
      setResult(
        locale === "zh"
          ? "这次在线生成没有成功，但核心逻辑已经保留。请稍后再试，或缩短输入内容后重新生成。"
          : locale === "ru"
            ? "Онлайн-генерация не удалась. Попробуйте позже или сократите ввод."
            : "The online generation did not finish. Please try again later or shorten the input.",
      );
    }
  }

  return (
    <main className="white-site insight-site">
      <header className="white-header insight-header">
        <div className="white-container white-header__inner">
          <a className="white-brand" href="/">
            <span aria-hidden="true" />
            DestinyPixel
          </a>
          <nav className="white-nav" aria-label="Insight navigation">
            <a href="/">{copy.nav.home}</a>
            <a href={`/black?locale=${locale}`}>{copy.nav.black}</a>
          </nav>
          <div className="white-language" aria-label="Language selector">
            {reportLanguageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-active={locale === option.value}
                onClick={() => changeLocale(option.value)}
              >
                {languageLabel(option.value)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="insight-hero">
        <div className="white-ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="white-container insight-hero__grid">
          <div className="insight-hero__copy">
            <p className="white-kicker">
              <Sparkles size={14} aria-hidden="true" />
              {copy.hero.eyebrow}
            </p>
            <h1>{copy.hero.title}</h1>
            <p>{copy.hero.lead}</p>
          </div>

          <div className="insight-mode-grid" role="tablist" aria-label="Insight modes">
            {(Object.keys(copy.modes) as InsightMode[]).map((item) => {
              const itemCopy = copy.modes[item];
              const Icon =
                item === "palm" ? Hand : item === "face" ? ScanFace : MessageCircle;

              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={mode === item}
                  data-active={mode === item}
                  onClick={() => changeMode(item)}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>{itemCopy.title}</span>
                  <small>{itemCopy.short}</small>
                  <em>{itemCopy.cta}</em>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="insight-workspace">
        <div className="white-container insight-workspace__grid">
          <form className="insight-input-panel" onSubmit={handleSubmit}>
            <div className="insight-panel-heading">
              <p>{activeModeCopy.short}</p>
              <h2>{activeModeCopy.title}</h2>
              <span>{activeModeCopy.body}</span>
            </div>

            {(mode === "palm" || mode === "face") && (
              <PhotoGuide
                mode={mode}
                previewUrl={previewUrl}
                copy={copy}
                onPhoto={handlePhoto}
                onClear={clearPhoto}
              />
            )}

            {mode === "palm" && (
              <div className="insight-field-grid">
                <SelectField
                  label={copy.fields.handSide}
                  value={palm.handSide}
                  options={optionSets.handSide[locale]}
                  onChange={(value) => setPalm((current) => ({ ...current, handSide: value }))}
                />
                <SelectField
                  label={copy.fields.dominantHand}
                  value={palm.dominantHand}
                  options={optionSets.dominantHand[locale]}
                  onChange={(value) =>
                    setPalm((current) => ({ ...current, dominantHand: value }))
                  }
                />
                <SelectField
                  label={copy.fields.lineClarity}
                  value={palm.lineClarity}
                  options={optionSets.lineClarity[locale]}
                  onChange={(value) =>
                    setPalm((current) => ({ ...current, lineClarity: value }))
                  }
                />
                <SelectField
                  label={copy.fields.heartLine}
                  value={palm.heartLine}
                  options={optionSets.heartLine[locale]}
                  onChange={(value) => setPalm((current) => ({ ...current, heartLine: value }))}
                />
                <SelectField
                  label={copy.fields.headLine}
                  value={palm.headLine}
                  options={optionSets.headLine[locale]}
                  onChange={(value) => setPalm((current) => ({ ...current, headLine: value }))}
                />
                <SelectField
                  label={copy.fields.lifeLine}
                  value={palm.lifeLine}
                  options={optionSets.lifeLine[locale]}
                  onChange={(value) => setPalm((current) => ({ ...current, lifeLine: value }))}
                />
                <SelectField
                  label={copy.fields.fateLine}
                  value={palm.fateLine}
                  options={optionSets.fateLine[locale]}
                  onChange={(value) => setPalm((current) => ({ ...current, fateLine: value }))}
                />
                <SelectField
                  label={copy.fields.mounts}
                  value={palm.mounts}
                  options={optionSets.mounts[locale]}
                  onChange={(value) => setPalm((current) => ({ ...current, mounts: value }))}
                />
              </div>
            )}

            {mode === "face" && (
              <div className="insight-field-grid">
                <SelectField
                  label={copy.fields.faceShape}
                  value={face.faceShape}
                  options={optionSets.faceShape[locale]}
                  onChange={(value) => setFace((current) => ({ ...current, faceShape: value }))}
                />
                <SelectField
                  label={copy.fields.browEye}
                  value={face.browEye}
                  options={optionSets.browEye[locale]}
                  onChange={(value) => setFace((current) => ({ ...current, browEye: value }))}
                />
                <SelectField
                  label={copy.fields.nose}
                  value={face.nose}
                  options={optionSets.nose[locale]}
                  onChange={(value) => setFace((current) => ({ ...current, nose: value }))}
                />
                <SelectField
                  label={copy.fields.mouth}
                  value={face.mouth}
                  options={optionSets.mouth[locale]}
                  onChange={(value) => setFace((current) => ({ ...current, mouth: value }))}
                />
                <SelectField
                  label={copy.fields.jaw}
                  value={face.jaw}
                  options={optionSets.jaw[locale]}
                  onChange={(value) => setFace((current) => ({ ...current, jaw: value }))}
                />
                <SelectField
                  label={copy.fields.expression}
                  value={face.expression}
                  options={optionSets.expression[locale]}
                  onChange={(value) =>
                    setFace((current) => ({ ...current, expression: value }))
                  }
                />
              </div>
            )}

            {mode === "oracle" && (
              <>
                <div className="insight-oracle-grid">
                  <label className="insight-field insight-field--full">
                    <span>{copy.fields.question}</span>
                    <textarea
                      value={oracle.question}
                      placeholder={copy.fields.questionPlaceholder}
                      required
                      onChange={(event) =>
                        setOracle((current) => ({
                          ...current,
                          question: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="insight-field">
                    <span>{copy.fields.questionTime}</span>
                    <input
                      type="datetime-local"
                      value={oracle.questionTime}
                      required
                      onChange={(event) =>
                        setOracle((current) => ({
                          ...current,
                          questionTime: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <SelectField
                    label={copy.fields.domain}
                    value={oracle.domain}
                    options={optionSets.domain[locale]}
                    onChange={(value) =>
                      setOracle((current) => ({
                        ...current,
                        domain: value as ReadingDomain,
                      }))
                    }
                  />
                  <label className="insight-field">
                    <span>{copy.fields.birthDate}</span>
                    <input
                      type="date"
                      value={oracle.birthDate}
                      onChange={(event) =>
                        setOracle((current) => ({
                          ...current,
                          birthDate: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="insight-field">
                    <span>{copy.fields.birthTime}</span>
                    <input
                      type="time"
                      value={oracle.birthTime}
                      onChange={(event) =>
                        setOracle((current) => ({
                          ...current,
                          birthTime: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <aside className="insight-oracle-preview">
                  <div>
                    <p>
                      <Clock3 size={15} aria-hidden="true" />
                      {copy.oracle.seedTitle}
                    </p>
                    <span>
                      {copy.oracle.upper}: {oracleSeed.upperTrigram}
                    </span>
                    <span>
                      {copy.oracle.lower}: {oracleSeed.lowerTrigram}
                    </span>
                    <span>
                      {copy.oracle.moving}:{" "}
                      {oracleSeed.movingLines.length
                        ? oracleSeed.movingLines.join(", ")
                        : "0"}
                    </span>
                  </div>
                  <div className="insight-liuyao-lines" aria-hidden="true">
                    {[...oracleSeed.lines].reverse().map((line) => (
                      <span
                        key={line.index}
                        data-yang={line.yang}
                        data-moving={line.moving}
                      />
                    ))}
                  </div>
                  <div className="insight-tarot-strip">
                    <strong>{copy.oracle.tarot}</strong>
                    <span>{copy.oracle.situation}: {oracleSeed.tarot[0]}</span>
                    <span>{copy.oracle.obstacle}: {oracleSeed.tarot[1]}</span>
                    <span>{copy.oracle.advice}: {oracleSeed.tarot[2]}</span>
                  </div>
                </aside>
              </>
            )}

            {(mode === "palm" || mode === "face") && (
              <label className="insight-field insight-field--full">
                <span>{copy.fields.notes}</span>
                <textarea
                  value={mode === "palm" ? palm.notes : face.notes}
                  onChange={(event) =>
                    mode === "palm"
                      ? setPalm((current) => ({ ...current, notes: event.target.value }))
                      : setFace((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </label>
            )}

            <div className="insight-submit-row">
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="loading-icon" size={17} aria-hidden="true" />
                    {copy.buttons.generating}
                  </>
                ) : (
                  <>
                    <Sparkles size={17} aria-hidden="true" />
                    {copy.buttons.generate}
                  </>
                )}
              </button>
              <button
                type="button"
                className="insight-secondary-button"
                onClick={() => setEducationOpen(true)}
              >
                <BookOpenText size={17} aria-hidden="true" />
                {copy.buttons.learn}
              </button>
            </div>
          </form>

          <section className="insight-result-panel">
            <header>
              <div>
                <p>{copy.result.title}</p>
                <h2>{activeModeCopy.title}</h2>
              </div>
              <span data-status={status}>
                {status === "loading" ? (
                  <Loader2 className="loading-icon" size={15} aria-hidden="true" />
                ) : status === "ready" ? (
                  <Check size={15} aria-hidden="true" />
                ) : status === "error" ? (
                  <HelpCircle size={15} aria-hidden="true" />
                ) : (
                  <CircleDot size={15} aria-hidden="true" />
                )}
                {copy.result[status]}
              </span>
            </header>

            {result ? (
              <ResultText text={result} />
            ) : (
              <div className="insight-empty-state">
                <Sparkles size={26} aria-hidden="true" />
                <p>{copy.result.idle}</p>
              </div>
            )}

            <div className="insight-result-actions">
              <button type="button" onClick={() => setEducationOpen(true)}>
                <BookOpenText size={16} aria-hidden="true" />
                {copy.buttons.learn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult("");
                  setStatus("idle");
                }}
              >
                <X size={16} aria-hidden="true" />
                {copy.buttons.clear}
              </button>
            </div>
          </section>
        </div>
      </section>

      {educationOpen && (
        <div className="insight-modal" role="dialog" aria-modal="true">
          <div className="insight-modal__panel">
            <button
              type="button"
              className="insight-modal__close"
              onClick={() => setEducationOpen(false)}
              aria-label="Close"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <p>
              <BookOpenText size={16} aria-hidden="true" />
              DestinyPixel Notes
            </p>
            <h2>{copy.education[mode].title}</h2>
            {copy.education[mode].body.map((paragraph) => (
              <span key={paragraph}>{paragraph}</span>
            ))}
          </div>
        </div>
      )}

      <footer className="white-footer">
        <div className="white-container">
          <span>DestinyPixel · Insight Studios</span>
          <span>
            <CalendarDays size={13} aria-hidden="true" />
            2026
          </span>
        </div>
      </footer>
    </main>
  );
}

export { normalizeInsightMode };
