import ExcelJS from "exceljs";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { JubenResult } from "@/lib/ai/juben";

export const runtime = "nodejs";
export const maxDuration = 60;

type ExportRequest = {
  format?: "word" | "excel";
  result?: JubenResult;
};

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80) || "juben";
}

function attachmentHeaders(filename: string, contentType: string) {
  return {
    "Cache-Control": "no-store",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "Content-Type": contentType,
  };
}

function docParagraph(text: string, bold = false) {
  return new Paragraph({ children: [new TextRun({ text, bold })] });
}

function docCell(value: unknown, bold = false) {
  return new TableCell({
    children: String(value ?? "")
      .split("\n")
      .map((line) => docParagraph(line || " ", bold)),
  });
}

function docTable(headers: string[], rows: Array<Array<unknown>>) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((item) => docCell(item, true)) }),
      ...rows.map(
        (row) => new TableRow({ children: row.map((item) => docCell(item)) }),
      ),
    ],
  });
}

function sceneForShot(result: JubenResult, sceneId: string) {
  return result.directorScript.find((scene) => scene.sceneId === sceneId);
}

function promptForShot(
  items: JubenResult["storyboardPrompts"],
  result: JubenResult,
  shot: JubenResult["shotList"][number],
) {
  const direct = items.find((item) => item.prompt.includes(shot.shotId));
  if (direct) return direct;
  const sameSceneShots = result.shotList.filter((item) => item.sceneId === shot.sceneId);
  const sameScenePrompts = items.filter((item) => item.sceneId === shot.sceneId);
  const index = sameSceneShots.findIndex((item) => item.shotId === shot.shotId);
  return sameScenePrompts[Math.max(index, 0)] ?? sameScenePrompts[0];
}

function dialogueForShot(result: JubenResult, shot: JubenResult["shotList"][number]) {
  const scene = sceneForShot(result, shot.sceneId);
  const explicit = shot.visual.match(/^(.+?)在.+?原稿对白：“([\s\S]+)”/);
  if (explicit) return `@${explicit[1]}：“${explicit[2]}”（逐字保留并对齐口型）`;
  const embedded = scene?.dialogue.find((line) =>
    `${shot.visual}\n${shot.action}`.includes(line.line),
  );
  return embedded
    ? `@${embedded.character}：“${embedded.line}”（逐字保留并对齐口型）`
    : "无新增对白；以动作、表情、呼吸和环境声推进。";
}

function charactersForShot(result: JubenResult, shot: JubenResult["shotList"][number]) {
  const scene = sceneForShot(result, shot.sceneId);
  const content = `${shot.visual} ${shot.action} ${scene?.action ?? ""}`;
  const matches = result.visualBible.characterLocks.filter((item) => {
    const aliases = [
      item.character,
      item.character.split("·")[0],
      ...Array.from(item.lockedPrompt.matchAll(/(?:白玫瑰|红玫瑰|公主|厉鬼|老国王|安布罗斯|亨利|埃德蒙|学士|布兰温)/g)).map((match) => match[0]),
    ];
    return aliases.some((alias) => alias.length >= 2 && content.includes(alias));
  });
  return (matches.length > 0 ? matches : result.visualBible.characterLocks.slice(0, 1)).slice(0, 4);
}

