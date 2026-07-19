export type DirectorRequest = {
  idea?: string;
  genre?: string;
  audience?: string;
  episodeCount?: number;
  episodeLength?: string;
  aspectRatio?: string;
  visualStyle?: string;
  dialogueLanguage?: string;
  platform?: string;
  mustHave?: string;
  avoid?: string;
};

export type DirectorAsset = {
  id: string;
  type: "character" | "location" | "prop";
  name: string;
  narrativeUse: string;
  lockPrompt: string;
  referenceViews: string[];
  continuityRules: string[];
  status: "draft" | "locked";
};

export type DirectorEpisodePlan = {
  episode: number;
  title: string;
  openingImage: string;
  hook: string;
  desire: string;
  obstacle: string;
  escalation: string[];
  turn: string;
  cliffhanger: string;
  continuityIn: string;
  continuityOut: string;
};

export type DirectorProject = {
  meta: {
    title: string;
    logline: string;
    format: string;
    provider: "deepseek" | "local-director-fallback";
    model: string;
    generatedAt: string;
  };
  brief: Required<DirectorRequest>;
  diagnosis: {
    currentWeakness: string;
    audiencePromise: string;
    repeatableEngine: string;
    antiTrailerRule: string;
  };
  storyEngine: {
    protagonistDesire: string;
    fatalFlaw: string;
    opposition: string;
    relationshipEngine: string;
    seasonQuestion: string;
    endingPayoff: string;
  };
  visualSystem: {
    format: string;
    palette: string[];
    lighting: string[];
    cameraRules: string[];
    performanceRules: string[];
    globalPrompt: string;
    globalNegative: string;
  };
  assets: DirectorAsset[];
  episodes: DirectorEpisodePlan[];
  qualityGates: string[];
};

export type DirectorDialogue = {
  speaker: string;
  line: string;
  delivery: string;
  subtext: string;
};

export type DirectorBeat = {
  range: string;
  visual: string;
  performance: string;
  camera: string;
  dialogue: DirectorDialogue[];
  sound: string;
};

export type DirectorScene = {
  id: string;
  slugline: string;
  dramaticPurpose: string;
  entryState: string;
  conflict: string;
  exitState: string;
};

export type DirectorVideoUnit = {
  id: string;
  sceneId: string;
  duration: string;
  storyFunction: string;
  transitionIn: string;
  startState: string;
  beats: DirectorBeat[];
  endState: string;
  transitionOut: string;
  firstFramePrompt: string;
  keyFramePrompt: string;
  lastFramePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  continuityIn: string;
  continuityOut: string;
  status: "script" | "frames" | "video" | "approved";
};

export type DirectorEpisodePackage = {
  episode: number;
  title: string;
  targetRuntime: string;
  dramaticQuestion: string;
  causalChain: string[];
  scenes: DirectorScene[];
  units: DirectorVideoUnit[];
  editPlan: {
    assemblyRule: string;
    musicArc: string[];
    soundBridges: string[];
    finalHook: string;
  };
  continuityAudit: string[];
  generatedAt: string;
};

export type DirectorEpisodeRequest = DirectorRequest & {
  episode?: number;
  project?: DirectorProject;
};

type ChatMessage = { role: "system" | "user"; content: string };

const API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/v1/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const TIMEOUT_MS = Number(process.env.DAOYAN_DEEPSEEK_TIMEOUT_MS ?? 120000);

function clean(value: unknown, fallback: string, max = 20000) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : fallback;
}

function episodeCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(12, Math.max(1, Math.round(value)))
    : 6;
}

export function normalizeDirectorRequest(body: DirectorRequest): Required<DirectorRequest> {
  return {
    idea: clean(
      body.idea,
      "一位边境王子在暴雨夜救下身份不明的落难女子。她看似温柔无害，却以嫉妒和欲望为食，让两位情同手足的继承人彼此反目。",
    ),
    genre: clean(body.genre, "哥特悬疑爱情微短剧"),
    audience: clean(body.audience, "18-40岁，偏爱禁忌爱情、绿茶博弈、超自然反转的海外竖屏观众"),
    episodeCount: episodeCount(body.episodeCount),
    episodeLength: clean(body.episodeLength, "90秒"),
    aspectRatio: clean(body.aspectRatio, "9:16竖屏"),
    visualStyle: clean(body.visualStyle, "写实电影感，15世纪英格兰哥特风，冷雨、烛火与红白玫瑰对照"),
    dialogueLanguage: clean(body.dialogueLanguage, "英语对白，中文制作说明"),
    platform: clean(body.platform, "TikTok / YouTube Shorts / Reels"),
    mustHave: clean(body.mustHave, "每集有强开场、人物欲望、误会升级、关系反转和可截图的结尾钩子"),
    avoid: clean(body.avoid, "不要宣传片、概念片、诗意混剪；不要用旁白代替人物行动；不要把连续场景切成互不相干的六秒片段"),
  };
}

function code(episode: number) {
  return `E${String(episode).padStart(2, "0")}`;
}

