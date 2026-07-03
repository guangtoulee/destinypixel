export const runtime = "nodejs";

type DeepSeekMessageContent = Array<
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
>;

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function extractJsonObject(value: string) {
  const trimmed = value.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function normalizeRecognizedText(value: unknown) {
  if (typeof value !== "string") return "";
  const firstLine = value
    .replace(/[“”‘’]/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return (firstLine ?? "").replace(/[^A-Za-z'-]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      imageDataUrl?: unknown;
      expectedWord?: unknown;
    };
    const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";
    const expectedWord = typeof body.expectedWord === "string" ? body.expectedWord : "";

    if (!imageDataUrl.startsWith("data:image/")) {
      return Response.json({ error: "请上传有效图片。" }, { status: 400 });
    }

    if (imageDataUrl.length > 7_000_000) {
      return Response.json({ error: "图片太大，请裁剪后再上传。" }, { status: 413 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "DeepSeek OCR is not configured. 请先配置 DEEPSEEK_API_KEY。" },
        { status: 501 },
      );
    }

    const apiUrl =
      process.env.DEEPSEEK_OCR_API_URL ??
      process.env.DEEPSEEK_API_URL ??
      "https://api.deepseek.com/v1/chat/completions";
    const model =
      process.env.DEEPSEEK_OCR_MODEL ??
      process.env.DEEPSEEK_MODEL ??
      "deepseek-v4-flash";
    const content: DeepSeekMessageContent = [
      {
        type: "text",
        text: [
          "请做英语手写单词 OCR，只识别图片里学生写的英文单词。",
          "如果有多个词，只返回最像目标听写答案的一个。",
          expectedWord ? `目标词可能是：${expectedWord}。` : "",
          "只能返回 JSON：{\"text\":\"识别到的英文\",\"note\":\"简短说明\"}。",
        ]
          .filter(Boolean)
          .join("\n"),
      },
      {
        type: "image_url",
        image_url: {
          url: imageDataUrl,
        },
      },
    ];

    const controller = new AbortController();
    const timeout = windowlessTimeout(controller, Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 18_000));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是给孩子英语听写批改使用的 OCR。只识别图片中的英文单词，不解释、不改写、不输出 Markdown。",
          },
          {
            role: "user",
            content,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const payload = (await response.json().catch(() => ({}))) as DeepSeekChatResponse;

    if (!response.ok) {
      const message =
        payload.error?.message ??
        "当前 DeepSeek 接口没有可用视觉 OCR；可配置 DEEPSEEK_OCR_API_URL / DEEPSEEK_OCR_MODEL，或先手动输入。";
      return Response.json({ error: message }, { status: response.status === 400 ? 501 : response.status });
    }

    const rawContent = payload.choices?.[0]?.message?.content ?? "";
    let parsed: { text?: unknown; note?: unknown } = {};

    try {
      parsed = JSON.parse(extractJsonObject(rawContent)) as { text?: unknown; note?: unknown };
    } catch {
      parsed = { text: rawContent, note: "OCR 返回了非 JSON 文本，已尽量提取。" };
    }

    return Response.json({
      text: normalizeRecognizedText(parsed.text),
      note: typeof parsed.note === "string" ? parsed.note : "",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.name === "AbortError"
            ? "OCR 超时，可以手动输入后验收。"
            : "OCR 识别失败，可以手动输入后验收。",
      },
      { status: 400 },
    );
  }
}

function windowlessTimeout(controller: AbortController, timeoutMs: number) {
  return setTimeout(() => controller.abort(), Math.min(Math.max(timeoutMs, 5_000), 45_000));
}
