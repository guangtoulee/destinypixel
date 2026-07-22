export type JubenSourceCharacter = {
  name: string;
  description: string;
};

export type JubenSourceDialogue = {
  character: string;
  line: string;
  note: string;
};

export type JubenSourceScene = {
  episode: number;
  sourceLabel: string;
  heading: string;
  action: string;
  dialogue: JubenSourceDialogue[];
  beats: Array<
    | { kind: "action"; text: string }
    | { kind: "dialogue"; character: string; line: string; note: string }
  >;
};

export type JubenSourceEpisode = {
  episode: number;
  label: string;
  title: string;
  sceneCount: number;
};

export type JubenSourceManifest = {
  mode: "idea" | "document";
  filename: string;
  title: string;
  genre: string;
  episodeCount: number;
  episodeLength: string;
  formatLine: string;
  characters: JubenSourceCharacter[];
  episodes: JubenSourceEpisode[];
  scenes: JubenSourceScene[];
  anchorLines: string[];
  protectedFacts: string[];
  fidelityMode: string;
  warnings: string[];
};

type SourceInput = {
  idea: string;
  sourceMode?: string;
  sourceFilename?: string;
  adaptationMode?: string;
  episodeCount?: number;
  episodeLength?: string;
  genre?: string;
};

const chineseNumbers: Record<string, number> = {
  "〇": 0,
  "一": 1,
  "二": 2,
  "三": 3,
  "四": 4,
  "五": 5,
  "六": 6,
  "七": 7,
  "八": 8,
  "九": 9,
  "十": 10,
};

function normalizeLines(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[\u2028\u2029]/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .filter(Boolean);
}

function parseChineseNumber(value: string) {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === "上") return 1;
  if (value === "下") return 2;
  if (value.length === 1) return chineseNumbers[value] ?? 1;
  if (value.startsWith("十")) return 10 + (chineseNumbers[value[1]] ?? 0);
  if (value.endsWith("十")) return (chineseNumbers[value[0]] ?? 1) * 10;
  const [tens, ones] = value.split("十");
  return (chineseNumbers[tens] ?? 1) * 10 + (chineseNumbers[ones] ?? 0);
}