function fallbackAssets(input: Required<DirectorRequest>): DirectorAsset[] {
  return [
    {
      id: "CHAR-01",
      type: "character",
      name: "主角",
      narrativeUse: "每一集都必须作出选择并承担后果，不能只是被剧情推着走。",
      lockPrompt: `写实电影角色定妆，${input.visualStyle}；主角具有可辨认的轮廓、克制但有裂缝的表情，正面、左侧面、右侧面、全身四视图，同一张脸、同一发型、同一基础服装，纯中灰背景，85mm portrait lens。`,
      referenceViews: ["正面半身", "左右侧面", "全身站姿", "核心情绪近景"],
      continuityRules: ["脸型、发际线与瞳色不得漂移", "服装变化必须由剧情事件触发", "伤痕、雨水、血迹延续到下一场"],
      status: "draft",
    },
    {
      id: "CHAR-02",
      type: "character",
      name: "诱惑者",
      narrativeUse: "表面帮助所有人，实际用看似无辜的选择制造误会和嫉妒。",
      lockPrompt: `写实电影角色定妆，${input.visualStyle}；极具亲和力但眼神比笑容慢半拍，漂亮而危险，服装轮廓单薄但不色情，野玫瑰作为唯一识别物，正侧背全身与近景表情板，同一身份。`,
      referenceViews: ["无辜微笑", "受伤落泪", "无人时的冷眼", "正侧背全身"],
      continuityRules: ["野玫瑰始终位于同一侧", "公开场合柔弱，独处时动作精确", "魅惑靠站位、目光与语言，不靠随机裸露"],
      status: "draft",
    },
    {
      id: "CHAR-03",
      type: "character",
      name: "关系对手",
      narrativeUse: "最早察觉异常，但因表达方式错误而被误解为嫉妒或控制欲。",
      lockPrompt: `写实电影角色定妆，${input.visualStyle}；清醒、敏锐、具有权力感，情绪被礼仪压住，服装结构与诱惑者形成材质和色彩反差，四视图与表演表情板。`,
      referenceViews: ["礼貌审视", "压抑愤怒", "公开失态", "真相确认"],
      continuityRules: ["站姿始终比诱惑者挺直", "发饰与身份匹配", "情绪升级必须逐场可见"],
      status: "draft",
    },
    {
      id: "LOC-01",
      type: "location",
      name: "主场景",
      narrativeUse: "承担大部分关系戏，必须先建立可反复切换的空间轴线。",
      lockPrompt: `${input.visualStyle}，主场景完整空间设计，入口、主桌、壁炉/主光源、楼梯或纵深通道位置明确；广角建立镜头、四个反打方向、日夜与雨夜光线版本，真实可拍摄建筑尺度。`,
      referenceViews: ["入口向内", "主角视角", "反打视角", "夜景灯位"],
      continuityRules: ["门窗与主光源位置固定", "180度轴线固定", "角色进出方向不能无故翻转"],
      status: "draft",
    },
    {
      id: "LOC-02",
      type: "location",
      name: "秘密场景",
      narrativeUse: "承载越界、窥视和真相揭露，必须与主场景保持可理解的地理关系。",
      lockPrompt: `${input.visualStyle}，秘密场景完整空间设计，门口、走廊、镜面或窥视点、唯一主光源位置明确；走廊向内、室内向门、人物视角、夜间异常光线四个固定方向，真实可拍摄尺度。`,
      referenceViews: ["走廊向内", "室内向门", "窥视点", "异常夜景"],
      continuityRules: ["门的开启方向固定", "镜面位置与反射轴固定", "主场景到秘密场景的移动方向必须一致"],
      status: "draft",
    },
    {
      id: "PROP-01",
      type: "prop",
      name: "关键证物",
      narrativeUse: "每次出现都改变人物对真相的判断，并负责镜头间的视觉交接。",
      lockPrompt: `${input.visualStyle}，关键证物道具设计，正反面、打开与关闭、干净与受损状态，材质细节清楚，比例尺明确，适合手部近景。`,
      referenceViews: ["正面", "背面", "手持比例", "剧情受损状态"],
      continuityRules: ["正反面不可互换", "损坏不可自动复原", "持有人变化必须在镜头内完成"],
      status: "draft",
    },
  ];
}

