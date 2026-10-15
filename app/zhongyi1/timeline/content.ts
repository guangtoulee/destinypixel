export type TimelineNode = {
  id: string;
  era: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  evidenceNote: string;
  sources: { label: string; url: string }[];
  artifactIds: string[];
};

// Stations follow the narrative at equal intervals, not a proportional time scale.
// Every scene and object is an artistic illustration, not a historical reconstruction.
export const TIMELINE_NODES: TimelineNode[] = [
  {
    id: "fuxi",
    era: "上古传说",
    title: "伏羲台",
    subtitle: "新乐 · 地方记忆",
    category: "历史传说",
    description:
      "新乐伏羲台承载祭祀伏羲的地方记忆。由传说走入历史，燕赵先民对天地与生命的想象，在此留下文化回声。",
    evidenceNote:
      "本场景呈现历史传说与地方祭祀记忆，为文化意象，非史实复原；不据此认定具体年代或学说创立地。",
    sources: [
      {
        label: "中国非物质文化遗产网 · 新乐伏羲祭典",
        url: "https://www.ihchina.cn/project_details/14993.html",
      },
    ],
    artifactIds: ["fuxi-ring"],
  },
  {
    id: "taixi",
    era: "商代中期",
    title: "商代台西",
    subtitle: "藁城 · 考古线索",
    category: "考古证据",
    description:
      "藁城台西遗址出土石质砭镰，外缘弯曲、内刃锐利。研究者将其解释为切割脓疡的医疗器具。台西出土桃仁、郁李仁等植物遗存。部分种仁剥壳保存，被研究者推测用于药用，留下早期医药的线索。",
    evidenceNote:
      "砭镰用途采用研究解释；种仁药用用途为推测，非处方。器物形制与场景均为艺术示意。",
    sources: [
      {
        label: "北京中医药大学中医药博物馆 · 河北博物院医药文物探秘（下）",
        url: "https://bowuguan.bucm.edu.cn/kpzl/ysmt/53543.htm",
      },
    ],
    artifactIds: ["taixi-blade", "taixi-seeds"],
  },
  {
    id: "zhang",
    era: "金代",
    title: "张元素",
    subtitle: "易州 · 区域师承背景",
    category: "学术传承",
    description:
      "易州医家张元素发展脏腑辨证，重视药物与脏腑经络的联系。易水学派由此兴起，影响后世医家。",
    evidenceNote:
      "易州为区域师承背景，并非石家庄。张元素、李东垣、罗天益之间呈现师承线索；本场景为艺术示意。",
    sources: [
      {
        label: "北京市卫生健康委员会 · 易水学派学术研讨会",
        url: "https://wjw.beijing.gov.cn/xwzx_20031/jcdt/202304/t20230426_3081089.html",
      },
      {
        label: "天津中医药大学第二附属医院 · 易水学派医家简介",
        url: "https://www.tjzyefy.com/system/2023/06/02/030111763.shtml",
      },
    ],
    artifactIds: ["zhang-book"],
  },
  {
    id: "li",
    era: "13世纪",
    title: "李东垣",
    subtitle: "真定 · 脾胃学说",
    category: "学术传承",
    description:
      "真定医家李杲，号东垣老人，师从张元素。他发展脾胃内伤学说，以《脾胃论》等著述影响后世。",
    evidenceNote:
      "此处以世纪标示年代，保留张元素至李东垣的师承关系；书页与场景为艺术示意。",
    sources: [
      {
        label: "天津中医药大学第二附属医院 · 易水学派医家简介",
        url: "https://www.tjzyefy.com/system/2023/06/02/030111763.shtml",
      },
      {
        label: "中国历代人物传记资料库（CBDB） · 李杲",
        url: "https://cbdb.fas.harvard.edu/cbdbapi/person.php?id=0010029",
      },
    ],
    artifactIds: ["li-book"],
  },
  {
    id: "luo",
    era: "13世纪",
    title: "罗天益",
    subtitle: "藁城 · 医书传承",
    category: "学术传承",
    description:
      "藁城医家罗天益从学李东垣，整理师说并著《卫生宝鉴》，将脾胃学说与临床经验继续传向后世。",
    evidenceNote:
      "此处呈现罗天益从学李东垣与整理著述的背景；书页与场景为艺术示意。",
    sources: [
      {
        label: "天津中医药大学第二附属医院 · 易水学派医家简介",
        url: "https://www.tjzyefy.com/system/2023/06/02/030111763.shtml",
      },
    ],
    artifactIds: ["luo-book"],
  },
  {
    id: "modern",
    era: "1920—2023",
    title: "路志正",
    subtitle: "藁城 · 当代传承",
    category: "学术承续",
    description:
      "藁城出生的国医大师路志正，融汇易水、河间学派，重视调理脾胃，以临床、著述和教学推动当代传承。",
    evidenceNote:
      "此处呈现学术承续，不表示从张元素至路志正的连续嫡传关系；书页与场景为艺术示意。",
    sources: [
      {
        label: "中国中医科学院 · 路志正",
        url: "https://www.cacms.ac.cn/nbe/detail/1402.html",
      },
      {
        label: "中国中医科学院 · 路志正同志生平",
        url: "https://www.cacms.ac.cn/news_dynamic/detail/2588.html",
      },
    ],
    artifactIds: ["modern-book"],
  },
];

export const ARTIFACTS: Record<
  string,
  { title: string; description: string; note: string }
> = {
  "fuxi-ring": {
    title: "伏羲文化 · 环形意象",
    description:
      "新乐伏羲台承载祭祀伏羲的地方记忆。由传说走入历史，燕赵先民对天地与生命的想象，在此留下文化回声。",
    note: "环形意象为程序化艺术创作，非考古器物或史实复原。",
  },
  "taixi-blade": {
    title: "台西砭镰 · 器物示意",
    description:
      "藁城台西遗址出土石质砭镰，外缘弯曲、内刃锐利。研究者将其解释为切割脓疡的医疗器具。",
    note: "器物形制为艺术示意；医疗用途采用研究解释。",
  },
  "taixi-seeds": {
    title: "台西种仁 · 植物遗存",
    description:
      "台西出土桃仁、郁李仁等植物遗存。部分种仁剥壳保存，被研究者推测用于药用，留下早期医药的线索。",
    note: "种仁为程序化形态示意；药用用途为推测，非处方。",
  },
  "zhang-book": {
    title: "易水学说 · 书页意象",
    description:
      "易州医家张元素发展脏腑辨证，重视药物与脏腑经络的联系。易水学派由此兴起，影响后世医家。",
    note: "易州为区域师承背景；书页为艺术示意，非古籍版本复原。",
  },
  "li-book": {
    title: "《脾胃论》 · 著述意象",
    description:
      "真定医家李杲，号东垣老人，师从张元素。他发展脾胃内伤学说，以《脾胃论》等著述影响后世。",
    note: "书页为艺术示意，非古籍版本或原文复原。",
  },
  "luo-book": {
    title: "《卫生宝鉴》 · 著述意象",
    description:
      "藁城医家罗天益从学李东垣，整理师说并著《卫生宝鉴》，将脾胃学说与临床经验继续传向后世。",
    note: "书页为艺术示意，非古籍版本或原文复原。",
  },
  "modern-book": {
    title: "当代著述 · 书页意象",
    description:
      "藁城出生的国医大师路志正，融汇易水、河间学派，重视调理脾胃，以临床、著述和教学推动当代传承。",
    note: "呈现学术承续，非连续嫡传谱系；书页为艺术示意。",
  },
};
