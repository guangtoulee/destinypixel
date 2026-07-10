import {
  clearPromptAdminSessionCookie,
  isSameOriginRequest,
} from "@/lib/prompt-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const response = Response.json({ authenticated: false });
  response.headers.set("Set-Cookie", clearPromptAdminSessionCookie());
  response.headers.set("Cache-Control", "no-store");
  return response;
}
