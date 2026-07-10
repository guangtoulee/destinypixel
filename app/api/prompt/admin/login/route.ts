import {
  createPromptAdminSession,
  isSameOriginRequest,
  promptAdminSessionCookie,
  verifyPromptAdminCredentials,
} from "@/lib/prompt-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyPromptAdminCredentials(username, password)) {
    return Response.json({ error: "用户名或密码不正确。" }, { status: 401 });
  }

  const response = Response.json({ authenticated: true, username: username.trim() });
  response.headers.set(
    "Set-Cookie",
    promptAdminSessionCookie(createPromptAdminSession()),
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
