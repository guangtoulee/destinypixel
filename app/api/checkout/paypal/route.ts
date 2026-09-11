import { claimReportForMember, isReportId } from "@/lib/commerce/access";
import { checkoutOffer, reportPriceCents } from "@/lib/commerce/config";
import { databaseRequest } from "@/lib/commerce/database";
import { assertMutation, readBody, privateJson, commerceError } from "@/lib/commerce/http";
import { createPaypalOrder, fetchPaypalOrder, PaymentUnavailableError } from "@/lib/commerce/paypal";
import { approvedPaypalUrl, validateOrderIdentity } from "@/lib/commerce/paypal-validation";
import { limitCommerceAction } from "@/lib/commerce/rate-limit";
import { reconcileOrder, type ReportOrder } from "@/lib/commerce/orders";
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(request:Request){
  try {
    assertMutation(request); const body=await readBody(request);
    if(!isReportId(body.reportId))return privateJson({error:"Invalid report."},400);
    const access=await claimReportForMember(body.reportId);
    if(!access?.member)return privateJson({error:"Sign in with access to this report."},401);
    const offer=checkoutOffer(access.member);
    if(!offer.available)return privateJson({error:"Paid reports are not available yet."},503);
    if(access.isFull)return privateJson({error:"This report is already unlocked.",alreadyUnlocked:true,reportId:body.reportId},409);
    await limitCommerceAction("checkout",access.member.id,20);
    let row=await databaseRequest<ReportOrder>("rpc/destiny_begin_checkout",{method:"POST",body:{p_report:body.reportId,p_member:access.member.id,p_amount:reportPriceCents(),p_currency:"USD",p_mode:offer.mode}});
    const origin=new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.destinypixel.com").origin;
    let order=row.paypal_order_id ? await fetchPaypalOrder(row.paypal_order_id) : await createPaypalOrder({localId:row.id,amount:(row.amount_cents/100).toFixed(2),origin});
    // A missing provider resource or network error is never evidence of nonpayment.
    // Only explicitly VOIDED old, uncaptured orders can be atomically replaced.
    if(order.status==="VOIDED"){
      const created=Date.parse(row.created_at);
      if(!row.paypal_order_id || row.status!=="created" || row.capture_id || order.purchase_units?.some(unit=>unit.payments?.captures?.length) || !Number.isFinite(created) || Date.now()-created<3*60*60*1000
        || !validateOrderIdentity(order,{localId:row.id,paypalId:row.paypal_order_id,amountCents:row.amount_cents,currency:row.currency,merchantId:process.env.PAYPAL_MERCHANT_ID}))throw new PaymentUnavailableError();
      row=await databaseRequest<ReportOrder>("rpc/destiny_replace_voided_checkout",{method:"POST",body:{p_order:row.id,p_member:access.member.id,p_paypal_order:row.paypal_order_id,p_amount:reportPriceCents(),p_currency:"USD",p_mode:offer.mode}});
      order=row.paypal_order_id ? await fetchPaypalOrder(row.paypal_order_id) : await createPaypalOrder({localId:row.id,amount:(row.amount_cents/100).toFixed(2),origin});
      if(order.status==="VOIDED")throw new PaymentUnavailableError();
    }
    if(!order.id)throw new PaymentUnavailableError();
    if(!row.paypal_order_id)await databaseRequest(`destiny_report_orders?id=eq.${row.id}&paypal_order_id=is.null`,{method:"PATCH",body:{paypal_order_id:order.id,updated_at:new Date().toISOString()}});
    if(order.status==="COMPLETED"){
      const status=await reconcileOrder({...row,paypal_order_id:row.paypal_order_id || order.id});
      return privateJson({error:status==="completed"?"This report is already unlocked.":"An earlier payment is still being checked.",alreadyUnlocked:status==="completed",reportId:body.reportId},409);
    }
    if(order.status==="APPROVED"){
      if(!validateOrderIdentity(order,{localId:row.id,paypalId:row.paypal_order_id || order.id,amountCents:row.amount_cents,currency:row.currency,merchantId:process.env.PAYPAL_MERCHANT_ID}))throw new PaymentUnavailableError();
      return privateJson({resumeOrderId:row.id});
    }
    const approvalUrl=approvedPaypalUrl(order,offer.mode==="sandbox");
    if(!approvalUrl)throw new PaymentUnavailableError();
    return privateJson({approvalUrl,orderId:row.id});
  }catch(error){return commerceError(error);}
}
