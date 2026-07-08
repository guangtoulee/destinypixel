export type JubenRequestBody = {
  idea?: string;
  genre?: string;
  audience?: string;
  episodeCount?: number;
  episodeLength?: string;
  aspectRatio?: string;
  tone?: string;
  productionMode?: string;
  outputTarget?: string;
  mustHave?: string;
  avoid?: string;
};

export type JubenAnalysisResult = Required<JubenRequestBody> & {
  titleSuggestion: string;
  premise: string;
  hook: string;
  revisionNotes: string[];
};

export type JubenDialogueLine = {
  character: string;
  line: string;
  subtext: string;
};

export type JubenScene = {
  sceneId: string;
  episode: number;
  sceneHeading: string;
  dramaticPurpose: string;
  conflict: string;
  action: string;
  dialogue: JubenDialogueLine[];
  emotionalTurn: string;
};

export type JubenShot = {
  shotId: string;
  sceneId: string;
  shotSize: string;
  cameraAngle: string;
  movement: string;
  duration: string;
  visual: string;
  action: string;
  sound: string;
  continuity: string;
};

export type JubenPromptItem = {
  id: string;
  sceneId: string;
  prompt: string;
  negativePrompt: string;
};

export type JubenVisualBible = {
  format: string;
  coreStyle: string;
  colorPalette: string[];
  cameraLanguage: string[];
  productionLogic: string[];
  environmentRules: string[];
  characterLocks: Array<{
    character: string;
    lockedPrompt: string;
  }>;
  keyProps: string[];
  globalPrompt: string;
  globalNegative: string;
};

export type JubenResult = {
  meta: {
    title: string;
    logline: string;
    format: string;
    provider: "deepseek" | "local-structured-fallback";
    model: string;
    generatedAt: string;
  };
  diagnosis: {
    corePromise: string;
    realAudienceHook: string;
    trailerRisk: string;
    fixStrategy: string;
  };
  storyBible: {
    theme: string;
    world: string;
    protagonist: string;
    antagonist: string;
    relationshipEngine: string;
    conflictEngine: string;
    visualRules: string[];
  };
  visualBible: JubenVisualBible;
  episodeOutline: Array<{
    episode: number;
    title: string;
    hook: string;
    beats: string[];
    turn: string;
    cliffhanger: string;
  }>;
  directorScript: JubenScene[];
  shotList: JubenShot[];
  storyboardPrompts: JubenPromptItem[];
  cameraPrompts: JubenPromptItem[];
  editPrompts: JubenPromptItem[];
  voiceoverScript: {
    narrator: string[];
    characterLines: JubenDialogueLine[];
    dubbingNotes: string[];
  };
  productionPack: {
    lovartStoryboard: string;
    grokVideo: string;
    editTimeline: string[];
    soundDesign: string[];
  };
  qualityChecklist: string[];
};

export type JubenEpisodeRequestBody = JubenRequestBody & {
  episode?: number;
  baseResult?: JubenResult;
};

type ChatMessage = { role: "system" | "user"; content: string };

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ??
  "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const DEEPSEEK_TIMEOUT_MS = Number(
  process.env.JUBEN_DEEPSEEK_TIMEOUT_MS ?? 16000,
);

const maxIdeaLength = 16000;

function clampEpisodeCount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 3;

  return Math.min(12, Math.max(1, Math.round(value)));
}

function episodeCode(episode: number) {
  return `E${String(episode).padStart(2, "0")}`;
}

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;

  return value.trim().slice(0, maxIdeaLength);
}

export function normalizeJubenRequest(body: JubenRequestBody): Required<JubenRequestBody> {
  return {
    idea:
      cleanText(body.idea) ||
      "一个外卖骑手在暴雨夜送错一份盒饭，发现收餐人三年前已经死亡；他越想退款，越被卷入一桩旧案和一个仍在等待真相的家庭。",
    genre: cleanText(body.genre, "悬疑短剧"),
    audience: cleanText(body.audience, "18-35 岁，喜欢强钩子、强反转、真实人物动机的短剧用户"),
    episodeCount: clampEpisodeCount(body.episodeCount),
    episodeLength: cleanText(body.episodeLength, "90 秒"),
    aspectRatio: cleanText(body.aspectRatio, "9:16 竖屏"),
    tone: cleanText(body.tone, "现实主义、紧张、克制、有生活质感"),
    productionMode: cleanText(body.productionMode, "短剧分集"),
    outputTarget: cleanText(body.outputTarget, "Lovart 分镜图 + Grok 视频生成"),
    mustHave: cleanText(body.mustHave, "每集必须有明确戏剧动作、对白推进、结尾钩子，不用旁白解释剧情"),
    avoid: cleanText(
      body.avoid,
      "不要写成宣传片、预告片、概念片、诗意混剪；不要只有氛围句；不要堆空镜；不要每句都像金句。",
    ),
  };
}

function resultSchemaHint() {
  return [
    "{",
    '  "meta": {"title": "...", "logline": "...", "format": "...", "provider": "deepseek", "model": "...", "generatedAt": "ISO string"},',
    '  "diagnosis": {"corePromise": "...", "realAudienceHook": "...", "trailerRisk": "...", "fixStrategy": "..."},',
    '  "storyBible": {"theme": "...", "world": "...", "protagonist": "...", "antagonist": "...", "relationshipEngine": "...", "conflictEngine": "...", "visualRules": ["..."]},',
    '  "visualBible": {"format": "...", "coreStyle": "...", "colorPalette": ["..."], "cameraLanguage": ["..."], "productionLogic": ["..."], "environmentRules": ["..."], "characterLocks": [{"character": "...", "lockedPrompt": "..."}], "keyProps": ["..."], "globalPrompt": "...", "globalNegative": "..."},',
    '  "episodeOutline": [{"episode": 1, "title": "...", "hook": "...", "beats": ["..."], "turn": "...", "cliffhanger": "..."}],',
    '  "directorScript": [{"sceneId": "E01-S01", "episode": 1, "sceneHeading": "内/外. 地点 - 时间", "dramaticPurpose": "...", "conflict": "...", "action": "...", "dialogue": [{"character": "...", "line": "...", "subtext": "..."}], "emotionalTurn": "..."}],',
    '  "shotList": [{"shotId": "E01-S01-01", "sceneId": "E01-S01", "shotSize": "...", "cameraAngle": "...", "movement": "...", "duration": "3s", "visual": "...", "action": "...", "sound": "...", "continuity": "..."}],',
    '  "storyboardPrompts": [{"id": "SB-01", "sceneId": "E01-S01", "prompt": "...", "negativePrompt": "..."}],',
    '  "cameraPrompts": [{"id": "CAM-01", "sceneId": "E01-S01", "prompt": "...", "negativePrompt": "..."}],',
    '  "editPrompts": [{"id": "ED-01", "sceneId": "E01-S01", "prompt": "...", "negativePrompt": "..."}],',
    '  "voiceoverScript": {"narrator": ["..."], "characterLines": [{"character": "...", "line": "...", "subtext": "..."}], "dubbingNotes": ["..."]},',
    '  "productionPack": {"lovartStoryboard": "...", "grokVideo": "...", "editTimeline": ["..."], "soundDesign": ["..."]},',
    '  "qualityChecklist": ["..."]',
    "}",
  ].join("\n");
}