export function fallbackDirectorProject(body: DirectorRequest, reason = "local structured demo"): DirectorProject {
  const input = normalizeDirectorRequest(body);
  const episodes: DirectorEpisodePlan[] = Array.from({ length: input.episodeCount }, (_, index) => {
    const episode = index + 1;
    const previous = episode === 1 ? "故事开始前的正常秩序" : `${code(episode - 1)}结尾留下的误会或证据`;
    return {
      episode,
      title: episode === 1 ? "雨夜来客" : episode === input.episodeCount ? "最后一张脸" : `第${episode}次谎言`,
      openingImage: episode === 1 ? "风雨中的远景先建立危险，再让一个衣着单薄的女人从黑暗里跌进车灯或火把光。" : `直接承接${previous}的最后动作，不重新介绍人物。`,
      hook: episode === 1 ? "被救者抬头的一刻很美，但她在积水中的倒影没有脸。" : `上一集的答案在前10秒被推翻，${previous}成为新的指控。`,
      desire: `主角想在本集内保护自己相信的人，同时守住身份、婚姻或盟约。`,
      obstacle: "诱惑者永远不直接撒可验证的谎，而是摆出一个让别人主动误会的局面。",
      escalation: ["一次善意动作被误读", "秘密对话被第三人只听见后半句", "公开场合出现无法收回的羞辱或站队"],
      turn: `看似最无辜的人获得了本集实际利益，主角第一次意识到自己的选择可能正中圈套。`,
      cliffhanger: episode === input.episodeCount ? "镜中残留的另一张脸睁开眼，证明代价并未结束。" : `关键证物落入错误的人手中，同时有人听见一句足以改变关系的半句话。`,
      continuityIn: previous,
      continuityOut: `记录本集末尾每个人的站位、服装湿度、伤痕、证物持有人和未说完的对白，作为${code(episode + 1)}首帧。`,
    };
  });

  return {
    meta: {
      title: input.idea.includes("画皮") ? "画皮：玫瑰之殇" : "未命名导演项目",
      logline: clean(input.idea, "短剧项目").slice(0, 180),
      format: `${input.episodeCount}集 × ${input.episodeLength} / ${input.aspectRatio}`,
      provider: "local-director-fallback",
      model: reason,
      generatedAt: new Date().toISOString(),
    },
    brief: input,
    diagnosis: {
      currentWeakness: "原始创意有题材吸引力，但如果直接拆镜头，会缺少逐场因果、关系升级和镜头交接。",
      audiencePromise: "每集都让观众先站队，再用一个具体行动推翻刚才的判断。",
      repeatableEngine: "诱惑者制造半真半假的场面，主角出于欲望作出选择，关系对手因只看见局部而升级冲突。",
      antiTrailerRule: "连续戏优先：每个视频单元必须从上一单元末帧接起，以人物完成一个动作或一句对白为结束，不用蒙太奇代替过程。",
    },
    storyEngine: {
      protagonistDesire: "既想维持忠诚体面，又想独占被理解和被崇拜的感觉。",
      fatalFlaw: "把自己的一时欲望解释成拯救别人，因此总能为越界找到高尚理由。",
      opposition: "超自然诱惑者不强迫任何人，只放大每个人原本就有的嫉妒、虚荣和恐惧。",
      relationshipEngine: "救助变亲密，亲密变秘密，秘密变站队，站队最终变背叛。",
      seasonQuestion: "毁掉他们的究竟是怪物，还是他们自己愿意相信的谎？",
      endingPayoff: "真相被揭开并付出代价，但关系无法恢复到谎言发生之前。",
    },
    visualSystem: {
      format: input.aspectRatio,
      palette: ["冷雨蓝灰", "肤色与象牙白", "烛火琥珀", "警示性深红", "旧铁黑"],
      lighting: ["外景低照度方向性雨光", "室内以真实烛火和窗光为动机光", "诱惑成功时暖光进入人物之间", "真相逼近时背景先暗而不是全画面变蓝"],
      cameraRules: ["先用远景建立空间，再进入中景动作与近景反应", "对白反打保持180度轴线", "每次推镜必须对应人物做出不可逆选择", "证物用匹配剪辑完成跨单元交接"],
      performanceRules: ["诱惑者的语言无辜，身体站位主动", "主角先看再回避，回避后才说谎", "关系对手先压住情绪，公开失态必须有累积过程"],
      globalPrompt: `${input.visualStyle}，${input.aspectRatio}，真实电影布光和物理材质，人物身份、服装、空间轴线与关键道具全程一致；表演细微、可读、非摆拍。`,
      globalNegative: "trailer montage, music video, random slow motion, glamour posing, identity drift, costume drift, flipped room layout, floating props, incorrect hands, unreadable dialogue performance, unexplained location change",
    },
    assets: fallbackAssets(input),
    episodes,
    qualityGates: [
      "开场先交代人物在哪里、正在做什么，再给异常；禁止第一镜只拍一张漂亮的脸。",
      "每场有欲望、阻碍、选择和结果，删除后会改变后续剧情。",
      "每句对白要么索取、拒绝、隐瞒、试探或反击，不写信息说明书。",
      "每个视频单元有明确首帧、两到三个内部动作节拍和可接下一条的末帧。",
      "连续单元之间至少共享两项：人物位置、视线、动作、声音、道具或光线。",
      "所有角色、场景、道具先生成参考资产并审批，再批量做分镜。",
      "成片静音观看仍能理解行为因果，只听声音仍能理解关系变化。",
    ],
  };
}

