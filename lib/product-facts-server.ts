import "server-only";
import { checkoutOffer } from "@/lib/commerce/config";
import { productCatalog } from "./product-facts";
/** Only the public offer crosses this boundary; no credentials or account state. */
export function currentProductCatalog() { return productCatalog(checkoutOffer()); }
export function productCatalogResponse(kind: "products" | "profile" | "agent" = "products") {
  const catalog = currentProductCatalog();
  const value = kind === "profile" ? { schemaVersion: catalog.schemaVersion, updatedAt: catalog.updatedAt, name: "DestinyPixel", officialUrl: catalog.officialUrl, documentationUrl: catalog.documentationUrl, catalogUrl: catalog.catalogUrl, policies: catalog.policies, productIds: catalog.products.map(p => p.id), readOnly: true } : catalog;
  return Response.json(value, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300", "X-Content-Type-Options": "nosniff", Link: `<${catalog.documentationUrl}>; rel="describedby"` } });
}
