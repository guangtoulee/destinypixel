import { test } from "node:test";
import assert from "node:assert/strict";
import { productCatalog, productFactsLocales, productFactsAlternates } from "./product-facts";
import robots from "@/app/robots";
test("crawler exceptions only open the two public JSON catalogs, not private APIs", () => {
  const rule = (robots().rules as Array<{allow:string[];disallow:string[]}>)[0];
  assert.deepEqual(rule.allow, ["/","/api/products.json$","/api/ai-profile.json$"]);
  assert.ok(rule.disallow.includes("/api/") && rule.disallow.includes("/report/") && rule.disallow.includes("/account"));
});
test("public catalog has four complete language editions and only main-site tools", () => {
  const c = productCatalog({ available: false, price: "6.99", currency:"USD",mode:"disabled" });
  assert.equal(c.products.length, 11);
  assert.equal(c.readOnly, true);
  assert.equal(Object.keys(productFactsAlternates()).length, 5);
  for (const p of c.products) for (const l of productFactsLocales) {
    const t = p.translations[l];
    for (const key of ["name","purpose","inputs","ai","saving","url"]) assert.ok(t[key as keyof typeof t]);
    assert.equal(new URL(t.url).hostname, "www.destinypixel.com");
  }
  assert.ok(!c.products.some(p => /prompt|english|script/.test(p.id)));
  assert.deepEqual(c.fortuneSticks.collections.map(c=>c.entries), [100,100,60,60,100]);
  assert.equal(c.compatibility.missingTimeDefault, null);
  assert.equal(c.compatibility.dateScoreUsesPlanetaryAspects, false);
});
test("only an available live offer exposes a price; sandbox is never advertised as public checkout", () => {
  for (const mode of ["disabled","sandbox","live"] as const) for (const available of [false,true]) {
    const c = productCatalog({ available, mode, price:"9.99",currency:"USD" });
    const pricing = c.products.find(p=>p.id==="birth-map")!.pricing;
    assert.ok("completeReport" in pricing);
    assert.equal(pricing.completeReport.available, mode==="live" && available);
    assert.equal(pricing.completeReport.amount, mode==="live" && available ? "9.99" : null);
    assert.ok(!JSON.stringify(c).includes("SUPABASE") && !JSON.stringify(c).includes("API_KEY"));
  }
});