function finalVideoPrompt(result: JubenResult, shot: JubenResult["shotList"][number]) {
  const scene = sceneForShot(result, shot.sceneId);
  const storyboard = promptForShot(result.storyboardPrompts, result, shot);
  const camera = promptForShot(result.cameraPrompts, result, shot);
  const edit = promptForShot(result.editPrompts, result, shot);
  const index = result.shotList.findIndex((item) => item.shotId === shot.shotId);
  const previous = index > 0 ? result.shotList[index - 1] : null;
  const characters = charactersForShot(result, shot)
    .map((item) => `@${item.character}：${item.lockedPrompt}`)
    .join("\n");

  return [
    "出场角色：",
    characters,
    "",
    "背景场景：",
    `${scene?.sceneHeading ?? shot.sceneId}；${result.visualBible.coreStyle}`,
    "",
    "前一个分镜描述：",
    previous ? `${previous.shotId}：${previous.visual} ${previous.action}` : "本集第一镜，直接以原稿动作开场。",
    "",
    "分段动作：",
    `【0-${Math.max(2, Math.floor(Number.parseInt(shot.duration, 10) / 2))}秒】${shot.visual}`,
    `【后半段】${shot.action}；结束状态：${shot.continuity}`,
    "",
    `景别：${shot.shotSize}；机位：${shot.cameraAngle}`,
    `光影氛围：${result.visualBible.colorPalette.slice(0, 4).join("、")}`,
    `对白/旁白：${dialogueForShot(result, shot)}`,
    `音效：${shot.sound}`,
    `运镜：${shot.movement}；${camera?.prompt ?? ""}`,
    `首帧提示词：${storyboard?.prompt ?? result.visualBible.globalPrompt}`,
    `剪辑：${edit?.prompt ?? "动作点清楚，环境声连续，结尾保留停点。"}`,
    `输出约束：${shot.continuity}；${storyboard?.negativePrompt ?? ""}；${result.visualBible.globalNegative}`,
    `[视觉风格：${result.visualBible.format}]`,
  ].join("\n");
}

