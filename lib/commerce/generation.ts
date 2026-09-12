import "server-only";
import { getReportAccess, isReportId } from "./access";
import { databaseRequest } from "./database";
import { assertMutation, readBody, privateJson, commerceError } from "./http";
import { buildReportGenerationContext } from "./report-context";
import { buildNatalMessages, buildTransitMessages, fallbackNatalText, fallbackTransitText } from "@/lib/ai/streaming";
import { transitPromptMarkers } from "@/lib/report-timing";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { limitCommerceAction } from "./rate-limit";
import { completeReportContent, normalizeReportContent } from "./report-content";

const configuredModel = process.env.DEEPSEEK_MODEL?.trim();
const reportModel = !configuredModel || configuredModel === "deepseek-v4-flash" ? "deepseek-flash" : configuredModel;

const natalMarkers=["DAY_MASTER","OUTER_PERSONA","DEEP_SELF","CAREER","LOVE","GROWTH","HEALTH"];
type Lease={state:"ready"|"claimed"|"running"|"exhausted";id?:string;leaseToken?:string;content?:string};
function textResponse(content:string,fallback=false){return new Response(content,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"private, no-store","X-Report-Content":fallback?"fallback":"generated"}});}
export async function generateReport(request:Request,kind:"natal"|"transit"){
  let lease:Lease|undefined;
  try {
    assertMutation(request);const body=await readBody(request);
    if(!isReportId(body.reportId))return privateJson({error:"A report ID is required."},400);
    const access=await getReportAccess(body.reportId);
    if(!access.canRead || !access.report)return privateJson({error:"Report unavailable."},403);
    if(!access.isFull)return privateJson({error:"Unlock this report to read the full interpretation.",code:"REPORT_LOCKED"},402);
    const locale=normalizeReportLocale(typeof body.locale==="string"?body.locale:"en");
    const context=buildReportGenerationContext(access.report,locale);
    const year=kind==="transit"?new Date().getUTCFullYear():0;
    lease=await databaseRequest<Lease>("rpc/destiny_claim_generation",{method:"POST",body:{p_report:body.reportId,p_kind:kind,p_locale:locale,p_year:year}});
    if(lease.state==="ready"&&lease.content)return textResponse(lease.content);
    if(lease.state==="running")return privateJson({error:"This report is already being prepared.",code:"GENERATION_RUNNING"},409,{"Retry-After":"3"});
    if(lease.state!=="claimed"||!lease.id||!lease.leaseToken)return privateJson({error:"Generation is temporarily unavailable. Contact support with your order number.",code:"GENERATION_UNAVAILABLE"},503);
    await limitCommerceAction("generate",access.member?.id||body.reportId,30);
    const apiKey=process.env.DEEPSEEK_API_KEY;
    if(!apiKey){
      if(access.commerceEnabled)throw new Error("Generation unavailable");
      await finishLease(lease,"error",null);
      return textResponse(kind==="natal"?fallbackNatalText(context):fallbackTransitText(context),true);
    }
    const response=await fetch(process.env.DEEPSEEK_API_URL||"https://api.deepseek.com/v1/chat/completions",{method:"POST",cache:"no-store",signal:AbortSignal.timeout(70_000),headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:reportModel,thinking:{type:"disabled"},temperature:0.42,max_tokens:6200,stream:false,messages:kind==="natal"?buildNatalMessages(context):buildTransitMessages(context)})});
    if(!response.ok){
      console.error("Report provider request failed", { kind, status: response.status, model: reportModel });
      throw new Error("Generation unavailable");
    }
    const result=await response.json() as {choices?:Array<{finish_reason?:string;message?:{content?:string}}>};
    const markers=kind==="natal"?natalMarkers:[...transitPromptMarkers];
    const content=normalizeReportContent(result.choices?.[0]?.message?.content || "",markers);
    if(result.choices?.[0]?.finish_reason!=="stop" || !completeReportContent(content,markers)){
      console.error("Report provider content incomplete", { kind, model: reportModel, finishReason: result.choices?.[0]?.finish_reason, characters: content.length, validChapters: markers.filter(marker => completeReportContent(content, [marker])).length, expectedChapters: markers.length });
      throw new Error("Incomplete generation");
    }
    const latest=await getReportAccess(body.reportId);
    if(!latest.canRead || !latest.isFull)throw new Error("Access changed");
    if(!await finishLease(lease,"ready",content))throw new Error("Generation lease expired");
    if(kind==="natal")await databaseRequest(`reports?id=eq.${body.reportId}`,{method:"PATCH",body:{status:"ai_ready"}});
    return textResponse(content);
  }catch(error){
    if(lease?.state==="claimed")try{await finishLease(lease,"error",null);}catch{/* Expiry remains a bounded recovery path. */}
    return commerceError(error);
  }
}
async function finishLease(lease:Lease,status:"ready"|"error",content:string|null){
  if(!lease.id||!lease.leaseToken)return false;
  const rows=await databaseRequest<Array<{id:string}>>(`destiny_report_generations?id=eq.${lease.id}&lease_token=eq.${lease.leaseToken}&status=eq.running`,{method:"PATCH",body:{status,content,updated_at:new Date().toISOString()},prefer:"return=representation"});
  return rows.length===1;
}
