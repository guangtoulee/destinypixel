import { cookies } from "next/headers";
import { destinyMemberSessionCookie, listSavedReportsForToken, saveDestinyReportForToken } from "@/lib/member-store";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { claimReportForMember, isReportId } from "@/lib/commerce/access";
import { assertMutation, readBody, privateJson, commerceError } from "@/lib/commerce/http";
export const runtime="nodejs";
export async function GET(){
  try{const token=(await cookies()).get(destinyMemberSessionCookie)?.value??"";if(!token)return privateJson({error:"Please sign in."},401);return privateJson(await listSavedReportsForToken(token));}catch(error){return commerceError(error);}
}
export async function POST(request:Request){
  try{
    assertMutation(request);const body=await readBody(request);
    const token=(await cookies()).get(destinyMemberSessionCookie)?.value??"";
    if(!token)return privateJson({error:"Please sign in."},401);
    if(!isReportId(body.reportId))return privateJson({error:"Invalid report."},400);
    const access=await claimReportForMember(body.reportId);
    if(!access?.report)return privateJson({error:"Report unavailable."},403);
    // Browser snapshots cannot grant ownership or premium access.
    return privateJson(await saveDestinyReportForToken({token,reportId:body.reportId,title:access.report.birth_record.name||"Birth report",locale:normalizeReportLocale(typeof body.locale==="string"?body.locale:"en"),snapshot:{version:2,reportId:body.reportId}}));
  }catch(error){return commerceError(error);}
}
