import { NextRequest, NextResponse } from "next/server";
import { get, head, BlobNotFoundError } from "@vercel/blob";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { OCEAN_COOKIE_NAME, OCEAN_PRIVATE_HEADERS, verifyOceanSession } from "@/lib/ocean-access";
import { oceanContentDisposition, oceanContentType, oceanMediaKey } from "@/lib/ocean-media";
import { diagnoseOceanStream } from "@/lib/ocean-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
type Context = { params: Promise<{ path: string[] }> };

async function serve(request: NextRequest, context: Context, headersOnly: boolean) {
  // Independent authorization keeps private storage protected even if proxy is bypassed.
  if (!verifyOceanSession(request.cookies.get(OCEAN_COOKIE_NAME)?.value)) return new NextResponse("需要访问口令。", { status: 401, headers: OCEAN_PRIVATE_HEADERS });
  const segments = (await context.params).path;
  const key = oceanMediaKey(segments);
  if (!key) return new NextResponse("未找到文件。", { status: 404, headers: OCEAN_PRIVATE_HEADERS });
  const filename = segments.at(-1)!;
  const headers = new Headers(OCEAN_PRIVATE_HEADERS);
  headers.set("Content-Type", oceanContentType(filename));
  headers.set("Content-Disposition", oceanContentDisposition(filename));
  try {
    // Local review uses copied assets; deployments always read the durable private store.
    const local = !process.env.VERCEL && process.env.OCEAN_MEDIA_LOCAL_DIR;
    if (local) {
      const root = path.resolve(local), file = path.resolve(root, ...segments);
      if (!file.startsWith(root + path.sep)) return new NextResponse(null, { status: 404, headers });
      const metadata = await stat(file);
      if (!metadata.isFile()) return new NextResponse(null, { status: 404, headers });
      headers.set("Content-Length", String(metadata.size));
      const stream = headersOnly ? null : Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>;
      return new NextResponse(stream, { headers });
    }
    if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) return new NextResponse("资源暂时无法读取。", { status: 503, headers });
    if (headersOnly) {
      const metadata = await head(key);
      headers.set("Content-Type", metadata.contentType || oceanContentType(filename));
      headers.set("Content-Length", String(metadata.size));
      return new NextResponse(null, { headers });
    }
    const metadata = await head(key);
    const result = await get(key, {
      access: "private", useCache: !key.endsWith("/manifest.json"),
      // The storage stream outlives this handler's incoming request lifecycle.
      abortSignal: AbortSignal.timeout(290_000), headers: { "Accept-Encoding": "identity" },
    });
    if (result?.statusCode !== 200) return new NextResponse("未找到文件。", { status: 404, headers });
    headers.set("Content-Type", result.blob.contentType || oceanContentType(filename));
    // GET metadata may report zero after decoding; head supplies the actual object size.
    headers.set("Content-Length", String(metadata.size));
    headers.set("Cache-Control", "private, no-store, max-age=0, no-transform");
    return new NextResponse(diagnoseOceanStream(result.stream, request.signal), { headers });
  } catch (error) {
    if (error instanceof BlobNotFoundError || (error instanceof Error && "code" in error && error.code === "ENOENT")) return new NextResponse("未找到文件。", { status: 404, headers });
    console.error("[ocean-media] Private storage read failed");
    return new NextResponse("资源暂时无法读取。", { status: 503, headers });
  }
}

export async function GET(request: NextRequest, context: Context) { return serve(request, context, false); }
export async function HEAD(request: NextRequest, context: Context) { return serve(request, context, true); }
