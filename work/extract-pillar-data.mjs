import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const source =
  "/Users/lee/.codex/attachments/b6631547-5b93-4b07-80e1-d4e05d97696c/pasted-text.txt";
const output = path.resolve("lib/pillars.ts");
const html = fs.readFileSync(source, "utf8");
const start = html.indexOf("const pillarsDB = ");
const end = html.indexOf("// --- 应用逻辑 ---");
const context = {};

vm.runInNewContext(`${html.slice(start, end)}\nthis.db = pillarsDB;`, context);

context.db["丁亥"] = {
  name: { en: "The Sparkler Boar", cn: "星火灵猪" },
  essence: {
    en: "A warm spark held inside deep night water. You are intuitive, loyal, and quietly radiant, with a gift for finding hope in emotionally complex places.",
    cn: "深夜水面上被小心守护的一点星火。你直觉敏锐、重情而安静发光，擅长在复杂情绪中找到希望。",
  },
  career: {
    style: {
      en: "The Empathic Illuminator. You notice what others miss and turn subtle emotional signals into thoughtful creative or strategic work.",
      cn: "共情型点灯者。你能觉察他人忽略的细微信号，并把它转化为有温度的创作或策略。",
    },
    fields: {
      en: "Psychology, Film, Writing, Hospitality, Brand Storytelling, Healing Arts.",
      cn: "心理咨询、影视写作、酒店服务、品牌叙事、疗愈艺术。",
    },
    wealth: {
      en: "Trust Wealth. Opportunity grows through emotional intelligence, reputation, and relationships built slowly over time.",
      cn: "信任之财。机会来自情绪洞察、长期声誉，以及缓慢建立起来的深度关系。",
    },
  },
  love: {
    mode: {
      en: "The Gentle Devotee. You love through tenderness, memory, and a private world shared with one trusted person.",
      cn: "温柔的守望者。你用体贴、记忆和只与所爱之人共享的私密世界表达感情。",
    },
    challenge: {
      en: "Hidden Overwhelm. You can absorb too much, retreat without explanation, and expect others to sense needs you have not voiced.",
      cn: "隐性的过载。你容易吸收过多情绪、无声退避，并期待对方读懂你尚未说出的需要。",
    },
  },
  growth: {
    en: "Visible Warmth. You grow by naming your needs clearly and allowing your small, steady light to be seen.",
    cn: "让温度被看见。清楚表达需要，并允许自己稳定而细小的光被他人看见。",
  },
  health: {
    en: "Focus: Circulation & Rest. Protect sleep and warmth when emotional demands are high.",
    cn: "关注循环与睡眠。情绪负荷较高时尤其需要保暖并保护休息。",
  },
  link: "#",
};

const stems = "甲乙丙丁戊己庚辛壬癸".split("");
const branches = "子丑寅卯辰巳午未申酉戌亥".split("");
const cycle = Array.from(
  { length: 60 },
  (_, index) => stems[index % 10] + branches[index % 12],
);
const missing = cycle.filter((pillar) => !context.db[pillar]);

if (missing.length > 0) {
  throw new Error(`Missing pillar data: ${missing.join(", ")}`);
}

const header = `export type Locale = "en" | "cn";

export type LocalizedText = Record<Locale, string>;

export type PillarProfile = {
  name: LocalizedText;
  essence: LocalizedText;
  career: {
    style: LocalizedText;
    fields: LocalizedText;
    wealth: LocalizedText;
  };
  love: {
    mode: LocalizedText;
    challenge: LocalizedText;
  };
  growth: LocalizedText;
  health?: LocalizedText;
  link?: string;
};

`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  `${header}export const pillarsDB = ${JSON.stringify(
    context.db,
    null,
    2,
  )} as const satisfies Record<string, PillarProfile>;\n`,
);

console.log(`Created ${Object.keys(context.db).length} pillar profiles in ${output}`);
