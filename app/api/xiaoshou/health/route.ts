export const runtime = "nodejs";

function getSupabaseConfig() {
  const url =
    process.env.XIAOSHOU_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.XIAOSHOU_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    !key ||
    !/^https?:\/\//.test(url) ||
    !/^[\x21-\x7e]+$/.test(key) ||
    key.length < 32
  ) {
    return null;
  }
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
    const schemaResponse = await fetch(`${config.url}/rest/v1/`, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    });
    const schema = schemaResponse.ok
      ? ((await schemaResponse.json()) as { paths?: Record<string, unknown> })
      : null;
    const schemaPaths = new Set(Object.keys(schema?.paths ?? {}));
    const migrationRpc = ["exec_sql", "run_sql", "execute_sql"].find((name) =>
      schemaPaths.has(`/rpc/${name}`),
    );
    const tableName = schemaPaths.has("/xs_users")
      ? "xs_users"
      : schemaPaths.has("/destiny_members")
        ? "destiny_members"
        : null;

    if (!schemaResponse.ok || !tableName) {
      return Response.json(
        {
          ok: false,
          storage: schemaResponse.ok ? "schema_required" : "unavailable",
          service: "packom-sales",
          upstreamStatus: schemaResponse.status,
          migrationRpc: migrationRpc ?? null,
        },
        { status: 503 },
      );
    }

    const response = await fetch(
      `${config.url}/rest/v1/${tableName}?select=id&limit=1`,
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
        storage: response.ok
          ? tableName === "xs_users"
            ? "supabase"
            : "schema_required"
          : "unavailable",
        service: "packom-sales",
        upstreamStatus: response.status,
        migrationRpc: migrationRpc ?? null,
      },
      {
        status: response.ok && tableName === "xs_users" ? 200 : 503,
      },
    );
  } catch {
    return Response.json(
      { ok: false, storage: "unavailable", service: "packom-sales" },
      { status: 503 },
    );
  }
}
