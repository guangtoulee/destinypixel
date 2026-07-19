import {
  generateDirectorProject,
  type DirectorRequest,
} from "@/lib/ai/daoyan";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  let body: DirectorRequest;

  try {
    body = (await request.json()) as DirectorRequest;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  return Response.json(await generateDirectorProject(body), {
    headers: { "Cache-Control": "no-store" },
  });
}
