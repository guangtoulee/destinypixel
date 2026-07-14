"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  Check,
  ChevronDown,
  Clapperboard,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  FileText,
  FileJson,
  Film,
  Gauge,
  LayoutList,
  Loader2,
  MapPin,
  Mic2,
  Palette,
  Play,
  RefreshCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Video,
  Workflow,
} from "lucide-react";
import type {
  JubenAnalysisResult,
  JubenPromptItem,
  JubenRequestBody,
  JubenResult,
  JubenScene,
  JubenShot,
} from "@/lib/ai/juben";
import styles from "./juben-experience.module.css";

type Status = "idle" | "loading" | "ready" | "error";
type AnalyzeStatus = "idle" | "loading" | "ready" | "error";
type UploadStatus = "idle" | "loading" | "ready" | "error";
type EpisodeScope = number | "all";
type TabKey =
  | "source"
  | "development"
  | "visual"
  | "outline"
  | "episode"
  | "shotpack"
  | "delivery"
  | "script"
  | "shots"
  | "storyboard"
  | "camera"
  | "edit"
  | "voice";

const voiceLanguageOptions = [
  "中文",
  "英语",
  "俄语",
  "印尼语",
  "阿拉伯语",
];

const initialForm: Required<JubenRequestBody> = {
  idea:
    "一个女律师发现自己每晚 23:17 都会收到已故母亲发来的微信语音。她一开始以为是诈骗，直到语音准确说出第二天庭审会出现的证据。她越追查，越发现母亲当年的死亡和自己正在辩护的案子有关。",
  sourceMode: "idea",
  sourceFilename: "",
  adaptationMode: "创意扩写",
  genre: "都市悬疑短剧",
  audience: "18-35 岁，喜欢反转、亲情悬疑、强情绪钩子的竖屏短剧用户",
  episodeCount: 4,
  episodeLength: "90 秒",
  aspectRatio: "9:16 竖屏",
  tone: "现实主义、紧张、克制、有情感刺痛",
  productionMode: "短剧分集",
  outputTarget: "Lovart 分镜图 + Grok 视频生成",
  voiceLanguage: "中文",
  mustHave: "每集必须有真实戏剧动作、人物关系推进、结尾钩子；母女关系要有情感重量。",
  avoid:
    "不要写成宣传片、预告片、概念片；不要只写氛围；不要靠旁白解释；不要每一幕都神神叨叨。",
};

const tabs: Array<{ key: TabKey; label: string; icon: typeof BookOpenText }> = [
  { key: "source", label: "原稿校对", icon: ClipboardCheck },
  { key: "development", label: "立项圣经", icon: BookOpenText },
  { key: "visual", label: "视觉定调", icon: Palette },
  { key: "outline", label: "分集节拍", icon: LayoutList },
  { key: "episode", label: "导演剧本", icon: Clapperboard },
  { key: "shotpack", label: "生成镜头", icon: Film },
  { key: "delivery", label: "交付导出", icon: Download },
];

function updateField<K extends keyof Required<JubenRequestBody>>(
  form: Required<JubenRequestBody>,
  key: K,
  value: Required<JubenRequestBody>[K],
) {
  return { ...form, [key]: value };
}

function asPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function promptText(items: JubenPromptItem[]) {
  return items
    .map(
      (item) =>
        `${item.id} / ${item.sceneId}\n${item.prompt}\n负向约束：${item.negativePrompt}`,
    )
    .join("\n\n");
}

function resultTabText(result: JubenResult, tab: TabKey) {
  return resultTabTextForScope(result, tab, "all");
}

function sceneEpisode(sceneId: string) {
  const match = sceneId.match(/^E(\d+)/i);

  return match ? Number(match[1]) : 1;
}

function scopedResultParts(result: JubenResult, scope: EpisodeScope) {
  const episode =
    scope === "all" ? null : typeof scope === "number" ? scope : null;
  const scenes =
    episode === null
      ? result.directorScript
      : result.directorScript.filter((scene) => scene.episode === episode);
  const sceneIds = new Set(scenes.map((scene) => scene.sceneId));
  const shots =
    episode === null
      ? result.shotList
      : result.shotList.filter(
          (shot) =>
            sceneIds.has(shot.sceneId) || sceneEpisode(shot.sceneId) === episode,
        );
  const storyboardPrompts =
    episode === null
      ? result.storyboardPrompts
      : result.storyboardPrompts.filter(
          (item) =>
            sceneIds.has(item.sceneId) || sceneEpisode(item.sceneId) === episode,
        );
  const cameraPrompts =
    episode === null
      ? result.cameraPrompts
      : result.cameraPrompts.filter(
          (item) =>
            sceneIds.has(item.sceneId) || sceneEpisode(item.sceneId) === episode,
        );
  const editPrompts =
    episode === null
      ? result.editPrompts
      : result.editPrompts.filter(
          (item) =>
            sceneIds.has(item.sceneId) || sceneEpisode(item.sceneId) === episode,
        );
  const outline =
    episode === null
      ? result.episodeOutline
      : result.episodeOutline.filter((item) => item.episode === episode);

  return {
    episode,
    outline,
    scenes,
    shots,
    storyboardPrompts,
    cameraPrompts,
    editPrompts,
  };
}

function findSceneForShot(result: JubenResult, shot: JubenShot) {
  return result.directorScript.find((scene) => scene.sceneId === shot.sceneId);
}

function promptForShot(
  items: JubenPromptItem[],
  shot: JubenShot,
  scopedShots: JubenShot[],
) {
  const direct = items.find((item) => item.prompt.includes(shot.shotId));

  if (direct) return direct;

  const sameSceneShots = scopedShots.filter(
    (candidate) => candidate.sceneId === shot.sceneId,
  );
  const sameScenePrompts = items.filter((item) => item.sceneId === shot.sceneId);
  const shotIndex = sameSceneShots.findIndex(
    (candidate) => candidate.shotId === shot.shotId,
  );

  return sameScenePrompts[Math.max(shotIndex, 0)] ?? sameScenePrompts[0];
}

function atTag(value: string) {
  return `@${value.replace(/^@/, "").trim()}`;
}

function shotSeconds(shot: JubenShot) {
  const match = shot.duration.match(/\d+/);

  return match ? Math.max(4, Number(match[0])) : 6;
}

function scenePlace(scene?: JubenScene) {
  if (!scene) return "当前场景";

  const withoutPrefix = scene.sceneHeading.replace(/^(内|外|内\/外|外\/内)\.\s*/, "");
  return withoutPrefix.split(/\s*[-－—]\s*/)[0]?.trim() || scene.sceneHeading;
}

function characterRoster(result: JubenResult) {
  return result.visualBible.characterLocks.length > 0
    ? result.visualBible.characterLocks
    : [
        {
          character: "主角",
          lockedPrompt: result.storyBible.protagonist,
        },
        {
          character: "阻碍者",
          lockedPrompt: result.storyBible.antagonist,
        },
      ];
}

function characterRosterText(result: JubenResult) {
  return characterRoster(result)
    .map((item) => `${atTag(item.character)}：${item.lockedPrompt}`)
    .join("\n");
}

function backgroundSceneText(result: JubenResult, scene?: JubenScene) {
  const place = scenePlace(scene);
  const rules = [
    ...result.visualBible.environmentRules.slice(0, 3),
    ...result.visualBible.keyProps.slice(0, 4).map((prop) => `关键道具：${prop}`),
  ];

  return [`${atTag(place)}：${scene?.sceneHeading ?? "本镜头场景"}，${result.visualBible.coreStyle}`, ...rules]
    .filter(Boolean)
    .join("\n");
}

function previousShotText(
  result: JubenResult,
  shot: JubenShot,
  scopedShots: JubenShot[],
) {
  const currentIndex = scopedShots.findIndex(
    (candidate) => candidate.shotId === shot.shotId,
  );
  const previousShot = currentIndex > 0 ? scopedShots[currentIndex - 1] : null;
  const previousScene = previousShot ? findSceneForShot(result, previousShot) : null;

  if (!previousShot) {
    return "本集第一镜：用具体动作建立人物目标、空间关系和第一处异常，不用旁白解释设定。";
  }

  return `${previousShot.shotId} / ${previousScene?.sceneHeading ?? previousShot.sceneId}：${previousShot.visual} ${previousShot.action} 连续性：${previousShot.continuity}`;
}