function fallbackEpisode(body: DirectorEpisodeRequest, reason: string): DirectorEpisodePackage {
  const project = body.project ?? fallbackDirectorProject(body, reason);
  const episode = Math.min(project.episodes.length, Math.max(1, Math.round(body.episode ?? 1)));
  const plan = project.episodes[episode - 1];
  const hero = project.assets.find((asset) => asset.type === "character")?.name ?? "主角";
  const tempter = project.assets.filter((asset) => asset.type === "character")[1]?.name ?? "诱惑者";
  const rival = project.assets.filter((asset) => asset.type === "character")[2]?.name ?? "关系对手";
  const basePrompt = project.visualSystem.globalPrompt;
  const units: DirectorVideoUnit[] = [
    {
      id: `${code(episode)}-U01`, sceneId: `${code(episode)}-S01`, duration: "12秒", storyFunction: "建立空间、危险和救助选择，第一镜不是人物摆拍。",
      transitionIn: plan.continuityIn, startState: "暴雨远景，人物尚未进入清晰近景，环境声先于画面建立。",
      beats: [
        { range: "0-4秒", visual: "24mm远景沿泥泞道路低位前移，风雨打斜，远处车灯或火把被树干间歇遮挡；一个纤细人影踉跄进入道路。", performance: `${tempter}不是蹲着等救，而是跑、滑倒、撑起身体继续向光靠近。`, camera: "稳定低位前移后轻摇跟人，不切镜。", dialogue: [], sound: "强风、泥水脚步、远处车轮，音乐只给一个低频音。" },
        { range: "4-8秒", visual: `${hero}所在车辆或队伍减速入画，前景车轮压过积水；${tempter}抬手遮光后失力跪下。`, performance: `${hero}先示意停车，再推门下车，警觉大于怜爱。`, camera: "从远景连续推到中远景，焦点由车轮移到女人。", dialogue: [{ speaker: hero, line: "Stop. Someone's on the road.", delivery: "短促命令，目光不离前方", subtext: "他已经决定介入" }], sound: "刹车、马匹或轮胎打滑，雨声持续作声音桥。" },
        { range: "8-12秒", visual: `${hero}半蹲但保持一臂距离，${tempter}抬脸进入暖光，美貌在真实疲惫与泥水中被看清；积水倒影短暂缺失五官。`, performance: `${tempter}先看${hero}的身份标记，再装作恐惧地看他的眼睛。`, camera: "50mm中近景轻推，最后焦点落到无脸倒影。", dialogue: [{ speaker: tempter, line: "Please... don't send me back.", delivery: "气息破碎，尾词几乎听不见", subtext: "她不说自己来自哪里，先让他作承诺" }], sound: "对白清晰，雷声在倒影出现时落下。" },
      ],
      endState: `${hero}的手停在半空，${tempter}抓住他的袖口；无脸倒影占画面下方。`, transitionOut: "下一单元从同一只抓住袖口的手开始，雨声不断。",
      firstFramePrompt: `${basePrompt} 24mm vertical establishing shot of a storm road, deep foreground mud and trees, distant moving light, a small female figure running rather than posing, clear geography and danger.`,
      keyFramePrompt: `${basePrompt} 50mm medium close-up, ${tempter} muddy and rain-soaked looking up into warm carriage light, ${hero} kneeling one arm away, beauty revealed through action, faceless reflection in puddle at bottom edge.`,
      lastFramePrompt: `${basePrompt} close insert of ${tempter}'s hand gripping ${hero}'s wet sleeve, their faces soft in background, faceless puddle reflection visible, exact wardrobe and screen direction locked.`,
      videoPrompt: "12-second continuous multi-beat dramatic shot. Begin with a wide storm-road geography, track the running woman as she falls and rises, reveal the arriving vehicle, rack focus to the rescuer getting down, then push into her face only after the rescue action. Spoken English lines with accurate lip sync. No montage, no teleporting, no pose change between beats.",
      negativePrompt: project.visualSystem.globalNegative, continuityIn: plan.continuityIn, continuityOut: "袖口被抓、双方低位站姿、女人全身湿透、雨声保持。", status: "script",
    },
    {
      id: `${code(episode)}-U02`, sceneId: `${code(episode)}-S01`, duration: "12秒", storyFunction: "通过问答建立半真相，并让第三人第一次产生疑心。",
      transitionIn: "匹配上一单元末帧的抓袖手部，镜头反向拉开。", startState: `${tempter}仍抓袖口，${hero}尚未答应带她走。`,
      beats: [
        { range: "0-4秒", visual: "手部近景反向拉到三人中景，关系对手从车门内探身，暖光把三人切成两个阵营。", performance: `${hero}扶起${tempter}；${rival}没有下车，先观察她的鞋和手。`, camera: "从手部特写平滑后拉到三角构图。", dialogue: [{ speaker: rival, line: "Who did this to you?", delivery: "冷静、清楚，不先表达同情", subtext: "她在验证故事" }], sound: "雨声、布料摩擦，音乐停止。" },
        { range: "4-8秒", visual: `${tempter}站不稳靠向${hero}胸前，但回答时看向${rival}。`, performance: `${tempter}努力离开${hero}半步又再次失衡，让接触看起来是不得已。`, camera: "85mm近景，先收她的努力克制，再给主角下意识扶腰。", dialogue: [{ speaker: tempter, line: "My husband is dead. His men want his land... and me with it.", delivery: "在husband一词上真哭，在me一词上迅速吞回情绪", subtext: "用怀念亡夫证明自己无意勾引" }], sound: "近距离呼吸、湿衣滴水。" },
        { range: "8-12秒", visual: `${hero}脱下外套裹住她，${rival}看见${tempter}在外套遮挡下用指尖轻轻压住主角手腕。`, performance: `${rival}嘴角收紧但没有揭穿，${tempter}抬眼向她露出感谢。`, camera: "越肩反打到关系对手，再拉焦到遮挡下的指尖。", dialogue: [{ speaker: tempter, line: "Your wife is kinder than I deserve.", delivery: "对主角说，却望着关系对手", subtext: "背后夸她，先占据道德高位" }], sound: "衣料落下，结尾只留一声压住的呼吸。" },
      ],
      endState: `${rival}看见指尖试探，${hero}没有看见；三人第一次拥有不同信息。`, transitionOut: "用外套的深色布面擦镜转场到室内同一件外套被放到椅背。",
      firstFramePrompt: `${basePrompt} exact hand grip continuation from previous unit, pull back composition with three characters and warm doorway light, fixed screen direction.`, keyFramePrompt: `${basePrompt} 85mm emotional close-up, vulnerable wet ${tempter} leaning by necessity while describing dead husband, ${hero}'s protective hand visible but restrained.`, lastFramePrompt: `${basePrompt} rack focus from ${rival}'s suspicious face to hidden fingertips pressing ${hero}'s wrist beneath a dark coat, readable triangular tension.`, videoPrompt: "12-second continuous dialogue scene with three internal reframings, not three disconnected clips. Preserve rain, wet wardrobe and positions. Pull from hand to three-shot, push to confession, then rack focus to the hidden fingertip. Accurate English lip sync and reaction timing; the listener reacts after the line, never before.", negativePrompt: project.visualSystem.globalNegative, continuityIn: "接上一条同一只手、同一袖口、同一雨量。", continuityOut: "主角外套披在诱惑者肩上，关系对手已看到隐秘触碰。", status: "script",
    },
    {
      id: `${code(episode)}-U03`, sceneId: `${code(episode)}-S02`, duration: "15秒", storyFunction: "进入主场景，用一段完整生活戏让诱惑、误会和站队同时升级。",
      transitionIn: "外套布面擦镜后，同色外套已挂在室内椅背；雨声降为窗外底噪。", startState: "三人已入室，空间轴线第一次完整建立。",
      beats: [
        { range: "0-5秒", visual: "35mm中景横移建立主桌、火源和三人位置；关系对手递出干衣，诱惑者拒绝坐主位。", performance: `${tempter}选择离${hero}最远的位置，却因寒冷发抖让他主动靠近。`, camera: "沿桌边横移，保持三人同框。", dialogue: [{ speaker: tempter, line: "I can sleep by the kitchen fire. I won't shame your house.", delivery: "温顺坚定，拒绝时把湿发拢到颈后", subtext: "越退让越逼主角挽留" }], sound: "火焰、雨窗、陶杯落桌。" },
        { range: "5-10秒", visual: `${hero}把自己的椅子推给她；${rival}刚好从屏风后拿着干衣回来，只听见后半句。`, performance: `${hero}俯身压低声音，${tempter}后退到刚好被桌沿挡住两人距离的位置。`, camera: "随椅子短推后停在屏风形成的窥视构图。", dialogue: [{ speaker: hero, line: "You will have my room until we know you're safe.", delivery: "像下命令，实则被需要感满足", subtext: "他越过共同决定" }, { speaker: tempter, line: "She will hate me for it.", delivery: "替关系对手说好话般担忧", subtext: "预先定义她的反对是嫉妒" }], sound: "椅脚摩擦盖住关系对手的脚步。" },
        { range: "10-15秒", visual: `${rival}走出屏风，把干衣重重放下；${tempter}立刻起身把主位让给她。`, performance: `${hero}以为${rival}在针对客人；${tempter}低头藏住极短的胜利表情。`, camera: "从屏风窥视位平移成正面三角构图，结尾推向诱惑者低头时的嘴角。", dialogue: [{ speaker: rival, line: "How generous of you to offer what isn't yours alone.", delivery: "礼貌到近乎锋利", subtext: "她骂的是主角，却被听成羞辱客人" }, { speaker: tempter, line: "Please don't quarrel because of me.", delivery: "轻声打断，立即后退", subtext: "一句话确认争吵确实因她而起" }], sound: "火焰爆响，雨声持续，结尾音乐第一次进入。" },
      ],
      endState: `${hero}挡在${tempter}与${rival}之间；主场景站位第一次明确变成两边。`, transitionOut: "下一单元从同一三角站位的反打开始，不换房间、不换服装。", firstFramePrompt: `${basePrompt} 35mm vertical interior master shot, complete geography of entrance, table, fire and screen, three characters in one readable composition, wet coat on chair matching prior unit.`, keyFramePrompt: `${basePrompt} voyeur composition through a folding screen, ${rival} holding dry clothes hears ${hero} offer his room to ${tempter}; table edge hides exact distance, dramatic irony, no glamour pose.`, lastFramePrompt: `${basePrompt} tense triangular blocking, ${hero} physically between women, ${tempter} lowering her face with a half-second hidden smile, warm fire dividing the room.`, videoPrompt: "15-second continuous domestic drama scene with motivated camera movement. Establish room geography, follow the chair push into hidden-screen eavesdropping, then reveal the listener and settle into a confrontation triangle. Preserve wet coat, dry clothes, eyelines and furniture. Dialogue and reaction timing are central; no montage and no random close-ups.", negativePrompt: project.visualSystem.globalNegative, continuityIn: "披过的外套仍湿并挂在椅背，三人雨夜服装状态一致。", continuityOut: "主角位于两人之间，干衣在桌上，客房承诺已公开。", status: "script",
    },
    {
      id: `${code(episode)}-U04`, sceneId: `${code(episode)}-S02`, duration: "12秒", storyFunction: "让诱惑者用夸奖完成挑拨，并制造可讨论的巴掌前兆。",
      transitionIn: "同一站位直接反打，火焰爆响作声音桥。", startState: `${hero}正准备替${tempter}辩护，${rival}仍拿着干衣。`,
      beats: [
        { range: "0-4秒", visual: `${tempter}越过${hero}亲自接过干衣，向${rival}行礼，反而让主角失去保护她的机会。`, performance: `${tempter}握住${rival}的手只一秒，像真诚感谢。`, camera: "中近景小幅侧移，让主角留在两人后景。", dialogue: [{ speaker: tempter, line: "He spoke of your courage all the way here.", delivery: "温暖、真诚，不带讽刺", subtext: "暗示主角一路都在谈妻子，证明自己清白" }], sound: "雨、衣料、火焰，不加音乐。" },
        { range: "4-8秒", visual: `${rival}神情松动；后景的${hero}却误以为她们和解，靠近一步。`, performance: `${tempter}等${rival}放松才补第二句，眼泪恰好落下。`, camera: "停机位，焦点由两位女人移到后景主角再移回。", dialogue: [{ speaker: tempter, line: "I told him a man who loves such a woman must be honorable.", delivery: "love一词轻，honorable一词看向主角", subtext: "表面赞美婚姻，实际向主角发出私人认可" }], sound: "台词后留半秒安静。" },
        { range: "8-12秒", visual: `${rival}看见她看主角的眼神，抽回手；${hero}只看见动作粗暴，立即接住诱惑者被带歪的身体。`, performance: `${tempter}没有夸张摔倒，只顺势靠到主角臂弯并马上挣开。`, camera: "快速但稳定地跟手部抽离，再停在主角接住她的双人构图。", dialogue: [{ speaker: hero, line: "Enough.", delivery: "低声、第一次明确站队", subtext: "他以为自己在制止羞辱" }], sound: "手掌抽离的衣料声被放大，结尾低频进入。" },
      ],
      endState: `${hero}扶着${tempter}，${rival}成为画面中被隔开的那个人。`, transitionOut: "以关系对手的凝视切到主角房门外的黑暗，时间进入深夜。", firstFramePrompt: `${basePrompt} exact continuation of triangle blocking, ${tempter} crossing around ${hero} to accept dry clothes from ${rival}, fire and furniture unchanged.`, keyFramePrompt: `${basePrompt} intimate but socially acceptable two-woman close-up, ${tempter} praising ${rival} while her gaze lands on ${hero} in background, layered focus and green-tea manipulation readable through blocking.`, lastFramePrompt: `${basePrompt} ${hero} catches ${tempter} in his arm after a withdrawn hand, ${rival} isolated across frame, no exaggerated fall, exact dry clothes prop visible.`, videoPrompt: "12-second performance-led dialogue unit. Move around the hero, hold the hand contact, rack focus on the double-meaning compliment, follow the withdrawn hand and finish on the hero's first explicit choice of side. Exact lip sync, restrained acting, no discontinuous cuts.", negativePrompt: project.visualSystem.globalNegative, continuityIn: "接同一争执、同一房间、同一干衣。", continuityOut: "主角第一次公开站诱惑者一边，关系对手看清那道目光。", status: "script",
    },
    {
      id: `${code(episode)}-U05`, sceneId: `${code(episode)}-S03`, duration: "15秒", storyFunction: "用深夜行动兑现暧昧，同时给超自然真相一个可见但不解释的证据。",
      transitionIn: "关系对手的视线方向切到同侧走廊，雨声变远，脚步声接管。", startState: "深夜，主角独自站在客房门外，尚未敲门。",
      beats: [
        { range: "0-5秒", visual: `${hero}端着热饮走到门前，听见房内压抑哭声；他举手又放下。`, performance: "他先准备离开，哭声停止后反而敲门，说明他需要被需要。", camera: "50mm侧后方慢跟，到门前停住。", dialogue: [{ speaker: tempter, line: "Is someone there?", delivery: "隔门轻声，像一直在等", subtext: "她控制何时让他进入" }], sound: "远雨、木地板、杯中液体、门内呼吸。" },
        { range: "5-10秒", visual: "门只开一掌宽，暖光照到诱惑者单薄里衣与披着的主角外套；她接杯时两人手指相碰。", performance: `${tempter}立即缩手道歉，${hero}却没有松开杯子。`, camera: "从主角肩后缓慢推近手部，再上移到两人眼神。", dialogue: [{ speaker: tempter, line: "I kept your coat. It smells like rain... and home.", delivery: "先看外套再看他，home轻得像失言", subtext: "把对亡夫的怀念转移到主角身上" }], sound: "杯壁轻响，配乐给一根弦乐长音。" },
        { range: "10-15秒", visual: `${hero}松开杯子后没有离开；门后镜面里，诱惑者的脸晚半拍才转向他。`, performance: `${tempter}靠近门缝却保持门没有完全打开，既邀请又保留否认空间。`, camera: "焦点从真人转入镜中延迟动作，最后镜面占三分之一。", dialogue: [{ speaker: hero, line: "Lock the door after me.", delivery: "声音沙哑，像最后的自我约束", subtext: "他说离开，但脚没有动" }, { speaker: tempter, line: "After you leave?", delivery: "几乎是耳语", subtext: "逼他承认是否要走" }], sound: "最后一词后，门铰链轻响但不关门。" },
      ],
      endState: "门仍只开一掌宽，主角脚没有后退，镜中脸与真人不同步。", transitionOut: "硬切到门外地面，热饮杯从门缝内滚出并碎裂；不展示无因果的床戏蒙太奇。", firstFramePrompt: `${basePrompt} dim corridor side-back shot, ${hero} holding a steaming cup outside a closed guest room, clear door geography, restrained hesitation.`, keyFramePrompt: `${basePrompt} doorway intimacy, door open only a hand width, ${tempter} in modest thin underdress and the hero's wet coat, fingers touching on cup, eye contact carries seduction.`, lastFramePrompt: `${basePrompt} split composition with real ${tempter} and mirror reflection turning half a beat late, door still narrow, ${hero}'s feet unmoved, supernatural evidence subtle and legible.`, videoPrompt: "15-second continuous corridor-to-door seduction scene. Follow the hero, pause on the unheard choice, open door narrowly, travel from cup contact to eye contact, then rack focus into a delayed mirror reflection. Dialogue must breathe; keep the door width, cup, coat and feet continuous. No glamour montage, no sudden sex scene.", negativePrompt: project.visualSystem.globalNegative, continuityIn: "关系对手凝视的方向、同一夜、诱惑者仍披主角外套。", continuityOut: "门未关、热饮杯在诱惑者手中、主角尚未离开、镜像异常已出现。", status: "script",
    },
    {
      id: `${code(episode)}-U06`, sceneId: `${code(episode)}-S03`, duration: "8秒", storyFunction: "用一个完整动作制造本集不可逆钩子，并精确交给下一集。",
      transitionIn: "从门内传来碰撞声后，杯子越过门槛滚出。", startState: "走廊空镜只持续不到一秒，门内有人但不直接展示。",
      beats: [
        { range: "0-3秒", visual: "杯子滚出、撞墙碎裂，液体流向镜头；一只属于关系对手的鞋停在液体前。", performance: `${rival}没有立刻闯入，先屏住呼吸辨认门内声音。`, camera: "100mm低机位跟杯，停在鞋尖。", dialogue: [], sound: "杯碎、门内一声压住的喘息、雨声远。" },
        { range: "3-6秒", visual: `${rival}缓慢抬头，门缝光打在她脸上；门内传来${hero}低声说话。`, performance: "她从怀疑变成受伤，再把受伤压回判断。", camera: "从鞋尖垂直摇到面部近景。", dialogue: [{ speaker: hero, line: "This can never happen again.", delivery: "门内、气息未平", subtext: "证实已经越界，但没有交代发生到什么程度" }], sound: "对白隔门略闷，配乐完全停。" },
        { range: "6-8秒", visual: "门缝内伸出一只手捡碎片，手腕内侧不是人类皮肤；关系对手看见。", performance: `${rival}瞳孔收紧但不出声。`, camera: "快速下摇到手腕，最后定格两秒。", dialogue: [], sound: "皮肤轻微撕裂声与一个极低心跳。" },
      ],
      endState: "关系对手同时掌握背叛证据和怪物证据，却无法证明自己看到的东西。", transitionOut: "下一集第一帧复用这只异常手腕和她的视线，不能换场重新开局。", firstFramePrompt: `${basePrompt} low 100mm corridor insert, ceramic cup rolling from narrow door gap, warm liquid trail, exact same door and lighting.`, keyFramePrompt: `${basePrompt} close-up of ${rival} lit by a blade of doorway light, hearing an offscreen confession, hurt becoming controlled suspicion.`, lastFramePrompt: `${basePrompt} two-second hook frame, hand reaching for broken ceramic with a small section of nonhuman skin at wrist, ${rival}'s shoe and reflected eye visible, subtle body horror.`, videoPrompt: "8-second hook unit. Follow one cup in a single causal action: it rolls, breaks, reveals the eavesdropper, then an abnormal hand reaches out. Offscreen English line lands before the reveal. Hold final frame for two seconds so the next episode can continue from it.", negativePrompt: project.visualSystem.globalNegative, continuityIn: "同一门缝、同一杯子、同一夜，门内人物不瞬移。", continuityOut: "异常手腕伸出门外，关系对手低头看见，碎杯位置锁定。", status: "script",
    },
  ];

  return {
    episode,
    title: plan.title,
    targetRuntime: project.brief.episodeLength,
    dramaticQuestion: `当${hero}相信自己只是在救人时，观众能否看清${tempter}如何让一次善意变成第一次背叛？`,
    causalChain: ["危险迫使主角停车", "救助产生身体接触", "半真相换来同情", "礼貌退让逼主角主动越界", "第三人只看到局部而被误解", "深夜安慰变成秘密", "背叛与怪物证据同时出现"],
    scenes: [
      { id: `${code(episode)}-S01`, slugline: "外. 暴雨道路 - 夜", dramaticPurpose: "让主角主动选择把危险带回家。", entryState: plan.continuityIn, conflict: "救还是不救；相信谁的叙述。", exitState: "三人已形成信息差。" },
      { id: `${code(episode)}-S02`, slugline: "内. 主场景 - 夜", dramaticPurpose: "用生活行动建立诱惑者的绿茶策略和第一次公开站队。", entryState: "陌生人需要安置。", conflict: "谁有权替家庭作决定。", exitState: "主角公开挡在诱惑者一边。" },
      { id: `${code(episode)}-S03`, slugline: "内. 客房门外 - 深夜", dramaticPurpose: "把暧昧变成不可撤回的秘密，并给目击者双重证据。", entryState: "主角仍可选择回房。", conflict: "安慰与越界只隔一扇门。", exitState: plan.cliffhanger },
    ],
    units,
    editPlan: {
      assemblyRule: "六个单元按编号直连；优先用动作匹配、声音桥和视线方向衔接，不插解释性空镜。",
      musicArc: ["U01只用环境低频", "U02-U04尽量无配乐，让对白承担张力", "U05进入单弦暧昧动机", "U06撤掉音乐，用杯碎和心跳完成钩子"],
      soundBridges: ["暴雨从U01连续到U04但逐渐被室内隔绝", "衣料声连接救助和室内外套", "火焰爆响连接争执反打", "关系对手的呼吸连接暧昧与目击"],
      finalHook: plan.cliffhanger,
    },
    continuityAudit: ["U01-U02抓袖口手型、方向、雨量一致", "U02外套在U03挂上椅背并继续湿", "U03-U04三角站位和干衣位置不变", "U05主角外套仍在诱惑者身上", "U05-U06杯子、门缝宽度、走廊灯位一致", "下一集必须从异常手腕与关系对手视线继续"],
    generatedAt: new Date().toISOString(),
  };
}

