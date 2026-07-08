import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60;

const maxFileBytes = 12 * 1024 * 1024;
const maxExtractedChars = 16000;

function cleanExtractedText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxExtractedChars);
}

function fileExtension(name: string) {
  const index = name.lastIndexOf(".");

  return index >= 0 ? name.slice(index + 1).toLowerCase() : "";
}

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractImageText(buffer: Buffer, mimeType: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("图片 OCR 需要配置 DEEPSEEK_API_KEY。");
  }

  const apiUrl =
    process.env.DEEPSEEK_OCR_API_URL ??
    process.env.DEEPSEEK_API_URL ??
    "https://api.deepseek.com/v1/chat/completions";
  const model =
    process.env.DEEPSEEK_OCR_MODEL ??
    process.env.DEEPSEEK_MODEL ??
    "deepseek-v4-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content:
            "你是短剧脚本文档 OCR。只提取图片中的中文/英文剧本文字、分场、对白和备注，不要解释，不要 Markdown。",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请识别这张图片里的脚本内容，保留换行和对白关系。",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${buffer.toString("base64")}`,
              },
            },
          ],
        },
      ],
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  const payload = (await response.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        "图片 OCR 暂不可用，可以先把图片文字手动粘进输入框。",
    );
  }

  return payload.choices?.[0]?.message?.content ?? "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "请上传一个文件。" }, { status: 400 });
    }

    if (file.size > maxFileBytes) {
      return Response.json(
        { error: "文件过大，请控制在 12MB 内。" },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = fileExtension(file.name);
    const mimeType = file.type || "application/octet-stream";
    let text = "";

    if (extension === "txt" || extension === "md" || mimeType.startsWith("text/")) {
      text = buffer.toString("utf8");
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (extension === "pdf" || mimeType === "application/pdf") {
      text = await extractPdfText(buffer);
    } else if (mimeType.startsWith("image/")) {
      text = await extractImageText(buffer, mimeType);
    } else if (extension === "doc") {
      return Response.json(
        { error: "暂不支持老式 .doc，请另存为 .docx 后上传。" },
        { status: 415 },
      );
    } else {
      return Response.json(
        { error: "请上传 docx、pdf、txt、md 或图片文件。" },
        { status: 415 },
      );
    }

    const cleaned = cleanExtractedText(text);

    if (!cleaned) {
      return Response.json(
        { error: "没有识别到可用文本，可以换一个文件或手动粘贴。" },
        { status: 422 },
      );
    }

    return Response.json({
      filename: file.name,
      text: cleaned,
      truncated: text.length > maxExtractedChars,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "文件解析失败，请换成 docx、pdf、txt 或清晰图片。",
      },
      { status: 400 },
    );
  }
}