export function buildJubenMessages(input: Required<JubenRequestBody>): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "你是短剧平台的资深编剧、分镜导演和AI视频生产总监。",
        "你的任务不是写宣传片、预告片、概念片或广告文案，而是把一个想法拆成能连续拍摄、能剪辑、能生成分镜图和视频的短剧生产包。",
        "必须遵守影视剧本基本格式：场景标题要包含内/外、地点、时间；动作要可拍；对白要推动关系、冲突和信息，不要用旁白替代戏剧动作。",
        "必须遵守制片拆解逻辑：先给故事承诺和人物目标，再给分集钩子、场景目的、镜头尺寸、机位、运镜、声音、连续性、剪辑节奏。",
        "每一场都要回答：谁想要什么，谁阻止他，观众此刻知道了什么，下一秒为什么要继续看。",
        "镜头必须服务叙事，避免只写空镜、氛围、慢动作、震撼、史诗感、燃、大片感等预告片词。",
        "输出给 Lovart/Grok 的 prompt 要具体到人物、地点、动作、构图、光线、镜头焦段感、情绪和连续性。不要只写风格词。",
        "必须输出 visualBible，像 live action production bible：全剧格式、核心风格、色彩、摄影语言、生产逻辑、环境规则、人物锁定 prompt、全局正向 prompt 和全局 negative prompt。",
        "visualBible 的人物锁定必须能直接用于角色定妆和每个镜头首帧，避免人物漂移。",
        "返回严格 JSON。不要 Markdown，不要代码块，不要解释。",
        "JSON 必须完全符合这个结构，所有字段都要有内容：",
        resultSchemaHint(),
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          creativeBrief: input,
          outputRules: [
            "episodeOutline 数量必须等于 episodeCount。",
            "每集至少 2 个导演场景；每个导演场景至少 3 个镜头。",
            "directorScript 必须像剧本，不要像梗概。",
            "shotList 必须能被导演、摄影、AI视频工具直接使用。",
            "storyboardPrompts 用于分镜图生成；cameraPrompts 用于视频运镜；editPrompts 用于剪辑节奏。",
            "voiceoverScript 只在需要时使用旁白，优先对白和行动推进。",
            "qualityChecklist 必须包含反宣传片检查项。",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

export function buildJubenSeedMessages(input: Required<JubenRequestBody>): ChatMessage[] {
  const [system] = buildJubenMessages(input);

  return [
    system,
    {
      role: "user",
      content: JSON.stringify(
        {
          creativeBrief: input,
          mode: "quick_seed",
          targetEpisode: 1,
          outputRules: [
            "先快速生成故事圣经、视觉圣经、全剧分集结构，以及第 1 集的导演剧本、镜头表、分镜 Prompt、运镜 Prompt、剪辑 Prompt。",
            "episodeOutline 数量必须等于 episodeCount。",
            "directorScript、shotList、storyboardPrompts、cameraPrompts、editPrompts 只生成 E01，不要一次性生成后面所有集。",
            "E01 至少 2 个导演场景；每个导演场景至少 3 个镜头。",
            "visualBible 必须包含全剧风格、人物、色彩、环境定调和全局 prompt。",
            "返回严格 JSON。不要 Markdown，不要代码块，不要解释。",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

export function buildJubenEpisodeMessages(
  input: Required<JubenRequestBody>,
  baseResult: JubenResult,
  episode: number,
): ChatMessage[] {
  const [system] = buildJubenMessages(input);

  return [
    system,
    {
      role: "user",
      content: JSON.stringify(
        {
          creativeBrief: input,
          mode: "single_episode_detail",
          targetEpisode: episode,
          establishedStoryBible: baseResult.storyBible,
          establishedVisualBible: baseResult.visualBible,
          episodeOutline: baseResult.episodeOutline,
          outputRules: [
            `只生成 E${String(episode).padStart(2, "0")} 的导演剧本、镜头表、分镜 Prompt、运镜 Prompt、剪辑 Prompt。`,
            "保留 establishedVisualBible 的角色锁定、色彩、场景、全局 negative，不要换演员脸和整体风格。",
            "本集至少 2 个导演场景；每个导演场景至少 3 个镜头。",
            "每个镜头 prompt 都要能生成 photoreal first frame，再动画成 4-7 秒短剧镜头。",
            "不要输出其他集的导演场景和镜头。",
            "返回完整 JSON 结构，但数组内容只放目标集的细节。",
          ],
        },
        null,
        2,
      ),
    },
  ];
}

export function buildJubenAnalysisMessages(
  input: Required<JubenRequestBody>,
): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "你是短剧平台的选题策划和制片开发编辑。",
        "用户只会先输入一个想法。你要先做创意简析，并自动补齐后续生成剧本包需要的参数。",
        "优先根据 idea 重新判断类型、受众、集数、时长和气质；不要因为表单里已有默认值就机械保留，除非 idea 明确要求固定规格。",
        "判断要偏短剧工业化：类型、受众、集数、单集时长、画幅、气质、必须保留、避免方向。",
        "必须避免把项目推成宣传片、预告片、氛围片。必须强调人物目标、冲突、反转、结尾钩子。",
        "返回严格 JSON，不要 Markdown，不要代码块。",
        "JSON 结构：",
        [
          "{",
          '  "titleSuggestion": "...",',
          '  "premise": "...",',
          '  "hook": "...",',
          '  "genre": "...",',
          '  "audience": "...",',
          '  "episodeCount": 8,',
          '  "episodeLength": "90 秒",',
          '  "aspectRatio": "9:16 竖屏",',
          '  "tone": "...",',
          '  "productionMode": "短剧分集",',
          '  "outputTarget": "Lovart 分镜图 + Grok 视频生成",',
          '  "mustHave": "...",',
          '  "avoid": "...",',
          '  "revisionNotes": ["..."]',
          "}",
        ].join("\n"),
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          currentDraft: input,
          instruction:
            "根据 idea 自动生成后面参数。表单可能带有默认值，不要把默认值当成用户明确选择；如果明显不适合短剧，可以在 revisionNotes 里提示。",
        },
        null,
        2,
      ),
    },
  ];
}

function episodeTitle(base: string, episode: number) {
  const titles = [
    "错送",
    "旧门牌",
    "等不到的人",
    "最后一单",
    "雨停之前",
    "门后证词",
    "反咬",
    "开门",
    "交换证据",
    "最后一夜",
    "旧账",
    "真相回声",
  ];

  return `${titles[(episode - 1) % titles.length]}：${base}`;
}

function fallbackJubenAnalysis(
  input: Required<JubenRequestBody>,
  reason = "DeepSeek 简析暂不可用，已用本地策划规则补齐。",
): JubenAnalysisResult {
  const idea = input.idea;
  const hasRomance = /爱|婚|妻|夫|暧昧|恋|情|女主|男主/.test(idea);
  const hasHorror = /鬼|魔|死|尸|附身|诅咒|医院|监控|失踪/.test(idea);
  const hasCase = /案|律师|警|证据|调查|法庭|离婚|遗产/.test(idea);
  const genre = hasCase
    ? "都市悬疑短剧"
    : hasHorror
      ? "民俗惊悚短剧"
      : hasRomance
        ? "情感反转短剧"
        : input.genre || "强反转短剧";

  return {
    ...input,
    genre,
    audience:
      hasRomance || hasHorror
        ? "18-35 岁，喜欢反转、亲情悬疑、情感拉扯和强钩子的竖屏短剧用户"
        : input.audience,
    episodeCount: input.episodeCount || 8,
    episodeLength: input.episodeLength || "90 秒",
    aspectRatio: input.aspectRatio || "9:16 竖屏",
    tone:
      hasHorror
        ? "现实主义、紧张、克制、带民俗惊悚和情感刺痛"
        : input.tone,
    productionMode: "短剧分集",
    outputTarget: "Lovart 分镜图 + Grok 视频生成",
    titleSuggestion: hasHorror ? "夜里多出来的人" : "第一场真相",
    premise:
      "主角被一个看似偶然的小事件拖入更大的隐情，每集用一个具体行动推进真相，而不是用旁白解释世界观。",
    hook:
      "观众追看的核心不是设定有多奇，而是主角每次接近真相都会付出新的现实代价。",
    mustHave:
      "每集必须有真实戏剧动作、人物关系推进、信息反转和结尾钩子；主角要主动调查或选择，不能只被动受害。",
    avoid:
      "不要写成宣传片、预告片、概念片；不要只写氛围；不要靠旁白解释；不要连续空镜；不要每一幕都神神叨叨。",
    revisionNotes: [
      reason,
      "建议先确认主角每集的具体目标：找人、取证、隐瞒、交换、逃离或摊牌。",
      "建议把反派或阻碍落到可拍的人和事上，不只用抽象邪恶或命运感。",
    ],
  };
}

function fallbackVisualBible(
  input: Required<JubenRequestBody>,
  title: string,
): JubenVisualBible {
  const isWestern =
    /西部|美国|牧场|牛仔|农场|谷仓|教堂|牧师|画皮|贵族|frontier|western/i.test(
      input.idea,
    );

  if (isWestern) {
    return {
      format:
        "Vertical 9:16 live-action microdrama. Serious suspense romance, not parody, not fantasy cosplay.",
      coreStyle:
        "Photoreal live-action vertical drama, 1880s American frontier gothic romance, remote farmhouse, prairie storm, barn loft, abandoned chapel, candlelit interiors, rain, mud, silver mirror, old Bible, velvet cloak, serious suspense, romance-thriller tone, cinematic close faces for phone screen.",
      colorPalette: [
        "storm blue",
        "candle amber",
        "black leather",
        "navy velvet",
        "bone white",
        "rust brown",
        "silver mirror highlights",
      ],
      cameraLanguage: [
        "close faces for phone screen",
        "doorway frames",
        "mirror reveals",
        "one-frame shadow stings",
        "locked dramatic pauses",
        "minimal locations",
      ],
      productionLogic: [
        "forbidden attraction",
        "suspicious wife",
        "other woman",
        "betrayal",
        "supernatural punishment",
        "cliffhanger every episode",
      ],
      environmentRules: [
        "Keep sets small: farmhouse, barn, chapel.",
        "Use rain, mud, candlelight, wood interiors and prairie storm as repeating texture.",
        "No fantasy cosplay; all supernatural signs must appear through practical objects and performance.",
      ],
      characterLocks: [
        {
          character: "Elias Hale",
          lockedPrompt:
            "34-year-old American frontier rancher and former cavalryman, wet black hat, dark leather coat, short beard, tired blue-gray eyes, revolver held low, guilt-prone protector energy.",
        },
        {
          character: "Mara Hale",
          lockedPrompt:
            "30-year-old ranch wife, beige calico dress, braided dark hair, sharp eyes, practical and controlled, silver hand mirror, small Bible or rosary, survivor energy.",
        },
        {
          character: "Lady Seraphine Voss",
          lockedPrompt:
            "24-looking European noblewoman, pale face, torn navy-black velvet cloak with gold embroidery, elegant accent, dangerous stillness, beautiful but predatory, no nudity.",
        },
        {
          character: "Reverend Crowe",
          lockedPrompt:
            "Old half-mad frontier preacher, ragged black coat, cracked voice, rosary, silver cup, knows old-world monsters but is not clean or saintly.",
        },
      ],
      keyProps: [
        "silver hand mirror",
        "old Bible or rosary",
        "wet black hat",
        "navy-black velvet cloak",
        "candle",
        "barn rope",
        "muddy threshold",
      ],
      globalPrompt: `${title}, Frontier Gothic Romance version, photoreal live-action vertical short drama, 1880s American frontier gothic romance, remote farmhouse, barn, chapel, candlelit interiors, prairie storm, rain, mud, serious suspense romance, cinematic close faces, consistent characters, 9:16.`,
      globalNegative:
        "no text in image, no watermark, no logo, no subtitles inside the frame, no modern objects unless specified, no explicit nudity, no gore, no distorted hands, no extra fingers, no duplicate faces, no low-res blur, keep character identity consistent.",
    };
  }

  return {
    format: `${input.aspectRatio} 真人短剧，${input.productionMode}，面向 ${input.outputTarget}。`,
    coreStyle:
      "Photoreal live-action vertical microdrama, realistic locations, phone-screen close faces, controlled suspense, practical props, small sets, clear character continuity.",
    colorPalette: ["现实冷色", "暖色实用光", "低饱和肤色", "关键道具高光", "暗部保留细节"],
    cameraLanguage: [
      "近脸特写承接情绪",
      "门框和窗框制造压迫",
      "关键物件做证据揭示",
      "手持轻微跟拍表现现实紧张",
      "结尾停顿后切黑",
    ],
    productionLogic: [
      "每集一个明确目标",
      "每场一个可拍阻碍",
      "每集结尾一个新证据或新危险",
      "不用旁白替代戏剧动作",
    ],
    environmentRules: [
      "场景数量控制在少量可复用空间。",
      "所有风格选择服务人物关系和信息揭示。",
      "避免空镜、概念镜头和预告片式混剪。",
    ],
    characterLocks: [
      {
        character: "主角",
        lockedPrompt: `${input.genre} 主角，现实生活质感，明确欲望和压力，服装道具连续，面部特征稳定。`,
      },
      {
        character: "核心阻碍者",
        lockedPrompt:
          "短剧反派或阻碍者，真实人物动机，表演克制，压迫感来自关系和信息差，不靠夸张造型。",
      },
    ],
    keyProps: ["手机", "门", "镜子", "旧照片", "证据物", "生活化服装"],
    globalPrompt: `${title}, photoreal live-action vertical microdrama, ${input.tone}, realistic small sets, close faces, dramatic conflict, consistent character identity, clear props, no trailer montage, ${input.aspectRatio}.`,
    globalNegative:
      "no text in image, no watermark, no logo, no subtitles, no modern objects unless specified, no explicit nudity, no gore, no distorted hands, no extra fingers, no duplicate faces, no low-res blur, no poster composition, no empty atmospheric montage.",
  };
}

export function fallbackJubenResult(
  input: Required<JubenRequestBody>,
  reason = "DeepSeek 暂不可用，已使用本地结构化样片。",
): JubenResult {
  const title = input.idea.includes("外卖") ? "雨夜错单" : "第一场真相";
  const episodeCount = input.episodeCount;
  const episodeOutline = Array.from({ length: episodeCount }, (_, index) => {
    const episode = index + 1;

    return {
      episode,
      title: episodeTitle(title, episode),
      hook:
        episode === 1
          ? "主角完成一件看似普通的小事，却发现收件人身份不成立。"
          : "上一集留下的证据被推翻，主角必须换一种方式接近真相。",
      beats: [
        "开场用一个具体行动切入，不解释世界观。",
        "主角遇到阻碍，对方用现实利益或情感压力逼他退后。",
        "一个细节反转旧判断，让观众重新理解上一场。",
      ],
      turn: "主角从被动卷入变成主动验证。",
      cliffhanger:
        episode === episodeCount
          ? "真相出现，但代价落到主角自己身上。"
          : "关键人物说出一句与证据相反的话，切黑。",
    };
  });

  const directorScript: JubenScene[] = episodeOutline.flatMap((episode) => [
    {
      sceneId: `${episodeCode(episode.episode)}-S01`,
      episode: episode.episode,
      sceneHeading: "外. 老小区楼下 - 夜",
      dramaticPurpose: "用一个可拍行动把主角推入事件，不靠旁白解释。",
      conflict: "主角只想完成订单离开，保安坚持楼里没有这个人。",
      action:
        "雨水打在外卖箱上。主角核对手机地址，门牌号和取餐备注完全一致。保安把登记本推过来，三年前那一页被撕掉一角。",
      dialogue: [
        {
          character: "骑手",
          line: "我就送个饭，签收了我马上走。",
          subtext: "他急着脱身，不想承认这单不正常。",
        },
        {
          character: "保安",
          line: "这栋楼没有 404，三年前就封了。",
          subtext: "保安知道更多，但在试探骑手。",
        },
      ],
      emotionalTurn: "主角从烦躁变成警觉。",
    },
    {
      sceneId: `${episodeCode(episode.episode)}-S02`,
      episode: episode.episode,
      sceneHeading: "内. 楼道四层 - 夜",
      dramaticPurpose: "把悬念落到人物选择：退单还是敲门。",
      conflict: "门内传出筷子碰碗声，但猫眼是黑的。",
      action:
        "楼道感应灯忽明忽暗。主角把盒饭放在门口，手机弹出催单提示。门缝里慢慢推出一张泛黄收据，收据日期停在三年前。",
      dialogue: [
        {
          character: "门内女声",
          line: "你终于送来了。",
          subtext: "她不像在等饭，更像在等一个证人。",
        },
        {
          character: "骑手",
          line: "你是谁？",
          subtext: "他第一次承认这不是一单普通配送。",
        },
      ],
      emotionalTurn: "主角被迫进入门后的真相。",
    },
  ]);

  const shotList: JubenShot[] = directorScript.flatMap((scene) => [
    {
      shotId: `${scene.sceneId}-01`,
      sceneId: scene.sceneId,
      shotSize: "近景",
      cameraAngle: "略低机位，贴近外卖箱",
      movement: "手持轻微跟拍",
      duration: "4s",
      visual: "雨水从外卖箱边缘滴下，订单小票被打湿但门牌号清楚。",
      action: "主角停下脚步，低头核对地址。",
      sound: "雨声、塑料箱摩擦、手机震动。",
      continuity: "小票门牌号必须和下一镜手机画面一致。",
    },
    {
      shotId: `${scene.sceneId}-02`,
      sceneId: scene.sceneId,
      shotSize: "过肩中景",
      cameraAngle: "从主角肩后看向阻挡者或门缝",
      movement: "慢推",
      duration: "5s",
      visual: scene.conflict,
      action: "对方给出阻碍，主角没有立刻退。",
      sound: "对白压低，环境声不断。",
      continuity: "人物站位保持左主角右阻碍。",
    },
    {
      shotId: `${scene.sceneId}-03`,
      sceneId: scene.sceneId,
      shotSize: "特写",
      cameraAngle: "正面平视",
      movement: "静止后突然切黑",
      duration: "3s",
      visual: scene.emotionalTurn,
      action: "关键物件出现，主角表情变化。",
      sound: "环境声瞬间抽空，只留一个低频点。",
      continuity: "结尾留足 8 帧黑场接下一场。",
    },
  ]);

  const promptItems = shotList.map((shot, index) => ({
    id: `SB-${String(index + 1).padStart(2, "0")}`,
    sceneId: shot.sceneId,
    prompt: `${input.aspectRatio} 短剧分镜图，${shot.shotSize}，${shot.cameraAngle}，${shot.visual}，人物动作：${shot.action}，现实主义短剧质感，生活化服装，清晰场景连续性，暗雨夜但主体可辨认。`,
    negativePrompt:
      "不要电影海报，不要预告片构图，不要夸张光效，不要空镜堆砌，不要多余文字，不要人物变脸，不要欧美大片风。",
  }));

  return {
    meta: {
      title,
      logline:
        "一个普通人被一件小事拖入旧案，他越想置身事外，越成为唯一能让真相重新开口的人。",
      format: `${input.productionMode} · ${episodeCount} 集 · ${input.episodeLength} · ${input.aspectRatio}`,
      provider: "local-structured-fallback",
      model: reason,
      generatedAt: new Date().toISOString(),
    },
    diagnosis: {
      corePromise: "用日常职业动作撞上不可解释的现实缝隙，制造短剧的强钩子。",
      realAudienceHook: "观众追的不是奇观，而是门后那个人到底是谁、主角为什么不能走。",
      trailerRisk: "如果只写雨夜、旧楼、神秘女声，会变成悬疑氛围预告片，没有戏剧推进。",
      fixStrategy: "每场都让主角做选择、付代价、拿到一个会推翻上一判断的新证据。",
    },
    storyBible: {
      theme: "普通人的善意一旦碰到沉默的旧案，就会变成危险的责任。",
      world: "真实城市边缘的老小区、外卖系统、物业登记和被遗忘的家庭。",
      protagonist: "外卖骑手，现实、谨慎、怕麻烦，但有最低限度的良心。",
      antagonist: "不是单个反派，而是所有想让旧案继续沉默的人。",
      relationshipEngine: "骑手和门内女声从互相防备到被迫交换真相。",
      conflictEngine: "每次接近真相，主角的工作、收入、安全和亲情都会被现实反噬。",
      visualRules: [
        "优先现实场景和可拍行动，不靠抽象意象撑戏。",
        "每集至少一个可记住的物件：小票、门牌、登记本、旧收据。",
        "镜头连续性固定：主角左侧入画，阻碍右侧压迫，真相从门缝或屏幕出现。",
      ],
    },
    visualBible: fallbackVisualBible(input, title),
    episodeOutline,
    directorScript,
    shotList,
    storyboardPrompts: promptItems,
    cameraPrompts: promptItems.map((item, index) => ({
      ...item,
      id: `CAM-${String(index + 1).padStart(2, "0")}`,
      prompt: `${item.sceneId} 视频运镜：${shotList[index]?.movement}，镜头时长 ${shotList[index]?.duration}，动作必须按“停顿-反应-发现”推进，保持人物服装、雨夜光线、门牌和外卖箱连续。`,
    })),
    editPrompts: promptItems.map((item, index) => ({
      ...item,
      id: `ED-${String(index + 1).padStart(2, "0")}`,
      prompt: `${item.sceneId} 剪辑：前 2 秒给行动，中段给阻碍，末尾用物件或一句对白制造钩子。不要混剪，不要跳成预告片节奏。镜头 ${index + 1} 保持声音桥接。`,
    })),
    voiceoverScript: {
      narrator: [
        "旁白只在转场或信息缺口时使用，不解释人物已经做出来的动作。",
        "示例：那天雨太大，他以为只是系统派错了一单。",
      ],
      characterLines: directorScript.flatMap((scene) => scene.dialogue),
      dubbingNotes: [
        "男主语速偏快，前半段带职业疲惫，发现异常后降速。",
        "门内女声不要鬼片化，要像一个等太久的人终于压住情绪。",
      ],
    },
    productionPack: {
      lovartStoryboard: promptItems.map((item) => `${item.id}: ${item.prompt}`).join("\n\n"),
      grokVideo: shotList
        .slice(0, 12)
        .map((shot) => `${shot.shotId} | ${shot.duration} | ${shot.movement} | ${shot.visual} | ${shot.action}`)
        .join("\n"),
      editTimeline: [
        "0-3s：用动作开场，不上世界观。",
        "3-18s：阻碍出现，观众得到第一个异常信息。",
        "18-55s：主角验证，信息反转。",
        "最后 5s：一句对白或一个物件做 cliffhanger。",
      ],
      soundDesign: ["现实环境声优先", "低频只在证据出现时进入", "不要全程铺史诗音乐"],
    },
    qualityChecklist: [
      "每场都有场景标题、人物目标、阻碍、动作和对白。",
      "每个镜头都能回答拍什么、怎么拍、拍几秒、接哪里。",
      "没有把核心剧情写成旁白简介。",
      "没有连续三个以上空镜或纯氛围镜头。",
      "每集结尾不是口号，而是新证据或新危险。",
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(text.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function looksLikeJubenResult(value: unknown): value is JubenResult {
  if (!isRecord(value)) return false;

  return (
    isRecord(value.meta) &&
    isRecord(value.storyBible) &&
    Array.isArray(value.episodeOutline) &&
    Array.isArray(value.directorScript) &&
    Array.isArray(value.shotList) &&
    Array.isArray(value.storyboardPrompts) &&
    isRecord(value.productionPack)
  );
}

function looksLikeAnalysisResult(value: unknown): value is Partial<JubenAnalysisResult> {
  if (!isRecord(value)) return false;

  return typeof value.genre === "string" || typeof value.audience === "string";
}

function episodeFromSceneId(sceneId: string) {
  const match = sceneId.match(/^E(\d+)/i);

  return match ? Number(match[1]) : 1;
}

function looksLikeVisualBible(value: unknown): value is JubenVisualBible {
  return (
    isRecord(value) &&
    typeof value.globalPrompt === "string" &&
    typeof value.globalNegative === "string"
  );
}

function ensureVisualBible(
  result: JubenResult,
  input: Required<JubenRequestBody>,
) {
  if (looksLikeVisualBible(result.visualBible)) {
    return result.visualBible;
  }

  return fallbackVisualBible(input, result.meta.title);
}

function normalizeEpisodeOutlines(
  result: JubenResult,
  input: Required<JubenRequestBody>,
) {
  const existing = result.episodeOutline.filter(
    (episode) =>
      typeof episode.episode === "number" &&
      episode.episode >= 1 &&
      episode.episode <= input.episodeCount,
  );
  const byEpisode = new Map(existing.map((episode) => [episode.episode, episode]));

  for (let episode = 1; episode <= input.episodeCount; episode += 1) {
    if (!byEpisode.has(episode)) {
      byEpisode.set(episode, {
        episode,
        title: episodeTitle(result.meta.title, episode),
        hook:
          episode === 1
            ? "用一个具体动作把主角推入事件，不解释设定。"
            : "上一集的证据被推翻，主角必须换一种方式继续追。",
        beats: [
          "开场接住上一集钩子，用人物行动推进。",
          "阻碍升级，关系或现实代价变重。",
          "出现新证据，迫使主角做选择。",
        ],
        turn: "主角从反应变成主动选择。",
        cliffhanger:
          episode === input.episodeCount
            ? "真相落地，但主角必须承担最后代价。"
            : "新证据指向一个更亲近的人。",
      });
    }
  }

  return Array.from(byEpisode.values()).sort((a, b) => a.episode - b.episode);
}

function makeSceneFromOutline(
  outline: JubenResult["episodeOutline"][number],
  sceneIndex: number,
  result: JubenResult,
): JubenScene {
  const sceneId = `${episodeCode(outline.episode)}-S${String(sceneIndex).padStart(2, "0")}`;
  const isFirst = sceneIndex === 1;
  const beat = outline.beats[(sceneIndex - 1) % Math.max(outline.beats.length, 1)];

  return {
    sceneId,
    episode: outline.episode,
    sceneHeading: isFirst ? "内. 主角工作现场 - 夜" : "外. 关键地点入口 - 夜",
    dramaticPurpose: isFirst
      ? "接住本集钩子，把主角目标落成一个具体行动。"
      : "让主角付出代价并拿到下一条证据。",
    conflict: isFirst
      ? "主角想验证线索，对方要求她先放弃或撒谎。"
      : "线索指向更危险的人，主角必须在安全和真相之间选择。",
    action:
      beat ||
      `${result.storyBible.protagonist} 根据上一集留下的线索赶到现场，发现事情并不按她的判断发展。`,
    dialogue: [
      {
        character: "主角",
        line: isFirst ? "我只问一句，这件事到底是谁让你瞒的？" : "如果我现在走，就再也没人知道真相了。",
        subtext: "她已经从被动反应转向主动追问。",
      },
      {
        character: "阻碍者",
        line: isFirst ? "你知道得越少，越安全。" : "你以为你救的是别人，其实是在害自己。",
        subtext: "对方用恐惧和现实代价逼她后退。",
      },
    ],
    emotionalTurn: isFirst ? outline.turn : outline.cliffhanger,
  };
}

function ensureSceneCoverage(
  result: JubenResult,
  outlines: JubenResult["episodeOutline"],
  detailEpisodes?: number[],
) {
  const detailSet =
    detailEpisodes && detailEpisodes.length > 0
      ? new Set(detailEpisodes)
      : new Set(outlines.map((outline) => outline.episode));
  const scenes = result.directorScript
    .filter((scene) => scene.sceneId && scene.action)
    .map((scene) => ({
      ...scene,
      episode: scene.episode || episodeFromSceneId(scene.sceneId),
    }))
    .filter((scene) => detailSet.has(scene.episode));

  outlines.forEach((outline) => {
    if (!detailSet.has(outline.episode)) return;

    const current = scenes.filter((scene) => scene.episode === outline.episode);

    for (let index = current.length + 1; index <= 2; index += 1) {
      scenes.push(makeSceneFromOutline(outline, index, result));
    }
  });

  return scenes.sort((a, b) => a.sceneId.localeCompare(b.sceneId));
}

function makeShotFromScene(scene: JubenScene, shotIndex: number): JubenShot {
  const presets = [
    {
      shotSize: "中近景",
      cameraAngle: "平视略贴近人物",
      movement: "手持轻微跟进",
      duration: "4s",
      visual: scene.action,
      action: "主角进入现场并开始执行本场目标。",
      sound: "现场环境声压低，保留脚步和呼吸。",
      continuity: "接上一场情绪，不换服装和核心道具。",
    },
    {
      shotSize: "过肩中景",
      cameraAngle: "从主角肩后看向阻碍者",
      movement: "慢推到两人之间",
      duration: "5s",
      visual: scene.conflict,
      action: "阻碍者给出压力，主角没有立刻退。",
      sound: "对白清楚，背景声保持真实。",
      continuity: "人物轴线保持稳定，主角在画面左侧。",
    },
    {
      shotSize: "特写",
      cameraAngle: "正面平视关键物件或表情",
      movement: "静止停顿后切走",
      duration: "3s",
      visual: scene.emotionalTurn,
      action: "新证据出现，主角做出本集下一步选择。",
      sound: "低频点入，随后留半秒空白。",
      continuity: "结尾必须能接下一镜或下一集钩子。",
    },
  ];
  const preset = presets[(shotIndex - 1) % presets.length];

  return {
    shotId: `${scene.sceneId}-${String(shotIndex).padStart(2, "0")}`,
    sceneId: scene.sceneId,
    ...preset,
  };
}

function ensureShotCoverage(existing: JubenShot[], scenes: JubenScene[]) {
  const sceneIds = new Set(scenes.map((scene) => scene.sceneId));
  const shots = existing.filter(
    (shot) => shot.shotId && shot.sceneId && sceneIds.has(shot.sceneId),
  );

  scenes.forEach((scene) => {
    const current = shots.filter((shot) => shot.sceneId === scene.sceneId);

    for (let index = current.length + 1; index <= 3; index += 1) {
      shots.push(makeShotFromScene(scene, index));
    }
  });

  return shots.sort((a, b) => a.shotId.localeCompare(b.shotId));
}

function makePromptFromShot(
  shot: JubenShot,
  type: "storyboard" | "camera" | "edit",
  index: number,
): JubenPromptItem {
  const idPrefix = type === "storyboard" ? "SB" : type === "camera" ? "CAM" : "ED";
  const baseId = `${idPrefix}-${String(index + 1).padStart(2, "0")}`;

  if (type === "camera") {
    return {
      id: baseId,
      sceneId: shot.sceneId,
      prompt: `${shot.shotId} 运镜生成：${shot.shotSize}，${shot.cameraAngle}，${shot.movement}，时长 ${shot.duration}。画面内容：${shot.visual}。人物动作：${shot.action}。保持同一场景、服装、道具、光线和情绪连续，不要跳成预告片混剪。`,
      negativePrompt:
        "不要空镜堆砌，不要大幅度无目的摇晃，不要电影预告片节奏，不要人物变脸，不要随机换景。",
    };
  }

  if (type === "edit") {
    return {
      id: baseId,
      sceneId: shot.sceneId,
      prompt: `${shot.shotId} 剪辑指令：镜头 ${shot.duration}，先给可见动作，再给反应或证据。声音使用 ${shot.sound}，转场要服务 ${shot.continuity}。结尾必须推动下一镜，不做纯氛围停留。`,
      negativePrompt:
        "不要宣传片蒙太奇，不要无意义闪白，不要史诗音乐硬推，不要把剧情用字幕解释完。",
    };
  }

  return {
    id: baseId,
    sceneId: shot.sceneId,
    prompt: `${shot.shotId} 分镜图，${shot.shotSize}，${shot.cameraAngle}，${shot.visual}。人物动作：${shot.action}。现实主义短剧质感，主体清楚，构图服务戏剧冲突，保留关键道具和场景连续性。`,
    negativePrompt:
      "不要海报构图，不要预告片大片感，不要抽象空镜，不要夸张光效，不要多余文字，不要人物五官不连续。",
  };
}

function ensurePromptCoverage(
  existing: JubenPromptItem[],
  shots: JubenShot[],
  type: "storyboard" | "camera" | "edit",
) {
  const idPrefix = type === "storyboard" ? "SB" : type === "camera" ? "CAM" : "ED";
  const sceneIds = new Set(shots.map((shot) => shot.sceneId));
  const normalized = existing.filter(
    (item) => item.sceneId && item.prompt && sceneIds.has(item.sceneId),
  );
  const shotCountsByScene = shots.reduce((map, shot) => {
    map.set(shot.sceneId, (map.get(shot.sceneId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const promptCountsByScene = normalized.reduce((map, item) => {
    map.set(item.sceneId, (map.get(item.sceneId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  shots.forEach((shot) => {
    const neededForScene = shotCountsByScene.get(shot.sceneId) ?? 1;
    const currentForScene = promptCountsByScene.get(shot.sceneId) ?? 0;

    if (currentForScene < neededForScene) {
      normalized.push(makePromptFromShot(shot, type, normalized.length));
      promptCountsByScene.set(shot.sceneId, currentForScene + 1);
    }
  });

  return normalized.map((item, index) => ({
    ...item,
    id: `${idPrefix}-${item.sceneId}-${String(index + 1).padStart(2, "0")}`,
  }));
}

function ensureJubenCoverage(
  result: JubenResult,
  input: Required<JubenRequestBody>,
  options?: {
    detailEpisodes?: number[];
  },
): JubenResult {
  const episodeOutline = normalizeEpisodeOutlines(result, input);
  const visualBible = ensureVisualBible(result, input);
  const directorScript = ensureSceneCoverage(
    { ...result, episodeOutline },
    episodeOutline,
    options?.detailEpisodes,
  );
  const shotList = ensureShotCoverage(result.shotList, directorScript);
  const storyboardPrompts = ensurePromptCoverage(
    result.storyboardPrompts,
    shotList,
    "storyboard",
  );
  const cameraPrompts = ensurePromptCoverage(
    result.cameraPrompts,
    shotList,
    "camera",
  );
  const editPrompts = ensurePromptCoverage(result.editPrompts, shotList, "edit");

  return {
    ...result,
    episodeOutline,
    visualBible,
    directorScript,
    shotList,
    storyboardPrompts,
    cameraPrompts,
    editPrompts,
    productionPack: {
      ...result.productionPack,
      lovartStoryboard: storyboardPrompts
        .map((item) => `${item.id} / ${item.sceneId}: ${item.prompt}`)
        .join("\n\n"),
      grokVideo: cameraPrompts
        .map((item) => `${item.id} / ${item.sceneId}: ${item.prompt}`)
        .join("\n\n"),
    },
  };
}

async function requestDeepSeekJson(messages: ChatMessage[], maxTokens: number) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const response = await Promise.race([
    fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.38,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages,
      }),
      cache: "no-store",
      signal: controller.signal,
    }),
    new Promise<Response>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("DeepSeek request timed out."));
      }, DEEPSEEK_TIMEOUT_MS);
    }),
  ]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  const parsed = typeof content === "string" ? parseJsonObject(content) : null;

  if (!parsed) {
    throw new Error("DeepSeek response did not contain JSON.");
  }

  return parsed;
}

export async function analyzeJubenIdea(
  body: JubenRequestBody,
): Promise<JubenAnalysisResult> {
  const input = normalizeJubenRequest(body);

  try {
    const parsed = await requestDeepSeekJson(
      buildJubenAnalysisMessages(input),
      Number(process.env.JUBEN_ANALYSIS_MAX_TOKENS ?? 1800),
    );

    if (!looksLikeAnalysisResult(parsed)) {
      return fallbackJubenAnalysis(input, "DeepSeek 简析结构不完整。");
    }

    const record = parsed as Partial<JubenAnalysisResult>;
    return {
      ...input,
      genre: cleanText(record.genre, input.genre),
      audience: cleanText(record.audience, input.audience),
      episodeCount: clampEpisodeCount(record.episodeCount ?? input.episodeCount),
      episodeLength: cleanText(record.episodeLength, input.episodeLength),
      aspectRatio: cleanText(record.aspectRatio, input.aspectRatio),
      tone: cleanText(record.tone, input.tone),
      productionMode: cleanText(record.productionMode, input.productionMode),
      outputTarget: cleanText(record.outputTarget, input.outputTarget),
      mustHave: cleanText(record.mustHave, input.mustHave),
      avoid: cleanText(record.avoid, input.avoid),
      titleSuggestion: cleanText(record.titleSuggestion, "短剧开发建议"),
      premise: cleanText(record.premise, "这个想法适合按短剧分集推进。"),
      hook: cleanText(record.hook, "每集用人物行动和新证据制造追看。"),
      revisionNotes:
        Array.isArray(record.revisionNotes) && record.revisionNotes.length > 0
          ? record.revisionNotes
              .filter((note): note is string => typeof note === "string")
              .slice(0, 5)
          : ["已根据想法自动补齐生成参数。"],
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "DeepSeek 简析请求失败。";

    return fallbackJubenAnalysis(input, reason);
  }
}

export async function generateJubenResult(
  body: JubenRequestBody,
): Promise<JubenResult> {
  const input = normalizeJubenRequest(body);
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return ensureJubenCoverage(
      fallbackJubenResult(input, "DEEPSEEK_API_KEY is not configured."),
      input,
      { detailEpisodes: [1] },
    );
  }

  try {
    const parsed = await requestDeepSeekJson(
      buildJubenSeedMessages(input),
      Number(process.env.JUBEN_SEED_MAX_TOKENS ?? 5200),
    );

    if (!looksLikeJubenResult(parsed)) {
      return ensureJubenCoverage(
        fallbackJubenResult(
          input,
          "DeepSeek JSON did not match the expected structure.",
        ),
        input,
        { detailEpisodes: [1] },
      );
    }

    return ensureJubenCoverage({
      ...parsed,
      meta: {
        ...parsed.meta,
        provider: "deepseek",
        model: DEEPSEEK_MODEL,
        generatedAt: new Date().toISOString(),
      },
    }, input, { detailEpisodes: [1] });
  } catch {
    return ensureJubenCoverage(
      fallbackJubenResult(
        input,
        `DeepSeek request exceeded ${DEEPSEEK_TIMEOUT_MS}ms or failed before completion.`,
      ),
      input,
      { detailEpisodes: [1] },
    );
  }
}

export async function generateJubenEpisodeResult(
  body: JubenEpisodeRequestBody,
): Promise<JubenResult> {
  const input = normalizeJubenRequest(body);
  const episode = clampEpisodeCount(body.episode ?? 1);
  const baseResult =
    body.baseResult && looksLikeJubenResult(body.baseResult)
      ? ensureJubenCoverage(body.baseResult, input, {
          detailEpisodes: [episode],
        })
      : fallbackJubenResult(input, "Missing base result; used local structure.");
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return ensureJubenCoverage(
      {
        ...fallbackJubenResult(input, "DEEPSEEK_API_KEY is not configured."),
        meta: baseResult.meta,
        storyBible: baseResult.storyBible,
        visualBible: baseResult.visualBible,
        episodeOutline: baseResult.episodeOutline,
      },
      input,
      { detailEpisodes: [episode] },
    );
  }

  try {
    const parsed = await requestDeepSeekJson(
      buildJubenEpisodeMessages(input, baseResult, episode),
      Number(process.env.JUBEN_EPISODE_MAX_TOKENS ?? 4600),
    );

    if (!looksLikeJubenResult(parsed)) {
      throw new Error("DeepSeek episode JSON did not match the expected structure.");
    }

    return ensureJubenCoverage(
      {
        ...parsed,
        meta: {
          ...baseResult.meta,
          provider: "deepseek",
          model: DEEPSEEK_MODEL,
          generatedAt: new Date().toISOString(),
        },
        storyBible: baseResult.storyBible,
        visualBible: baseResult.visualBible,
        episodeOutline: baseResult.episodeOutline,
      },
      input,
      { detailEpisodes: [episode] },
    );
  } catch {
    return ensureJubenCoverage(
      {
        ...fallbackJubenResult(
          input,
          `DeepSeek episode request exceeded ${DEEPSEEK_TIMEOUT_MS}ms or failed before completion.`,
        ),
        meta: baseResult.meta,
        storyBible: baseResult.storyBible,
        visualBible: baseResult.visualBible,
        episodeOutline: baseResult.episodeOutline,
      },
      input,
      { detailEpisodes: [episode] },
    );
  }
}