function parseObject(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(cleaned); } catch { return null; }
}

async function requestJson(messages: ChatMessage[], maxTokens: number) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        thinking: { type: "disabled" },
        temperature: 0.52,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages,
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`DeepSeek request failed: ${response.status}`);
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = parseObject(data.choices?.[0]?.message?.content ?? "");
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON response");
    return parsed as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

function projectPrompt(input: Required<DirectorRequest>): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "你是能写中国微短剧、欧美微剧并懂AI视频生产的总编剧兼制片导演。",
        "只做项目蓝图，不写逐镜。目标是先解决完整剧情、人物欲望、因果链与资产一致性。",
        "拒绝宣传片思维：不要诗意混剪、气氛词堆砌、角色站着摆造型。每集都必须由上一集结果引发，并以一个人物行动改变关系。",
        "资产锁定要像电影前期制作：人物四视图与情绪板、场景空间轴线、道具正反面与状态变化。",
        "故事允许俗、狠、抓马，但所有耳光、误会、暧昧、反转必须有前因、目击信息差和后果。",
        "输出严格JSON，字段完全遵循用户给出的 schema 示例，不要Markdown。",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "生成可进入单集导演阶段的完整项目蓝图",
        brief: input,
        schema: fallbackDirectorProject(input),
        hardRules: [
          `episodes必须恰好${input.episodeCount}集`,
          "assets至少3个人物、2个场景、1个关键道具",
          "每集写清openingImage、hook、desire、obstacle、至少3条escalation、turn、cliffhanger、continuityIn和continuityOut",
          "continuityOut必须能直接成为下一集continuityIn",
          "meta.provider写deepseek，meta.model写实际模型名",
        ],
      }),
    },
  ];
}

