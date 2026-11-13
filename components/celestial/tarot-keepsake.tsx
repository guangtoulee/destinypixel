"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bookmark, Download, Share2, Sparkles, X } from "lucide-react";
import type { ReportLocale } from "@/lib/report-i18n";
import type { CelestialCopy } from "@/lib/celestial/copy";
import type { CardInfo } from "@/lib/celestial/tarot-meanings";
import type { DrawnCard, SpreadId } from "@/lib/celestial/tarot";

type KeepsakeCopy = {
  trigger: string;
  title: string;
  subtitle: string;
  includeQuestion: string;
  takeawayLabel: string;
  takeawayPlaceholder: string;
  download: string;
  share: string;
  rendering: string;
  close: string;
  sanctuary: string;
  takeawayHeading: string;
};

const KEEPSAKE_COPY: Record<ReportLocale, KeepsakeCopy> = {
  en: {
    trigger: "Save Keepsake Bookmark (PNG)",
    title: "Twilight Tarot Keepsake",
    subtitle: "Generated locally · 1080 px wide, with room for every drawn card",
    includeQuestion: "Include my question on the bookmark",
    takeawayLabel: "Personal one-line takeaway (optional)",
    takeawayPlaceholder: "Notice what stood out first before rushing ahead.",
    download: "Download PNG",
    share: "Share Image",
    rendering: "Painting bookmark…",
    close: "Close preview",
    sanctuary: "MOUNTAIN-LAKE TAROT SANCTUARY",
    takeawayHeading: "PERSONAL NOTE",
  },
  zh: {
    trigger: "保存此刻书签卡 (PNG)",
    title: "山湖暮色 · 塔罗纪念书签",
    subtitle: "纯本地高清绘制 · 完整保存已抽牌，牌数较多时自动加长（不上传服务器）",
    includeQuestion: "在书签上展示我的提问",
    takeawayLabel: "写一句留给自己的话（选填）",
    takeawayPlaceholder: "例如：先看清脚下的路，再决定下一步。",
    download: "保存高清 PNG",
    share: "分享书签卡",
    rendering: "正在绘制书签…",
    close: "关闭预览",
    sanctuary: "山湖塔罗 · 静心牌桌",
    takeawayHeading: "此刻手记",
  },
  "zh-TW": {
    trigger: "保存此刻書籤卡 (PNG)",
    title: "山湖暮色 · 塔羅紀念書籤",
    subtitle: "純本地高清繪製 · 完整保存已抽牌，牌數較多時自動加長（不上傳伺服器）",
    includeQuestion: "在書籤上展示我的提問",
    takeawayLabel: "寫一句留給自己的話（選填）",
    takeawayPlaceholder: "例如：先看清腳下的路，再決定下一步。",
    download: "保存高清 PNG",
    share: "分享書籤卡",
    rendering: "正在繪製書籤…",
    close: "關閉預覽",
    sanctuary: "山湖塔羅 · 靜心牌桌",
    takeawayHeading: "此刻手記",
  },
  ru: {
    trigger: "Сохранить закладку (PNG)",
    title: "Сумеречная закладка Таро",
    subtitle: "Создаётся локально · ширина 1080 px, место для всех вытянутых карт",
    includeQuestion: "Показать мой вопрос на закладке",
    takeawayLabel: "Личная заметка одной строкой (необязательно)",
    takeawayPlaceholder: "Главное наблюдение этого расклада…",
    download: "Скачать PNG",
    share: "Поделиться",
    rendering: "Создаём изображение…",
    close: "Закрыть",
    sanctuary: "СУМЕРЕЧНЫЙ ЗАЛ ТАРО",
    takeawayHeading: "ЛИЧНАЯ ЗАМЕТКА",
  },
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function toRoman(num: number): string {
  return ROMAN[num - 1] ?? String(num);
}

/** Smart CJK + Latin/Cyrillic text wrapper for HTML5 Canvas */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  // Tokenize so CJK characters wrap per-char while Latin/Cyrillic words stay whole
  const tokens = clean.match(/[\u3400-\u9FFF\uF900-\uFAFF]|[^\u3400-\u9FFF\uF900-\uFAFF\s]+|\s+/g) || [clean];
  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    if (!current && /^\s+$/.test(token)) continue;
    const candidate = current + token;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current.trimEnd());
      if (lines.length >= maxLines) {
        const last = lines[maxLines - 1];
        lines[maxLines - 1] = last.slice(0, Math.max(1, last.length - 1)).trimEnd() + "…";
        return lines;
      }
      current = token.trimStart();
    }
  }
  if (current.trim()) {
    lines.push(current.trimEnd());
  }
  return lines.slice(0, maxLines);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function loadCardImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  color: string,
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

