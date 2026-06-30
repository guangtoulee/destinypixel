import { cookies } from "next/headers";
import {
  destinyMemberSessionCookie,
  listSavedReportsForToken,
  saveDestinyReportForToken,
} from "@/lib/member-store";
import { normalizeReportLocale } from "@/lib/report-i18n";

export const runtime = "nodejs";

async function readSessionToken() {
  const cookieStore = await cookies();

  return cookieStore.get(destinyMemberSessionCookie)?.value ?? "";
}

export async function GET() {
  try {
    const token = await readSessionToken();
    if (!token) return Response.json({ error: "请先登录。" }, { status: 401 });

    return Response.json(await listSavedReportsForToken(token));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "读取报告失败。" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await readSessionToken();
    if (!token) return Response.json({ error: "请先登录。" }, { status: 401 });

    const body = (await request.json()) as {
      reportId?: string;
      title?: string;
      locale?: string;
      snapshot?: unknown;
    };

    if (!body.reportId) {
      return Response.json({ error: "缺少报告 ID。" }, { status: 400 });
    }

    const result = await saveDestinyReportForToken({
      token,
      reportId: body.reportId,
      title: body.title ?? "DestinyPixel Report",
      locale: normalizeReportLocale(body.locale ?? "en"),
      snapshot: body.snapshot,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "保存报告失败。" },
      { status: 400 },
    );
  }
}