function episodePrompt(project: DirectorProject, episode: number): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "你是连续剧现场导演、分镜师、对白导演和AI视频提示词工程师。",
        "输出的是完整可连续播放的一集，不是预告片，不是镜头概述。",
        "把一集拆成8-15秒的连续视频单元。每个单元内部必须有2-4个按秒排列的动作/对白/反应节拍，运镜在同一空间内自然完成。",
        "第一单元先建立空间、人物动作与事件，再进入近景；禁止开场只给蹲着的人或漂亮脸特写。",
        "对白要像演员能演的戏：写原句、语气、潜台词；上一句必须引发下一动作或反应。",
        "每个单元写首帧、关键帧、末帧提示词和完整视频提示词；末帧必须与下一单元首帧共享动作、道具、声音或视线。",
        "情色只用人物关系、站位、衣料与眼神制造，不写露骨性行为。惊悚可以有克制的身体恐怖。",
        "输出严格JSON，字段完全遵循schema示例，不要Markdown。",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify({
        task: `生成E${String(episode).padStart(2, "0")}完整导演生产包`,
        project,
        targetPlan: project.episodes[episode - 1],
        schema: fallbackEpisode({ ...project.brief, project, episode }, "schema example"),
        hardRules: [
          "总时长接近目标，不得用蒙太奇压缩关键关系戏",
          "至少3个场景、6个连续视频单元，每个单元2-4个beats",
          "每个beat都写visual、performance、camera、dialogue和sound",
          "每条对白同时写delivery与subtext",
          "首帧/关键帧/末帧prompt可直接交给Lovart或Grok生图，videoPrompt可直接生成多段内部运镜视频",
          "保持project.assets与visualSystem锁定，不新增无来源的主要人物",
        ],
      }),
    },
  ];
}

