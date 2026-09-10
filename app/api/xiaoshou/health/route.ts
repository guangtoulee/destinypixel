import { storageHealth } from "@/lib/xiaoshou/store";

export const runtime = "nodejs";

export async function GET() {
  const health = await storageHealth();
  return Response.json(
    {
      ok: health.ok,
      service: "packom-sales",
      storage: health.state,
      version: "2.0.0",
    },
    { status: health.ok ? 200 : 503 },
  );
}
