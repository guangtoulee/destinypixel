export type DirectoryLocale = "en" | "zh";
export type ToolGroup = "birth" | "insight" | "elements";
type ToolCopy = { name: string; description: string; prepare: string; result: string };
export type DirectoryTool = { key: string; path: string; group: ToolGroup; localized: boolean; copy: Record<DirectoryLocale, ToolCopy> };

// DestinyPixel core: birth symbolism, divination, observation and five-element design.
export const directoryTools: DirectoryTool[] = [
  { key: "birth-map", path: "/", group: "birth", localized: true, copy: {
    en: { name: "Birth map", description: "Explore a symbolic reading combining Bazi, five elements and astrology.", prepare: "Name, birth date, time, city and gender option", result: "A personal reading with archetypes and reflection prompts" },
    zh: { name: "出生能量图", description: "把八字、五行与占星放在一起，阅读一份象征性的个人解读。", prepare: "姓名、出生日期、时间、城市及性别选项", result: "包含原型意象与自我观察提示的个人报告" },
  } },
  { key: "tuteng", path: "/tuteng", group: "birth", localized: true, copy: {
    en: { name: "Birth Totem", description: "Turn Four Pillars and five-element relationships into an interactive geometric design.", prepare: "Birth date, time, a listed city and gender option", result: "An explorable totem with PNG and SVG export" },
    zh: { name: "本命灵构", description: "把四柱与五行关系转成可点选、可查看解释的几何图腾。", prepare: "出生日期、时间、列表中的城市及性别选项", result: "交互图腾，可导出 PNG 和 SVG" },
  } },
  { key: "day-pillar", path: "/day-pillar", group: "birth", localized: true, copy: {
    en: { name: "Free Day Pillar card", description: "Explore a symbolic card from your birthday, without creating an account.", prepare: "Gregorian birth date only; no login needed", result: "A provisional day pillar using a midnight day boundary; add birth time and city for a full birth map" },
    zh: { name: "免费日柱卡", description: "只用公历生日，先认识一张日柱意象卡，无需注册登录。", prepare: "仅需公历生日，无需登录", result: "按公历日期、午夜换日初算的日柱；补充出生时间与城市后，可校准完整出生图谱" },
  } },
  { key: "oracle", path: "/oracle", group: "insight", localized: true, copy: {
    en: { name: "Question Oracle", description: "Use Tarot and hexagram-inspired imagery to reflect on one situation.", prepare: "One specific question, its time and topic", result: "A symbolic reading focused on that question" },
    zh: { name: "一事一问", description: "用塔罗与卦象启发的意象，为眼前的一件事提供另一种观察角度。", prepare: "一个具体问题、提问时间和主题", result: "围绕这件事的象征性解读" },
  } },
  { key: "sticks", path: "/sticks", group: "insight", localized: true, copy: {
    en: { name: "Temple sticks", description: "Draw a symbolic stick or look up the number of one you have already drawn.", prepare: "A tradition; optionally a question or stick number", result: "A stick text, with optional AI interpretation" },
    zh: { name: "灵签解读", description: "选择签种在线抽签，也可以查询已经在线下抽到的签号。", prepare: "选择签种，可填写问题或已有签号", result: "签文，以及可选的 AI 问事解读" },
  } },
  { key: "palm", path: "/palm", group: "insight", localized: true, copy: {
    en: { name: "Palm studio", description: "Explore palm symbols from your selected observations. An optional photo serves as a local reference.", prepare: "Palm details and hand side; optional reference photo", result: "A reflective text reading, not a diagnosis" },
    zh: { name: "手相观察室", description: "根据自己确认的掌纹细节进行象征解读，可选照片仅作本地观察参考。", prepare: "左右手、掌纹细节，可选本地参考照片", result: "用于自我观察的文字解读，不作诊断" },
  } },
  { key: "face", path: "/face", group: "insight", localized: true, copy: {
    en: { name: "Face studio", description: "Reflect on self-described facial details. An optional photo serves as a local reference.", prepare: "Facial observations; optional reference portrait", result: "A text reflection, not a personality assessment" },
    zh: { name: "面相观察室", description: "根据自己描述的表情与面部细节进行象征解读，可选照片仅作本地参考。", prepare: "面部观察信息，可选本地参考照片", result: "文字观察提示，不作人格测评" },
  } },
  { key: "atelier", path: "/atelier", group: "elements", localized: true, copy: {
    en: { name: "Crystal bracelet atelier", description: "Try gemstone colors and bead combinations inspired by the five elements.", prepare: "An element focus and your design preferences", result: "A bracelet design, symbolic color balance and downloadable image" },
    zh: { name: "灵石手串工坊", description: "以五行配色为灵感，尝试宝石颜色、珠径和不同搭配。", prepare: "希望关注的五行与个人设计偏好", result: "手串设计、象征性配色分析与可下载图片" },
  } },

];

export function directoryToolHref(tool: DirectoryTool, locale: DirectoryLocale) {
  const path = tool.localized && locale === "zh" ? `${tool.path}?locale=zh` : tool.path;
  return tool.key === "birth-map" ? `${path}#report` : path;
}
