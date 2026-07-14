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
  const parts = value
    .replace(/[。；;]+$/g, "")
    .split(/[·•]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const location = parts[0] || "未标注地点";
  const time = parts.find((part) => /日|夜|晨|晚|昏|回忆|幻象|梦境/.test(part)) || "日";
  const interior = parts.find((part) => /内|外/.test(part)) || "内";

  return `${interior}. ${location} - ${time}`;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function looksLikeScreenplay(text: string) {
  const sceneCount = (text.match(/【场景[^】]+】/g) ?? []).length;
  const dialogueCount = (text.match(/^[^\n：:]{1,16}[：:]/gm) ?? []).length;
  return sceneCount >= 2 || (sceneCount >= 1 && dialogueCount >= 4);
}

export function parseJubenSource(input: SourceInput): JubenSourceManifest {
  const text = input.idea.trim();
  const lines = normalizeLines(text);
  const detectedDocument = input.sourceMode === "document" || looksLikeScreenplay(text);
  const titleMatch = text.slice(0, 500).match(/《([^》]{2,80})》/);
  const plainTitle = lines[0]?.replace(/剧本|微短剧|短剧|廉洁文化/g, "").trim();
  const title = titleMatch?.[1]?.trim() || plainTitle || "未命名短剧";
  const genreLine = lines.find((line) => /^题材定位[：:]/.test(line));
  const formatLine = lines.find((line) => /^剧集类型[：:]/.test(line)) || "";
  const genre = genreLine?.replace(/^题材定位[：:]\s*/, "") || input.genre || "短剧";
  const characters: JubenSourceCharacter[] = [];
  const episodes: JubenSourceEpisode[] = [];
  const scenes: JubenSourceScene[] = [];
  const anchorLines: string[] = [];
  let currentEpisode = 1;
  let currentEpisodeTitle = title;
  let currentScene: JubenSourceScene | null = null;
  let inCharacterTable = false;

  const characterBlock = text.match(
    /人物表([\s\S]*?)(?=(?:上|下|第[一二三四五六七八九十百〇\d]+)集\s*[：:]?|【场景)/,
  )?.[1];
  if (characterBlock) {
    const dialogueSpeakers = unique(
      Array.from(text.matchAll(/(?:^|\n)([^\n：:（）()]{1,16})(?:（[^）]+）|\([^)]+\))?[：:]/g))
        .map((match) => match[1].trim()),
    );
    const markers = dialogueSpeakers
      .map((name) => ({ name, index: characterBlock.indexOf(`${name}（`) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => a.index - b.index);

    for (let index = 0; index < markers.length; index += 1) {
      const marker = markers[index];
      const next = markers[index + 1];
      const segment = characterBlock.slice(marker.index, next?.index ?? characterBlock.length);
      const match = segment.match(/^([^（]+)（([^）]+)）\s*[—-]{1,2}([\s\S]*)$/);
      if (!match) continue;
      characters.push({
        name: marker.name,
        description: `${match[2].trim()}，${match[3].replace(/\s+/g, " ").trim()}`,
      });
    }
  }

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

    const episodeMatch = line.match(/^(上|下|第([一二三四五六七八九十百〇\d]+))集\s*[：:]?\s*(?:《([^》]+)》)?/);
    if (episodeMatch) {
      flushScene();
      currentEpisode = episodeMatch[1] === "上"
        ? 1
        : episodeMatch[1] === "下"
          ? 2
          : parseChineseNumber(episodeMatch[2] || "1");
      currentEpisodeTitle = episodeMatch[3]?.trim() || `第${currentEpisode}集`;
      if (!episodes.some((item) => item.episode === currentEpisode)) {
        episodes.push({
          episode: currentEpisode,
          label: episodeMatch[1] === "上" || episodeMatch[1] === "下" ? `${episodeMatch[1]}集` : `第${currentEpisode}集`,
          title: currentEpisodeTitle,
          sceneCount: 0,
        });
      }
      inCharacterTable = false;
      continue;
    }

    const sceneMatch = line.match(/^【场景([^】]+)】\s*(.+)$/);
    if (sceneMatch) {
      flushScene();
      inCharacterTable = false;
      currentScene = {
        episode: currentEpisode,
        sourceLabel: `场景${sceneMatch[1]}`,
        heading: cleanHeading(sceneMatch[2]),
        action: "",
        dialogue: [],
        beats: [],
      };
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
  const numericEpisodeMatch = formatLine.match(/(\d+)\s*集/);
  if (numericEpisodeMatch) inferredEpisodeCount = Number(numericEpisodeMatch[1]);
  if (episodes.length > 0) inferredEpisodeCount = Math.max(...episodes.map((item) => item.episode));

  let episodeLength = input.episodeLength || "90 秒";
  const eachMinutes = formatLine.match(/各约\s*(\d+)\s*分钟/);
  const singleMinutes = text.match(/单集(?:时长)?[^\d]{0,8}(\d+)\s*分钟/);
  if (eachMinutes) episodeLength = `${eachMinutes[1]} 分钟`;
  else if (singleMinutes) episodeLength = `${singleMinutes[1]} 分钟`;

  const protectedFacts = [
    `原稿标题：${title}`,
    `原稿规格：${inferredEpisodeCount}集，每集${episodeLength}`,
    characters.length > 0 ? `原稿角色：${characters.map((item) => item.name).join("、")}` : "",
    scenes.length > 0 ? `原稿场次：${scenes.length}场，必须按原顺序推进` : "",
    episodes.length > 0 ? `原稿分集：${episodes.map((item) => `E${String(item.episode).padStart(2, "0")}《${item.title}》`).join("；")}` : "",
  ].filter(Boolean);

  const warnings: string[] = [];
  if (detectedDocument && scenes.length === 0) warnings.push("未识别到标准场景标题，请人工确认分场。");
  if (detectedDocument && characters.length === 0) warnings.push("未识别到人物表，将从对白说话人继续锁定角色。");
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
