import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { GET, HEAD } from "../app/ocean/media/[...path]/route";
import { OCEAN_COOKIE_NAME, createOceanSession } from "./ocean-access";
import { OCEAN_BLOB_PREFIX, oceanByteRange, oceanMediaKey } from "./ocean-media";
const saved = Object.fromEntries(["BLENDER_ACCESS_PASSWORD", "BLENDER_SESSION_SECRET", "OCEAN_MEDIA_LOCAL_DIR", "VERCEL"].map(k=>[k,process.env[k]]));
const directory = mkdtempSync(path.join(tmpdir(), "ocean-media-test-"));
process.env.BLENDER_ACCESS_PASSWORD = "ocean-test-password";
process.env.BLENDER_SESSION_SECRET = "ocean-test-signing-secret-at-least-32-characters";
process.env.OCEAN_MEDIA_LOCAL_DIR = directory;
delete process.env.VERCEL;
writeFileSync(path.join(directory, "fixture.json"), '{"private":true}');
after(() => { for (const [k,v] of Object.entries(saved)) { if(v===undefined)delete process.env[k];else process.env[k]=v; } rmSync(directory,{recursive:true}); });
const context = { params: Promise.resolve({ path: ["fixture.json"] }) };
function request(authenticated:boolean) { return new NextRequest("https://www.destinypixel.com/ocean/media/fixture.json", { headers: authenticated ? { Cookie:`${OCEAN_COOKIE_NAME}=${createOceanSession()}` } : {} }); }
test("media route independently denies unauthorized GET and HEAD", async () => {
  for(const handler of [GET,HEAD]) {const r=await handler(request(false),context);assert.equal(r.status,401);assert.match(r.headers.get("cache-control")||"",/private, no-store/);}
});
test("authenticated media streams bytes with private headers and HEAD metadata", async () => {
  const get=await GET(request(true),context);assert.equal(get.status,200);assert.equal(await get.text(),'{"private":true}');assert.match(get.headers.get("content-type")||"",/application\/json/);assert.match(get.headers.get("cache-control")||"",/private, no-store/);
  const head=await HEAD(request(true),context);assert.equal(head.status,200);assert.equal(await head.text(),"");assert.equal(head.headers.get("content-length"),"16");assert.equal(head.headers.get("x-robots-tag"),"noindex, nofollow");
});
test("missing private media returns 404 and namespace traversal is rejected", async () => {
  const missing=await GET(request(true),{params:Promise.resolve({path:["missing.glb"]})});assert.equal(missing.status,404);
  for(const segments of [["..","secret"],["assets","bad","file.glb"],["../secret"],["%2e%2e"],["a\\b"],["a/b"],[""]])assert.equal(oceanMediaKey(segments),null);
  assert.equal(oceanMediaKey(["assets","a".repeat(64),"中文模型.glb"]),OCEAN_BLOB_PREFIX+"assets/"+"a".repeat(64)+"/中文模型.glb");
});

test("authenticated downloads support single ranges and reject unsatisfiable requests", async () => {
  const partial = new NextRequest(request(true), { headers: { Cookie: `${OCEAN_COOKIE_NAME}=${createOceanSession()}`, Range: "bytes=2-8" } });
  const response = await GET(partial, context);
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(response.headers.get("content-range"), "bytes 2-8/16");
  assert.equal(response.headers.get("content-length"), "7");
  assert.equal(await response.text(), 'private');
  const invalid = new NextRequest(request(true), { headers: { Cookie: `${OCEAN_COOKIE_NAME}=${createOceanSession()}`, Range: "bytes=20-" } });
  const rejected = await GET(invalid, context);
  assert.equal(rejected.status, 416);
  assert.equal(rejected.headers.get("content-range"), "bytes */16");
  assert.match(rejected.headers.get("cache-control") || "", /private, no-store/);
  const head = await HEAD(partial, context);
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), "16");
  const unauthorized = await GET(new NextRequest("https://www.destinypixel.com/ocean/media/fixture.json", { headers: { Range: "bytes=0-1" } }), context);
  assert.equal(unauthorized.status, 401);
});

test("range parsing handles suffixes, open ends and oversized ends without overflow", () => {
  assert.equal(oceanByteRange(null, 16), null);
  assert.deepEqual(oceanByteRange("bytes=-5", 16), { start: 11, end: 15 });
  assert.deepEqual(oceanByteRange("bytes=5-", 16), { start: 5, end: 15 });
  assert.deepEqual(oceanByteRange("bytes=5-999", 16), { start: 5, end: 15 });
  for (const value of ["bytes=20-", "bytes=-0", "bytes=8-2", "bytes=0-1,4-5", "bytes=9999999999999999999999-", "items=0-1", "bytes=-"]) assert.equal(oceanByteRange(value, 16), false);
});