function validProject(value: unknown): value is DirectorProject {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DirectorProject>;
  return Boolean(item.meta && item.brief && item.storyEngine && item.visualSystem && Array.isArray(item.assets) && Array.isArray(item.episodes));
}

function validEpisode(value: unknown): value is DirectorEpisodePackage {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DirectorEpisodePackage>;
  return Boolean(item.episode && Array.isArray(item.scenes) && Array.isArray(item.units) && item.units.length > 0 && item.editPlan);
}

export async function generateDirectorProject(body: DirectorRequest): Promise<DirectorProject> {
  const input = normalizeDirectorRequest(body);
  try {
    const value = await requestJson(projectPrompt(input), Number(process.env.DAOYAN_PROJECT_MAX_TOKENS ?? 6500));
    if (!validProject(value) || value.episodes.length !== input.episodeCount) throw new Error("Project coverage is incomplete");
    return {
      ...value,
      brief: input,
      meta: { ...value.meta, provider: "deepseek", model: MODEL, generatedAt: new Date().toISOString() },
      assets: value.assets.map((asset) => ({ ...asset, status: asset.status === "locked" ? "locked" : "draft" })),
    };
  } catch (error) {
    return fallbackDirectorProject(input, error instanceof Error ? error.message : "generation failed");
  }
}

