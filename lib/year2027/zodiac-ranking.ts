export type ZodiacRankingLang = "zh" | "en";
export const zodiacRankingCategories = ["overall", "career", "love", "wealth"] as const;
export type ZodiacRankingCategory = typeof zodiacRankingCategories[number];
type Copy = Record<ZodiacRankingLang, string>;
type StarValue = 1 | 2 | 3 | 4 | 5;
export type ZodiacRating = { stars: StarValue; note: Copy };
export type ZodiacRankingEntry = {
  id: string; branch: string; name: Copy; relation: Copy; basis: Copy;
  ratings: Record<ZodiacRankingCategory, ZodiacRating>;
};
const rating = (stars: StarValue, zh: string, en: string): ZodiacRating => ({ stars, note: { zh, en } });

/** Original editorial prompts, not a traditional algorithm, probability or personal-chart result. */
export const zodiacRankingEntries: ZodiacRankingEntry[] = [
  {
    id: "rat", branch: "子", name: { zh: "鼠", en: "Rat" },
    relation: { zh: "子未害", en: "Zi–Wei harm" },
    basis: { zh: "把“害”转成核对误会的提醒；不推断有人加害。", en: "We use “harm” as a prompt to check misunderstandings, never as evidence that someone intends harm." },
    ratings: { overall: rating(3, "先确认彼此的理解", "Check that you mean the same thing"), career: rating(3, "把需求写下来", "Put expectations in writing"), love: rating(2, "别让猜测替代沟通", "Ask instead of assuming"), wealth: rating(3, "核对共同开支", "Review shared expenses") },
  },
  {
    id: "ox", branch: "丑", name: { zh: "牛", en: "Ox" },
    relation: { zh: "丑未冲 · 三刑口径另看", en: "Chou–Wei clash · punishment caveat" },
    basis: { zh: "以“冲”提示安排调整空间；丑未戌三刑须说明条件与流派，不能只凭属牛下结论。", en: "“Clash” prompts room for adjustments. Chou–Wei–Xu punishment depends on the reading convention and chart context; Ox alone settles nothing." },
    ratings: { overall: rating(3, "给变化留点余地", "Leave room for change"), career: rating(2, "先谈清职责变化", "Clarify changing responsibilities"), love: rating(3, "一起商量新节奏", "Agree on a new rhythm"), wealth: rating(3, "预算留有缓冲", "Keep a budget buffer") },
  },
  {
    id: "tiger", branch: "寅", name: { zh: "虎", en: "Tiger" },
    relation: { zh: "此简表无直接关系标签", en: "No direct label in this short list" },
    basis: { zh: "未见本表所列与未的直接关系，不额外加减分；建议是现代日常练习。", en: "No direct relationship with Wei in this limited list earns a bonus or penalty. These are original everyday exercises." },
    ratings: { overall: rating(3, "选一件事做扎实", "Follow through on one priority"), career: rating(3, "明确交付的标准", "Define what done looks like"), love: rating(3, "给陪伴留时间", "Make time to be present"), wealth: rating(3, "回看固定开销", "Review recurring costs") },
  },
  {
    id: "rabbit", branch: "卯", name: { zh: "兔", en: "Rabbit" },
    relation: { zh: "亥卯未三合中的卯未", en: "Mao–Wei within Hai–Mao–Wei" },
    basis: { zh: "借三合组的联系鼓励合作；仅有卯未不等于三支齐全，更不自动化局。", en: "The three-harmony grouping inspires collaboration. Mao and Wei alone are not the complete three-branch set or an automatic transformation." },
    ratings: { overall: rating(4, "试着把资源连起来", "Connect people and resources"), career: rating(4, "主动寻找合作者", "Reach out to a collaborator"), love: rating(4, "安排一次共同体验", "Plan a shared experience"), wealth: rating(3, "合作前讲清分配", "Agree on terms before teaming up") },
  },
  {
    id: "dragon", branch: "辰", name: { zh: "龙", en: "Dragon" },
    relation: { zh: "此简表无直接关系标签", en: "No direct label in this short list" },
    basis: { zh: "没有本表列出的直接关系，不代表没有机遇或挑战；维持中性编辑星级。", en: "The absence of a direct label says nothing about opportunities or difficulties. We keep a neutral editorial rating." },
    ratings: { overall: rating(3, "让计划落到日程上", "Give your plan a place in the diary"), career: rating(3, "拆小一个大目标", "Break down one big goal"), love: rating(3, "倾听具体的需要", "Listen for specific needs"), wealth: rating(3, "定期盘点收支", "Check income and spending") },
  },
  {
    id: "snake", branch: "巳", name: { zh: "蛇", en: "Snake" },
    relation: { zh: "此简表无直接关系标签", en: "No direct label in this short list" },
    basis: { zh: "本表只看与未的指定关系，不把其他组合或神煞偷加成分数。", en: "This list considers only the stated relationships with Wei. It does not quietly add other groupings or symbolic stars to the score." },
    ratings: { overall: rating(3, "把观察变成小行动", "Turn an observation into a small action"), career: rating(3, "用反馈修正方案", "Use feedback to revise a plan"), love: rating(3, "把感谢说出来", "Say what you appreciate"), wealth: rating(3, "看清条款再决定", "Read the terms before deciding") },
  },
  {
    id: "horse", branch: "午", name: { zh: "马", en: "Horse" },
    relation: { zh: "午未六合", en: "Wu–Wei six harmony" },
    basis: { zh: "以六合的联结意象鼓励主动协作；“合”不保证事情顺利，也不等于合化成立。", en: "The pairing in six harmony inspires active cooperation. Harmony does not guarantee an easy outcome or establish a transformation." },
    ratings: { overall: rating(4, "主动建立有用联结", "Build a useful connection"), career: rating(4, "约一次务实合作", "Propose a practical collaboration"), love: rating(4, "把支持变成行动", "Show support through action"), wealth: rating(3, "人情与账目分清", "Keep generosity and accounts clear") },
  },
  {
    id: "goat", branch: "未", name: { zh: "羊", en: "Goat" },
    relation: { zh: "值太岁 · 本命年", en: "Same branch · ben ming nian" },
    basis: { zh: "年支同为未，只表示重复；本命年不扣分。未不在辰午酉亥的常见自刑表中。", en: "A repeated Wei year branch is not a penalty. Wei is not in the common Chen–Wu–You–Hai list of self-punishment branches." },
    ratings: { overall: rating(3, "给自己一次年度复盘", "Make time for a personal review"), career: rating(3, "选择值得坚持的方向", "Choose what deserves your effort"), love: rating(3, "说清自己的边界", "Express your boundaries"), wealth: rating(3, "为自己的目标留预算", "Budget for a goal of your own") },
  },
  {
    id: "monkey", branch: "申", name: { zh: "猴", en: "Monkey" },
    relation: { zh: "此简表无直接关系标签", en: "No direct label in this short list" },
    basis: { zh: "不靠生肖补写个人运势；中性星级配合可执行的小练习。", en: "A year animal cannot fill in a personal forecast. Neutral stars accompany small, practical exercises." },
    ratings: { overall: rating(3, "少开一条战线", "Keep fewer projects open"), career: rating(3, "先完成再扩张", "Finish before expanding"), love: rating(3, "约定专心相处的时间", "Agree on time without distractions"), wealth: rating(3, "整理零散订阅", "Tidy up unused subscriptions") },
  },
  {
    id: "rooster", branch: "酉", name: { zh: "鸡", en: "Rooster" },
    relation: { zh: "此简表无直接关系标签", en: "No direct label in this short list" },
    basis: { zh: "本表没有直接关系标签，因此不编造额外吉凶依据。", en: "With no direct label in this list, we do not invent an extra auspicious or inauspicious explanation." },
    ratings: { overall: rating(3, "为重要的事留白", "Make room for what matters"), career: rating(3, "把流程做得更清楚", "Make a process clearer"), love: rating(3, "建议之前先听完", "Listen before offering solutions"), wealth: rating(3, "设一个可回看的目标", "Set a goal you can review") },
  },
  {
    id: "dog", branch: "戌", name: { zh: "狗", en: "Dog" },
    relation: { zh: "未戌破 · 三刑口径另看", en: "Wei–Xu break · punishment caveat" },
    basis: { zh: "“破”借作检修约定的提醒；刑的组合条件另见科普，不能把标签数当成坏事次数。", en: "“Break” becomes a prompt to review agreements. Punishment requires its own context; more labels do not mean more bad events." },
    ratings: { overall: rating(3, "检查约定是否仍合用", "Check whether an agreement still fits"), career: rating(3, "提前核对协作接口", "Review team handovers early"), love: rating(3, "温和重谈旧约定", "Revisit an old agreement kindly"), wealth: rating(2, "支出承诺先核实", "Check spending commitments first") },
  },
  {
    id: "pig", branch: "亥", name: { zh: "猪", en: "Pig" },
    relation: { zh: "亥卯未三合中的亥未", en: "Hai–Wei within Hai–Mao–Wei" },
    basis: { zh: "以同属三合组的联系鼓励资源交流；亥未两支不等于完整三合或自动化局。", en: "Membership of the three-harmony grouping inspires an exchange of resources. Hai and Wei alone are not a complete grouping or automatic transformation." },
    ratings: { overall: rating(4, "把好想法拿来交流", "Share a useful idea"), career: rating(4, "互通资源与经验", "Exchange resources and experience"), love: rating(4, "一起做件小事", "Do something small together"), wealth: rating(3, "热心也要有预算", "Keep generosity within a budget") },
  },
];

/** Competition ranks retain equal places, with traditional cycle order as a stable display order. */
export function rankedZodiacEntries(category: ZodiacRankingCategory) {
  const sorted = [...zodiacRankingEntries].sort((a, b) => b.ratings[category].stars - a.ratings[category].stars);
  return sorted.map((entry, index) => ({
    ...entry,
    rank: sorted.findIndex(other => other.ratings[category].stars === entry.ratings[category].stars) + 1,
    tied: sorted.filter(other => other.ratings[category].stars === entry.ratings[category].stars).length > 1,
    order: index + 1,
  }));
}
