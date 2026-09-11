import { generateReport } from "@/lib/commerce/generation";
export const runtime="nodejs";
export const maxDuration=120;
export async function POST(request:Request){return generateReport(request,"transit");}