export async function generateDirectorEpisode(body: DirectorEpisodeRequest): Promise<DirectorEpisodePackage> {
  const project = body.project && validProject(body.project) ? body.project : fallbackDirectorProject(body, "missing project");
  const episode = Math.min(project.episodes.length, Math.max(1, Math.round(body.episode ?? 1)));
  try {
    const value = await requestJson(episodePrompt(project, episode), Number(process.env.DAOYAN_EPISODE_MAX_TOKENS ?? 11000));
    if (!validEpisode(value) || value.units.length < 6) throw new Error("Episode coverage is incomplete");
    return {
      ...value,
      episode,
      generatedAt: new Date().toISOString(),
      units: value.units.map((unit) => ({ ...unit, status: ["frames", "video", "approved"].includes(unit.status) ? unit.status : "script" })),
    };
  } catch (error) {
    return fallbackEpisode({ ...body, project, episode }, error instanceof Error ? error.message : "generation failed");
  }
}

export function directorEpisodeToMarkdown(project: DirectorProject, pack: DirectorEpisodePackage) {
  const lines = [
    `# ${project.meta.title} · E${String(pack.episode).padStart(2, "0")} ${pack.title}`,
    "",
    `目标时长：${pack.targetRuntime}`,
    `戏剧问题：${pack.dramaticQuestion}`,
    "",
    "## 因果链",
    ...pack.causalChain.map((item, index) => `${index + 1}. ${item}`),
    "",
  ];
  for (const unit of pack.units) {
    lines.push(`## ${unit.id} · ${unit.duration} · ${unit.storyFunction}`, "", `承接：${unit.transitionIn}`, `起始状态：${unit.startState}`, "");
    for (const beat of unit.beats) {
      lines.push(`### ${beat.range}`, `画面：${beat.visual}`, `表演：${beat.performance}`, `运镜：${beat.camera}`);
      for (const dialogue of beat.dialogue) lines.push(`对白：${dialogue.speaker}：“${dialogue.line}”`, `语气：${dialogue.delivery}`, `潜台词：${dialogue.subtext}`);
      lines.push(`声音：${beat.sound}`, "");
    }
    lines.push(`结束状态：${unit.endState}`, `转出：${unit.transitionOut}`, "", "**首帧 Prompt**", unit.firstFramePrompt, "", "**关键帧 Prompt**", unit.keyFramePrompt, "", "**末帧 Prompt**", unit.lastFramePrompt, "", "**视频 Prompt**", unit.videoPrompt, "", `负向约束：${unit.negativePrompt}`, "", `连续性进入：${unit.continuityIn}`, `连续性输出：${unit.continuityOut}`, "");
  }
  return lines.join("\n");
}
