export type DirectoryLocale = "en" | "zh";
export type ToolGroup = "discovery" | "creation" | "learning";
type ToolCopy = { name: string; description: string; prepare: string; result: string };
export type DirectoryTool = { key: string; path: string; group: ToolGroup; localized: boolean; copy: Record<DirectoryLocale, ToolCopy> };

// Public entry points only: private workspaces and alternate homepage themes are omitted.
export const directoryTools: DirectoryTool[] = [
  { key: "birth-map", path: "/", group: "discovery", localized: true, copy: {
    en: { name: "Birth map", description: "Explore a symbolic reading combining Bazi, five elements and astrology.", prepare: "Name, birth date, time, city and gender option", result: "A personal reading with archetypes and reflection prompts" },
    zh: { name: "出生能量图", description: "把八字、五行与占星放在一起，阅读一份象征性的个人解读。", prepare: "姓名、出生日期、时间、城市及性别选项", result: "包含原型意象与自我观察提示的个人报告" },
  } },
  { key: "tuteng", path: "/tuteng", group: "discovery", localized: true, copy: {
    en: { name: "Birth Totem", description: "Turn Four Pillars and five-element relationships into an interactive geometric design.", prepare: "Birth date, time, a listed city and gender option", result: "An explorable totem with PNG and SVG export" },
    zh: { name: "本命灵构", description: "把四柱与五行关系转成可点选、可查看解释的几何图腾。", prepare: "出生日期、时间、列表中的城市及性别选项", result: "交互图腾，可导出 PNG 和 SVG" },
  } },
  { key: "oracle", path: "/oracle", group: "discovery", localized: true, copy: {
    en: { name: "Question Oracle", description: "Use Tarot and hexagram-inspired imagery to reflect on one situation.", prepare: "One specific question, its time and topic", result: "A symbolic reading focused on that question" },
    zh: { name: "一事一问", description: "用塔罗与卦象启发的意象，为眼前的一件事提供另一种观察角度。", prepare: "一个具体问题、提问时间和主题", result: "围绕这件事的象征性解读" },
  } },
  { key: "sticks", path: "/sticks", group: "discovery", localized: true, copy: {
    en: { name: "Temple sticks", description: "Draw a symbolic stick or look up the number of one you have already drawn.", prepare: "A tradition; optionally a question or stick number", result: "A stick text, with optional AI interpretation" },
    zh: { name: "灵签解读", description: "选择签种在线抽签，也可以查询已经在线下抽到的签号。", prepare: "选择签种，可填写问题或已有签号", result: "签文，以及可选的 AI 问事解读" },
  } },
  { key: "palm", path: "/palm", group: "discovery", localized: true, copy: {
    en: { name: "Palm studio", description: "Explore palm symbols from your selected observations. An optional photo serves as a local reference.", prepare: "Palm details and hand side; optional reference photo", result: "A reflective text reading, not a diagnosis" },
    zh: { name: "手相观察室", description: "根据自己确认的掌纹细节进行象征解读，可选照片仅作本地观察参考。", prepare: "左右手、掌纹细节，可选本地参考照片", result: "用于自我观察的文字解读，不作诊断" },
  } },
  { key: "face", path: "/face", group: "discovery", localized: true, copy: {
    en: { name: "Face studio", description: "Reflect on self-described facial details. An optional photo serves as a local reference.", prepare: "Facial observations; optional reference portrait", result: "A text reflection, not a personality assessment" },
    zh: { name: "面相观察室", description: "根据自己描述的表情与面部细节进行象征解读，可选照片仅作本地参考。", prepare: "面部观察信息，可选本地参考照片", result: "文字观察提示，不作人格测评" },
  } },
  { key: "atelier", path: "/atelier", group: "discovery", localized: true, copy: {
    en: { name: "Crystal bracelet atelier", description: "Try gemstone colors and bead combinations inspired by the five elements.", prepare: "An element focus and your design preferences", result: "An on-screen bracelet design and symbolic color balance" },
    zh: { name: "灵石手串工坊", description: "以五行配色为灵感，尝试宝石颜色、珠径和不同搭配。", prepare: "希望关注的五行与个人设计偏好", result: "屏幕上的手串设计与象征性配色分析" },
  } },
  { key: "prompt", path: "/prompt", group: "creation", localized: false, copy: {
    en: { name: "Prompt Radar", description: "Browse image and video examples, expand an idea or analyze a reference image.", prepare: "A search term, rough prompt or reference image", result: "Examples and copyable prompts for your chosen generator" },
    zh: { name: "Prompt 雷达", description: "浏览图片与视频案例、扩写想法，或从参考图中提取提示词。", prepare: "搜索词、初步想法或参考图片", result: "可参考的案例与可复制到生成工具的提示词" },
  } },
  { key: "juben", path: "/juben", group: "creation", localized: false, copy: {
    en: { name: "Short drama script studio", description: "Develop an idea or source text into episodes, scenes and production prompts.", prepare: "Story material, audience, episode count and duration", result: "Script material, shot lists and prompt text to copy or export" },
    zh: { name: "短剧剧本工作台", description: "从创意或原稿出发，梳理分集、场次与后续制作提示词。", prepare: "故事素材、目标观众、集数与单集时长", result: "可复制和导出的剧本、镜头表与提示词" },
  } },
  { key: "daoyan", path: "/daoyan", group: "creation", localized: false, copy: {
    en: { name: "Director workspace", description: "Plan a series, lock character and scene descriptions, then develop each episode.", prepare: "Story, visual style, format and production constraints", result: "Episode direction, continuity notes and generation prompts" },
    zh: { name: "导演工作台", description: "先建立项目蓝图、锁定人物与场景描述，再展开单集导演方案。", prepare: "故事、视觉风格、画幅与制作约束", result: "单集导演方案、连续性说明与生成提示词" },
  } },
  { key: "english", path: "/english", group: "learning", localized: false, copy: {
    en: { name: "Bright Steps English", description: "Work through an English starting assessment, textbook units and practice activities.", prepare: "Choose a textbook or begin the starting assessment", result: "Practice feedback and a learning record in this browser" },
    zh: { name: "Bright Steps 英语学习", description: "从起点测评、教材单元和练习活动中，选择适合自己的学习入口。", prepare: "选择教材，或先完成起点测评", result: "练习反馈与保存在当前浏览器的学习记录" },
  } },
  { key: "danci", path: "/danci", group: "learning", localized: false, copy: {
    en: { name: "Recall Base vocabulary", description: "Practice middle-school English words through recall, spelling, listening and review.", prepare: "Choose a textbook level and training difficulty", result: "Word-level feedback and a review queue" },
    zh: { name: "Recall Base 单词训练", description: "用主动回忆、拼写、听写与复习练习初中英语单词。", prepare: "选择教材阶段与训练难度", result: "逐词反馈与待复习词队列" },
  } },
];

export function directoryToolHref(tool: DirectoryTool, locale: DirectoryLocale) {
  const path = tool.localized && locale === "zh" ? `${tool.path}?locale=zh` : tool.path;
  return tool.key === "birth-map" ? `${path}#report` : path;
}