export function TarotKeepsake({
  locale,
  copy,
  mode,
  spread,
  drawnCards,
  cardsMeta,
  question,
}: {
  locale: ReportLocale;
  copy: CelestialCopy;
  mode: "spread" | "free";
  spread: SpreadId;
  drawnCards: DrawnCard[];
  cardsMeta: CardInfo[];
  question: string;
}) {
  const kc = KEEPSAKE_COPY[locale];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [takeaway, setTakeaway] = useState("");
  const [painting, setPainting] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);

  useEffect(() => {
    setCanShareFile(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function",
    );
  }, []);

  useEffect(() => {
    if (open && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    } else if (!open && dialogRef.current?.open) {
      dialogRef.current?.close();
    }
  }, [open]);

  const renderBookmark = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setPainting(true);
    const W = 1080;
    const cardColumns = 5;
    const compactCardWidth = 152;
    const compactCardHeight = Math.round(compactCardWidth * 1.72);
    const cardRowGap = 32;
    const legendColumns = 2;
    const legendCellHeight = 104;
    const legendRowGap = 10;
    // Keep the original bookmark size through ten cards, then make room for
    // every extra image row and legend row, including the 78-card free draw.
    const extraCardRows = Math.max(0, Math.ceil(drawnCards.length / cardColumns) - 2);
    const extraLegendRows = Math.max(0, Math.ceil(drawnCards.length / legendColumns) - 5);
    const H = 1920
      + extraCardRows * (compactCardHeight + cardRowGap)
      + extraLegendRows * (legendCellHeight + legendRowGap);
    canvas.width = W;
    canvas.height = H;

    // 1. Deep Mountain-Lake Twilight sky & lake reflection backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#130f21");
    bgGrad.addColorStop(0.32, "#221a36");
    bgGrad.addColorStop(0.68, "#2c203e");
    bgGrad.addColorStop(1, "#141122");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Soft lunar champagne aura at top-center
    const moonGlow = ctx.createRadialGradient(W / 2, 240, 20, W / 2, 240, 560);
    moonGlow.addColorStop(0, "rgba(244, 214, 174, 0.20)");
    moonGlow.addColorStop(0.5, "rgba(196, 160, 218, 0.08)");
    moonGlow.addColorStop(1, "rgba(20, 16, 33, 0)");
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, W, 900);

    // Subtle mountain silhouette & lake horizon
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 1460);
    ctx.quadraticCurveTo(240, 1370, 510, 1430);
    ctx.quadraticCurveTo(810, 1350, W, 1425);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    const lakeGrad = ctx.createLinearGradient(0, 1360, 0, H);
    lakeGrad.addColorStop(0, "rgba(26, 19, 41, 0.55)");
    lakeGrad.addColorStop(1, "rgba(15, 12, 26, 0.92)");
    ctx.fillStyle = lakeGrad;
    ctx.fill();
    ctx.restore();

    // Deterministic golden starlight motes
    for (let i = 0; i < 36; i++) {
      const sx = ((i * 197 + 83) % 980) + 50;
      const sy = ((i * 311 + 61) % 1760) + 80;
      const r = i % 5 === 0 ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle =
        i % 3 === 0 ? "rgba(247, 220, 182, 0.42)" : "rgba(222, 202, 238, 0.26)";
      ctx.fill();
    }

    // 2. Ornate Double Champagne-Gold Sanctuary Frame
    ctx.strokeStyle = "rgba(238, 206, 166, 0.48)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 44, 44, W - 88, H - 88, 28);
    ctx.stroke();

    ctx.strokeStyle = "rgba(238, 206, 166, 0.20)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 58, 58, W - 116, H - 116, 20);
    ctx.stroke();

    // Corner stars
    const corners: [number, number][] = [
      [76, 76],
      [W - 76, 76],
      [76, H - 76],
      [W - 76, H - 76],
    ];
    for (const [cx, cy] of corners) {
      drawFourPointStar(ctx, cx, cy, 10, 3, "rgba(242, 210, 171, 0.72)");
    }

    // Celestial astrolabe arc at top
    ctx.save();
    ctx.strokeStyle = "rgba(242, 210, 171, 0.24)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(W / 2, 290, 200, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    drawFourPointStar(ctx, W / 2, 92, 13, 4, "#f3d3a8");
    ctx.restore();

    // 3. Header: Sanctuary Kicker + Spread Title + Date
    const serifFont = `Georgia, "Songti SC", "Noto Serif SC", serif`;
    const sansFont = `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`;

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(238, 208, 174, 0.85)";
    ctx.font = `600 19px ${sansFont}`;
    ctx.fillText(kc.sanctuary, W / 2, 142);

    const spreadTitle = mode === "free" ? copy.freeMode : copy.spreads[spread];
    ctx.fillStyle = "#fbf3ea";
    ctx.font = `400 42px ${serifFont}`;
    ctx.fillText(spreadTitle, W / 2, 202);

    const now = new Date();
    const dateStamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    ctx.fillStyle = "rgba(214, 198, 224, 0.78)";
    ctx.font = `500 20px ${sansFont}`;
    ctx.fillText(`DESTINYPIXEL  ·  ${dateStamp}`, W / 2, 242);

    let cursorY = 278;

    // 4. Optional Question Capsule
    const trimmedQuestion = question.trim();
    if (showQuestion && trimmedQuestion) {
      ctx.font = `400 26px ${serifFont}`;
      const qLines = wrapCanvasText(ctx, `“${trimmedQuestion}”`, W - 240, 2);
      const boxH = 34 + qLines.length * 38;
      ctx.fillStyle = "rgba(38, 28, 54, 0.68)";
      ctx.strokeStyle = "rgba(242, 210, 171, 0.30)";
      ctx.lineWidth = 1.2;
      drawRoundedRect(ctx, 96, cursorY, W - 192, boxH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f7e6d0";
      qLines.forEach((line, idx) => {
        ctx.fillText(line, W / 2, cursorY + 42 + idx * 38);
      });
      cursorY += boxH + 28;
    } else {
      cursorY += 16;
    }

    // 5. Load & Paint Revealed Cards
    const cardEntries = await Promise.all(
      drawnCards.map(async (dc) => {
        const meta = cardsMeta.find((m) => m.id === dc.id)!;
        const img = meta ? await loadCardImage(meta.image) : null;
        const posLabel =
          mode === "spread"
            ? copy.positions[spread][dc.slot] || `${copy.position} ${dc.slot + 1}`
            : `${copy.position} ${dc.slot + 1}`;
        return { dc, meta, img, posLabel };
      }),
    );

    const n = cardEntries.length;

    const paintCardArt = (
      entry: (typeof cardEntries)[number],
      x: number,
      y: number,
      w: number,
      h: number,
      badgeNum: number,
    ) => {
      ctx.save();
      // Drop shadow
      ctx.shadowColor = "rgba(9, 6, 18, 0.65)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "#f7eedb";
      drawRoundedRect(ctx, x, y, w, h, 12);
      ctx.fill();
      ctx.restore();

      // Clip & draw image (rotated 180deg if reversed)
      ctx.save();
      drawRoundedRect(ctx, x + 4, y + 4, w - 8, h - 8, 9);
      ctx.clip();
      if (entry.img) {
        if (entry.dc.reversed) {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(entry.img, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
        } else {
          ctx.drawImage(entry.img, x + 4, y + 4, w - 8, h - 8);
        }
      } else {
        ctx.fillStyle = "#2b213c";
        ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
      }
      ctx.restore();

      // Gold border around card
      ctx.save();
      ctx.strokeStyle = "rgba(240, 206, 162, 0.72)";
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, w, h, 12);
      ctx.stroke();

      // Roman numeral pill above top-center of card
      const numeral = toRoman(badgeNum);
      ctx.fillStyle = "#1d162c";
      ctx.strokeStyle = "rgba(242, 210, 171, 0.65)";
      ctx.lineWidth = 1.4;
      drawRoundedRect(ctx, x + w / 2 - 24, y - 15, 48, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f4d5aa";
      ctx.font = `600 15px ${serifFont}`;
      ctx.textAlign = "center";
      ctx.fillText(numeral, x + w / 2, y + 5);
      ctx.restore();
    };

    if (n === 1) {
      const cw = 356;
      const ch = 612;
      const cx = (W - cw) / 2;
      paintCardArt(cardEntries[0], cx, cursorY + 14, cw, ch, 1);
      cursorY += ch + 58;
    } else if (n <= 3) {
      const cw = n === 2 ? 280 : 258;
      const ch = Math.round(cw * 1.72);
      const gap = n === 2 ? 56 : 40;
      const totalW = n * cw + (n - 1) * gap;
      const startX = (W - totalW) / 2;
      cardEntries.forEach((entry, i) => {
        paintCardArt(entry, startX + i * (cw + gap), cursorY + 14, cw, ch, i + 1);
      });
      cursorY += ch + 50;
    } else if (n <= 5) {
      const topRow = cardEntries.slice(0, 3);
      const botRow = cardEntries.slice(3);
      const cw = 186;
      const ch = Math.round(cw * 1.72);
      const gapX = 36;
      const gapY = 34;

      const topW = topRow.length * cw + (topRow.length - 1) * gapX;
      const topStartX = (W - topW) / 2;
      topRow.forEach((entry, i) => {
        paintCardArt(entry, topStartX + i * (cw + gapX), cursorY + 10, cw, ch, i + 1);
      });

      const botW = botRow.length * cw + (botRow.length - 1) * gapX;
      const botStartX = (W - botW) / 2;
      botRow.forEach((entry, i) => {
        paintCardArt(
          entry,
          botStartX + i * (cw + gapX),
          cursorY + 10 + ch + gapY,
          cw,
          ch,
          i + 4,
        );
      });
      cursorY += ch * 2 + gapY + 42;
    } else {
      // Five cards per row, with as many rows as the reading needs.
      const cols = cardColumns;
      const cw = compactCardWidth;
      const ch = compactCardHeight;
      const gapX = 26;
      const gapY = cardRowGap;
      const rowsCount = Math.ceil(n / cols);
      cardEntries.forEach((entry, i) => {
        const r = Math.floor(i / cols);
        const col = i % cols;
        const rowLen = r === rowsCount - 1 ? n - r * cols : cols;
        const rowW = rowLen * cw + (rowLen - 1) * gapX;
        const rowStartX = (W - rowW) / 2;
        paintCardArt(
          entry,
          rowStartX + col * (cw + gapX),
          cursorY + 10 + r * (ch + gapY),
          cw,
          ch,
          i + 1,
        );
      });
      cursorY += rowsCount * ch + (rowsCount - 1) * gapY + 38;
    }

    // 6. Card Positions, Orientations & Quick Keywords Summary
    const trimmedTakeaway = takeaway.trim();
    const bottomReserved = trimmedTakeaway ? 245 : 120;
    const availableListH = Math.max(180, H - cursorY - bottomReserved);

    if (n <= 5) {
      const rowGap = n <= 3 ? 16 : 10;
      const rowH = Math.min(
        n === 1 ? 210 : n <= 3 ? 132 : 94,
        Math.floor((availableListH - (n - 1) * rowGap) / Math.max(1, n)),
      );

      cardEntries.forEach((entry, i) => {
        const ry = cursorY + i * (rowH + rowGap);
        ctx.fillStyle = "rgba(32, 24, 46, 0.72)";
        ctx.strokeStyle = "rgba(218, 192, 232, 0.20)";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 88, ry, W - 176, rowH, 16);
        ctx.fill();
        ctx.stroke();

        const orient = entry.dc.reversed ? copy.reversed : copy.upright;
        const keyword = entry.dc.reversed ? entry.meta.reversed : entry.meta.upright;

        ctx.textAlign = "left";
        ctx.fillStyle = "#efd0a8";
        ctx.font = `600 18px ${sansFont}`;
        const headerText = `${toRoman(i + 1)} · ${entry.posLabel}`;
        ctx.fillText(headerText, 116, ry + (rowH >= 115 ? 34 : 29));

        ctx.textAlign = "right";
        ctx.fillStyle = "#fbf3ea";
        ctx.font = `600 22px ${serifFont}`;
        ctx.fillText(`${entry.meta.name} (${orient})`, W - 116, ry + (rowH >= 115 ? 35 : 30));

        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(229, 217, 238, 0.88)";
        ctx.font = `400 ${rowH >= 115 ? 21 : 18}px ${sansFont}`;
        const kwLines = wrapCanvasText(ctx, keyword, W - 232, rowH >= 120 ? 2 : 1);
        kwLines.forEach((line, lIdx) => {
          ctx.fillText(line, 116, ry + (rowH >= 115 ? 70 : 62) + lIdx * 28);
        });
      });
    } else {
      // Keep every position and orientation readable in a two-column legend.
      const cols = legendColumns;
      const colW = (W - 196) / 2;
      const rowsCount = Math.ceil(n / cols);
      const cellH = Math.min(
        legendCellHeight,
        Math.floor((availableListH - (rowsCount - 1) * legendRowGap) / rowsCount),
      );
      cardEntries.forEach((entry, i) => {
        const r = Math.floor(i / cols);
        const col = i % cols;
        const cx = 88 + col * (colW + 20);
        const cy = cursorY + r * (cellH + legendRowGap);

        ctx.fillStyle = "rgba(32, 24, 46, 0.68)";
        ctx.strokeStyle = "rgba(218, 192, 232, 0.18)";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, cx, cy, colW, cellH, 12);
        ctx.fill();
        ctx.stroke();

        const orient = entry.dc.reversed ? copy.reversed : copy.upright;
        const keyword = entry.dc.reversed ? entry.meta.reversed : entry.meta.upright;

        ctx.textAlign = "left";
        ctx.fillStyle = "#f3d5ad";
        ctx.font = `600 17px ${sansFont}`;
        const titleLines = wrapCanvasText(
          ctx,
          `${toRoman(i + 1)} ${entry.posLabel} · ${entry.meta.name} (${orient})`,
          colW - 32,
          2,
        );
        titleLines.forEach((line, lineIndex) => {
          ctx.fillText(line, cx + 16, cy + 26 + lineIndex * 23);
        });

        ctx.fillStyle = "rgba(224, 212, 234, 0.84)";
        ctx.font = `400 16px ${sansFont}`;
        const kwLine = wrapCanvasText(ctx, keyword, colW - 32, 1)[0];
        if (kwLine) ctx.fillText(kwLine, cx + 16, cy + 82);
      });
    }

    // 7. Personal One-Line Takeaway Box (if entered)
    if (trimmedTakeaway) {
      const noteY = H - 230;
      ctx.fillStyle = "rgba(49, 36, 66, 0.76)";
      ctx.strokeStyle = "rgba(242, 210, 171, 0.44)";
      ctx.lineWidth = 1.4;
      drawRoundedRect(ctx, 88, noteY, W - 176, 118, 18);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(242, 210, 171, 0.85)";
      ctx.font = `600 15px ${sansFont}`;
      ctx.fillText(`✦  ${kc.takeawayHeading}  ✦`, W / 2, noteY + 32);

      ctx.fillStyle = "#fff6eb";
      ctx.font = `400 24px ${serifFont}`;
      const noteLines = wrapCanvasText(ctx, trimmedTakeaway, W - 236, 2);
      noteLines.forEach((line, idx) => {
        ctx.fillText(line, W / 2, noteY + 68 + idx * 30);
      });
    }

    // 8. Subtle Editorial Watermark
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(238, 208, 174, 0.56)";
    ctx.font = `500 19px ${serifFont}`;
    ctx.fillText("✧  destinypixel.com  ✧", W / 2, H - 76);

    setPainting(false);
  }, [drawnCards, cardsMeta, mode, spread, copy, kc, question, showQuestion, takeaway]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      void renderBookmark();
    }, 30);
    return () => clearTimeout(t);
  }, [open, renderBookmark]);

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `destinypixel-tarot-${stamp}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const stamp = new Date().toISOString().slice(0, 10);
      const file = new File([blob], `destinypixel-tarot-${stamp}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: kc.title,
          });
          return;
        } catch {
          // User cancelled share sheet; do nothing
          return;
        }
      }
      void handleDownload();
    }, "image/png");
  }

  return (
    <>
      <button
        type="button"
        className="cel-button tarot-keepsake-trigger"
        onClick={() => setOpen(true)}
      >
        <Bookmark size={15} />
        <span>{kc.trigger}</span>
      </button>

      <dialog
        ref={dialogRef}
        className="tarot-keepsake-dialog"
        aria-labelledby={titleId}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="tarot-keepsake-shell">
          <div className="tarot-keepsake-head">
            <div>
              <p className="cel-kicker">
                <Sparkles size={12} style={{ display: "inline", verticalAlign: "-1px" }} />{" "}
                DESTINYPIXEL KEEPSAKE
              </p>
              <h2 id={titleId}>{kc.title}</h2>
              <p className="tarot-keepsake-sub">{kc.subtitle}</p>
            </div>
            <button
              type="button"
              className="tarot-keepsake-close"
              aria-label={kc.close}
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="tarot-keepsake-body">
            <div className="tarot-keepsake-preview-wrap">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="tarot-keepsake-canvas"
              />
              {painting && (
                <span className="tarot-keepsake-painting" role="status">
                  {kc.rendering}
                </span>
              )}
            </div>

            <div className="tarot-keepsake-controls">
              {question.trim().length > 0 && (
                <label className="tarot-keepsake-toggle">
                  <input
                    type="checkbox"
                    checked={showQuestion}
                    onChange={(e) => setShowQuestion(e.target.checked)}
                  />
                  <span>{kc.includeQuestion}</span>
                </label>
              )}

              <label className="tarot-keepsake-note-field">
                <span>{kc.takeawayLabel}</span>
                <input
                  type="text"
                  maxLength={120}
                  value={takeaway}
                  onChange={(e) => setTakeaway(e.target.value)}
                  placeholder={kc.takeawayPlaceholder}
                />
              </label>

              <div className="tarot-keepsake-actions">
                <button
                  type="button"
                  className="cel-button"
                  disabled={painting}
                  onClick={handleDownload}
                >
                  <Download size={16} />
                  <span>{kc.download}</span>
                </button>
                {canShareFile && (
                  <button
                    type="button"
                    className="cel-button-soft"
                    disabled={painting}
                    onClick={handleShare}
                  >
                    <Share2 size={16} />
                    <span>{kc.share}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
