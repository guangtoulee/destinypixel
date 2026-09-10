export const runtime = "nodejs";

function getSupabaseConfig() {
  const url =
    process.env.XIAOSHOU_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.XIAOSHOU_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !/^https?:\/\//.test(url)) return null;
  return { url, key };
}

export async function GET() {
  const config = getSupabaseConfig();

  if (!config) {
    return Response.json(
      { ok: false, storage: "unconfigured", service: "packom-sales" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/destiny_members?select=id&limit=1`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
        cache: "no-store",
      },
    );

    return Response.json(
      {
        ok: response.ok,
        storage: response.ok ? "supabase" : "unavailable",
        service: "packom-sales",
      },
      { status: response.ok ? 200 : 503 },
    );
  } catch {
    return Response.json(
      { ok: false, storage: "unavailable", service: "packom-sales" },
      { status: 503 },
    );
  }
}
