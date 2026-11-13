import type { ReportLocale } from "@/lib/report-i18n";
import type { TarotLearningArticle } from "./content";

export function normalizeTarotExternalUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  return url.replace(/^https?:\/\/original\.sacred-texts\.com\//i, "https://sacred-texts.com/");
}

function normalizeMarkdownLinks(markdown: string): string {
  return markdown.replace(/https?:\/\/original\.sacred-texts\.com\//gi, "https://sacred-texts.com/");
}

/**
 * Clean up robotic multi-bot append patterns ("Pollack 补一条（印刷／PDF 96）。这是作者解释，补充而不覆盖 Waite")
 * across all 312 Tarot pages while preserving genuine scholarly citations and section anchors.
 */
function smoothEditorialSeams(markdown: string): string {
  return normalizeMarkdownLinks(markdown)
    .replace(/Pollack\s*只?补(?:了)?一[条层]：/g, "现代塔罗学者 Rachel Pollack 进一步指出：")
    .replace(/Pollack\s*也写到，/g, "在现代象征解读中，Rachel Pollack 观察到：")
    .replace(/（《78度的智慧》印刷／PDF\s*([0-9–-]+)）/g, "（参阅《78度的智慧》，pp. $1）")
    .replace(/（([0-9–-]+)）。这是作者(?:解释|象征)，[^。\n]*。/g, "（pp. $1）。")
    .replace(/这是作者(?:解释|象征)，补充[^。\n]*Waite[^。\n]*。/g, "")
    .replace(/这是作者解释，不能覆盖\s*Waite。/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type SectionPatch = Record<string, { title?: string; bodyMarkdown: string }>;

const zhEditions: Record<
  string,
  {
    title?: string;
    hook?: string;
    quickTake?: { upright: string; reversed: string };
    sections: SectionPatch;
  }
> = {
  chariot: {
    title: "战车（The Chariot）牌义：当没有缰绳时，如何让分歧的力量同向而行",
    hook: "高耸的城垣退在身后，车前黑白两只斯芬克斯静卧在侧，而披甲御者的手中甚至没有一根缰绳——真正推动战车向前的，从来不只是蛮力。",
    quickTake: {
      upright: "锚定主航向，协调内在与外部的分歧节奏，以清晰边界稳步推进。",
      reversed: "用力过猛却方向失焦；先停下校准冲突的目标与消耗，再重新启程。",
    },
    sections: {
      "section-01": {
        title: "画面细读：静卧的斯芬克斯与消失的缰绳",
        bodyMarkdown:
          "披甲的御者笔直伫立在战车中央，头顶八角星冠与缀满星辰的蓝布华盖，双肩承托月牙面饰，胸前佩着象征秩序的方形胸牌。他左手轻扶车栏，右手握持权杖——值得注意的是，画面中没有尘土飞扬，车轮尚未疾驰，车前黑白两只斯芬克斯也只是并排静卧，连头与躯干的朝向都略有分歧。\n\n[查看本篇核对的 RWS 原图](https://commons.wikimedia.org/wiki/File:RWS_Tarot_07_Chariot.jpg)\n\n这幅构图最耐人寻味的地方，在于「没有缰绳」。如果把领导与行动仅仅理解成死死拽紧绳索，就错过了 Pamela Colman Smith 留下的视觉线索：当两股习性相反的力量（快与慢、理性与直觉、独行与协作）同时存在时，真正让车轮转动的，是对终点的清晰共识与节奏编排。身后的护城河与城墙标志着你已离开熟悉的舒适区，而在启程与抵达之间，比速度更关键的是掌舵的定力。\n\nRachel Pollack 在《78度的智慧》（pp. 92–93）中也曾提醒：御者手中的权杖呼应着[魔术师](/journal/tarot-magician?locale=zh)的意志，但石质般的车身几乎与他融为一体——当一个人要求周遭一切绝对服从时，高度集中的意志也可能变成僵硬的壳。",
      },
      "section-02": {
        title: "典籍溯源：外在凯旋与内在洞察的边界",
        bodyMarkdown:
          "A. E. Waite 在《塔罗图解之钥》（1911）中将战车与智力、心智及外在领域的凯旋相连，但他专门写下一条冷静的限定：这位御者赢得了世俗与理智层面的征服，却未必已经通达内在的精神奥秘。换言之，拿下一场硬仗、推进一个项目，并不等于所有深层矛盾都已自然消融。\n\n有趣的是，Waite 原文将御者手中器物写作「出鞘之剑」，而传世 RWS 彩绘原版画的却是权杖。我们在阅读时保留这一图文差异——让眼睛诚实面对牌面，也让历史文本回到它原本的语境。\n\n[阅读 Waite《The Pictorial Key to the Tarot》战车原文](https://sacred-texts.com/tarot/pkt/pktar07.htm)",
      },
      "section-03": {
        title: "正位解读：在分歧中建立行进秩序",
        bodyMarkdown:
          "抽到战车正位，通常意味着你已经具备起步的动能与决心，眼下真正需要建立的是**先后次序与行进纪律**。就像车前朝向略异的黑白斯芬克斯，生活中很少有「所有条件完美一致」的时刻；承认不同需求同时合理，给它们排定主次与时间窗，整辆车才会真正往前走。\n\n稳步推进同样包含中途校准：核对阶段反馈、补充体力与资源、在弯道前主动降速。真正的坚定不是蒙头猛冲，而是清楚自己为何出发，同时留出修正航线的余地。",
      },
      "section-04": {
        title: "逆位解读：当速度掩盖了方向的偏离",
        bodyMarkdown:
          "逆位的战车往往指向「推进失衡」：要么多方各自使劲、日程与精力互相拉扯；要么陷入「不能输、不能停」的紧绷姿态，表面日程排得极满，实际上却离核心目标越来越远。\n\n此时最有效的动作不是再踩一脚油门，而是暂时靠边核查：把真实目的、可用资源和责任边界拆开看，找出哪两项要求正在正面冲突。如果原先设定的终点已经不再契合现状，主动调转车头本身就是一种成熟的掌控。",
      },
      "depth-sequence": {
        title: "延伸对读：受控的冲突与真正的安顿",
        bodyMarkdown:
          "为什么第 VII 号「战车」之后，紧接着第 VIII 号「[力量](/journal/tarot-strength?locale=zh#depth-sequence)」？战车擅长在分歧尚存时用目标与纪律把局面稳住——冲突被收束在轨道之内，但未必真正消解；而下一张「力量」则卸下盔甲，转而面对内在情绪与生命本能的柔和引导。两张牌对照着读，能帮你分辨此刻究竟该「立规矩推事情」，还是先「停下来接住情绪」。",
      },
    },
  },
  strength: {
    title: "力量（Strength）牌义：卸下盔甲之后，如何把劲用在稳住自己上",
    hook: "没有盔甲，也没有刀剑。在开阔的金色原野上，真正有分量的人，往往能把动作放得很轻。",
    quickTake: {
      upright: "不靠压制与硬撑，在看清情绪起伏后依然温和而笃定地守住边界。",
      reversed: "留意「紧绷控制」与「过度透支」两个极端，先卸下自我苛责再恢复行动力。",
    },
    sections: {
      "section-01": {
        title: "画面细读：轻柔的双手与鲜活的狮子",
        bodyMarkdown:
          "明朗的金黄色天幕下，身着白袍的女子俯身靠近一头橙红色的雄狮。她头戴花冠，腰间缠绕的花链自然垂落到狮鬃之侧，头顶悬浮着横向的无限符号「∞」。她一手轻抚狮子的上颚，一手托住下颚，既没有挥舞武器，也没有紧绷对抗；雄狮昂首吐舌，四爪稳稳踏地，尾巴收在后腿之间，远方则是绿野与宁静的蓝色山峦。\n\n[查看本篇核对的 RWS 原图](https://commons.wikimedia.org/wiki/File:RWS_Tarot_08_Strength.jpg)\n\n如果把这张牌与前一张披坚执锐的[战车](/journal/tarot-chariot?locale=zh)并排摆放，反差会格外鲜明：这里没有城墙与护甲，双手直接贴近最炽烈的生命本能。在日常情境中，这并不是要求你在受到伤害时一味忍让，而是提醒你——当愤怒、恐惧或急躁翻涌上来时，先认出这股能量正在发生，暂停那句冲口而出的气话，再用清晰而平静的句子把边界立住。",
      },
      "section-02": {
        title: "典籍溯源：温厚的坚毅而非盲目逞强",
        bodyMarkdown:
          "A. E. Waite 在《塔罗图解之钥》中将牌面动作描述为「合拢狮口」，借花链象征更高秩序的感召，并特意把这种内在定力与流于表面的日常逞强区分开来。因此，若把「力量」简单等同于励志口号式的「只要相信自己就一定赢」，反而会漏掉牌面那种沉静、节制的底色。\n\n[阅读 Waite《The Pictorial Key to the Tarot》力量原文](https://sacred-texts.com/tarot/pkt/pktar08.htm)",
      },
      "section-03": {
        title: "正位解读：温和而有棱角的行动力",
        bodyMarkdown:
          "力量正位代表一种「带着觉察的笃定」：局面未必轻松，甚至心里仍然会紧张，但你没有被本能反应推着跑。愤怒往往提示某条重要边界被触碰，担忧则说明你真心在乎眼前的事——先听懂情绪传递的信号，再选择回应的时机与分寸，力气才算用在了刀刃上。\n\n温和从来不等于退让。平静而明确地说出「这件事超出我的承受范围」，或是坦诚请求支援、缩减不必要的负荷，都是极具分量的自我掌舵。",
      },
      "section-04": {
        title: "逆位解读：识别硬撑与失控的两端",
        bodyMarkdown:
          "逆位时不妨诚实检视天平的两端：一端是因为害怕失控而不断催促、苛责自己或他人，试图靠紧绷维持表面秩序；另一端则是长期隐忍透支之后，连表达真实需求的力气都被耗尽。与其给自己贴上「不够坚强」的标签，不如先找出真正让你过载的触发点，把步调放慢半拍。[参阅 Waite 第三部释义](https://sacred-texts.com/tarot/pkt/pkt0303.htm)",
      },
      "depth-sequence": {
        title: "延伸对读：战车的推进与力量的涵容",
        bodyMarkdown:
          "在塔罗大阿卡那的序列中，[战车](/journal/tarot-chariot?locale=zh)把分散的精力拧成一股绳，朝外部目标果断进发；「力量」则向内转身，学会与自己的欲望、胆怯和脾气和平共处。当一个人既能向外立定方向，又能向内安顿情绪，便自然生出下一张牌——[隐士](/journal/tarot-hermit?locale=zh#depth-sequence)独自提灯审视人生的从容。",
      },
    },
  },
  "ace-of-cups": {
    title: "圣杯王牌（Ace of Cups）牌义：在心意初动时，为新感受准备合适的容器",
    hook: "云中伸出的手稳稳托起满溢的金杯，五道清流落入莲池——真正动人的起点，需要一只接得住它的杯子。",
    quickTake: {
      upright: "心门温和敞开，灵感、善意与情感连接正在自然萌芽。",
      reversed: "感受被压抑在心底，或一下子倾倒得太满；先照顾好承接的容器与边界。",
    },
    sections: {
      "section-01": {
        title: "画面细读：满溢的五道水流与托杯之手",
        bodyMarkdown:
          "画面右侧的云团中伸出一只手，掌心稳稳托起一只金色高脚圣杯，四周散开柔和的光线。白鸽自上方俯冲而下，喙间衔着刻有十字纹样的圆片；杯口涌出五道弧形清流，注入下方铺满睡莲浮叶与红花的水域，细碎水珠在空中轻盈散落。\n\n[查看本篇核对的 RWS 原图](https://commons.wikimedia.org/wiki/File:Cups01.jpg)\n\n整幅画里只有托举、满溢与汇入大水面的动态，尚未出现具体对饮的人物。这恰恰点出了「王牌（Ace）」的特质：它捕捉的是被一首旧歌、一句体谅或一个创作念头轻轻击中的最初瞬间。掌心托住杯底的姿态也在提醒我们——水要长久流动，先得有一只稳当的容器；把刚萌芽的好感或灵感安放进日常节奏里，比急着追问最终结局更贴近这张牌的本意。",
      },
      "section-02": {
        title: "典籍溯源：丰盈意象与图文细节核对",
        bodyMarkdown:
          "A. E. Waite 在《塔罗图解之钥》（1911）中以圣餐传统诠释白鸽与十字圆片，赋予圣杯王牌喜悦、滋养与内在丰盛的古典含义。值得顺手记下的校勘细节是：1911 年英文转录本写的是「四道水流」，而 Pamela Colman Smith 绘制的 Pam-A 原版牌面清晰画出了五道水柱。如实看见牌面的五道清流，同时了解文本背后的文化脉络，能让我们既不盲从字句，也不把每一滴水珠硬套成宿命密码。\n\n[阅读 Waite《The Pictorial Key to the Tarot》圣杯王牌原文](https://sacred-texts.com/tarot/pkt/pktcuac.htm)",
      },
    },
  },
};

export function applyTarotV2Edition(
  article: TarotLearningArticle,
  locale: ReportLocale,
): TarotLearningArticle {
  const normalizedSources = article.sources.map((source) => ({
    ...source,
    url: normalizeTarotExternalUrl(source.url) ?? null,
  }));

  const edition = locale === "zh" ? zhEditions[article.cardId] : undefined;

  const sections = article.sections.map((section) => {
    const patch = edition?.sections[section.id];
    if (patch) {
      return {
        ...section,
        title: patch.title ?? section.title,
        bodyMarkdown: normalizeMarkdownLinks(patch.bodyMarkdown),
      };
    }
    return {
      ...section,
      bodyMarkdown:
        locale === "zh" || locale === "zh-TW"
          ? smoothEditorialSeams(section.bodyMarkdown)
          : normalizeMarkdownLinks(section.bodyMarkdown),
    };
  });

  return {
    ...article,
    title: edition?.title ?? article.title,
    hook: edition?.hook ?? article.hook,
    quickTake: edition?.quickTake ?? article.quickTake,
    sections,
    sources: normalizedSources,
  };
}
