import assert from "node:assert/strict";
import test from "node:test";
import { birthDateHandoffKey, offerBirthDate, takeBirthDate, birthDateDraftKey, resumeBirthDate, updateBirthDateDraft, clearBirthDateDraft } from "./birth-date-handoff";
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

test("locale draft consumes handoff, survives navigation and edits without extending expiry",()=>{
 const s=storage(); offerBirthDate(s,"1990-01-01",1000);
 const expected={birthDate:"1990-01-01",expiresAt:901000};
 assert.deepEqual(resumeBirthDate(s,1001),expected);
 assert.equal(s.getItem(birthDateHandoffKey),null);
 for(const now of [2000,3000,4000,5000,6000])assert.deepEqual(resumeBirthDate(s,now),expected);
 updateBirthDateDraft(s,"1991-02-03",7000);
 assert.deepEqual(resumeBirthDate(s,8000),{...expected,birthDate:"1991-02-03"});
 assert.deepEqual(Object.keys(JSON.parse(s.getItem(birthDateDraftKey)!)).sort(),["birthDate","expiresAt"]);
 assert.equal(resumeBirthDate(s,901000),null);assert.equal(s.getItem(birthDateDraftKey),null);
});
test("draft clears on date removal or submission and never stores ordinary form input",()=>{
 const s=storage();updateBirthDateDraft(s,"1990-01-01",1000);assert.equal(s.getItem(birthDateDraftKey),null);
 offerBirthDate(s,"1990-01-01",1000);resumeBirthDate(s,1001);updateBirthDateDraft(s,"",1002);
 assert.equal(resumeBirthDate(s,1003),null);
 offerBirthDate(s,"1990-01-01",1000);resumeBirthDate(s,1001);clearBirthDateDraft(s);
 assert.equal(resumeBirthDate(s,1002),null);
 s.setItem(birthDateDraftKey,"broken");assert.equal(resumeBirthDate(s),null);assert.equal(s.getItem(birthDateDraftKey),null);
});