function dialogueText(scene?: JubenScene) {
  if (!scene || scene.dialogue.length === 0) {
    return "本镜头以动作、表情、呼吸和环境声推进；如需对白，口型必须清楚。";
  }

  return scene.dialogue
    .map((line) => `${atTag(line.character)}开口：“${line.line}”（${line.subtext}）`)
    .join("\n");
}

function dialogueTextForShot(scene: JubenScene | undefined, shot: JubenShot) {
  const match = shot.visual.match(/^(.+?)在.+?原稿对白：“([\s\S]+)”/);

  if (match) {
    return `${atTag(match[1])}开口：“${match[2]}”（原稿对白，必须准确发音并对齐口型）`;
  }

  return scene?.dialogue.length
    ? "本镜头不新增对白，只保留上一句尾音、人物反应、呼吸和现场环境声。"
    : "本镜头以动作、表情、呼吸和环境声推进，不增加原稿之外的台词。";
}

function splitActionText(
  result: JubenResult,
  shot: JubenShot,
  scene?: JubenScene,
) {
  const total = shotSeconds(shot);
  const mid = Math.max(2, Math.floor(total / 2));
  const mainCharacter =
    characterRoster(result)[0]?.character ?? scene?.dialogue[0]?.character ?? "主角";
  const antagonist =
    characterRoster(result)[1]?.character ?? scene?.dialogue[1]?.character ?? "阻碍者";

  return [
    `【0-${mid}秒：动作建立】`,
    `画面：${shot.visual} ${atTag(mainCharacter)}执行动作：${shot.action}。景别为${shot.shotSize}，${shot.cameraAngle}，空间必须有前景/中景/背景层次。`,
    `禁止：主体突然换脸；动作迟缓散漫；画面没有景深层次；服装和道具与上一镜不连续；光线突然刺眼。`,
    `约束：${shot.continuity}；关键道具必须可见；人物手部结构自然真实；镜面/反光物品必须明确正反面，不能污染画面。`,
    `站位与朝向：${atTag(mainCharacter)}占据主要视觉中心，${atTag(antagonist)}或阻碍信息保留在可识别的位置，人物视线必须服务冲突。`,
    `运镜：${shot.movement}，镜头从${shot.cameraAngle}进入，不跳轴，不随机换景。`,
    `音效：${shot.sound}`,
    "",
    `【${mid}-${total}秒：反应与钩子】`,
    `画面：动作推进到情绪或信息反转，${scene?.emotionalTurn ?? shot.visual}。光影按照“${result.visualBible.colorPalette.slice(0, 4).join(" / ")}”逐步变化，压迫感增强。`,
    `禁止：对白无口型；人物关系不推进；背景角色离开既定位置；手部穿模；裙摆/外套/帽子/道具突然变干净或消失。`,
    `约束：必须给出清晰反应和下一镜钩子；保留${scenePlace(scene)}的空间连续性；${result.visualBible.globalNegative}`,
    `站位与朝向：主体动作结束后，视线或身体朝向必须指向下一镜的冲突来源。`,
    `运镜：保持${shot.movement}的运动逻辑，最后定格在表情、证据物或阻碍者反应上。`,
    `音效：${shot.sound}，环境底噪不断，结尾留出剪辑点。`,
  ].join("\n");
}

function libtvFinalPrompt(
  result: JubenResult,
  shot: JubenShot,
  scene?: JubenScene,
  scopedShots: JubenShot[] = result.shotList,
) {
  const storyboard = promptForShot(result.storyboardPrompts, shot, scopedShots);
  const camera = promptForShot(result.cameraPrompts, shot, scopedShots);
  const characters = characterRoster(result)
    .slice(0, 4)
    .map((item) => `${atTag(item.character)}（${item.lockedPrompt}）`)
    .join("、");
  const place = atTag(scenePlace(scene));

  return [
    `${shot.shotSize}，${result.visualBible.colorPalette.slice(0, 3).join("、")}交替的${place}。`,
    `${characters}。`,
    `${shot.visual} ${shot.action}`,
    dialogueTextForShot(scene, shot),
    `镜头语言：${shot.cameraAngle}，${shot.movement}，${camera?.prompt ?? ""}`,
    `光影氛围：${result.visualBible.coreStyle}`,
    `音效：${shot.sound}`,
    `最终约束：${shot.continuity}；${storyboard?.negativePrompt ?? ""}；${result.visualBible.globalNegative}`,
    `[视觉风格：${result.visualBible.format}]`,
  ]
    .filter(Boolean)
    .join(" ");
}

function libtvStructuredPrompt(
  result: JubenResult,
  shot: JubenShot,
  scene: JubenScene | undefined,
  scopedShots: JubenShot[],
) {
  const storyboard = promptForShot(result.storyboardPrompts, shot, scopedShots);
  const camera = promptForShot(result.cameraPrompts, shot, scopedShots);
  const edit = promptForShot(result.editPrompts, shot, scopedShots);

  return [
    "出场角色：",
    characterRosterText(result),
    "",
    "---",
    "",
    "背景场景：",
    backgroundSceneText(result, scene),
    "",
    "---",
    "",
    "前一个分镜描述：",
    previousShotText(result, shot, scopedShots),
    "",
    "---",
    "",
    "分段动作：",
    splitActionText(result, shot, scene),
    "",
    "---",
    "",
    "对白/旁白：",
    dialogueTextForShot(scene, shot),
    "",
    "---",
    "",
    "分镜提示词：",
    storyboard?.prompt ?? `${result.visualBible.globalPrompt} ${shot.visual}`,
    "",
    "视频运动提示词：",
    camera?.prompt ?? `${shot.shotId} ${shot.duration} ${shot.movement} ${shot.action}`,
    "",
    "剪辑提示词：",
    edit?.prompt ?? `${shot.duration}，动作点清晰，声音桥连续，结尾形成钩子。`,
    "",
    "---",
    "",
    "输出约束：",
    "1. 角色外貌、身高体态、服装、发型、核心道具必须与视觉圣经一致。",
    "2. 对白必须有准确口型，不能只用字幕表达。",
    "3. 背景角色必须停留在既定空间位置，不得无故离开或穿帮。",
    "4. 光影必须体现本剧色彩策略，冷暖过渡要平滑，压迫感逐步增强。",
    "5. 手部、手指、脸部、眼神和道具接触必须真实自然，无穿模。",
    "6. 镜面、玻璃、银器、反光物必须约束正反面和反射内容，避免污染主体。",
    "7. 保持原参考图元素和人物身份一致，不改变服装、道具和时代背景。",
    `8. ${result.visualBible.globalNegative}`,
    `[视觉风格：${result.visualBible.format}]`,
  ].join("\n");
}

