import { currentMember, isReportId } from "@/lib/commerce/access";
import { assertMutation, readBody, privateJson, commerceError } from "@/lib/commerce/http";
import { findOwnedOrder, reconcileOrder, type ReportOrder } from "@/lib/commerce/orders";
import { limitCommerceAction } from "@/lib/commerce/rate-limit";
import { databaseRequest } from "@/lib/commerce/database";
import { paypalMode } from "@/lib/commerce/config";
export const runtime="nodejs";
export const maxDuration=120;
export async function POST(request:Request){
  try {
    assertMutation(request); const body=await readBody(request);
    const member=await currentMember();
    if(!member)return privateJson({error:"Please sign in to confirm your payment."},401);
    if(!isReportId(body.orderId))return privateJson({error:"Invalid order."},400);
    let row=await findOwnedOrder(body.orderId,member.id);
    if(!row)return privateJson({error:"Order unavailable."},404);
    if(row.mode!==paypalMode())return privateJson({error:"Payment verification is unavailable in this environment."},503);
    await limitCommerceAction("capture",member.id,60);
    row=await databaseRequest<ReportOrder>("rpc/destiny_prepare_capture",{method:"POST",body:{p_order:row.id,p_member:member.id}});
    if(["refunded","reversed","denied"].includes(row.status))return privateJson({error:"This payment did not grant report access. Check your order or contact support.",status:row.status,reportId:row.report_id},409);
    const status=await reconcileOrder(row,row.status==="pending");
    if(status!=="completed" && status!=="pending")return privateJson({error:"This payment did not grant report access. Check your order or contact support.",status,reportId:row.report_id},409);
    return privateJson({status,reportId:row.report_id});
  }catch(error){return commerceError(error);}
}
