import { claimReportForMember, isReportId } from "@/lib/commerce/access";
import { assertMutation, readBody, privateJson, commerceError } from "@/lib/commerce/http";
export const runtime="nodejs";
export async function POST(request:Request){
  try {
    assertMutation(request);
    const body=await readBody(request);
    if(!isReportId(body.reportId))return privateJson({error:"Invalid report."},400);
    if(!await claimReportForMember(body.reportId))return privateJson({error:"Sign in with access to this report."},403);
    return privateJson({reportId:body.reportId,saved:true});
  }catch(error){return commerceError(error);}
}