function shotPackageText(
  result: JubenResult,
  shot: JubenShot,
  scopedShots: JubenShot[],
) {
  const scene = findSceneForShot(result, shot);
  const storyboard = promptForShot(result.storyboardPrompts, shot, scopedShots);
  const camera = promptForShot(result.cameraPrompts, shot, scopedShots);
  const edit = promptForShot(result.editPrompts, shot, scopedShots);
  const characterLocks =
    result.visualBible.characterLocks
      ?.map((item) => `${item.character}: ${item.lockedPrompt}`)
      .join("\n") || "";

  return [
    `${shot.shotId} / ${scene?.sceneHeading ?? shot.sceneId}`,
    "",
    "【LibTV 最终提示词】",
    libtvFinalPrompt(result, shot, scene, scopedShots),
    "",
    "【LibTV 结构化提示词】",
    libtvStructuredPrompt(result, shot, scene, scopedShots),
    "",
    "【全局风格】",
    result.visualBible.globalPrompt,
    characterLocks ? `\n【人物锁定】\n${characterLocks}` : "",
    "",
    "【分镜首帧 / Lovart】",
    storyboard?.prompt ??
      `${result.visualBible.globalPrompt} ${shot.shotSize}, ${shot.cameraAngle}, ${shot.visual}, ${shot.action}`,
    `负向约束：${[
      result.visualBible.globalNegative,
      storyboard?.negativePrompt,
    ]
      .filter(Boolean)
      .join(", ")}`,
    "",
    "【视频运镜 / Grok】",
    camera?.prompt ??
      `${shot.shotId} ${shot.duration}, ${shot.movement}, ${shot.visual}, ${shot.action}`,
    "",
    "【剪辑】",
    edit?.prompt ??
      `${shot.duration}，先给动作，再给反应或证据，结尾接下一镜。声音：${shot.sound}`,
    "",
    "【配音 / 声音】",
    dialogueTextForShot(scene, shot),
    `声音：${shot.sound}`,
    `连续性：${shot.continuity}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function shotPackageTextForScope(result: JubenResult, scope: EpisodeScope) {
  const scoped = scopedResultParts(result, scope);

  return scoped.shots
    .map((shot) => shotPackageText(result, shot, scoped.shots))
    .join("\n\n---\n\n");
}

function resultTabTextForScope(
  result: JubenResult,
  tab: TabKey,
  scope: EpisodeScope,
) {
  const scoped = scopedResultParts(result, scope);

  switch (tab) {
    case "source":
      return asPrettyJson({
        sourceManifest: result.sourceManifest,
        fidelityReport: result.fidelityReport,
      });
    case "development":
      return asPrettyJson({
        diagnosis: result.diagnosis,
        storyBible: result.storyBible,
        productionPlan: result.productionPlan,
      });
    case "visual":
      return asPrettyJson(result.visualBible);
    case "outline":
      return asPrettyJson(scoped.outline);
    case "shotpack":
      return shotPackageTextForScope(result, scope);
    case "episode":
    case "script":
      return asPrettyJson({ directorScript: scoped.scenes, shotList: scoped.shots });
    case "shots":
      return asPrettyJson(scoped.shots);
    case "storyboard":
      return promptText(scoped.storyboardPrompts);
    case "camera":
      return promptText(scoped.cameraPrompts);
    case "edit":
      return promptText(scoped.editPrompts);
    case "delivery":
    case "voice":
      return asPrettyJson({
        voiceoverScript: result.voiceoverScript,
        productionPack: result.productionPack,
        qualityChecklist: result.qualityChecklist,
      });
  }
}

function safeSheetName(value: string) {
  return value.replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Sheet";
}

function downloadBlobPart(filename: string, data: BlobPart[], type: string) {
  const blob = new Blob(data, { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 1000);
}

function downloadBlob(filename: string, text: string, type: string) {
  downloadBlobPart(filename, [text], type);
}

function downloadText(filename: string, text: string) {
  downloadBlob(filename, text, "application/json;charset=utf-8");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableHtml(
  title: string,
  headers: string[],
  rows: Array<Array<unknown>>,
) {
  return [
    `<h2>${escapeHtml(title)}</h2>`,
    "<table>",
    `<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>`,
    `<tbody>${rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody>`,
    "</table>",
  ].join("");
}

function exportHtml(result: JubenResult) {
  const promptRows = [
    ...result.storyboardPrompts.map((item) => ["分镜", item.id, item.sceneId, item.prompt, item.negativePrompt]),
    ...result.cameraPrompts.map((item) => ["运镜", item.id, item.sceneId, item.prompt, item.negativePrompt]),
    ...result.editPrompts.map((item) => ["剪辑", item.id, item.sceneId, item.prompt, item.negativePrompt]),
  ];

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",Arial,sans-serif;color:#111}
h1{font-size:24px} h2{margin-top:24px;font-size:18px}
table{border-collapse:collapse;width:100%;margin:10px 0 22px}
th,td{border:1px solid #999;padding:8px;vertical-align:top;font-size:12px;line-height:1.45}
th{background:#efefef}
</style>
</head>
<body>
<h1>${escapeHtml(result.meta.title)} - 短剧生产包</h1>
<p>${escapeHtml(result.meta.logline)}</p>
${tableHtml("故事圣经", ["模块", "内容"], [
  ["核心承诺", result.diagnosis.corePromise],
  ["观众钩子", result.diagnosis.realAudienceHook],
  ["预告片风险", result.diagnosis.trailerRisk],
  ["修正策略", result.diagnosis.fixStrategy],
  ["主题", result.storyBible.theme],
  ["世界观", result.storyBible.world],
  ["主角", result.storyBible.protagonist],
  ["反派/阻碍", result.storyBible.antagonist],
  ["冲突引擎", result.storyBible.conflictEngine],
])}
${tableHtml("制作策略", ["模块", "内容"], [
  ["改编简报", result.productionPlan.adaptationBrief],
  ["拍摄策略", result.productionPlan.shootingStrategy],
  ["场景计划", result.productionPlan.locationPlan.join("\n")],
  ["参考资产", result.productionPlan.referenceAssets.join("\n")],
  ["生成顺序", result.productionPlan.generationOrder.join("\n")],
  ["质量节点", result.productionPlan.qualityGates.join("\n")],
])}
${tableHtml("视觉圣经", ["模块", "内容"], [
  ["格式", result.visualBible.format],
  ["核心风格", result.visualBible.coreStyle],
  ["色彩", result.visualBible.colorPalette.join("\n")],
  ["摄影语言", result.visualBible.cameraLanguage.join("\n")],
  ["生产逻辑", result.visualBible.productionLogic.join("\n")],
  ["环境规则", result.visualBible.environmentRules.join("\n")],
  ["人物锁定", result.visualBible.characterLocks.map((item) => `${item.character}: ${item.lockedPrompt}`).join("\n")],
  ["关键道具", result.visualBible.keyProps.join("\n")],
  ["全局 Prompt", result.visualBible.globalPrompt],
  ["全局负向约束", result.visualBible.globalNegative],
])}
${tableHtml(
  "分集结构",
  ["集数", "标题", "钩子", "本集目标", "核心阻碍", "节拍", "时间分配", "转折", "结尾钩子"],
  result.episodeOutline.map((episode) => [
    `E${String(episode.episode).padStart(2, "0")}`,
    episode.title,
    episode.hook,
    episode.objective,
    episode.obstacle,
    episode.beats.join("\n"),
    episode.durationPlan.join("\n"),
    episode.turn,
    episode.cliffhanger,
  ]),
)}
${tableHtml(
  "导演剧本",
  ["场景", "集数", "场景标题", "戏剧目的", "冲突", "动作", "对白", "情绪转折"],
  result.directorScript.map((scene) => [
    scene.sceneId,
    scene.episode,
    scene.sceneHeading,
    scene.dramaticPurpose,
    scene.conflict,
    scene.action,
    scene.dialogue.map((line) => `${line.character}: ${line.line}（${line.subtext}）`).join("\n"),
    scene.emotionalTurn,
  ]),
)}
${tableHtml(
  "镜头表",
  ["镜头", "场景", "景别", "机位", "运镜", "时长", "画面", "动作", "声音", "连续性"],
  result.shotList.map((shot) => [
    shot.shotId,
    shot.sceneId,
    shot.shotSize,
    shot.cameraAngle,
    shot.movement,
    shot.duration,
    shot.visual,
    shot.action,
    shot.sound,
    shot.continuity,
  ]),
)}
${tableHtml("AI Prompt", ["类型", "编号", "场景", "Prompt", "Negative"], promptRows)}
${tableHtml(
  "镜头整合包",
  ["镜头", "整合内容"],
  result.shotList.map((shot) => [
    shot.shotId,
    shotPackageText(result, shot, result.shotList),
  ]),
)}
</body>
</html>`;
}

async function downloadExcel(result: JubenResult) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DestinyPixel Juben";
  workbook.created = new Date();

  const addSheet = (
    name: string,
    headers: string[],
    rows: Array<Array<unknown>>,
  ) => {
    const sheet = workbook.addWorksheet(safeSheetName(name));
    sheet.addRow(headers);
    rows.forEach((row) => sheet.addRow(row.map((cell) => String(cell ?? ""))));
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: "top", wrapText: true };
    sheet.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    sheet.columns = headers.map((header, index) => ({
      header,
      key: String(index),
      width: index === 0 ? 18 : 42,
    }));
  };

  addSheet("故事圣经", ["模块", "内容"], [
    ["标题", result.meta.title],
    ["一句话", result.meta.logline],
    ["核心承诺", result.diagnosis.corePromise],
    ["观众钩子", result.diagnosis.realAudienceHook],
    ["预告片风险", result.diagnosis.trailerRisk],
    ["主题", result.storyBible.theme],
    ["冲突引擎", result.storyBible.conflictEngine],
  ]);
  addSheet("制作策略", ["模块", "内容"], [
    ["改编简报", result.productionPlan.adaptationBrief],
    ["拍摄策略", result.productionPlan.shootingStrategy],
    ["场景计划", result.productionPlan.locationPlan.join("\n")],
    ["参考资产", result.productionPlan.referenceAssets.join("\n")],
    ["生成顺序", result.productionPlan.generationOrder.join("\n")],
    ["质量节点", result.productionPlan.qualityGates.join("\n")],
  ]);
  addSheet("视觉圣经", ["模块", "内容"], [
    ["格式", result.visualBible.format],
    ["核心风格", result.visualBible.coreStyle],
    ["色彩", result.visualBible.colorPalette.join("\n")],
    ["摄影语言", result.visualBible.cameraLanguage.join("\n")],
    ["生产逻辑", result.visualBible.productionLogic.join("\n")],
    ["人物锁定", result.visualBible.characterLocks.map((item) => `${item.character}: ${item.lockedPrompt}`).join("\n")],
    ["全局 Prompt", result.visualBible.globalPrompt],
    ["全局负向约束", result.visualBible.globalNegative],
  ]);
  addSheet(
    "分集结构",
    ["集数", "标题", "钩子", "本集目标", "核心阻碍", "节拍", "时间分配", "转折", "结尾钩子"],
    result.episodeOutline.map((episode) => [
      `E${String(episode.episode).padStart(2, "0")}`,
      episode.title,
      episode.hook,
      episode.objective,
      episode.obstacle,
      episode.beats.join("\n"),
      episode.durationPlan.join("\n"),
      episode.turn,
      episode.cliffhanger,
    ]),
  );
  addSheet(
    "导演剧本",
    ["场景", "集数", "场景标题", "戏剧目的", "冲突", "动作", "对白", "情绪转折"],
    result.directorScript.map((scene) => [
      scene.sceneId,
      scene.episode,
      scene.sceneHeading,
      scene.dramaticPurpose,
      scene.conflict,
      scene.action,
      scene.dialogue.map((line) => `${line.character}: ${line.line}（${line.subtext}）`).join("\n"),
      scene.emotionalTurn,
    ]),
  );
  addSheet(
    "镜头整合包",
    ["镜头", "场景", "整合内容"],
    result.shotList.map((shot) => [
      shot.shotId,
      shot.sceneId,
      shotPackageText(result, shot, result.shotList),
    ]),
  );

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlobPart(
    `${result.meta.title || "juben"}-production-pack.xlsx`,
    [buffer],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}

async function downloadWord(result: JubenResult) {
  const {
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");
  const paragraph = (text: string, bold = false) =>
    new Paragraph({ children: [new TextRun({ text, bold })] });
  const heading = (
    text: string,
    level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  ) =>
    new Paragraph({ text, heading: level });
  const cell = (text: unknown, bold = false) =>
    new TableCell({
      children: String(text ?? "")
        .split("\n")
        .map((line) => paragraph(line || " ", bold)),
    });
  const table = (headers: string[], rows: Array<Array<unknown>>) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: headers.map((item) => cell(item, true)) }),
        ...rows.map(
          (row) => new TableRow({ children: row.map((item) => cell(item)) }),
        ),
      ],
    });
  const shotParagraphs = result.shotList.flatMap((shot) => [
    heading(
      `${shot.shotId} · ${findSceneForShot(result, shot)?.sceneHeading ?? shot.sceneId}`,
      HeadingLevel.HEADING_3,
    ),
    ...shotPackageText(result, shot, result.shotList)
      .split("\n")
      .map((line) => paragraph(line || " ")),
  ]);
  const document = new Document({
    creator: "DestinyPixel Juben",
    title: `${result.meta.title} - 短剧生产包`,
    sections: [
      {
        children: [
          heading(result.meta.title, HeadingLevel.TITLE),
          paragraph(result.meta.logline),
          heading("故事与制作圣经", HeadingLevel.HEADING_1),
          table(["模块", "内容"], [
            ["核心承诺", result.diagnosis.corePromise],
            ["观众钩子", result.diagnosis.realAudienceHook],
            ["主题", result.storyBible.theme],
            ["主角", result.storyBible.protagonist],
            ["阻碍者", result.storyBible.antagonist],
            ["冲突引擎", result.storyBible.conflictEngine],
            ["改编简报", result.productionPlan.adaptationBrief],
            ["拍摄策略", result.productionPlan.shootingStrategy],
            ["参考资产", result.productionPlan.referenceAssets.join("\n")],
            ["生成顺序", result.productionPlan.generationOrder.join("\n")],
          ]),
          heading("视觉圣经", HeadingLevel.HEADING_1),
          table(["模块", "内容"], [
            ["格式", result.visualBible.format],
            ["核心风格", result.visualBible.coreStyle],
            ["色彩", result.visualBible.colorPalette.join("\n")],
            ["摄影语言", result.visualBible.cameraLanguage.join("\n")],
            ["人物锁定", result.visualBible.characterLocks.map((item) => `${item.character}: ${item.lockedPrompt}`).join("\n")],
            ["全局 Prompt", result.visualBible.globalPrompt],
            ["全局负向约束", result.visualBible.globalNegative],
          ]),
          heading("分集节拍", HeadingLevel.HEADING_1),
          table(
            ["集数", "标题", "本集目标", "核心阻碍", "节拍", "结尾钩子"],
            result.episodeOutline.map((episode) => [
              `E${String(episode.episode).padStart(2, "0")}`,
              episode.title,
              episode.objective,
              episode.obstacle,
              [...episode.durationPlan, ...episode.beats].join("\n"),
              episode.cliffhanger,
            ]),
          ),
          heading("导演剧本", HeadingLevel.HEADING_1),
          table(
            ["场景", "场景标题", "戏剧目的", "冲突", "动作", "对白", "转折"],
            result.directorScript.map((scene) => [
              scene.sceneId,
              scene.sceneHeading,
              scene.dramaticPurpose,
              scene.conflict,
              scene.action,
              scene.dialogue.map((line) => `${line.character}: ${line.line}（${line.subtext}）`).join("\n"),
              scene.emotionalTurn,
            ]),
          ),
          heading("逐镜生成包", HeadingLevel.HEADING_1),
          ...shotParagraphs,
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(document);

  downloadBlobPart(
    `${result.meta.title || "juben"}-production-pack.docx`,
    [blob],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
}

async function downloadProductionFile(
  result: JubenResult,
  format: "word" | "excel",
) {
  const response = await fetch("/api/juben/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, result }),
  });

  if (!response.ok) {
    throw new Error("导出失败，请稍后重试。");
  }

  const blob = await response.blob();
  const extension = format === "word" ? "docx" : "xlsx";
  const contentType =
    format === "word"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  downloadBlobPart(
    `${result.meta.title || "juben"}-production-pack.${extension}`,
    [blob],
    contentType,
  );
}

function SceneCard({ scene, shots }: { scene: JubenScene; shots: JubenShot[] }) {
  const sceneShots = shots.filter((shot) => shot.sceneId === scene.sceneId);

  return (
    <article className={styles.sceneCard}>
      <header>
        <div>
          <span>{scene.sceneId}</span>
          <strong>{scene.sceneHeading}</strong>
        </div>
        <small>{sceneShots.length} 镜</small>
      </header>
      <div className={styles.sceneIntent}>
        <div><span>本场目的</span><p>{scene.dramaticPurpose}</p></div>
        <div><span>正面冲突</span><p>{scene.conflict}</p></div>
      </div>
      <div className={styles.sceneAction}><span>可拍动作</span><p>{scene.action}</p></div>
      {scene.dialogue.length > 0 ? (
        <div className={styles.dialogueStack}>
          {scene.dialogue.map((line, index) => (
            <div key={`${scene.sceneId}-${line.character}-${index}`}>
              <strong>{line.character}</strong><p>{line.line}</p><small>{line.subtext}</small>
            </div>
          ))}
        </div>
      ) : null}
      <footer><span>情绪转折</span><p>{scene.emotionalTurn}</p></footer>
    </article>
  );
}

function PromptBlock({
  icon: Icon,
  label,
  text,
  copyId,
  copied,
  onCopy,
}: {
  icon: typeof BookOpenText;
  label: string;
  text: string;
  copyId: string;
  copied: string | null;
  onCopy: (label: string, text: string) => void;
}) {
  return (
    <section className={styles.promptBlock}>
      <header>
        <span><Icon size={15} />{label}</span>
        <button type="button" title={`复制${label}`} aria-label={`复制${label}`} onClick={() => onCopy(copyId, text)}>
          {copied === copyId ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </header>
      <p>{text}</p>
    </section>
  );
}

function ShotPackageCard({
  result,
  shot,
  scopedShots,
  onCopy,
  copied,
}: {
  result: JubenResult;
  shot: JubenShot;
  scopedShots: JubenShot[];
  onCopy: (label: string, text: string) => void;
  copied: string | null;
}) {
  const scene = findSceneForShot(result, shot);
  const storyboard = promptForShot(result.storyboardPrompts, shot, scopedShots);
  const camera = promptForShot(result.cameraPrompts, shot, scopedShots);
  const edit = promptForShot(result.editPrompts, shot, scopedShots);
  const fullText = shotPackageText(result, shot, scopedShots);
  const copyLabel = `shot-${shot.shotId}`;
  const firstFrame = storyboard?.prompt ?? `${result.visualBible.globalPrompt} ${shot.visual}`;
  const motion = camera?.prompt ?? `${shot.duration}，${shot.movement}，${shot.action}`;
  const editText = edit?.prompt ?? `${shot.duration}，动作点清楚，结尾接下一镜。`;
  const voice = `${dialogueTextForShot(scene, shot)}\n声音：${shot.sound}`;

  return (
    <article className={styles.shotPackageCard}>
      <header className={styles.shotHeader}>
        <div><span>{shot.shotId}</span><strong>{scene?.sceneHeading ?? shot.sceneId}</strong></div>
        <div className={styles.shotHeaderActions}>
          <span>{shot.duration}</span>
          <button type="button" onClick={() => onCopy(copyLabel, fullText)}>
            {copied === copyLabel ? <Check size={14} /> : <Copy size={14} />}复制完整镜头包
          </button>
        </div>
      </header>
      <div className={styles.shotSummary}>
        <p>{shot.visual}</p>
        <div><span>{shot.shotSize}</span><span>{shot.cameraAngle}</span><span>{shot.movement}</span></div>
      </div>
      <div className={styles.shotActionRow}>
        <div><span>主体动作</span><p>{shot.action}</p></div>
        <div><span>连续性锚点</span><p>{shot.continuity}</p></div>
      </div>
      <div className={styles.promptMatrix}>
        <PromptBlock icon={FileText} label="首帧 / Lovart" text={firstFrame} copyId={`${copyLabel}-still`} copied={copied} onCopy={onCopy} />
        <PromptBlock icon={Video} label="视频运动 / Grok" text={motion} copyId={`${copyLabel}-motion`} copied={copied} onCopy={onCopy} />
        <PromptBlock icon={Mic2} label="对白与声音" text={voice} copyId={`${copyLabel}-voice`} copied={copied} onCopy={onCopy} />
        <PromptBlock icon={Scissors} label="剪辑与停点" text={editText} copyId={`${copyLabel}-edit`} copied={copied} onCopy={onCopy} />
      </div>
      <details className={styles.structuredPrompt}>
        <summary><Workflow size={15} />查看 LibTV 式完整结构<ChevronDown size={15} /></summary>
        <pre>{libtvStructuredPrompt(result, shot, scene, scopedShots)}</pre>
      </details>
    </article>
  );
}

function EmptyEpisode({ onOutline }: { onOutline: () => void }) {
  return (
    <div className={styles.emptyState}>
      <Clapperboard size={30} />
      <strong>先从上方选择一集</strong>
      <p>导演剧本和生成镜头会随集数切换，不再把整部剧混在一个长页面里。</p>
      <button type="button" onClick={onOutline}>查看分集节拍</button>
    </div>
  );
}

export default function JubenExperience() {
  const [form, setForm] = useState<Required<JubenRequestBody>>(initialForm);
  const [result, setResult] = useState<JubenResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [analyzeStatus, setAnalyzeStatus] = useState<AnalyzeStatus>("idle");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [analysis, setAnalysis] = useState<JubenAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("source");
  const [episodeScope, setEpisodeScope] = useState<EpisodeScope>("all");
  const [detailStatus, setDetailStatus] = useState<Record<number, Status>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const scopedParts = useMemo(() => {
    if (!result) {
      return null;
    }

    return scopedResultParts(result, episodeScope);
  }, [episodeScope, result]);

  const currentTabText = useMemo(() => {
    if (!result) return "";

    return resultTabTextForScope(result, activeTab, episodeScope);
  }, [activeTab, episodeScope, result]);

  const totals = useMemo(() => {
    if (!result) {
      return { scenes: 0, shots: 0, prompts: 0 };
    }

    return {
      scenes: scopedParts?.scenes.length ?? result.directorScript.length,
      shots: scopedParts?.shots.length ?? result.shotList.length,
      prompts:
        (scopedParts?.storyboardPrompts.length ??
          result.storyboardPrompts.length) +
        (scopedParts?.cameraPrompts.length ?? result.cameraPrompts.length) +
        (scopedParts?.editPrompts.length ?? result.editPrompts.length),
    };
  }, [result, scopedParts]);

  const episodeCoverage = useMemo(() => {
    if (!result) return [];

    return result.episodeOutline.map((episode) => {
      const prefix = `E${String(episode.episode).padStart(2, "0")}`;
      const scenes = result.directorScript.filter(
        (scene) => scene.episode === episode.episode,
      ).length;
      const shots = result.shotList.filter((shot) =>
        shot.sceneId.startsWith(prefix),
      ).length;

      return { episode: episode.episode, scenes, shots, ready: shots > 0 };
    });
  }, [result]);

  async function copyText(label: string, text: string) {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1200);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setActiveTab("outline");

    try {
      const response = await fetch("/api/juben/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Request failed.");
      }

      const payload = (await response.json()) as JubenResult;
      setResult(payload);
      setEpisodeScope(1);
      setStatus(
        payload.meta.provider === "local-structured-fallback" ? "error" : "ready",
      );
    } catch {
      setStatus("error");
    }
  }

  function applyAnalysisPayload(
    payload: JubenAnalysisResult,
    baseForm: Required<JubenRequestBody>,
  ) {
    setAnalysis(payload);
    setForm({
      ...baseForm,
      sourceMode: payload.sourceMode,
      sourceFilename: payload.sourceFilename,
      adaptationMode: payload.adaptationMode,
      genre: payload.genre,
      audience: payload.audience,
      episodeCount: payload.episodeCount,
      episodeLength: payload.episodeLength,
      aspectRatio: payload.aspectRatio,
      tone: payload.tone,
      productionMode: payload.productionMode,
      outputTarget: payload.outputTarget,
      voiceLanguage: payload.voiceLanguage,
      mustHave: payload.mustHave,
      avoid: payload.avoid,
    });
  }

  async function analyzeDraft(targetForm: Required<JubenRequestBody>) {
    const response = await fetch("/api/juben/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(targetForm),
    });

    if (!response.ok) throw new Error("Analyze request failed.");
    const payload = (await response.json()) as JubenAnalysisResult;
    applyAnalysisPayload(payload, targetForm);
    return payload;
  }

  async function handleUploadFile(file: File | undefined) {
    if (!file) return;

    setUploadStatus("loading");
    setUploadMessage(`正在解析 ${file.name}`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/juben/extract", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        filename?: string;
        text?: string;
        truncated?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.text) {
        throw new Error(payload.error ?? "文件解析失败。");
      }

      const nextForm: Required<JubenRequestBody> = {
        ...form,
        idea: payload.text,
        sourceMode: "document",
        sourceFilename: payload.filename ?? file.name,
        adaptationMode: "忠实拆解",
      };
      setForm(nextForm);
      setUploadStatus("ready");
      setUploadMessage(
        `${payload.filename ?? file.name} 已导入${
          payload.truncated ? "，长文已截取前段核心内容" : ""
        }`,
      );
      setAnalyzeStatus("loading");
      await analyzeDraft(nextForm);
      setAnalyzeStatus("ready");
      setActiveTab("source");
    } catch (error) {
      setAnalyzeStatus("error");
      setUploadStatus("error");
      setUploadMessage(
        error instanceof Error ? error.message : "文件解析失败，请手动粘贴。",
      );
    }
  }

  function mergeEpisodeResult(
    base: JubenResult,
    detail: JubenResult,
    episode: number,
  ): JubenResult {
    const sortScenes = (items: JubenScene[]) =>
      [...items].sort((a, b) => a.sceneId.localeCompare(b.sceneId));
    const sortShots = (items: JubenShot[]) =>
      [...items].sort((a, b) => a.shotId.localeCompare(b.shotId));
    const sortPrompts = (items: JubenPromptItem[]) =>
      [...items].sort((a, b) => a.id.localeCompare(b.id));
    const sceneBelongsToEpisode = (scene: JubenScene) => scene.episode === episode;
    const shotBelongsToEpisode = (shot: JubenShot) =>
      sceneEpisode(shot.sceneId) === episode;
    const promptBelongsToEpisode = (item: JubenPromptItem) =>
      sceneEpisode(item.sceneId) === episode;
    const storyboardPrompts = sortPrompts([
      ...base.storyboardPrompts.filter((item) => !promptBelongsToEpisode(item)),
      ...detail.storyboardPrompts,
    ]);
    const cameraPrompts = sortPrompts([
      ...base.cameraPrompts.filter((item) => !promptBelongsToEpisode(item)),
      ...detail.cameraPrompts,
    ]);

    return {
      ...base,
      meta: {
        ...base.meta,
        provider: detail.meta.provider,
        model: detail.meta.model,
        generatedAt: detail.meta.generatedAt,
      },
      visualBible: detail.visualBible ?? base.visualBible,
      directorScript: sortScenes([
        ...base.directorScript.filter((scene) => !sceneBelongsToEpisode(scene)),
        ...detail.directorScript,
      ]),
      shotList: sortShots([
        ...base.shotList.filter((shot) => !shotBelongsToEpisode(shot)),
        ...detail.shotList,
      ]),
      storyboardPrompts,
      cameraPrompts,
      editPrompts: sortPrompts([
        ...base.editPrompts.filter((item) => !promptBelongsToEpisode(item)),
        ...detail.editPrompts,
      ]),
      voiceoverScript: detail.voiceoverScript ?? base.voiceoverScript,
      productionPack: {
        ...base.productionPack,
        lovartStoryboard: storyboardPrompts
          .map((item) => `${item.id} / ${item.sceneId}: ${item.prompt}`)
          .join("\n\n"),
        grokVideo: cameraPrompts
          .map((item) => `${item.id} / ${item.sceneId}: ${item.prompt}`)
          .join("\n\n"),
      },
    };
  }

  async function generateEpisodeDetail(episode: number) {
    if (!result) return;

    setDetailStatus((current) => ({ ...current, [episode]: "loading" }));

    try {
      const response = await fetch("/api/juben/episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, episode, baseResult: result }),
      });

      if (!response.ok) {
        throw new Error("Episode request failed.");
      }

      const payload = (await response.json()) as JubenResult;
      setResult((current) =>
        current ? mergeEpisodeResult(current, payload, episode) : payload,
      );
      setStatus(
        payload.meta.provider === "local-structured-fallback" ? "error" : "ready",
      );
      setDetailStatus((current) => ({ ...current, [episode]: "ready" }));
      setActiveTab("shotpack");
    } catch {
      setDetailStatus((current) => ({ ...current, [episode]: "error" }));
    }
  }

  async function handleAnalyze() {
    if (form.idea.trim().length < 8) return;

    setAnalyzeStatus("loading");

    try {
      await analyzeDraft(form);
      setAnalyzeStatus("ready");
    } catch {
      setAnalyzeStatus("error");
    }
  }

  const selectedEpisode = scopedParts?.episode ?? null;
  const selectedEpisodeHasDetails =
    selectedEpisode !== null ? (scopedParts?.shots.length ?? 0) > 0 : true;
  const selectedEpisodeStatus =
    selectedEpisode !== null ? detailStatus[selectedEpisode] ?? "idle" : "idle";
  const selectedOutline =
    selectedEpisode !== null
      ? result?.episodeOutline.find((item) => item.episode === selectedEpisode)
      : null;
  const statusLabel =
    status === "loading"
      ? "正在锁定原稿并拆解全剧"
      : status === "ready"
        ? result?.meta.provider === "source-locked"
          ? "原稿锁定与拆解已完成"
          : "DeepSeek 已完成"
        : status === "error"
          ? "原稿备用拆解已完成，可继续生成"
          : "等待项目输入";

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a href="/" aria-label="返回 DestinyPixel" title="返回首页">
          <ArrowLeft size={16} />
          <span>DestinyPixel</span>
        </a>
        <div className={styles.topStatus} data-status={status}>
          <i />
          <span>{statusLabel}</span>
        </div>
      </header>

      <section className={styles.workspace}>
        <form className={styles.inputPanel} onSubmit={handleSubmit}>
          <div className={styles.panelHeading}>
            <span>短剧生产工作台 · 原稿优先</span>
            <h1>先锁原稿，再拆成真正能拍的AI镜头。</h1>
            <p>上传完整剧本会自动识别人物、分集、场次和关键对白；逐集生成，避免串戏和长请求失败。</p>
          </div>

          <div className={styles.sourceModeBar}>
            <button
              type="button"
              data-active={form.sourceMode === "idea"}
              onClick={() =>
                setForm({
                  ...form,
                  sourceMode: "idea",
                  sourceFilename: "",
                  adaptationMode: "创意扩写",
                })
              }
            >
              <Sparkles size={14} />从想法创作
            </button>
            <button
              type="button"
              data-active={form.sourceMode === "document"}
              disabled={form.sourceMode !== "document"}
            >
              <FileText size={14} />原稿忠实拆解
            </button>
          </div>

          <label className={styles.field}>
            <span>{form.sourceMode === "document" ? "原稿全文（可校正）" : "想法 / 大概剧情"}</span>
            <textarea
              className={styles.ideaInput}
              value={form.idea}
              onChange={(event) =>
                setForm(updateField(form, "idea", event.target.value))
              }
            />
          </label>

          <div className={styles.uploadRow}>
            <label>
              <Upload size={16} />
              <span>{uploadStatus === "loading" ? "正在导入" : "上传脚本"}</span>
              <input
                type="file"
                accept=".doc,.docx,.pdf,.txt,.md,image/*"
                disabled={uploadStatus === "loading"}
                onChange={(event) => {
                  void handleUploadFile(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <p data-status={uploadStatus}>
              {uploadMessage || "支持 docx、pdf、txt、md、图片；导入后可继续手动修改。"}
            </p>
          </div>

          <div className={styles.analyzeRow}>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeStatus === "loading" || form.idea.trim().length < 8}
            >
              {analyzeStatus === "loading" ? (
                <Loader2 size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              {analyzeStatus === "loading"
                ? "正在识别原稿"
                : form.sourceMode === "document"
                  ? "重新校对原稿"
                  : "先简析想法"}
            </button>
            <span>
              {analysis
                ? `${analysis.titleSuggestion} · ${analysis.hook}`
                : "先识别题材、人物、分集、场次和硬约束，再进入生成。"}
            </span>
          </div>

          {analysis ? (
            <div className={styles.analysisNote}>
              <strong>{analysis.premise}</strong>
              {analysis.sourceManifest.mode === "document" ? (
                <div className={styles.sourceSummary}>
                  <span>《{analysis.sourceManifest.title}》</span>
                  <span>{analysis.sourceManifest.episodeCount} 集</span>
                  <span>{analysis.sourceManifest.scenes.length} 场</span>
                  <span>{analysis.sourceManifest.characters.length} 个角色</span>
                </div>
              ) : null}
              {analysis.revisionNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          ) : null}

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>类型</span>
              <input
                value={form.genre}
                onChange={(event) =>
                  setForm(updateField(form, "genre", event.target.value))
                }
              />
            </label>
            <label className={styles.field}>
              <span>受众</span>
              <input
                value={form.audience}
                onChange={(event) =>
                  setForm(updateField(form, "audience", event.target.value))
                }
              />
            </label>
            <label className={styles.field}>
              <span>集数</span>
              <select
                value={form.episodeCount}
                onChange={(event) =>
                  setForm(
                    updateField(form, "episodeCount", Number(event.target.value)),
                  )
                }
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((count) => (
                  <option key={count} value={count}>
                    {count} 集
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>单集时长</span>
              <select
                value={form.episodeLength}
                onChange={(event) =>
                  setForm(updateField(form, "episodeLength", event.target.value))
                }
              >
                {["30 秒", "60 秒", "90 秒", "2 分钟", "3 分钟", "5 分钟"].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className={styles.field}>
              <span>画幅</span>
              <select
                value={form.aspectRatio}
                onChange={(event) =>
                  setForm(updateField(form, "aspectRatio", event.target.value))
                }
              >
                {["9:16 竖屏", "16:9 横屏", "1:1 方屏", "4:5 信息流"].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className={styles.field}>
              <span>气质</span>
              <input
                value={form.tone}
                onChange={(event) =>
                  setForm(updateField(form, "tone", event.target.value))
                }
              />
            </label>
            <label className={styles.field}>
              <span>输出 / 配音语言</span>
              <select
                value={form.voiceLanguage}
                onChange={(event) =>
                  setForm(updateField(form, "voiceLanguage", event.target.value))
                }
              >
                {voiceLanguageOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>改编强度</span>
              <select
                value={form.adaptationMode}
                onChange={(event) =>
                  setForm(updateField(form, "adaptationMode", event.target.value))
                }
              >
                {["忠实拆解", "适度优化", "创意扩写"].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>必须保留</span>
            <textarea
              className={styles.shortTextarea}
              value={form.mustHave}
              onChange={(event) =>
                setForm(updateField(form, "mustHave", event.target.value))
              }
            />
          </label>

          <label className={styles.field}>
            <span>避免方向</span>
            <textarea
              className={styles.shortTextarea}
              value={form.avoid}
              onChange={(event) =>
                setForm(updateField(form, "avoid", event.target.value))
              }
            />
          </label>

          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setResult(null);
                setStatus("idle");
                setAnalysis(null);
                setAnalyzeStatus("idle");
                setUploadStatus("idle");
                setUploadMessage("");
                setDetailStatus({});
                setEpisodeScope("all");
                setActiveTab("source");
              }}
            >
              <RefreshCcw size={16} />
              重置样例
            </button>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              {status === "loading" ? "正在拆解" : "锁定原稿并拆全剧"}
            </button>
          </div>
        </form>

        <section className={styles.outputPanel}>
          <div className={styles.visualPanel}>
            <Image
              src="/juben/director-desk.png"
              alt="导演剧本与分镜工作台"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
            />
            <div className={styles.visualOverlay}>
              <span data-status={status}>
                {status === "loading"
                  ? "DeepSeek 正在拆骨架"
                  : status === "ready"
                    ? result?.meta.provider === "source-locked"
                      ? "原稿保真引擎完成"
                      : "DeepSeek 生成完成"
                    : status === "error"
                      ? "原稿保真备用稿"
                      : "等待生成"}
              </span>
              <strong>{result?.meta.title ?? "未命名短剧项目"}</strong>
              <p>{result?.meta.logline ?? "故事圣经、分集节拍、导演剧本和逐镜生成包会集中在这里。"}</p>
            </div>
          </div>

          <div className={styles.metricRow}>
            <div>
              <small>场景</small>
              <strong>{totals.scenes}</strong>
            </div>
            <div>
              <small>镜头</small>
              <strong>{totals.shots}</strong>
            </div>
            <div>
              <small>Prompt</small>
              <strong>{totals.prompts}</strong>
            </div>
            <div>
              <small>格式</small>
              <strong>
                {episodeScope === "all"
                  ? result?.meta.format ?? form.aspectRatio
                  : `E${String(episodeScope).padStart(2, "0")} · ${form.aspectRatio}`}
              </strong>
            </div>
          </div>

          <div className={styles.resultToolbar}>
            <div className={styles.tabs} role="tablist" aria-label="剧本输出">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.copyActions}>
              <button
                type="button"
                disabled={!result}
                onClick={() => copyText("tab", currentTabText)}
              >
                {copied === "tab" ? <Check size={15} /> : <Copy size={15} />}
                复制当前页
              </button>
              {activeTab === "delivery" ? (
                <>
                  <button type="button" disabled={!result} onClick={() => copyText("json", result ? asPrettyJson(result) : "")}>
                    {copied === "json" ? <Check size={15} /> : <FileJson size={15} />}复制 JSON
                  </button>
                  <button type="button" disabled={!result} onClick={() => result && downloadText(`${result.meta.title || "juben"}-production-pack.json`, asPrettyJson(result))}>
                    <Download size={15} />JSON
                  </button>
                  <button type="button" disabled={!result} onClick={() => result && void downloadProductionFile(result, "excel")}>
                    <Download size={15} />Excel
                  </button>
                  <button type="button" disabled={!result} onClick={() => result && void downloadProductionFile(result, "word")}>
                    <Download size={15} />Word
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {result ? (
            <div className={styles.episodeSwitch} role="group" aria-label="选择集数">
              <button
                type="button"
                data-active={episodeScope === "all"}
                onClick={() => setEpisodeScope("all")}
              >
                全剧
              </button>
              {result.episodeOutline.map((episode) => {
                const coverage = episodeCoverage.find(
                  (item) => item.episode === episode.episode,
                );

                return (
                  <button
                    key={episode.episode}
                    type="button"
                    data-active={episodeScope === episode.episode}
                    data-ready={coverage?.ready}
                    onClick={() => setEpisodeScope(episode.episode)}
                  >
                    <i />
                    E{String(episode.episode).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          ) : null}

          {result && selectedEpisode !== null ? (
            <div className={styles.episodeDetailBar}>
              <div>
                <span>E{String(selectedEpisode).padStart(2, "0")} · {selectedOutline?.title}</span>
                <small>
                  {selectedEpisodeHasDetails
                    ? `${scopedParts?.scenes.length ?? 0} 场 · ${scopedParts?.shots.length ?? 0} 镜，已可进入生成`
                    : "只有分集骨架，尚未生成导演剧本和镜头"}
                </small>
              </div>
              <button
                type="button"
                disabled={selectedEpisodeStatus === "loading"}
                onClick={() => generateEpisodeDetail(selectedEpisode)}
              >
                {selectedEpisodeStatus === "loading" ? (
                  <Loader2 size={15} />
                ) : (
                  <Sparkles size={15} />
                )}
                {selectedEpisodeStatus === "loading"
                  ? "正在生成本集"
                  : selectedEpisodeHasDetails
                    ? "重做本集"
                    : "生成本集导演包"}
              </button>
            </div>
          ) : null}

          <div className={styles.resultBody}>
            {!result ? (
              <div className={styles.emptyState}>
                <Clapperboard size={32} />
                <strong>输入剧情后生成第一版生产包。</strong>
                <p>
                  输出会按剧作、导演、摄影、AI 分镜、视频运镜、剪辑和配音拆开。
                </p>
              </div>
            ) : activeTab === "source" ? (
              <div className={styles.sourceAudit}>
                <div className={styles.fidelityBanner} data-status={result.fidelityReport.status}>
                  <div>
                    <ShieldCheck size={22} />
                    <span>原稿保真度</span>
                    <strong>{result.fidelityReport.score}</strong>
                  </div>
                  <p>
                    {result.fidelityReport.status === "locked"
                      ? "标题、人物、分集、场次与关键对白已锁定，可以按集生成。"
                      : result.fidelityReport.status === "review"
                        ? "发现偏离项，请先检查警告后再生成镜头。"
                        : "当前为创意扩写模式，没有上传原稿作为硬约束。"}
                  </p>
                </div>

                <section className={styles.manifestOverview}>
                  <header>
                    <div>
                      <span>来源文件</span>
                      <strong>{result.sourceManifest.filename || "手动输入"}</strong>
                    </div>
                    <div>
                      <span>原稿标题</span>
                      <strong>《{result.sourceManifest.title}》</strong>
                    </div>
                    <div>
                      <span>原稿规格</span>
                      <strong>{result.sourceManifest.episodeCount} 集 · {result.sourceManifest.episodeLength}</strong>
                    </div>
                    <div>
                      <span>拆解方式</span>
                      <strong>{result.sourceManifest.fidelityMode}</strong>
                    </div>
                  </header>
                </section>

                <div className={styles.manifestColumns}>
                  <section>
                    <h3><Users size={16} />锁定人物</h3>
                    {result.sourceManifest.characters.length > 0 ? (
                      result.sourceManifest.characters.map((character) => (
                        <article key={character.name}>
                          <strong>{character.name}</strong>
                          <p>{character.description}</p>
                        </article>
                      ))
                    ) : (
                      <p>创意模式将在视觉圣经阶段锁定人物。</p>
                    )}
                  </section>
                  <section>
                    <h3><LayoutList size={16} />分集与场次</h3>
                    {result.sourceManifest.episodes.map((episode) => (
                      <article key={episode.episode}>
                        <strong>E{String(episode.episode).padStart(2, "0")} · {episode.title}</strong>
                        <p>{episode.sceneCount} 场原稿，按原顺序拆镜</p>
                      </article>
                    ))}
                  </section>
                </div>

                <section className={styles.protectedFacts}>
                  <h3><ClipboardCheck size={16} />禁止改写的原稿事实</h3>
                  <div>
                    {result.sourceManifest.protectedFacts.map((fact) => (
                      <span key={fact}><Check size={13} />{fact}</span>
                    ))}
                  </div>
                </section>

                {result.fidelityReport.warnings.length > 0 ? (
                  <section className={styles.fidelityWarnings}>
                    <h3>需要人工确认</h3>
                    {result.fidelityReport.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                  </section>
                ) : null}

                {result.sourceManifest.scenes.length > 0 ? (
                  <details className={styles.sourceSceneList}>
                    <summary>查看原稿 {result.sourceManifest.scenes.length} 场对应关系</summary>
                    <ol>
                      {result.sourceManifest.scenes.map((scene, index) => (
                        <li key={`${scene.episode}-${index}`}>
                          <strong>E{String(scene.episode).padStart(2, "0")} · {scene.sourceLabel} · {scene.heading}</strong>
                          <span>{scene.dialogue.map((line) => line.character).filter((name, itemIndex, names) => names.indexOf(name) === itemIndex).join("、") || "动作场"}</span>
                        </li>
                      ))}
                    </ol>
                  </details>
                ) : null}
              </div>
            ) : activeTab === "development" ? (
              <div className={styles.bibleGrid}>
                <article>
                  <span>核心承诺</span>
                  <p>{result.diagnosis.corePromise}</p>
                </article>
                <article>
                  <span>观众钩子</span>
                  <p>{result.diagnosis.realAudienceHook}</p>
                </article>
                <article>
                  <span>预告片风险</span>
                  <p>{result.diagnosis.trailerRisk}</p>
                </article>
                <article>
                  <span>修正策略</span>
                  <p>{result.diagnosis.fixStrategy}</p>
                </article>
                <article>
                  <span>主题</span>
                  <p>{result.storyBible.theme}</p>
                </article>
                <article>
                  <span>冲突引擎</span>
                  <p>{result.storyBible.conflictEngine}</p>
                </article>
                <article>
                  <span>主角</span>
                  <p>{result.storyBible.protagonist}</p>
                </article>
                <article>
                  <span>视觉规则</span>
                  <ul>
                    {result.storyBible.visualRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </article>
                <article className={styles.wideCard}>
                  <span>改编与拍摄策略</span>
                  <p>{result.productionPlan.adaptationBrief}</p>
                  <p>{result.productionPlan.shootingStrategy}</p>
                </article>
                <article className={styles.wideCard}>
                  <span>参考资产</span>
                  <ul>
                    {result.productionPlan.referenceAssets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={styles.wideCard}>
                  <span>生产顺序</span>
                  <ol>
                    {result.productionPlan.generationOrder.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </article>
                <article className={styles.wideCard}>
                  <span>质量审批节点</span>
                  <ol>
                    {result.productionPlan.qualityGates.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </article>
              </div>
            ) : activeTab === "visual" ? (
              <div className={styles.visualBibleGrid}>
                <article>
                  <span>格式</span>
                  <p>{result.visualBible.format}</p>
                </article>
                <article>
                  <span>核心风格</span>
                  <p>{result.visualBible.coreStyle}</p>
                </article>
                <article>
                  <span>色彩</span>
                  <ul>
                    {result.visualBible.colorPalette.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <span>摄影语言</span>
                  <ul>
                    {result.visualBible.cameraLanguage.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <span>环境规则</span>
                  <ul>
                    {result.visualBible.environmentRules.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <span>关键道具</span>
                  <ul>
                    {result.visualBible.keyProps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <span>人物锁定</span>
                  {result.visualBible.characterLocks.map((item) => (
                    <p key={item.character}>
                      <strong>{item.character}</strong>：{item.lockedPrompt}
                    </p>
                  ))}
                </article>
                <article>
                  <span>全局 Prompt</span>
                  <pre>{result.visualBible.globalPrompt}</pre>
                </article>
                <article>
                  <span>全局负向约束</span>
                  <pre>{result.visualBible.globalNegative}</pre>
                </article>
              </div>
            ) : activeTab === "outline" ? (
              <div className={styles.episodeList}>
                {(scopedParts?.outline ?? result.episodeOutline).map((episode) => (
                  <article
                    key={episode.episode}
                    data-active={episodeScope === episode.episode}
                    onClick={() => setEpisodeScope(episode.episode)}
                  >
                    <header>
                      <span>E{String(episode.episode).padStart(2, "0")}</span>
                      <strong>{episode.title}</strong>
                    </header>
                    <p>{episode.hook}</p>
                    <div className={styles.episodeConflict}>
                      <div>
                        <span>本集目标</span>
                        <p>{episode.objective}</p>
                      </div>
                      <div>
                        <span>核心阻碍</span>
                        <p>{episode.obstacle}</p>
                      </div>
                    </div>
                    <ol>
                      {episode.beats.map((beat) => (
                        <li key={beat}>{beat}</li>
                      ))}
                    </ol>
                    <div className={styles.durationPlan}>
                      {episode.durationPlan.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                    <footer className={styles.episodeFooter}>
                      <small>{episode.cliffhanger}</small>
                      <button
                        type="button"
                        disabled={detailStatus[episode.episode] === "loading"}
                        onClick={(event) => {
                          event.stopPropagation();
                          setEpisodeScope(episode.episode);
                          void generateEpisodeDetail(episode.episode);
                        }}
                      >
                        {detailStatus[episode.episode] === "loading" ? (
                          <Loader2 size={14} />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {result.shotList.some(
                          (shot) => sceneEpisode(shot.sceneId) === episode.episode,
                        )
                          ? "重做本集"
                          : "生成导演包"}
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
            ) : activeTab === "shotpack" ? (
              selectedEpisode === null ? (
                <EmptyEpisode onOutline={() => setActiveTab("outline")} />
              ) : (scopedParts?.shots.length ?? 0) > 0 ? (
                <div className={styles.shotPackageGrid}>
                  {(scopedParts?.shots ?? result.shotList).map((shot) => (
                    <ShotPackageCard
                      key={shot.shotId}
                      result={result}
                      shot={shot}
                      scopedShots={scopedParts?.shots ?? result.shotList}
                      onCopy={copyText}
                      copied={copied}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Sparkles size={28} />
                  <strong>这一集还没有镜头细节。</strong>
                  <p>点上方“生成本集细节”，会补导演剧本、镜头和整合 Prompt。</p>
                </div>
              )
            ) : activeTab === "episode" ? (
              selectedEpisode === null ? (
                <EmptyEpisode onOutline={() => setActiveTab("outline")} />
              ) : (scopedParts?.scenes.length ?? 0) > 0 ? (
              <div className={styles.sceneGrid}>
                {(scopedParts?.scenes ?? result.directorScript).map((scene) => (
                  <SceneCard
                    key={scene.sceneId}
                    scene={scene}
                    shots={scopedParts?.shots ?? result.shotList}
                  />
                ))}
              </div>
              ) : (
                <div className={styles.emptyState}>
                  <Clapperboard size={28} />
                  <strong>本集还没有导演剧本</strong>
                  <p>点击上方“生成本集导演包”，只生成当前集，等待时间更短。</p>
                </div>
              )
            ) : (
              <div className={styles.voiceGrid}>
                <article>
                  <span>旁白原则</span>
                  {result.voiceoverScript.narrator.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </article>
                <article>
                  <span>配音备注</span>
                  <ul>
                    {result.voiceoverScript.dubbingNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <span>Lovart 分镜包</span>
                  <pre>
                    {promptText(
                      scopedParts?.storyboardPrompts ?? result.storyboardPrompts,
                    )}
                  </pre>
                </article>
                <article>
                  <span>Grok 视频包</span>
                  <pre>
                    {promptText(scopedParts?.cameraPrompts ?? result.cameraPrompts)}
                  </pre>
                </article>
              </div>
            )}
          </div>

          {result ? (
            <div className={styles.checklist}>
              {result.qualityChecklist.map((item) => (
                <span key={item}>
                  <Check size={14} />
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
