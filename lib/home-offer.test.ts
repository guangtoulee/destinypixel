import assert from "node:assert/strict";
import test from "node:test";
import { homeOffers, homeOfferCopy } from "./home-offer";
import { productCatalog } from "./product-facts";

test("homepage distinguishes the free preview from the available complete report in every language", () => {
  const catalog = productCatalog({ available: true, price: "6.99", mode: "live", currency: "USD" });
  const pricing = catalog.products.find(p => p.id === "birth-map")!.pricing;
  assert.ok("completeReport" in pricing);
  for (const locale of ["en", "zh", "zh-TW", "ru"] as const) {
    const offers = homeOffers(pricing.completeReport, locale, "https://www.destinypixel.com/#report");
    assert.deepEqual(offers.map(o => o.price), ["0", "6.99"]);
    assert.notEqual(offers[0].name, offers[1].name);
    assert.ok(homeOfferCopy(locale).note.replace("{price}", offers[1].price).includes("6.99"));
  }
});

test("disabled and sandbox checkout never produce a purchasable paid homepage offer", () => {
  for (const mode of ["disabled", "sandbox"] as const) {
    const pricing = productCatalog({ available: true, price: "6.99", mode, currency: "USD" }).products.find(p => p.id === "birth-map")!.pricing;
    assert.ok("completeReport" in pricing);
    assert.deepEqual(homeOffers(pricing.completeReport, "en", "https://www.destinypixel.com/#report").map(o => o.price), ["0"]);
  }
});
