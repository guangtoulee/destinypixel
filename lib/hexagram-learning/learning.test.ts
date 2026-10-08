import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { castOracle } from "@/lib/oracle/cast";
import { kingWenFromBits,kingWenFromCast,hexagramNumber,hexagramSymbol } from "./identity";
import { hexagramHref } from "./paths";
import { hexagramMetadata,hexagramSitemap } from "./metadata";
import { loadHexagramArticle } from "./content";
import identities from "@/content/hexagrams/identities.verified.json";
import manifest from "@/content/hexagrams/provenance.json";
import { journalLocales } from "@/lib/journal-locales";
test("all 64 verified bottom-up patterns uniquely resolve to their actual King Wen identity",()=>{
 const patterns=new Set<string>(),numbers=new Set<number>();
 for(const h of identities.hexagrams){const n=kingWenFromBits(h.linesBottomUp);assert.equal(n,h.kingWenNumber);assert.equal(kingWenFromCast(h.linesBottomUp.map(bit=>({yang:bit===1}))),n);assert.equal(hexagramNumber(h.id),n);assert.equal(hexagramSymbol(n!),h.unicode);patterns.add(h.linesBottomUp.join(""));numbers.add(n!);}
 assert.equal(patterns.size,64);assert.equal(numbers.size,64);
 for(const [bits,n] of [["111000",11],["000111",12],["101010",63],["010101",64]] as const)assert.equal(kingWenFromBits([...bits].map(Number)),n);
 for(const bits of [[],[1,1,1],[-1,0,1,0,1,0],[1,1,1,1,1,2]])assert.equal(kingWenFromBits(bits),undefined);
 for(const slug of ["hexagram-00","hexagram-65","hexagram-1","hexagram-11-extra","constructor"])assert.equal(hexagramNumber(slug),undefined);
});
test("all 256 complete approved texts load only for their correct identity and locale",async()=>{
 for(const locale of journalLocales)for(const h of identities.hexagrams){const a=await loadHexagramArticle(h.id,locale);assert.ok(a);assert.equal(a.locale,locale);assert.equal(a.id,h.id);assert.deepEqual(a.linesBottomUp,h.linesBottomUp);assert.equal(a.lineNotes.length,6);const key=`${locale}/${h.id}` as keyof typeof manifest.articleMarkdownSha256;assert.equal(createHash('sha256').update(a.articleMarkdown).digest('hex'),manifest.articleMarkdownSha256[key]);}
 for(const id of ["constructor","__proto__","../hexagram-01","hexagram-65"])assert.equal(await loadHexagramArticle(id,"en"),undefined);
});
test("directory and 256 editions have reciprocal canonical URLs and one brand suffix",()=>{
 const routes=hexagramSitemap();assert.equal(routes.length,260);assert.equal(new Set(routes.map(x=>x.url)).size,260);
 for(const n of [undefined,...identities.hexagrams.map(h=>h.kingWenNumber)])for(const locale of journalLocales){const m=hexagramMetadata(locale,n);assert.equal(m.alternates?.canonical,hexagramHref(n,locale));assert.equal(Object.keys(m.alternates?.languages??{}).length,5);assert.match(JSON.stringify(m.title),/ \| DestinyPixel/);}
 for(const n of [0,65,1.5,NaN])assert.equal(hexagramHref(n,"en"),undefined);
});
test("learning lookup preserves released cast seeds, six-line values and Tarot draws",()=>{
 const fixtures=[{question:"How can I approach this?",seed:1596815601,lines:[7,8,7,8,6,7],tarot:["tower","four-of-cups","star"]},{question:"我该如何准备？",seed:3515122148,lines:[8,7,7,8,7,7],tarot:["two-of-swords","wheel","two-of-cups"]},{question:"Как подготовиться?",seed:822001832,lines:[7,8,7,8,7,7],tarot:["wheel","star","knight-of-pentacles"]}];
 for(const f of fixtures){const a=castOracle({question:f.question,questionTime:"2026-10-07T12:00:00Z",birthDate:"1990-01-15",domain:"work"});assert.equal(a.seed,f.seed);assert.deepEqual(a.lines.map(l=>l.value),f.lines);assert.deepEqual(a.tarot.map(t=>t.id),f.tarot);assert.ok(kingWenFromCast(a.lines));}
});
