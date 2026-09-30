import { productCatalogResponse } from "@/lib/product-facts-server";
export const dynamic = "force-dynamic";
export function GET() { return productCatalogResponse("products"); }