async function buildWord(result: JubenResult) {
  const shotSections = result.shotList.flatMap((shot) => {
    const scene = result.directorScript.find(
      (item) => item.sceneId === shot.sceneId,
    );

    return [
      new Paragraph({
        text: `${shot.shotId} · ${scene?.sceneHeading ?? shot.sceneId}`,
        heading: HeadingLevel.HEADING_3,
      }),
      docTable(["镜头信息", "画面与执行", "对白 / 声音", "最终视频提示词"], [
        [`${shot.shotId}\n${shot.duration}\n${shot.shotSize}\n${shot.cameraAngle}`, `${shot.visual}\n动作：${shot.action}\n运镜：${shot.movement}\n连续性：${shot.continuity}`, `${dialogueForShot(result, shot)}\n音效：${shot.sound}`, finalVideoPrompt(result, shot)],
      ]),
    ];
  });
  const document = new Document({
    creator: "DestinyPixel Juben",
    title: `${result.meta.title} - 短剧生产包`,
    sections: [
      {
        children: [
          new Paragraph({ text: result.meta.title, heading: HeadingLevel.TITLE }),
          docParagraph(result.meta.logline),
          new Paragraph({ text: "故事与制作圣经", heading: HeadingLevel.HEADING_1 }),
          docTable(["模块", "内容"], [
            ["核心承诺", result.diagnosis.corePromise],
            ["观众钩子", result.diagnosis.realAudienceHook],
            ["预告片风险", result.diagnosis.trailerRisk],
            ["修正策略", result.diagnosis.fixStrategy],
            ["主题", result.storyBible.theme],
            ["世界", result.storyBible.world],
            ["主角", result.storyBible.protagonist],
            ["阻碍者", result.storyBible.antagonist],
            ["关系引擎", result.storyBible.relationshipEngine],
            ["冲突引擎", result.storyBible.conflictEngine],
            ["改编简报", result.productionPlan.adaptationBrief],
            ["拍摄策略", result.productionPlan.shootingStrategy],
            ["参考资产", result.productionPlan.referenceAssets.join("\n")],
            ["生成顺序", result.productionPlan.generationOrder.join("\n")],
            ["质量节点", result.productionPlan.qualityGates.join("\n")],
          ]),
          new Paragraph({ text: "视觉圣经", heading: HeadingLevel.HEADING_1 }),
          docTable(["模块", "内容"], [
            ["格式", result.visualBible.format],
            ["核心风格", result.visualBible.coreStyle],
            ["色彩", result.visualBible.colorPalette.join("\n")],
            ["摄影语言", result.visualBible.cameraLanguage.join("\n")],
            ["环境规则", result.visualBible.environmentRules.join("\n")],
            ["人物锁定", result.visualBible.characterLocks.map((item) => `${item.character}: ${item.lockedPrompt}`).join("\n")],
            ["关键道具", result.visualBible.keyProps.join("\n")],
            ["全局 Prompt", result.visualBible.globalPrompt],
            ["全局负向约束", result.visualBible.globalNegative],
          ]),
          new Paragraph({ text: "分集节拍", heading: HeadingLevel.HEADING_1 }),
          docTable(
            ["集数", "标题", "本集目标", "核心阻碍", "时间与剧情节拍", "结尾钩子"],
            result.episodeOutline.map((episode) => [
              `E${String(episode.episode).padStart(2, "0")}`,
              episode.title,
              episode.objective,
              episode.obstacle,
              [...episode.durationPlan, ...episode.beats].join("\n"),
              episode.cliffhanger,
            ]),
          ),
          new Paragraph({ text: "导演剧本", heading: HeadingLevel.HEADING_1 }),
          docTable(
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
          new Paragraph({ text: "逐镜生成包", heading: HeadingLevel.HEADING_1 }),
          ...shotSections,
        ],
      },
    ],
  });

  return Packer.toBuffer(document);
}

async function buildExcel(result: JubenResult) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DestinyPixel Juben";
  workbook.created = new Date();

  const addSheet = (name: string, headers: string[], rows: Array<Array<unknown>>) => {
    const sheet = workbook.addWorksheet(name.slice(0, 31));
    sheet.addRow(headers);
    rows.forEach((row) => sheet.addRow(row.map((item) => String(item ?? ""))));
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF20372F" } };
    sheet.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    headers.forEach((header, index) => {
      const widths: Record<string, number> = {
        "镜号": 18,
        "时长": 10,
        "画面描述": 64,
        "景别": 18,
        "光影氛围": 34,
        "对白 / 旁白": 42,
        "音效": 34,
        "运镜": 34,
        "最终视频提示词": 82,
      };
      sheet.getColumn(index + 1).width = widths[header] ?? (index === 0 ? 18 : 38);
    });
  };

  addSheet("故事与制作圣经", ["模块", "内容"], [
    ["标题", result.meta.title],
    ["一句话", result.meta.logline],
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
  ]);
  addSheet("视觉圣经", ["模块", "内容"], [
    ["格式", result.visualBible.format],
    ["核心风格", result.visualBible.coreStyle],
    ["色彩", result.visualBible.colorPalette.join("\n")],
    ["摄影语言", result.visualBible.cameraLanguage.join("\n")],
    ["人物锁定", result.visualBible.characterLocks.map((item) => `${item.character}: ${item.lockedPrompt}`).join("\n")],
    ["全局 Prompt", result.visualBible.globalPrompt],
    ["全局负向约束", result.visualBible.globalNegative],
  ]);
  addSheet(
    "分集节拍",
    ["集数", "标题", "本集目标", "核心阻碍", "时间分配", "剧情节拍", "反转", "结尾钩子"],
    result.episodeOutline.map((episode) => [
      `E${String(episode.episode).padStart(2, "0")}`,
      episode.title,
      episode.objective,
      episode.obstacle,
      episode.durationPlan.join("\n"),
      episode.beats.join("\n"),
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
    "逐镜生成表",
    ["镜号", "时长", "画面描述", "景别", "光影氛围", "对白 / 旁白", "音效", "运镜", "最终视频提示词"],
    result.shotList.map((shot) => [
      shot.shotId,
      shot.duration,
      `${shot.visual}\n动作：${shot.action}\n连续性：${shot.continuity}`,
      `${shot.shotSize}\n${shot.cameraAngle}`,
      `${result.visualBible.colorPalette.slice(0, 4).join("、")}\n${result.visualBible.coreStyle}`,
      dialogueForShot(result, shot),
      shot.sound,
      shot.movement,
      finalVideoPrompt(result, shot),
    ]),
  );

  return workbook.xlsx.writeBuffer();
}

export async function POST(request: Request) {
  let body: ExportRequest;

  try {
    body = (await request.json()) as ExportRequest;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.result?.meta || !body.result.episodeOutline || !body.format) {
    return Response.json({ error: "剧本包数据不完整。" }, { status: 400 });
  }

  const baseName = safeFilename(body.result.meta.title);

  if (body.format === "word") {
    const buffer = await buildWord(body.result);
    return new Response(new Uint8Array(buffer), {
      headers: attachmentHeaders(
        `${baseName}-production-pack.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    });
  }

  const buffer = await buildExcel(body.result);
  return new Response(new Uint8Array(buffer), {
    headers: attachmentHeaders(
      `${baseName}-production-pack.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ),
  });
}
