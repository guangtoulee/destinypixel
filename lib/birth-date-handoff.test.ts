import assert from "node:assert/strict";
import test from "node:test";
import { birthDateHandoffKey, offerBirthDate, takeBirthDate } from "./birth-date-handoff";
function storage() { const data = new Map<string,string>(); return { getItem: (key:string)=>data.get(key)??null, setItem:(key:string,value:string)=>{data.set(key,value);}, removeItem:(key:string)=>{data.delete(key);} }; }
test("birthday handoff is one-use and expires, with no name, city or public URL",()=>{
 const s=storage(); offerBirthDate(s,"1990-05-12",1000);
 assert.deepEqual(Object.keys(JSON.parse(s.getItem(birthDateHandoffKey)!)).sort(),["birthDate","expiresAt"]);
 assert.equal(takeBirthDate(s,1001),"1990-05-12"); assert.equal(takeBirthDate(s,1002),null);
 offerBirthDate(s,"1990-05-12",1000); assert.equal(takeBirthDate(s,1000+15*60*1000),null);
});
test("invalid, corrupt and inaccessible storage never prefill or break navigation",()=>{
 const s=storage(); for(const value of ["1990-02-30","x","1700-01-01","2101-01-01"]){offerBirthDate(s,value,1000);assert.equal(takeBirthDate(s,1000),null);}
 s.setItem(birthDateHandoffKey,"invalid json"); assert.equal(takeBirthDate(s),null); assert.equal(s.getItem(birthDateHandoffKey),null);
 const blocked={getItem(){throw new Error("blocked");},setItem(){throw new Error("blocked");},removeItem(){throw new Error("blocked");}};
 assert.doesNotThrow(()=>offerBirthDate(blocked,"1990-05-12"));assert.equal(takeBirthDate(blocked),null);
});
