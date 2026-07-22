import {
  parseJubenSource,
  sourceFidelityWarnings,
  type JubenSourceManifest,
} from "./juben-source";

export type JubenRequestBody = {
  idea?: string;
  sourceMode?: string;
  sourceFilename?: string;
  adaptationMode?: string;
  genre?: string;
  audience?: string;
  episodeCount?: number;
  episodeLength?: string;
  aspectRatio?: string;
  tone?: string;
  productionMode?: string;
  outputTarget?: string;
  voiceLanguage?: string;
  mustHave?: string;
  avoid?: string;
};

export type JubenAnalysisResult = Required<JubenRequestBody> & {
  titleSuggestion: string;
  premise: string;
  hook: string;
  revisionNotes: string[];
  sourceManifest: JubenSourceManifest;
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

export type JubenProductionPlan = {
  adaptationBrief: string;
  shootingStrategy: string;
  locationPlan: string[];
  referenceAssets: string[];
  generationOrder: string[];
  qualityGates: string[];
};

export type JubenResult = {
  meta: {
    title: string;
    logline: string;
    format: string;
    provider: "deepseek" | "source-locked" | "local-structured-fallback";
    model: string;
    generatedAt: string;
  };
  diagnosis: {
    corePromise: string;
    realAudienceHook: string;
    trailerRisk: string;
    fixStrategy: string;
  };
  sourceManifest: JubenSourceManifest;
  fidelityReport: {
    score: number;
    status: "locked" | "review" | "creative";
    warnings: string[];
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
  productionPlan: JubenProductionPlan;
  visualBible: JubenVisualBible;
  episodeOutline: Array<{
    episode: number;
    title: string;
    hook: string;
    objective: string;
    obstacle: string;
    beats: string[];
    turn: string;
    cliffhanger: string;
    durationPlan: string[];
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
const DEEPSEEK_EPISODE_TIMEOUT_MS = Number(
  process.env.JUBEN_EPISODE_TIMEOUT_MS ?? 55000,
);

const maxIdeaLength = 180000;

export class JubenSourceParseError extends Error {
  sourceManifest: JubenSourceManifest;

  constructor(message: string, sourceManifest: JubenSourceManifest) {
    super(message);
    this.name = "JubenSourceParseError";
    this.sourceManifest = sourceManifest;
  }
}

function assertUsableDocumentSource(
  source: JubenSourceManifest,
  episode?: number,
) {
  if (source.mode !== "document") return;
  if (source.scenes.length === 0) {
    throw new JubenSourceParseError(
      "没有从文档中识别到任何场次，已停止生成，避免把示例内容误当成客户原稿。请使用【场 2-1】、[场2-1]、【场景一】等分场标题，或先把正文粘贴到输入框。",
      source,
    );
  }
  if (episode && !source.scenes.some((scene) => scene.episode === episode)) {
    throw new JubenSourceParseError(
      `原稿中没有识别到第 ${episode} 集的场次，已停止生成这一集，避免补写无关剧情。`,
      source,
    );
  }
}

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
  const idea =
    cleanText(body.idea) ||
    "一个外卖骑手在暴雨夜送错一份盒饭，发现收餐人三年前已经死亡；他越想退款，越被卷入一桩旧案和一个仍在等待真相的家庭。";
  const source = parseJubenSource({ ...body, idea });
  const isDocument = source.mode === "document";

  return {
    idea,
    sourceMode: cleanText(body.sourceMode, source.mode),
    sourceFilename: cleanText(body.sourceFilename),
    adaptationMode: cleanText(
      body.adaptationMode,
      isDocument ? "忠实拆解" : "创意扩写",
    ),
    genre: isDocument ? source.genre : cleanText(body.genre, "悬疑短剧"),
    audience: cleanText(body.audience, "18-35 岁，喜欢强钩子、强反转、真实人物动机的短剧用户"),
    episodeCount: isDocument
      ? clampEpisodeCount(source.episodeCount)
      : clampEpisodeCount(body.episodeCount),
    episodeLength: isDocument
      ? source.episodeLength
      : cleanText(body.episodeLength, "90 秒"),
    aspectRatio: cleanText(body.aspectRatio, "9:16 竖屏"),
    tone: cleanText(body.tone, "现实主义、紧张、克制、有生活质感"),
    productionMode: cleanText(body.productionMode, "短剧分集"),
    outputTarget: cleanText(body.outputTarget, "Lovart 分镜图 + Grok 视频生成"),
    voiceLanguage: cleanText(body.voiceLanguage, "中文"),
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
    '  "sourceManifest": {"mode": "document", "filename": "...", "title": "...", "genre": "...", "episodeCount": 2, "episodeLength": "5 分钟", "formatLine": "...", "characters": [{"name": "...", "description": "..."}], "episodes": [{"episode": 1, "label": "上集", "title": "...", "sceneCount": 8}], "scenes": [], "anchorLines": ["..."], "protectedFacts": ["..."], "fidelityMode": "忠实拆解", "warnings": []},',
    '  "fidelityReport": {"score": 100, "status": "locked", "warnings": []},',
    '  "storyBible": {"theme": "...", "world": "...", "protagonist": "...", "antagonist": "...", "relationshipEngine": "...", "conflictEngine": "...", "visualRules": ["..."]},',
    '  "productionPlan": {"adaptationBrief": "...", "shootingStrategy": "...", "locationPlan": ["..."], "referenceAssets": ["..."], "generationOrder": ["..."], "qualityGates": ["..."]},',
    '  "visualBible": {"format": "...", "coreStyle": "...", "colorPalette": ["..."], "cameraLanguage": ["..."], "productionLogic": ["..."], "environmentRules": ["..."], "characterLocks": [{"character": "...", "lockedPrompt": "..."}], "keyProps": ["..."], "globalPrompt": "...", "globalNegative": "..."},',
    '  "episodeOutline": [{"episode": 1, "title": "...", "hook": "...", "objective": "...", "obstacle": "...", "beats": ["..."], "turn": "...", "cliffhanger": "...", "durationPlan": ["0-5秒：..."]}],',
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
  const sourceManifest = parseJubenSource(input);

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
        "必须输出 visualBible，按真人影视制作圣经来写：全剧格式、核心风格、色彩、摄影语言、生产逻辑、环境规则、人物锁定 prompt、全局正向 prompt 和全局负向约束。",
        "必须输出 productionPlan，把改编方向、低成本拍法、可复用场景、角色/场景/道具参考资产、AI生成顺序和质量审批节点写清楚。",
        "visualBible 的人物锁定必须能直接用于角色定妆和每个镜头首帧，避免人物漂移。",
        "所有镜头 prompt 必须接近 LibTV 分镜提示词密度：使用 @角色 和 @场景/道具 标签；明确出场角色、背景场景、前一个镜头承接、分段动作、禁止项、约束、站位与朝向、运镜、音效。",
        "shotList.visual 必须写成可拍画面，不少于 45 个中文字符；shotList.action 必须包含具体身体动作、道具交互、站位关系和情绪变化；continuity 必须说明与上一镜/下一镜怎么接。",
        "cameraPrompts.prompt 要写视频运动提示词，不只写镜头名；必须包含分段秒数、主体运动、摄影机运动、景深/焦点变化、光影变化和不可违反的角色位置。",
        "storyboardPrompts.prompt 要写最终分镜提示词，不少于 80 个中文字符，必须包含景别、光影氛围、人物服装/道具、空间层次和视觉风格。",
        "editPrompts.prompt 要说明剪辑节奏、声音桥、对白口型、动作点和结尾钩子，不要只说快切或慢切。",
        "默认使用中文输出。只有 creativeBrief.voiceLanguage 明确不是中文时，才把对白、配音脚本和可读提示词翻成对应语言；结构字段名仍保持 JSON schema 不变。",
        "即使输出给国际视频模型，也不要整段默认英语化；中文用户的创作工作流优先中文。",
        "如果 sourceManifest.mode 是 document，这不是自由创作任务，而是原稿影视化拆解任务。标题、人物姓名与关系、分集数量、场次顺序、关键事件、关键对白和结局都是硬约束。",
        "忠实拆解允许把一个长场次拆成更多可生成镜头、补足动作连续性和摄影信息，但不允许新增无关主角、替换地点、篡改因果、把原稿换成相似题材故事。",
        "sourceManifest.protectedFacts 和 anchorLines 必须在结果中可追溯。任何与原稿无关的样例内容都视为严重错误。",
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
          sourceManifest,
          outputRules: [
            "episodeOutline 数量必须等于 episodeCount。",
            "每集必须写 objective、obstacle、turn、cliffhanger，并用 durationPlan 按秒分配开场钩子、冲突升级、反转和结尾停点。",
            "每集至少 2 个导演场景；每个导演场景至少 3 个镜头。",
            "directorScript 必须像剧本，不要像梗概。",
            "shotList 必须能被导演、摄影、AI视频工具直接使用。",
            "storyboardPrompts 用于分镜图生成；cameraPrompts 用于视频运镜；editPrompts 用于剪辑节奏。",
            "voiceoverScript 只在需要时使用旁白，优先对白和行动推进。",
            "qualityChecklist 必须包含反宣传片检查项。",
            `输出语言/配音语言：${input.voiceLanguage}。`,
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
  const sourceManifest = parseJubenSource(input);

  return [
    system,
    {
      role: "user",
      content: JSON.stringify(
        {
          creativeBrief: input,
          sourceManifest,
          mode: "quick_seed",
          targetEpisode: 1,
          outputRules: [
            "先快速生成故事圣经、视觉圣经和全剧分集结构。第 1 集只需生成原稿场景级导演剧本和少量代表镜头，完整逐镜包由后续单集接口生成。",
            "episodeOutline 数量必须等于 episodeCount。",
            "分集结构不能只是剧情摘要；每集都要有具体目标、具体阻碍、关系变化、信息反转和按秒节拍。",
            "directorScript、shotList、storyboardPrompts、cameraPrompts、editPrompts 只生成 E01，不要一次性生成后面所有集。",
            "E01 至少 2 个导演场景；每个导演场景至少 3 个镜头。",
            "visualBible 必须包含全剧风格、人物、色彩、环境定调和全局 prompt。",
            "productionPlan 必须列出先生成角色定妆、场景、关键道具，再生成代表镜头和批量镜头的顺序。",
            "所有镜头都按 LibTV 镜头表思路写：画面描述、景别、光影氛围、对白/旁白、音效、运镜、最终提示词都要足够具体。",
            "文档模式下逐场对应 sourceManifest.scenes，E01 不得漏掉原稿第一集场次，不得把别的故事套进来。",
            `输出语言/配音语言：${input.voiceLanguage}。默认中文，不要无故写成英语。`,
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
  const sourceManifest = parseJubenSource(input);
  const sourceEpisodeScenes = sourceManifest.scenes.filter(
    (scene) => scene.episode === episode,
  );
  const sourceContext = {
    mode: sourceManifest.mode,
    filename: sourceManifest.filename,
    title: sourceManifest.title,
    genre: sourceManifest.genre,
    episodeCount: sourceManifest.episodeCount,
    episodeLength: sourceManifest.episodeLength,
    characters: sourceManifest.characters,
    episodes: sourceManifest.episodes.filter((item) => item.episode === episode),
    scenes: sourceEpisodeScenes,
    anchorLines: sourceManifest.anchorLines,
    protectedFacts: sourceManifest.protectedFacts,
    fidelityMode: sourceManifest.fidelityMode,
  };

  return [
    {
      role: "system",
      content: [
        "你是资深短剧分镜导演，负责把一集已锁定原稿拆成可直接交给AI视频平台的镜头表。",
        "这是原稿影视化，不是自由创作。不得新增无关人物、地点、事件、对白或结局；不得套用任何示例故事。",
        "必须按原稿场次顺序覆盖全部场次；原稿对白逐字保留。每镜8-15秒，可包含2-3段连续动作，但只有一个核心叙事任务和一条清楚运镜。",
        "画面描述必须具体到人物、站位、朝向、身体动作、道具接触、表情变化、前中后景和镜头结束状态，不能写抽象氛围句。",
        "shotList.visual 不少于60个中文字符；action 写清开始状态、动作链和结束状态；continuity 明确承接上一镜的服装、道具、站位、视线和环境。",
        "输出语言默认中文。不得写成宣传片、预告片、概念片、海报文案或英语提示词。",
        "只返回严格JSON，不要Markdown。JSON只含 directorScript 与 shotList 两个数组。",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          creativeBrief: {
            adaptationMode: input.adaptationMode,
            aspectRatio: input.aspectRatio,
            episodeLength: input.episodeLength,
            tone: input.tone,
            voiceLanguage: input.voiceLanguage,
            mustHave: input.mustHave,
            avoid: input.avoid,
          },
          sourceManifest: sourceContext,
          mode: "single_episode_detail",
          targetEpisode: episode,
          establishedVisualBible: {
            format: baseResult.visualBible.format,
            coreStyle: baseResult.visualBible.coreStyle,
            colorPalette: baseResult.visualBible.colorPalette,
            cameraLanguage: baseResult.visualBible.cameraLanguage,
            characterLocks: baseResult.visualBible.characterLocks,
            keyProps: baseResult.visualBible.keyProps,
            globalNegative: baseResult.visualBible.globalNegative,
          },
          episodeOutline: baseResult.episodeOutline.find((item) => item.episode === episode),
          responseSchema: {
            directorScript: [{
              sceneId: `E${String(episode).padStart(2, "0")}-S01`,
              episode,
              sceneHeading: "内/外. 原稿地点 - 时间",
              dramaticPurpose: "本场目标",
              conflict: "具体阻碍",
              action: "按原稿发生的可拍动作",
              dialogue: [{ character: "原稿角色", line: "原稿对白", subtext: "表演提示" }],
              emotionalTurn: "本场结束状态",
            }],
            shotList: [{
              shotId: `E${String(episode).padStart(2, "0")}-S01-01`,
              sceneId: `E${String(episode).padStart(2, "0")}-S01`,
              shotSize: "景别",
              cameraAngle: "机位与构图",
              movement: "单一明确运镜",
              duration: "12s",
              visual: "详细画面描述",
              action: "开始状态→动作链→结束状态",
              sound: "原稿对白、动作音效、环境底噪",
              continuity: "与前后镜的连续性约束",
            }],
          },
          outputRules: [
            `只生成 E${String(episode).padStart(2, "0")} 的导演剧本与镜头表。`,
            "保留 establishedVisualBible 的角色锁定、色彩、场景、全局负向约束，不要换演员脸和整体风格。",
            "directorScript 必须与 sourceManifest.scenes 一一对应，sceneId 顺序连续，不得漏场。",
            "镜头按8-15秒生产片段设计，每场通常2-5镜；长动作可以拆，短动作不能注水。",
            "每个镜头必须有明确首帧、分段动作和结束状态，后续系统会据此组装 LibTV 式完整提示词。",
            "文档模式下必须覆盖 sourceEpisodeScenes 的全部场次和原稿对白，不得删掉原稿冲突，不得新增无关人物与地点。",
            `输出语言/配音语言：${input.voiceLanguage}。默认中文，不要无故写成英语。`,
            "不要输出其他集的导演场景和镜头。",
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
  const sourceManifest = parseJubenSource(input);

  return [
    {
      role: "system",
      content: [
        "你是短剧平台的选题策划和制片开发编辑。",
        "用户只会先输入一个想法。你要先做创意简析，并自动补齐后续生成剧本包需要的参数。",
        "优先根据 idea 重新判断类型、受众、集数、时长和气质；不要因为表单里已有默认值就机械保留，除非 idea 明确要求固定规格。",
        "判断要偏短剧工业化：类型、受众、集数、单集时长、画幅、气质、输出/配音语言、必须保留、避免方向。",
        "默认输出/配音语言是中文；只有用户想法或 currentDraft.voiceLanguage 明确指定其他语言时，才建议英语、俄语、印尼语或阿拉伯语。",
        "如果检测到完整剧本文档，必须优先读取原稿已写明的标题、题材、集数、单集时长、人物与场次，不能拿表单默认值覆盖原稿。",
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
          '  "voiceLanguage": "中文",',
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
          sourceManifest,
          instruction:
            "根据 idea 自动生成后面参数。表单可能带有默认值，不要把默认值当成用户明确选择；文档模式必须严格采用 sourceManifest 中的原稿规格。如果明显不适合短剧，可以在 revisionNotes 里提示。",
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
  const source = parseJubenSource(input);

  if (source.mode === "document") {
    const firstScene = source.scenes[0];
    const lastScene = source.scenes[source.scenes.length - 1];
    const characterNames = source.characters.map((item) => item.name).join("、");

    return {
      ...input,
      sourceMode: "document",
      genre: source.genre,
      episodeCount: source.episodeCount,
      episodeLength: source.episodeLength,
      productionMode: "原稿忠实拆解",
      adaptationMode: input.adaptationMode || "忠实拆解",
      titleSuggestion: source.title,
      premise: firstScene
        ? `原稿从“${firstScene.heading}”展开，围绕${characterNames || "原稿人物"}的选择与代价推进，需保留原场次因果并补足可拍动作。`
        : `把《${source.title}》按原稿事实拆成可执行的导演与AI镜头生产包。`,
      hook: lastScene?.dialogue.at(-1)?.line || source.anchorLines.at(-1) || "保留原稿反转和结尾落点。",
      mustHave: [
        `必须保留原稿标题《${source.title}》`,
        characterNames ? `必须保留人物：${characterNames}` : "",
        source.scenes.length ? `必须按原稿 ${source.scenes.length} 场的顺序和因果拆解` : "",
        "原稿对白可拆分但不得擅自改写核心含义；只补足动作、机位、声音和连续性",
      ].filter(Boolean).join("；"),
      avoid:
        "不得新增与原稿无关的人物、地点和主线；不得套用样例故事；不得把廉洁主题拍成口号宣传片；不得用旁白替代原稿冲突。",
      revisionNotes: [
        reason,
        `已识别为完整剧本文档：${source.episodeCount} 集、${source.scenes.length} 场、${source.characters.length} 个锁定角色。`,
        "建议先核对原稿清单，再按单集生成逐镜包，避免一次请求过长。",
      ],
      sourceManifest: source,
    };
  }

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
    sourceManifest: source,
  };
}

function fallbackVisualBible(
  input: Required<JubenRequestBody>,
  title: string,
): JubenVisualBible {
  const source = parseJubenSource(input);
  const isWestern =
    /美国西部|西部荒原|西部边境|牛仔|牧场主|拓荒|frontier|western/i.test(
      input.idea,
    );
  const isBritishGothic =
    /英伦|英格兰|玫瑰战争|约克|都铎|王国大厅|哥特权谋|城堡主卧/.test(
      input.idea,
    );
  const sourceLocations = Array.from(
    new Set(source.scenes.map((scene) => scene.heading.split(" - ")[0].replace(/^(内|外)\.\s*/, ""))),
  ).filter(Boolean);
  const characterLocks = source.characters.length > 0
    ? source.characters.map((item) => ({
        character: item.name,
        lockedPrompt: `${item.description}。真人写实定妆，年龄、发型、服装、身份道具和面部特征在全剧保持一致。`,
      }))
    : [
        {
          character: "主角",
          lockedPrompt: `${input.genre} 主角，现实生活质感，明确欲望和压力，服装道具连续，面部特征稳定。`,
        },
        {
          character: "核心阻碍者",
          lockedPrompt:
            "短剧反派或阻碍者，真实人物动机，表演克制，压迫感来自关系和信息差，不靠夸张造型。",
        },
      ];
  const propCandidates = [
    "佩剑",
    "短剑",
    "圣水瓶",
    "验尸工具",
    "假死药瓶",
    "密信",
    "吸血鬼獠牙",
    "蛛丝团",
    "黑焰甲片",
    "铜烛台",
    "玫瑰纹腰牌",
    "黑镜",
    "药碗",
    "手机",
    "电脑",
    "镜子",
    "旧照片",
  ].filter((item) => input.idea.includes(item));

  if (isWestern) {
    return {
      format:
        `${input.aspectRatio} 真人竖屏短剧，1875 年美国西部哥特悬疑爱情，不恶搞，不做奇幻 cosplay。`,
      coreStyle:
        "真人写实电影质感，1875 美国西部荒原哥特爱情惊悚；偏远农舍、草原暴风、谷仓阁楼、废弃小教堂、烛光室内、雨、泥、银镜、旧圣经、天鹅绒斗篷；严肃悬疑与禁忌吸引并行，手机竖屏需要大量近脸特写。",
      colorPalette: [
        "暴风冷蓝",
        "烛火琥珀",
        "黑色皮革",
        "深海军蓝天鹅绒",
        "骨白肤色",
        "铁锈棕泥土",
        "银镜高光",
      ],
      cameraLanguage: [
        "适合手机屏幕的近脸特写",
        "门框构图制造压迫",
        "镜面揭示身份异常",
        "一帧阴影惊吓点",
        "锁定机位的戏剧停顿",
        "少量场景反复使用",
      ],
      productionLogic: [
        "禁忌吸引",
        "妻子的怀疑",
        "外来女人破坏家庭",
        "背叛与反咬",
        "超自然惩罚",
        "每集结尾必须有钩子",
      ],
      environmentRules: [
        "场景控制在农舍、谷仓、小教堂和荒原马车附近。",
        "反复使用雨、泥、烛光、木质室内和草原风暴作为质感。",
        "不做奇幻 cosplay；所有超自然迹象都通过实物、表演、光影和镜面反射出现。",
      ],
      characterLocks: [
        {
          character: "约翰",
          lockedPrompt:
            "34 岁美国西部牧场主，退役骑兵，湿黑帽、深色皮革外套、短胡子、疲惫蓝灰眼，左轮枪低垂，带愧疚感的保护者气质。",
        },
        {
          character: "玛莎",
          lockedPrompt:
            "30 岁牧场妻子，米色印花棉布长裙、深色编发、眼神锐利，务实克制，随身银手镜、小圣经或念珠，幸存者气质。",
        },
        {
          character: "莉莉丝",
          lockedPrompt:
            "外表 24 岁的欧洲落魄贵族女人，苍白面孔，破损深蓝黑天鹅绒斗篷带金色刺绣，优雅口音，危险的静止感，美丽但具有捕食性，不裸露。",
        },
        {
          character: "克劳牧师",
          lockedPrompt:
            "年迈半疯的边境牧师，破旧黑外套，嗓音沙哑，念珠和银杯，懂旧世界怪物但并不圣洁。",
        },
      ],
      keyProps: [
        "银手镜",
        "旧圣经或念珠",
        "湿黑帽",
        "深蓝黑天鹅绒斗篷",
        "蜡烛",
        "谷仓麻绳",
        "泥泞门槛",
      ],
      globalPrompt: `${title}，西部哥特爱情惊悚版，真人写实竖屏短剧，1875 美国边境荒原，偏远农舍、谷仓、小教堂、烛光室内、草原风暴、雨和泥，严肃悬疑爱情，手机屏幕近脸特写，人物身份和服装必须连续，${input.aspectRatio}。`,
      globalNegative:
        "画面内不要文字，不要水印，不要 logo，不要内嵌字幕，不要现代物品，除非明确指定；不要裸露，不要血腥 gore，不要畸形手，不要多指，不要重复脸，不要低清模糊，必须保持角色身份一致。",
    };
  }

  if (isBritishGothic) {
    return {
      format: `${input.aspectRatio} 真人写实微短剧，架空玫瑰战争时期英伦哥特权谋悬疑，不做美国西部，不做奇幻 cosplay。`,
      coreStyle:
        "真人写实英伦哥特宫廷短剧，冷青石墙与暖橙烛火对撞，雾、城堡、行营、旧教堂与审判大厅；超自然只通过局部特写、影子、实物和声音显形，人物关系与权谋信息优先。",
      colorPalette: [
        "哥特青灰",
        "惨白月光",
        "烛火暖橙",
        "病黄烛光",
        "毒液冷蓝",
        "玫瑰暗红",
        "铅灰黎明",
      ],
      cameraLanguage: [
        "竖屏中央轴近脸特写",
        "门框、廊柱与高窗形成纵向压迫",
        "关键证物大特写承担叙事",
        "动作段手持跟拍与短促快切",
        "反转前锁定机位留表演停顿",
        "超自然出现前保留半秒静默",
      ],
      productionLogic: [
        "先锁人物定妆与双时间线服装",
        "按原稿场次顺序逐镜生成",
        "每个视频片段只执行一个主动作",
        "关键对白保留准确口型",
        "证物状态跨集连续",
        "每集结尾落实原稿钩子",
      ],
      environmentRules: [
        `原稿空间锁定为：${sourceLocations.join("、")}；不得替换成现代城市、美国西部或无关棚景。`,
        "同一场景的入口、主光方向、人物轴线、门窗和主要陈设必须固定。",
        "超自然迹象少而明确，不用大面积魔法特效或宣传片式空镜代替剧情。",
      ],
      characterLocks,
      keyProps: propCandidates.length > 0 ? propCandidates : ["双王子佩剑", "圣水", "密信", "黑镜"],
      globalPrompt: `${title}，架空玫瑰战争时期英伦哥特权谋悬疑，真人写实${input.aspectRatio}短剧，冷青石墙与暖橙烛火对撞，城堡、行营与审判大厅，近脸特写和证物大特写，人物身份、时代服装、武器、伤痕与道具状态严格连续，按原稿因果逐镜表演，不做美国西部，不做海报或预告片。`,
      globalNegative:
        "画面内不要文字、水印、logo、内嵌字幕；不要现代物品、美国西部服装、牛仔帽、农舍马车套模板；不要奇幻 cosplay、裸露、血腥 gore、畸形手、多指、重复脸、低清模糊、海报构图、空镜蒙太奇；不得改变原稿人物身份和时代背景。",
    };
  }

  return {
    format: `${input.aspectRatio} 真人短剧，${input.productionMode}，面向 ${input.outputTarget}。`,
    coreStyle:
      "真人写实竖屏短剧，小场景、真实地点、手机屏幕近脸特写、克制悬疑、实用道具、角色外貌和服装连续。",
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
      sourceLocations.length > 0
        ? `原稿场景锁定为：${sourceLocations.join("、")}；不得擅自替换为无关地点。`
        : "场景数量控制在少量可复用空间。",
      "所有风格选择服务人物关系和信息揭示。",
      "避免空镜、概念镜头和预告片式混剪。",
    ],
    characterLocks,
    keyProps: propCandidates.length > 0 ? propCandidates : ["原稿关键道具", "人物身份道具", "连续性证据物"],
    globalPrompt: `${title}，真人写实竖屏短剧，${input.tone}，真实小场景，近脸特写，戏剧冲突明确，人物身份连续，道具清楚，不要预告片混剪，${input.aspectRatio}。`,
    globalNegative:
      "画面内不要文字，不要水印，不要 logo，不要字幕，不要未指定的现代物品，不要裸露，不要血腥 gore，不要畸形手，不要多指，不要重复脸，不要低清模糊，不要海报构图，不要空镜氛围蒙太奇。",
  };
}

export function fallbackJubenResult(
  input: Required<JubenRequestBody>,
  reason = "DeepSeek 暂不可用，已按当前原稿生成结构化备用稿。",
): JubenResult {
  const sourceManifest = parseJubenSource(input);
  assertUsableDocumentSource(sourceManifest);
  const title = sourceManifest.title || "未命名短剧";
  const episodeCount = sourceManifest.mode === "document"
    ? sourceManifest.episodeCount
    : input.episodeCount;
  const secondsMatch = input.episodeLength.match(/(\d+)/);
  const totalSeconds = secondsMatch
    ? Number(secondsMatch[1]) * (input.episodeLength.includes("分钟") ? 60 : 1)
    : 90;
  const episodeOutline = Array.from({ length: episodeCount }, (_, index) => {
    const episode = index + 1;
    const sourceEpisode = sourceManifest.episodes.find((item) => item.episode === episode);
    const sourceScenes = sourceManifest.scenes.filter((scene) => scene.episode === episode);
    const firstScene = sourceScenes[0];
    const lastScene = sourceScenes[sourceScenes.length - 1];
    const segment = Math.max(1, Math.floor(totalSeconds / Math.max(sourceScenes.length, 1)));
    const beats = sourceScenes.length > 0
      ? sourceScenes.map((scene) => {
          const dialogue = scene.dialogue[0];
          return `${scene.sourceLabel} ${scene.heading}：${scene.action.slice(0, 90)}${dialogue ? `；${dialogue.character}：“${dialogue.line}”` : ""}`;
        })
      : [input.idea.slice(0, 180)];

    return {
      episode,
      title: sourceEpisode?.title || episodeTitle(title, episode),
      hook:
        firstScene?.dialogue[0]?.line ||
        firstScene?.action.slice(0, 120) ||
        `从“${input.idea.slice(0, 90)}”直接进入人物行动。`,
      objective:
        firstScene
          ? `按原稿完成从“${firstScene.heading}”到本集结尾的选择链，不改变人物和因果。`
          : "让主角用一个可见行动推进当前冲突。",
      obstacle:
        firstScene?.dialogue[1]?.line ||
        firstScene?.dialogue[0]?.line ||
        firstScene?.action.slice(0, 120) ||
        "现实压力和人物关系阻止主角完成目标。",
      beats,
      turn:
        lastScene?.dialogue.at(-1)?.line ||
        lastScene?.action.slice(-120) ||
        "主角必须为自己的选择承担后果。",
      cliffhanger:
        lastScene?.dialogue.at(-1)?.line ||
        lastScene?.action.slice(-120) ||
        (episode === episodeCount ? "原稿结局落地。" : "原稿下一集冲突被打开。"),
      durationPlan: sourceScenes.length > 0
        ? sourceScenes.map((scene, sceneIndex) => {
            const start = sceneIndex * segment;
            const end = sceneIndex === sourceScenes.length - 1
              ? totalSeconds
              : Math.min(totalSeconds, (sceneIndex + 1) * segment);
            return `${start}-${end}秒：${scene.sourceLabel} ${scene.heading}`;
          })
        : [
            "0-5秒：用原始剧情中的具体动作开场。",
            `5-${Math.max(6, totalSeconds - 8)}秒：推进冲突与选择。`,
            `${Math.max(0, totalSeconds - 8)}-${totalSeconds}秒：落在原稿反转或停点。`,
          ],
    };
  });

  const sourceScenes = sourceManifest.scenes.length > 0
    ? sourceManifest.scenes
    : Array.from({ length: episodeCount }, (_, index) => ({
        episode: index + 1,
        sourceLabel: "创意场景",
        heading: "内. 核心冲突现场 - 日",
        action: input.idea.slice(0, 800),
        dialogue: [],
        beats: [{ kind: "action" as const, text: input.idea.slice(0, 800) }],
      }));
  const directorScript: JubenScene[] = sourceScenes.map((scene, index) => {
    const scenesInEpisode = sourceScenes.filter((item) => item.episode === scene.episode);
    const sceneIndex = scenesInEpisode.indexOf(scene) + 1;
    const dialogue = scene.dialogue.map((line) => ({
      character: line.character,
      line: line.line,
      subtext: line.note || "保留原稿语义与人物态度，表演克制。",
    }));

    return {
      sceneId: `${episodeCode(scene.episode)}-S${String(sceneIndex).padStart(2, "0")}`,
      episode: scene.episode,
      sceneHeading: scene.heading,
      dramaticPurpose: sceneIndex === 1
        ? "忠实建立本集人物目标、关系压力和第一道选择。"
        : "承接上一场结果，按原稿推进新的证据、压力或人物选择。",
      conflict:
        dialogue.slice(0, 2).map((line) => `${line.character}：${line.line}`).join(" / ") ||
        scene.action.slice(0, 180),
      action: scene.action || "按原稿场景执行人物走位、道具交互和情绪变化。",
      dialogue,
      emotionalTurn:
        dialogue.at(-1)?.line ||
        scene.action.slice(-140) ||
        `原稿第 ${index + 1} 场完成。`,
    };
  });

  const splitDialogueForShots = (line: JubenDialogueLine) => {
    const clauses = line.line.match(/[^，。！？；…]+[，。！？；…]?/g) ?? [line.line];
    const chunks: string[] = [];
    let current = "";

    for (const clause of clauses) {
      if (current && current.length + clause.length > 44) {
        chunks.push(current);
        current = clause;
      } else {
        current += clause;
      }
    }
    if (current) chunks.push(current);

    return chunks.map((chunk) => ({ ...line, line: chunk }));
  };

  const splitActionForShots = (text: string) => {
    const clauses = text.match(/[^。！？；]+[。！？；]?/g) ?? [text];
    const chunks: string[] = [];
    let current = "";

    for (const clause of clauses) {
      if (current && current.length + clause.length > 110) {
        chunks.push(current);
        current = clause;
      } else {
        current += clause;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

  const shotList: JubenShot[] = directorScript.flatMap((scene) => {
    const sceneNumber = Number(scene.sceneId.match(/-S(\d+)/)?.[1] || 1);
    const sourceScene = sourceScenes
      .filter((item) => item.episode === scene.episode)[sceneNumber - 1];
    const orderedBeats = sourceScene?.beats ?? [
      { kind: "action" as const, text: scene.action },
      ...scene.dialogue.map((line) => ({
        kind: "dialogue" as const,
        character: line.character,
        line: line.line,
        note: line.subtext,
      })),
    ];
    const productionBeats: Array<
      | { kind: "dialogue"; line: JubenDialogueLine }
      | { kind: "action"; text: string }
    > = [];
    for (const beat of orderedBeats) {
      if (beat.kind === "dialogue") {
        productionBeats.push(...splitDialogueForShots({
          character: beat.character,
          line: beat.line,
          subtext: beat.note,
        }).map((line) => ({ kind: "dialogue" as const, line })));
      } else {
        productionBeats.push(...splitActionForShots(beat.text).map((text) => ({
          kind: "action" as const,
          text,
        })));
      }
    }
    const beatShots: JubenShot[] = productionBeats.map((beat, index) => {
      const shotOffset = sourceManifest.mode === "document" ? 1 : 2;
      const shotId = `${scene.sceneId}-${String(index + shotOffset).padStart(2, "0")}`;

      if (beat.kind === "dialogue") {
        return {
          shotId,
          sceneId: scene.sceneId,
          shotSize: index % 2 === 0 ? "中近景" : "近景反打",
          cameraAngle: index % 2 === 0 ? "平视人物，保留对手肩部前景" : "反打平视，保持180度轴线",
          movement: "对白起句轻推，句尾停住反应",
          duration: `${Math.max(8, Math.min(15, Math.ceil(beat.line.line.length / 4) + 5))}s`,
          visual: `${beat.line.character}在${scene.sceneHeading}中说出原稿对白：“${beat.line.line}”，对手反应必须留在画面空间关系内。`,
          action: `${beat.line.character}按“${beat.line.subtext}”完成细小动作并准确对口型，不增加原稿之外的行为。`,
          sound: `${beat.line.character}原稿对白清楚，保留现场底噪，不铺满配乐。`,
          continuity: `承接${scene.sceneId}上一镜站位、视线、服装和道具状态；对白内容不得改写。`,
        };
      }

      return {
        shotId,
        sceneId: scene.sceneId,
        shotSize: index % 3 === 0 ? "中景动作镜头" : "近景动作细节",
        cameraAngle: index % 3 === 0 ? "平视保持空间关系" : "三分之二侧面贴近手部、关键道具或表情",
        movement: index % 2 === 0 ? "跟随主动作短移后锁定" : "固定机位，动作完成后轻推",
        duration: `${Math.max(8, Math.min(15, Math.ceil(beat.text.length / 11) + 4))}s`,
        visual: `${scene.sceneHeading}。严格执行原稿动作：${beat.text}`,
        action: "只执行这一段原稿动作，明确起始姿态、道具接触和结束状态，不提前表演下一镜。",
        sound: "保留与动作对应的脚步、衣料、金属、纸张、门或空间环境声。",
        continuity: `按原稿顺序承接${scene.sceneId}前一动作，人物站位、道具状态和视线不得跳变。`,
      };
    });

    const framedShots = [
      {
        shotId: `${scene.sceneId}-01`,
        sceneId: scene.sceneId,
        shotSize: "中景建立",
        cameraAngle: "平视略广，交代人物与关键道具位置",
        movement: "短距离跟入后锁定",
        duration: "4s",
        visual: `${scene.sceneHeading}的真实空间建立镜头，人物已处于原稿开场站位，关键道具清楚可见。`,
        action: "只建立空间、人物站位和第一道视线关系，不增加原稿事件。",
        sound: "真实现场底噪先入，保持声音连续。",
        continuity: "锁定场景入口、人物左右站位、主光方向和关键道具位置。",
      },
      ...beatShots,
      {
        shotId: `${scene.sceneId}-${String(beatShots.length + 2).padStart(2, "0")}`,
        sceneId: scene.sceneId,
        shotSize: "反应特写",
        cameraAngle: "正面或三分之二侧面，聚焦选择后的反应",
        movement: "静止停顿，结尾轻微推近",
        duration: "4s",
        visual: scene.emotionalTurn,
        action: "人物消化刚发生的信息，以眼神、呼吸或手部动作完成本场停点。",
        sound: "保留上一句对白尾音和现场底噪，停点前不加口号音乐。",
        continuity: "保持原稿场次顺序，下一镜必须承接本场产生的新状态。",
      },
    ];
    return sourceManifest.mode === "document" && beatShots.length > 0
      ? beatShots
      : framedShots;
  });

  const promptItems = shotList.map((shot, index) => ({
    id: `SB-${String(index + 1).padStart(2, "0")}`,
    sceneId: shot.sceneId,
    prompt: `${input.aspectRatio} 真人短剧首帧，原稿《${title}》，${shot.shotSize}，${shot.cameraAngle}。画面：${shot.visual}。人物动作：${shot.action}。连续性：${shot.continuity}。现实主义表演，人物身份、服装、道具和场景位置严格连续，前中后景清楚，关键动作可读，不做海报。`,
    negativePrompt:
      "不要新增无关人物和地点，不要篡改原稿事件，不要电影海报，不要预告片构图，不要夸张光效，不要空镜堆砌，不要多余文字，不要人物变脸。",
  }));

  const protagonist = sourceManifest.characters[0];
  const antagonist = sourceManifest.characters.find((item) => /总|反派|调查|阻碍/.test(item.name + item.description)) || sourceManifest.characters.at(-1);
  const locations = Array.from(new Set(sourceManifest.scenes.map((scene) => scene.heading.split(" - ")[0])));
  const fidelityWarnings = sourceFidelityWarnings(sourceManifest, {
    title,
    text: JSON.stringify({ episodeOutline, directorScript }),
  });

  return {
    meta: {
      title,
      logline: sourceManifest.mode === "document"
        ? `忠实拆解《${title}》：${episodeOutline[0]?.hook || input.idea.slice(0, 120)}`
        : input.idea.slice(0, 180),
      format: `${input.productionMode} · ${episodeCount} 集 · ${input.episodeLength} · ${input.aspectRatio}`,
      provider:
        sourceManifest.mode === "document"
          ? "source-locked"
          : "local-structured-fallback",
      model: reason,
      generatedAt: new Date().toISOString(),
    },
    diagnosis: {
      corePromise: sourceManifest.mode === "document"
        ? `保留《${title}》原稿人物、场次、对白和结局，只把文学描述翻译成可拍动作与逐镜生产指令。`
        : "把创意变成有目标、阻碍、选择和后果的连续短剧。",
      realAudienceHook: episodeOutline[0]?.hook || "人物的选择与现实代价。",
      trailerRisk: "如果删掉原稿对白和场次因果，只保留主题、氛围和口号，就会拍成宣传片或预告片。",
      fixStrategy: "逐场保留原稿事实；每个镜头只补景别、动作、站位、声音、连续性与AI生成约束。",
    },
    sourceManifest,
    fidelityReport: {
      score: fidelityWarnings.length === 0 ? 100 : Math.max(60, 100 - fidelityWarnings.length * 15),
      status: sourceManifest.mode === "document" ? (fidelityWarnings.length === 0 ? "locked" : "review") : "creative",
      warnings: fidelityWarnings,
    },
    storyBible: {
      theme: /廉洁|审批|合规/.test(input.idea)
        ? "审批审的是数据，批的是良心；每一次选择都在定义一个人。"
        : `《${title}》原稿中的核心选择与代价。`,
      world: locations.length > 0 ? `原稿发生在${locations.join("、")}等锁定空间。` : input.idea.slice(0, 240),
      protagonist: protagonist ? `${protagonist.name}：${protagonist.description}` : "原稿中的核心行动者。",
      antagonist: antagonist ? `${antagonist.name}：${antagonist.description}` : "阻止主角完成目标的人与现实压力。",
      relationshipEngine: sourceManifest.characters.length > 1
        ? `${sourceManifest.characters.map((item) => item.name).join("、")}围绕原稿核心事件形成信任、施压、试探和选择。`
        : "人物关系随每次选择发生变化。",
      conflictEngine: "每一场保留原稿中的具体任务、关系压力、证据变化与选择后果。",
      visualRules: [
        "原稿人物姓名、身份、年龄、服装和核心道具必须全剧连续。",
        "原稿场次按顺序拍摄，允许拆镜但不允许跨场拼贴成氛围蒙太奇。",
        "涉及文书、信件、屏幕或特殊道具时，生成阶段锁定尺寸、正反面、持握关系与人物视线；可读文字统一后期叠加。",
      ],
    },
    productionPlan: {
      adaptationBrief:
        `采用“${sourceManifest.fidelityMode}”：锁定《${title}》的${sourceManifest.scenes.length || "全部"}场原稿、人物关系、关键对白和结局；只补足适合AI生成的动作颗粒度、镜头连续性和生产约束。`,
      shootingStrategy:
        "优先小场景、少角色、可复用机位。每个8-15秒生成片段只安排一个核心叙事任务和一个主运镜，片内可按2-3段连续动作执行；先生成静态首帧确认身份与构图，再做图生视频。",
      locationPlan: [
        ...(locations.length > 0
          ? locations.map((location) => `${location}：按原稿场次复用，先锁定出入口、主要陈设、主光方向和人物轴线。`)
          : ["根据原始创意锁定3-5个可复用主场景。"]),
      ],
      referenceAssets: [
        ...sourceManifest.characters.map((item) => `${item.name}：正面、侧面、全身定妆与身份道具参考`),
        ...locations.map((location) => `${location}：空景、主光方向与人物站位参考`),
        "原稿关键文书、武器、证物或电子界面的正反面与持握参考",
      ],
      generationOrder: [
        "锁定角色定妆和服装",
        "锁定场景结构与关键道具",
        "生成一张代表性近景并确认风格",
        "按场景批量生成首帧",
        "按镜头逐条生成8-15秒视频",
        "最后统一对白、环境声和剪辑节奏",
      ],
      qualityGates: [
        "立项：目标、阻碍、受众钩子和结局承诺成立",
        "圣经：角色脸、服装、场景方位和关键道具已锁定",
        "单镜：代表镜头通过后才批量生成",
        "粗剪：对白可听清、动作连续、结尾钩子成立",
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
      prompt: `${shotList[index]?.shotId} 视频运动：${shotList[index]?.movement}，时长 ${shotList[index]?.duration}。0-2秒建立首帧和人物站位，2秒后执行“${shotList[index]?.action}”，结尾停在原稿动作或对白反应上。保持《${title}》人物身份、服装、道具、场景轴线和光线连续，不得新增原稿外事件。`,
    })),
    editPrompts: promptItems.map((item, index) => ({
      ...item,
      id: `ED-${String(index + 1).padStart(2, "0")}`,
      prompt: `${item.sceneId} 剪辑：前 2 秒给行动，中段给阻碍，末尾用物件或一句对白制造钩子。不要混剪，不要跳成预告片节奏。镜头 ${index + 1} 保持声音桥接。`,
    })),
    voiceoverScript: {
      narrator: [
        "原稿没有旁白时不擅自增加旁白；AI语音、画外音和屏幕文字按原稿作为独立声音/后期轨处理。",
      ],
      characterLines: directorScript.flatMap((scene) => scene.dialogue),
      dubbingNotes: [
        `输出语言：${input.voiceLanguage}；中文原稿优先保留原句和语气。`,
        "每句对白独立导出，保留说话人、表演提示和口型时长，不用旁白覆盖角色对白。",
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
      "文档模式下标题、人物、场次、关键对白与结局均通过原稿保真校验。",
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

function looksLikeEpisodeDetail(value: unknown): value is Pick<JubenResult, "directorScript" | "shotList"> {
  return isRecord(value) && Array.isArray(value.directorScript) && Array.isArray(value.shotList);
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

function ensureProductionPlan(
  result: JubenResult,
  input: Required<JubenRequestBody>,
): JubenProductionPlan {
  const plan: Record<string, unknown> = isRecord(result.productionPlan)
    ? result.productionPlan
    : {};
  const list = (value: unknown, fallback: string[]) =>
    Array.isArray(value) && value.some((item) => typeof item === "string")
      ? value.filter((item): item is string => typeof item === "string")
      : fallback;

  return {
    adaptationBrief: cleanText(
      plan.adaptationBrief,
      `把“${result.meta.logline}”改编成有连续人物目标、现实阻碍、关系推进和分集钩子的${input.productionMode}，避免预告片式摘要。`,
    ),
    shootingStrategy: cleanText(
      plan.shootingStrategy,
      `采用${input.aspectRatio}的小场景真人短剧拍法；每个4-7秒片段只安排一个主动作和一个主运镜，先锁定首帧再生成视频。`,
    ),
    locationPlan: list(plan.locationPlan, [
      "控制在3-5个可复用主场景，同一场景通过机位、时间和道具状态变化覆盖多集。",
      "每个场景先固定入口、人物站位、主光方向和关键道具位置。",
    ]),
    referenceAssets: list(plan.referenceAssets, [
      "主要角色正面、侧面、全身定妆参考",
      "核心场景空景与人物站位参考",
      "剧情关键道具的正反面与尺寸参考",
    ]),
    generationOrder: list(plan.generationOrder, [
      "角色定妆与服装锁定",
      "场景和关键道具锁定",
      "代表镜头首帧测试",
      "按场景批量生成首帧",
      "逐镜生成视频并记录重试原因",
      "对白、声音和剪辑统一交付",
    ]),
    qualityGates: list(plan.qualityGates, [
      "确认改编方向、时长、画幅和目标受众",
      "确认故事圣经、视觉圣经和分集结构",
      "确认一条代表镜头后再批量生成",
      "粗剪通过后再做昂贵重生成和最终声音",
    ]),
  };
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
        objective: "用一个可见行动验证本集线索，并拿到能推动下一集的结果。",
        obstacle: "阻碍者用现实代价、关系压力或错误信息逼主角退后。",
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
        durationPlan: [
          "0-5秒：接住钩子并让人物行动。",
          "5-25秒：目标与阻碍正面相撞。",
          "25-65秒：验证、对抗和关系变化。",
          "65-85秒：证据反转旧判断。",
          "85-90秒：反应或危险动作停点。",
        ],
      });
    }
  }

  return Array.from(byEpisode.values())
    .map((episode) => ({
      ...episode,
      objective:
        cleanText(episode.objective) ||
        "用一个可见行动验证本集线索，并拿到能推动下一集的结果。",
      obstacle:
        cleanText(episode.obstacle) ||
        "阻碍者用现实代价、关系压力或错误信息逼主角退后。",
      durationPlan:
        Array.isArray(episode.durationPlan) && episode.durationPlan.length > 0
          ? episode.durationPlan
          : [
              "0-5秒：开场钩子和具体行动。",
              "5-25秒：目标与阻碍建立。",
              "25-65秒：对抗和关系推进。",
              "65-85秒：反转或新证据。",
              "85-90秒：结尾停点。",
            ],
    }))
    .sort((a, b) => a.episode - b.episode);
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
      ? `接住本集钩子，把“${outline.objective}”落成一个具体行动。`
      : `让主角为“${outline.objective}”付出代价，并拿到下一条证据。`,
    conflict: isFirst
      ? outline.obstacle
      : `${outline.obstacle}继续升级，主角必须在安全和真相之间选择。`,
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
  const dialogue = scene.dialogue[(shotIndex - 1) % Math.max(scene.dialogue.length, 1)];
  const speaker = dialogue?.character || "行动人物";
  const presets = [
    {
      shotSize: "中近景",
      cameraAngle: "平视略贴近人物",
      movement: "手持轻微跟进",
      duration: "10s",
      visual: `${scene.sceneHeading}。按导演场次执行：${scene.action}`,
      action: "从上一镜结束姿态起步，完成本场第一个可见动作并停在阻碍出现的瞬间。",
      sound: "保留与动作同步的脚步、衣料、道具接触和空间底噪。",
      continuity: "承接上一镜人物站位、服装、道具和光线，动作完成前不跳时空。",
    },
    {
      shotSize: "过肩中景",
      cameraAngle: "从行动人物肩后看向阻碍者",
      movement: "沿人物视线缓慢推近后锁定",
      duration: "12s",
      visual: `${scene.sceneHeading}。冲突在同一空间内升级：${scene.conflict}${dialogue ? ` ${speaker}说出原稿对白：“${dialogue.line}”。` : ""}`,
      action: `${speaker}面对具体阻碍完成反应动作，对白结束后保留对手一拍反应。`,
      sound: dialogue ? `${speaker}原稿对白清楚并准确对口型，环境底噪连续。` : "动作音效清楚，环境底噪连续，不用旁白补剧情。",
      continuity: "保持180度轴线、人物朝向和视线关系，关键道具仍在上一镜位置。",
    },
    {
      shotSize: "特写",
      cameraAngle: "正面平视关键物件或表情",
      movement: "从关键道具或眼神轻推至结束状态",
      duration: "9s",
      visual: `${scene.sceneHeading}。本场转折必须落成可见结果：${scene.emotionalTurn}`,
      action: "人物先完成上一镜反应，再用一个明确动作确认选择，末尾定格在证据、表情或新的阻碍上。",
      sound: "动作落点给真实声响，随后留半秒环境声停点。",
      continuity: "保留本场服装、伤痕、道具状态和光线方向，结尾状态直接交给下一镜。",
    },
  ];
  const preset = presets[(shotIndex - 1) % presets.length];

  return {
    shotId: `${scene.sceneId}-${String(shotIndex).padStart(2, "0")}`,
    sceneId: scene.sceneId,
    ...preset,
  };
}

function ensureShotCoverage(
  existing: JubenShot[],
  scenes: JubenScene[],
  minimumPerScene = 3,
) {
  const sceneIds = new Set(scenes.map((scene) => scene.sceneId));
  const shots = existing.filter(
    (shot) => shot.shotId && shot.sceneId && sceneIds.has(shot.sceneId),
  );

  scenes.forEach((scene) => {
    const current = shots.filter((shot) => shot.sceneId === scene.sceneId);

    for (let index = current.length + 1; index <= minimumPerScene; index += 1) {
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
      prompt: `${shot.shotId} 视频运动提示词：出场角色保持上一镜身份和服装连续，背景场景保持同一空间。0-2秒，${shot.shotSize}从${shot.cameraAngle}建立主体和环境层次；2-${shot.duration}，${shot.movement}跟随动作“${shot.action}”，焦点从关键道具或人物眼神切换到冲突反应。画面内容：${shot.visual}。光影必须平滑过渡，景深清楚，人物站位不跳轴，动作点落在剪辑节奏上。禁止突然换景、变脸、空镜堆砌、预告片混剪。`,
      negativePrompt:
        "不要空镜堆砌，不要大幅度无目的摇晃，不要电影预告片节奏，不要人物变脸，不要随机换景。",
    };
  }

  if (type === "edit") {
    return {
      id: baseId,
      sceneId: shot.sceneId,
      prompt: `${shot.shotId} 剪辑指令：镜头 ${shot.duration}，开头 1 秒接上一镜动作或视线，中段给“${shot.action}”的清晰动作点，末尾停在证据、表情或阻碍上形成下一镜钩子。对白口型必须对齐，声音使用 ${shot.sound}，环境底噪不断，转场必须服务连续性：${shot.continuity}。不要用字幕解释剧情，不要剪成预告片。`,
      negativePrompt:
        "不要宣传片蒙太奇，不要无意义闪白，不要史诗音乐硬推，不要把剧情用字幕解释完。",
    };
  }

  return {
    id: baseId,
    sceneId: shot.sceneId,
    prompt: `${shot.shotId} 最终分镜提示词：${shot.shotSize}，${shot.cameraAngle}，${shot.visual}。人物动作：${shot.action}。画面必须有前景/中景/背景层次，主体清楚，关键道具可见，服装污渍和材质连续，光影氛围服务戏剧冲突，保留上一镜空间和人物朝向。真人写实竖屏短剧质感，不要海报构图。`,
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
  const minPromptLength = type === "storyboard" ? 120 : type === "camera" ? 180 : 140;
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

  const scenePromptIndex = new Map<string, number>();

  return normalized.map((item, index) => {
    const currentIndex = scenePromptIndex.get(item.sceneId) ?? 0;
    const sameSceneShots = shots.filter((shot) => shot.sceneId === item.sceneId);
    const fallbackShot = sameSceneShots[currentIndex] ?? sameSceneShots[0] ?? shots[index];
    const fallback = fallbackShot
      ? makePromptFromShot(fallbackShot, type, index)
      : null;
    const prompt =
      item.prompt.length >= minPromptLength || !fallback
        ? item.prompt
        : `${item.prompt}\n补充控制：${fallback.prompt}`;
    const negativePrompt = [item.negativePrompt, fallback?.negativePrompt]
      .filter(Boolean)
      .join("；");

    scenePromptIndex.set(item.sceneId, currentIndex + 1);

    return {
      ...item,
      id: `${idPrefix}-${item.sceneId}-${String(index + 1).padStart(2, "0")}`,
      prompt,
      negativePrompt,
    };
  });
}

function ensureJubenCoverage(
  result: JubenResult,
  input: Required<JubenRequestBody>,
  options?: {
    detailEpisodes?: number[];
    minimumShotsPerScene?: number;
  },
): JubenResult {
  const episodeOutline = normalizeEpisodeOutlines(result, input);
  const visualBible = ensureVisualBible(result, input);
  const productionPlan = ensureProductionPlan(result, input);
  const directorScript = ensureSceneCoverage(
    { ...result, episodeOutline },
    episodeOutline,
    options?.detailEpisodes,
  );
  const shotList = ensureShotCoverage(
    result.shotList,
    directorScript,
    options?.minimumShotsPerScene ?? (input.sourceMode === "document" ? 1 : 3),
  );
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
  const sourceManifest = parseJubenSource(input);
  let fidelityWarnings = sourceFidelityWarnings(sourceManifest, {
    title: result.meta.title,
    text: JSON.stringify({
      diagnosis: result.diagnosis,
      storyBible: result.storyBible,
      episodeOutline,
      directorScript,
    }),
  });
  if (options?.detailEpisodes?.length) {
    fidelityWarnings = fidelityWarnings.filter(
      (warning) => !warning.startsWith("缺少原稿角色"),
    );
  }
  if (sourceManifest.mode === "document") {
    const detailSet = new Set(options?.detailEpisodes ?? []);
    const expectedScenes = sourceManifest.scenes.filter(
      (scene) => detailSet.size === 0 || detailSet.has(scene.episode),
    ).length;
    if (expectedScenes > 0 && directorScript.length < expectedScenes) {
      fidelityWarnings.push(
        `原稿场次覆盖不足：应有 ${expectedScenes} 场，当前只有 ${directorScript.length} 场。`,
      );
    }
  }

  return {
    ...result,
    sourceManifest,
    fidelityReport: {
      score:
        sourceManifest.mode === "document"
          ? Math.max(40, 100 - fidelityWarnings.length * 15)
          : 100,
      status:
        sourceManifest.mode === "document"
          ? fidelityWarnings.length === 0
            ? "locked"
            : "review"
          : "creative",
      warnings: fidelityWarnings,
    },
    episodeOutline,
    visualBible,
    productionPlan,
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

async function requestDeepSeekJson(
  messages: ChatMessage[],
  maxTokens: number,
  timeoutMs = DEEPSEEK_TIMEOUT_MS,
) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
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
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`DeepSeek request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeJubenIdea(
  body: JubenRequestBody,
): Promise<JubenAnalysisResult> {
  const input = normalizeJubenRequest(body);
  const source = parseJubenSource(input);
  assertUsableDocumentSource(source);

  if (source.mode === "document") {
    return fallbackJubenAnalysis(
      input,
      "原稿锁定引擎已直接读取文档规格、人物、分集、场次与对白。",
    );
  }

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
      voiceLanguage: cleanText(record.voiceLanguage, input.voiceLanguage),
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
      sourceManifest: source,
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
  const source = parseJubenSource(input);
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (source.mode === "document") {
    return ensureJubenCoverage(
      fallbackJubenResult(
        input,
        "原稿锁定引擎：已按文档人物、分集、场次和对白完成无改写拆解。",
      ),
      input,
      { detailEpisodes: [1] },
    );
  }

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

    const covered = ensureJubenCoverage({
      ...parsed,
      meta: {
        ...parsed.meta,
        provider: "deepseek",
        model: DEEPSEEK_MODEL,
        generatedAt: new Date().toISOString(),
      },
    }, input, { detailEpisodes: [1] });

    if (
      covered.sourceManifest.mode === "document" &&
      covered.fidelityReport.warnings.length > 0
    ) {
      return ensureJubenCoverage(
        fallbackJubenResult(
          input,
          `DeepSeek 结果未通过原稿保真校验：${covered.fidelityReport.warnings.join(" ")}`,
        ),
        input,
        { detailEpisodes: [1] },
      );
    }

    return covered;
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
  const source = parseJubenSource(input);
  const episode = clampEpisodeCount(body.episode ?? 1);
  assertUsableDocumentSource(source, episode);
  const baseResult =
    body.baseResult && looksLikeJubenResult(body.baseResult)
      ? ensureJubenCoverage(body.baseResult, input, {
          detailEpisodes: [episode],
        })
      : fallbackJubenResult(input, "Missing base result; used local structure.");
  const apiKey = process.env.DEEPSEEK_API_KEY;

  const useCurrentStoryFallback = (reason: string): JubenResult => {
    const sourceGrounded = ensureJubenCoverage(
      fallbackJubenResult(input, reason),
      input,
      { detailEpisodes: [episode], minimumShotsPerScene: 3 },
    );

    return {
      ...sourceGrounded,
      storyBible: baseResult.storyBible,
      visualBible: baseResult.visualBible,
      episodeOutline: baseResult.episodeOutline,
      productionPlan: baseResult.productionPlan,
      meta: {
        ...sourceGrounded.meta,
        provider: "local-structured-fallback",
        model: reason,
        generatedAt: new Date().toISOString(),
      },
    };
  };

  if (!apiKey) {
    return useCurrentStoryFallback("DEEPSEEK_API_KEY is not configured.");
  }

  try {
    const parsed = await requestDeepSeekJson(
      buildJubenEpisodeMessages(input, baseResult, episode),
      Number(process.env.JUBEN_EPISODE_MAX_TOKENS ?? 7000),
      DEEPSEEK_EPISODE_TIMEOUT_MS,
    );

    if (!looksLikeEpisodeDetail(parsed)) {
      throw new Error("DeepSeek episode JSON did not match the expected structure.");
    }

    const covered = ensureJubenCoverage(
      {
        ...baseResult,
        directorScript: parsed.directorScript,
        shotList: parsed.shotList,
        storyboardPrompts: [],
        cameraPrompts: [],
        editPrompts: [],
        meta: {
          ...baseResult.meta,
          provider: "deepseek",
          model: DEEPSEEK_MODEL,
          generatedAt: new Date().toISOString(),
        },
      },
      input,
      { detailEpisodes: [episode] },
    );

    if (
      covered.sourceManifest.mode === "document" &&
      covered.fidelityReport.warnings.length > 0
    ) {
      return useCurrentStoryFallback(
        `DeepSeek 单集结果未通过原稿保真校验：${covered.fidelityReport.warnings.join(" ")}`,
      );
    }

    return covered;
  } catch {
    return useCurrentStoryFallback(
      `DeepSeek episode request exceeded ${DEEPSEEK_EPISODE_TIMEOUT_MS}ms or failed before completion.`,
    );
  }
}
