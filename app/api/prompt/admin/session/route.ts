import { readPromptAdminSession } from "@/lib/prompt-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = readPromptAdminSession(request);
  return Response.json(
    {
      authenticated: Boolean(session),
      username: session?.username,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