function cleanHeading(value: string) {
  const structuredLocation = value.match(
    /内外景[／/]地点[／/]时间[：:]\s*([\s\S]*?)(?=\s+-\s+(?:戏剧问题|视觉时刻|情绪走向|预估时长|镜头组)|$)/,
  )?.[1];
  const normalized = (structuredLocation || value)
    .replace(/^[-—–\s]+/, "")
    .replace(/^内外景[／/]地点[／/]时间[：:]\s*/, "")
    .replace(/\s+-\s+(?:戏剧问题|视觉时刻|情绪走向|预估时长|镜头组)[\s\S]*$/, "")
    .replace(/[。；;]+$/g, "")
    .trim();
  const parts = normalized
    .split(/[·•，,／/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const location = parts[0] || "未标注地点";
  const time = parts.find((part) => /^(?:日|夜|晨|清晨|早|午|下午|傍晚|黄昏|晚|深夜|黎明|回忆|幻象|梦境)/.test(part)) || "日";
  const interiorPart = parts.find((part) => /^(?:内景|外景|内|外)(?:转(?:内景|外景|内|外))?$/.test(part));
  const interior = interiorPart?.includes("外") && !interiorPart.startsWith("内") ? "外" : "内";

  return `${interior}. ${location} - ${time}`;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function looksLikeScreenplay(text: string) {
  const sceneCount = (text.match(/[【[]\s*(?:场景?|SCENE)\s*[一二三四五六七八九十百〇\d]+(?:\s*[-—–]\s*\d+)?\s*[】\]]/gi) ?? []).length;
  const dialogueCount = (text.match(/^[^\n：:]{1,16}[：:]/gm) ?? []).length;
  return sceneCount >= 2 || (sceneCount >= 1 && dialogueCount >= 4);
}

function parseEpisodeHeading(line: string) {
  const match = line.match(
    /^(?:EP?|第)\s*([一二三四五六七八九十百〇\d]+)\s*(?:集|EPISODE)\s*[：:]?\s*(?:《([^》]+)》|([^（(—-]{1,60}))?/i,
  );
  if (!match) return null;

  return {
    episode: parseChineseNumber(match[1]),
    label: `第${parseChineseNumber(match[1])}集`,
    title: (match[2] || match[3] || "").trim(),
  };
}

function parseSceneHeading(line: string, currentEpisode: number) {
  const bracketed = line.match(
    /^[【[]\s*(?:场景?|SCENE)\s*([一二三四五六七八九十百〇\d]+(?:\s*[-—–]\s*\d+)?)\s*[】\]]\s*(.*)$/i,
  );
  const plain = line.match(
    /^(?:场景?|SCENE)\s*([一二三四五六七八九十百〇\d]+(?:\s*[-—–]\s*\d+)?)\s*[：:.、-]\s*(.+)$/i,
  );
  const match = bracketed || plain;
  if (!match) return null;

  const label = match[1].replace(/\s+/g, "").replace(/[—–]/g, "-");
  const episodeToken = label.includes("-") ? label.split("-")[0] : "";
  const inferredEpisode = episodeToken ? parseChineseNumber(episodeToken) : currentEpisode;

  return {
    episode: Math.max(1, inferredEpisode),
    sourceLabel: `场 ${label}`,
    remainder: match[2].trim(),
  };
}

function scenePayload(value: string) {
  const segments = value
    .replace(/\s+-\s+(?=[^：:]{1,30}[：:])/g, "\n")
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
  const useful = segments
    .filter((part) => /^(?:镜头组|视觉时刻|画面|动作|分段动作)/.test(part))
    .map((part) => part.replace(/^[^：:]{1,30}[：:]\s*/, "").trim())
    .filter(Boolean);

  if (useful.length > 0) return useful.join(" ");

  return segments
    .slice(1)
    .filter((part) => !/^(?:戏剧问题|情绪走向|预估时长|纪律|光线)[：:]/.test(part))
    .join(" ") || value;
}

const structuralSpeakerNames = new Set([
  "类型",
  "媒介",
  "结构",
  "题材定位",
  "剧集类型",
  "总时长",
  "叙事功能",
  "内外景／地点／时间",
  "内外景/地点/时间",
  "地点",
  "戏剧问题",
  "视觉时刻",
  "情绪走向",
  "预估时长",
  "镜头组",
  "画面",
  "动作",
  "禁止",
  "约束",
  "运镜",
  "音效",
  "站位与朝向",
  "输出约束",
]);

function normalizeSpeakerName(value: string) {
  return value
    .replace(/^[•·\-\s]+/, "")
    .replace(/(?:低语|嘶吼|大喊|喊|问|答|说|气声断续|画外音|旁白)$/g, "")
    .trim();
}

function characterAliases(characters: JubenSourceCharacter[]) {
  const aliases = new Set<string>();

  for (const character of characters) {
    aliases.add(character.name);
    aliases.add(character.name.replace(/(?:修士|学士|王子|公主|国王|侍女)$/g, ""));
    const givenName = character.name.split("·")[0];
    if (givenName.length >= 2) aliases.add(givenName);
    for (const match of character.description.matchAll(/(?:白玫瑰|红玫瑰|公主|厉鬼|老国王|安布罗斯|亨利|埃德蒙|学士)/g)) {
      aliases.add(match[0]);
    }
  }

  return Array.from(aliases)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)
    .sort((a, b) => b.length - a.length);
}

function inlineDialogues(
  value: string,
  characters: JubenSourceCharacter[],
): JubenSourceDialogue[] {
  const dialogues: JubenSourceDialogue[] = [];
  const aliases = characterAliases(characters);
  const pattern = /(?:^|[；;。]|\s)\s*(?:[a-z]\d+\s*)?([^，。；;！？!?“”：:]{1,30}?)(?:（([^）]{1,30})）)?[：:]\s*[“\"]([^”\"]+)[”\"]/gi;

  for (const match of value.matchAll(pattern)) {
    const phrase = normalizeSpeakerName(match[1]);
    const character = aliases.find((alias) => phrase.includes(alias)) ||
      (aliases.length === 0 && /^[\p{Script=Han}A-Za-z·]{2,8}$/u.test(phrase) ? phrase : "");
    if (!character || structuralSpeakerNames.has(character)) continue;
    dialogues.push({
      character,
      note: (match[2] || "").trim(),
      line: match[3].trim(),
    });
  }

  return dialogues;
}

function parseCharacterProfiles(lines: string[]) {
  const characters: JubenSourceCharacter[] = [];
  const start = lines.findIndex((line) => /^(?:[一二三四五六七八九十百]+、)?(?:人物拆解|人物表|人物小传|角色设定|角色档案)/.test(line));
  if (start < 0) return characters;

  let current: JubenSourceCharacter | null = null;
  const flush = () => {
    if (!current) return;
    current.description = current.description.replace(/\s+/g, " ").trim();
    if (current.name && !characters.some((item) => item.name === current?.name)) {
      characters.push(current);
    }
    current = null;
  };

  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[一二三四五六七八九十百]+、/.test(line)) break;

    const heading = line.match(
      /^([^•：:（(]{1,40}?)(?:（([^）]{1,100})）|\(([^)]{1,100})\))?\s*(?:——|--|—)\s*(.+)$/,
    );
    if (heading) {
      flush();
      current = {
        name: heading[1].trim(),
        description: [heading[2] || heading[3], heading[4]].filter(Boolean).join("，"),
      };
      continue;
    }

    const simpleHeading = line.match(/^([^•：:（(]{1,40})（([^）]{1,100})）$/);
    if (simpleHeading && /^•?\s*身份[：:]/.test(lines[index + 1] || "")) {
      flush();
      current = {
        name: simpleHeading[1].trim(),
        description: simpleHeading[2].trim(),
      };
      continue;
    }

    if (current && /^•?\s*(?:身份|弧光|声音特质|外形|欲望／障碍|欲望\/障碍)[：:]/.test(line)) {
      current.description += `，${line.replace(/^•\s*/, "")}`;
    }
  }
  flush();

  return characters;
}

export function parseJubenSource(input: SourceInput): JubenSourceManifest {
  const text = input.idea.trim();
  const lines = normalizeLines(text);
  const detectedDocument = input.sourceMode === "document" || looksLikeScreenplay(text);
  const titleMatch = text.slice(0, 500).match(/《([^》]{2,80})》/);
  const plainTitle = lines[0]?.replace(/剧本|微短剧|短剧|廉洁文化/g, "").trim();
  const title = titleMatch?.[1]?.trim() || plainTitle || "未命名短剧";
  const genreLine = lines.find((line) => /^(?:题材定位|类型)[：:]/.test(line));
  const formatLine = lines.find((line) => /^(?:剧集类型|媒介)[：:]/.test(line)) || "";
  const genre = genreLine?.replace(/^(?:题材定位|类型)[：:]\s*/, "").split(/\s+媒介[：:]/)[0] || input.genre || "短剧";
  const characters: JubenSourceCharacter[] = parseCharacterProfiles(lines);
  const episodes: JubenSourceEpisode[] = [];
  const scenes: JubenSourceScene[] = [];
  const anchorLines: string[] = [];
  let currentEpisode = 1;
  let currentEpisodeTitle = title;
  let currentScene: JubenSourceScene | null = null;
  let inCharacterTable = false;

  const flushScene = () => {
    if (!currentScene) return;
    currentScene.action = currentScene.action.trim();
    scenes.push(currentScene);
    currentScene = null;
  };

  for (const line of lines) {
    if (/^人物表/.test(line)) {
      inCharacterTable = true;
      continue;
    }

    const episodeMatch = parseEpisodeHeading(line);
    if (episodeMatch) {
      flushScene();
      currentEpisode = episodeMatch.episode;
      currentEpisodeTitle = episodeMatch.title || `第${currentEpisode}集`;
      if (!episodes.some((item) => item.episode === currentEpisode)) {
        episodes.push({
          episode: currentEpisode,
          label: episodeMatch.label,
          title: currentEpisodeTitle,
          sceneCount: 0,
        });
      }
      inCharacterTable = false;
      continue;
    }

    if (
      currentScene &&
      (/^[一二三四五六七八九十百]+、/.test(line) ||
        /^第[一二三四五六七八九十百]+部分[：:]?/.test(line) ||
        /^(?:附录|参考|说明)[：:]?/.test(line))
    ) {
      flushScene();
      continue;
    }

    const sceneMatch = parseSceneHeading(line, currentEpisode);
    if (sceneMatch) {
      flushScene();
      inCharacterTable = false;
      currentEpisode = sceneMatch.episode;
      const payload = scenePayload(sceneMatch.remainder);
      const dialogue = inlineDialogues(payload, characters);
      currentScene = {
        episode: sceneMatch.episode,
        sourceLabel: sceneMatch.sourceLabel,
        heading: cleanHeading(sceneMatch.remainder),
        action: payload,
        dialogue,
        beats: payload ? [{ kind: "action" as const, text: payload }] : [],
      };
      for (const item of dialogue) {
        if (item.line.length >= 4 && anchorLines.length < 20) {
          anchorLines.push(`${item.character}：${item.line}`);
        }
      }
      if (/(?:戏剧问题|视觉时刻|镜头组|预估时长)[：:]/.test(sceneMatch.remainder)) {
        flushScene();
      }
      continue;
    }

    if (inCharacterTable && characters.length === 0) {
      const characterMatch = line.match(/^([^（(—-]{1,20})(?:（([^）]+)）|\(([^)]+)\))?\s*[—-]{1,2}\s*(.+)$/);
      if (characterMatch) {
        characters.push({
          name: characterMatch[1].trim(),
          description: [characterMatch[2] || characterMatch[3], characterMatch[4]]
            .filter(Boolean)
            .join("，"),
        });
        continue;
      }
    }

    if (!currentScene) continue;

    const dialogueMatch = line.match(/^([^：:（(]{1,16})(?:（([^）]+)）|\(([^)]+)\))?[：:]\s*(.+)$/);
    if (dialogueMatch && !/^【/.test(line)) {
      const dialogue = {
        character: dialogueMatch[1].trim(),
        note: (dialogueMatch[2] || dialogueMatch[3] || "").trim(),
        line: dialogueMatch[4].trim(),
      };
      currentScene.dialogue.push(dialogue);
      currentScene.beats.push({ kind: "dialogue", ...dialogue });
      if (dialogue.line.length >= 6 && anchorLines.length < 12) {
        anchorLines.push(`${dialogue.character}：${dialogue.line}`);
      }
      continue;
    }

    const action = line.replace(/^（|）$/g, "").trim();
    if (action) {
      currentScene.action += `${currentScene.action ? " " : ""}${action}`;
      currentScene.beats.push({ kind: "action", text: action });
    }
  }
  flushScene();

  const knownCharacterNames = new Set(characters.map((item) => item.name));
  const inferredSpeakers = characters.length > 0 ? [] : unique([
    ...lines.flatMap((line) => {
      const match = line.match(/^([^：:（）()]{2,16})(?:（[^）]+）|\([^)]+\))?[：:]\s*[“\"]?(.+)/);
      return match && !structuralSpeakerNames.has(match[1].trim())
        ? [normalizeSpeakerName(match[1])]
        : [];
    }),
    ...Array.from(text.matchAll(/@([\p{Script=Han}A-Za-z][\p{Script=Han}A-Za-z·]{0,19})/gu)).map((match) => match[1]),
  ]).filter((name) => name && !structuralSpeakerNames.has(name));
  for (const name of inferredSpeakers) {
    if (knownCharacterNames.has(name)) continue;
    characters.push({
      name,
      description: "由原稿对白或场内标记识别，外形、服装与表演信息待在资产锁定阶段补齐。",
    });
    knownCharacterNames.add(name);
  }

  const episodeNumbers = unique(scenes.map((scene) => scene.episode));
  for (const episode of episodeNumbers) {
    const existing = episodes.find((item) => item.episode === episode);
    const sceneCount = scenes.filter((scene) => scene.episode === episode).length;
    if (existing) existing.sceneCount = sceneCount;
    else {
      episodes.push({
        episode,
        label: `第${episode}集`,
        title: episode === currentEpisode ? currentEpisodeTitle : `第${episode}集`,
        sceneCount,
      });
    }
  }
  episodes.sort((a, b) => a.episode - b.episode);

  let inferredEpisodeCount = input.episodeCount || 1;
  if (/双集|上集\s*\+\s*下集/.test(formatLine)) inferredEpisodeCount = 2;
  const numericEpisodeMatch = text.match(/(?:共|全)\s*(\d+)\s*集/) || formatLine.match(/(\d+)\s*集/);
  if (numericEpisodeMatch) inferredEpisodeCount = Number(numericEpisodeMatch[1]);
  if (episodes.length > 0) inferredEpisodeCount = Math.max(...episodes.map((item) => item.episode));

  let episodeLength = input.episodeLength || "90 秒";
  const eachMinutes = formatLine.match(/各约\s*(\d+)\s*分钟/);
  const singleMinutes = text.match(/单集(?:时长)?[^\d]{0,8}(\d+)(?:\s*[–—-]\s*(\d+))?\s*分钟/);
  if (eachMinutes) episodeLength = `${eachMinutes[1]} 分钟`;
  else if (singleMinutes) episodeLength = singleMinutes[2]
    ? `${singleMinutes[1]}-${singleMinutes[2]} 分钟`
    : `${singleMinutes[1]} 分钟`;

  const protectedFacts = [
    `原稿标题：${title}`,
    `原稿规格：${inferredEpisodeCount}集，每集${episodeLength}`,
    characters.length > 0 ? `原稿角色：${characters.map((item) => item.name).join("、")}` : "",
    scenes.length > 0 ? `原稿场次：${scenes.length}场，必须按原顺序推进` : "",
    episodes.length > 0 ? `原稿分集：${episodes.map((item) => `E${String(item.episode).padStart(2, "0")}《${item.title}》`).join("；")}` : "",
  ].filter(Boolean);

  const warnings: string[] = [];
  if (detectedDocument && scenes.length === 0) warnings.push("未识别到场次：支持【场 2-1】、[场2-1]、【场景一】等标题；为防止瞎编，生成已禁止继续。");
  if (detectedDocument && characters.length === 0) warnings.push("未识别到人物档案或对白说话人，请先补充角色信息。");
  if (!detectedDocument) warnings.push("当前是创意模式，人物和场景尚未由原稿锁定。");

  return {
    mode: detectedDocument ? "document" : "idea",
    filename: input.sourceFilename || "",
    title,
    genre,
    episodeCount: Math.min(12, Math.max(1, inferredEpisodeCount)),
    episodeLength,
    formatLine,
    characters,
    episodes,
    scenes,
    anchorLines: unique(anchorLines),
    protectedFacts,
    fidelityMode: input.adaptationMode || (detectedDocument ? "忠实拆解" : "创意扩写"),
    warnings,
  };
}

export function sourceFidelityWarnings(
  manifest: JubenSourceManifest,
  candidate: {
    title?: string;
    text: string;
  },
) {
  if (manifest.mode !== "document") return [];
  const warnings: string[] = [];
  const candidateText = `${candidate.title || ""}\n${candidate.text}`;

  if (manifest.title && candidate.title && !candidate.title.includes(manifest.title)) {
    warnings.push(`标题偏离原稿：应保留《${manifest.title}》。`);
  }

  const missingCharacters = manifest.characters
    .map((item) => item.name)
    .filter((name) => !candidateText.includes(name));
  if (missingCharacters.length > 0) {
    warnings.push(`缺少原稿角色：${missingCharacters.join("、")}。`);
  }

  const foreignSampleTerms = ["外卖", "骑手", "404", "小票", "老小区"]
    .filter((term) => candidateText.includes(term) && !manifest.scenes.some((scene) => `${scene.heading}${scene.action}`.includes(term)));
  if (foreignSampleTerms.length > 0) {
    warnings.push(`发现与原稿无关的样例元素：${foreignSampleTerms.join("、")}。`);
  }

  return warnings;
}
