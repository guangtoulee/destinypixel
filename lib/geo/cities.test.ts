import assert from "node:assert/strict";
import test from "node:test";
import { cities, resolveCity } from "./cities";
import { calculateBaziEngine } from "../engines/bazi";
test("report city entry recognizes curated names and aliases, not arbitrary typed cities",()=>{
 assert.equal(cities.length,12);
 for(const text of ["深圳","杭州","乌鲁木齐","Unknown city","","  "]) assert.equal(resolveCity(text),undefined,text);
 for(const text of ["石家庄","Shijiazhuang","shijiazhuang-cn","Shijiazhuang, Hebei, China"]) assert.equal(resolveCity(text)?.id,"shijiazhuang-cn");
 assert.equal(resolveCity("上海")?.timezone,"Asia/Shanghai");
});
test("a recognized typed alias provides the actual city's coordinates to the local calculator",()=>{
 const city=resolveCity("上海")!;
 const result=calculateBaziEngine({name:"Fixture",gender:"female",locale:"en",birthDate:"1990-05-12",birthTime:"09:30",city});
 assert.ok(result.pillars.day);assert.ok(result.trueSolarTime.isoLike);
});
