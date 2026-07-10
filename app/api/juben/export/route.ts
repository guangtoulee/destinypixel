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

async function buildWord(result: JubenResult) {
  const shotSections = result.shotList.flatMap((shot) => {
    const scene = result.directorScript.find(
      (item) => item.sceneId === shot.sceneId,
    );
    const storyboard = result.storyboardPrompts.find(
      (item) => item.sceneId === shot.sceneId,
    );
    const camera = result.cameraPrompts.find(
      (item) => item.sceneId === shot.sceneId,
    );
    const edit = result.editPrompts.find(
      (item) => item.sceneId === shot.sceneId,
    );

    return [
      new Paragraph({
        text: `${shot.shotId} · ${scene?.sceneHeading ?? shot.sceneId}`,
        heading: HeadingLevel.HEADING_3,
      }),
      docTable(["模块", "内容"], [
        ["时长 / 景别", `${shot.duration} · ${shot.shotSize}`],
        ["机位 / 运镜", `${shot.cameraAngle} · ${shot.movement}`],
        ["画面", shot.visual],
        ["动作", shot.action],
        ["对白", scene?.dialogue.map((line) => `${line.character}: ${line.line}（${line.subtext}）`).join("\n")],
        ["声音", shot.sound],
        ["连续性", shot.continuity],
        ["首帧 Prompt", storyboard?.prompt],
        ["视频运动 Prompt", camera?.prompt],
        ["剪辑 Prompt", edit?.prompt],
        ["负向约束", [result.visualBible.globalNegative, storyboard?.negativePrompt].filter(Boolean).join("；")],
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
    headers.forEach((_, index) => {
      sheet.getColumn(index + 1).width = index === 0 ? 18 : 38;
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
    ["镜头", "场景", "时长", "景别", "机位", "运镜", "画面", "动作", "声音", "连续性", "首帧 Prompt", "视频运动 Prompt", "剪辑 Prompt", "负向约束"],
    result.shotList.map((shot) => {
      const storyboard = result.storyboardPrompts.find((item) => item.sceneId === shot.sceneId);
      const camera = result.cameraPrompts.find((item) => item.sceneId === shot.sceneId);
      const edit = result.editPrompts.find((item) => item.sceneId === shot.sceneId);
      return [shot.shotId, shot.sceneId, shot.duration, shot.shotSize, shot.cameraAngle, shot.movement, shot.visual, shot.action, shot.sound, shot.continuity, storyboard?.prompt, camera?.prompt, edit?.prompt, [result.visualBible.globalNegative, storyboard?.negativePrompt].filter(Boolean).join("；")];
    }),
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
