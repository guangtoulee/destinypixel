import { NextRequest, NextResponse } from "next/server";
import { get, head, BlobNotFoundError } from "@vercel/blob";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { OCEAN_COOKIE_NAME, OCEAN_PRIVATE_HEADERS, verifyOceanSession } from "@/lib/ocean-access";
import { oceanByteRange, oceanContentDisposition, oceanContentType } from "@/lib/ocean-media";
import { deepseaMediaKey } from "@/lib/deepsea-media";
import { diagnoseOceanStream } from "@/lib/ocean-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
type Context = { params: Promise<{ path: string[] }> };

async function serve(request: NextRequest, context: Context, headersOnly: boolean) {
  // Independent authorization keeps private storage protected even if proxy is bypassed.
  if (!verifyOceanSession(request.cookies.get(OCEAN_COOKIE_NAME)?.value)) return new NextResponse("需要访问口令。", { status: 401, headers: OCEAN_PRIVATE_HEADERS });
  const segments = (await context.params).path;
  const key = deepseaMediaKey(segments);
  if (!key) return new NextResponse("未找到文件。", { status: 404, headers: OCEAN_PRIVATE_HEADERS });
  const filename = segments.at(-1)!;
  const headers = new Headers(OCEAN_PRIVATE_HEADERS);
  headers.set("Content-Type", oceanContentType(filename));
  headers.set("Content-Disposition", oceanContentDisposition(filename));
  try {
    // Local review uses copied assets; deployments always read the durable private store.
    const local = !process.env.VERCEL && process.env.DEEPSEA_MEDIA_LOCAL_DIR;
    if (local) {
      const root = path.resolve(local), file = path.resolve(root, ...segments);
      if (!file.startsWith(root + path.sep)) return new NextResponse(null, { status: 404, headers });
      const metadata = await stat(file);
      if (!metadata.isFile()) return new NextResponse(null, { status: 404, headers });
      const range = headersOnly ? null : oceanByteRange(request.headers.get("range"), metadata.size);
      headers.set("Accept-Ranges", "bytes");
      if (range === false) {
        headers.set("Content-Range", `bytes */${metadata.size}`);
        return new NextResponse(null, { status: 416, headers });
      }
      headers.set("Content-Length", String(range ? range.end - range.start + 1 : metadata.size));
      if (range) headers.set("Content-Range", `bytes ${range.start}-${range.end}/${metadata.size}`);
      const stream = headersOnly ? null : Readable.toWeb(createReadStream(file, range || undefined)) as ReadableStream<Uint8Array>;
      return new NextResponse(stream, { status: range ? 206 : 200, headers });
    }
    if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) return new NextResponse("资源暂时无法读取。", { status: 503, headers });
    if (headersOnly) {
      const metadata = await head(key);
      headers.set("Content-Type", metadata.contentType || oceanContentType(filename));
      headers.set("Content-Length", String(metadata.size));
      headers.set("Accept-Ranges", "bytes");
      return new NextResponse(null, { headers });
    }
    const metadata = await head(key);
    const range = oceanByteRange(request.headers.get("range"), metadata.size);
    headers.set("Accept-Ranges", "bytes");
    if (range === false) {
      headers.set("Content-Range", `bytes */${metadata.size}`);
      return new NextResponse(null, { status: 416, headers });
    }
    const contentRange = range ? `bytes ${range.start}-${range.end}/${metadata.size}` : null;
    const result = await get(key, {
      access: "private", useCache: !key.endsWith("/manifest.json"),
      // The storage stream outlives this handler's incoming request lifecycle.
      abortSignal: AbortSignal.timeout(290_000),
      headers: { "Accept-Encoding": "identity", ...(range ? { Range: `bytes=${range.start}-${range.end}` } : {}) },
    });
    if (result?.statusCode !== 200) return new NextResponse("未找到文件。", { status: 404, headers });
    if (contentRange && result.headers.get("content-range") !== contentRange) {
      await result.stream.cancel();
      throw new Error("Private store did not honor the byte range");
    }
    headers.set("Content-Type", result.blob.contentType || oceanContentType(filename));
    // GET metadata may report zero after decoding; head supplies the actual object size.
    headers.set("Content-Length", String(range ? range.end - range.start + 1 : metadata.size));
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set("Cache-Control", "private, no-store, max-age=0, no-transform");
    return new NextResponse(diagnoseOceanStream(result.stream, request.signal), { status: range ? 206 : 200, headers });
  } catch (error) {
    if (error instanceof BlobNotFoundError || (error instanceof Error && "code" in error && error.code === "ENOENT")) return new NextResponse("未找到文件。", { status: 404, headers });
    console.error("[deepsea-media] Private storage read failed");
    return new NextResponse("资源暂时无法读取。", { status: 503, headers });
  }
}

export async function GET(request: NextRequest, context: Context) { return serve(request, context, false); }
export async function HEAD(request: NextRequest, context: Context) { return serve(request, context, true); }
