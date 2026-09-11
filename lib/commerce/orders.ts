import "server-only";
import { databaseRequest } from "./database";
import { paypalMode } from "./config";
import { fetchPaypalOrder, fetchPaypalCapture, capturePaypalOrder, PaymentUnavailableError } from "./paypal";
import { paymentAmountCents, validateCompletedOrder, type PaypalCapture, type PaypalOrder } from "./paypal-validation";
export type ReportOrder = {id:string;report_id:string;member_id:string;paypal_order_id:string|null;capture_id:string|null;amount_cents:number;currency:string;mode:"sandbox"|"live";status:string;created_at:string};
export async function findOwnedOrder(id:string,memberId:string){
  const [row]=await databaseRequest<ReportOrder[]>(`destiny_report_orders?id=eq.${id}&member_id=eq.${memberId}&limit=1`);
  return row ?? null;
}
function assertOrderIdentity(order:PaypalOrder,row:ReportOrder){
  const unit=order.purchase_units?.[0];
  if(row.mode!==paypalMode() || order.id!==row.paypal_order_id || order.purchase_units?.length!==1 || unit?.custom_id!==row.id || unit.amount?.currency_code!==row.currency || paymentAmountCents(unit.amount?.value)!==row.amount_cents || (process.env.PAYPAL_MERCHANT_ID && unit.payee?.merchant_id!==process.env.PAYPAL_MERCHANT_ID)) throw new PaymentUnavailableError();
}
function assertCaptureIdentity(capture:PaypalCapture,row:ReportOrder){
  if(!capture.id || (row.capture_id && capture.id!==row.capture_id) || capture.amount?.currency_code!==row.currency || paymentAmountCents(capture.amount?.value)!==row.amount_cents || (capture.supplementary_data?.related_ids?.order_id && capture.supplementary_data.related_ids.order_id!==row.paypal_order_id))throw new PaymentUnavailableError();
}
export async function applyCapture(row:ReportOrder,order:PaypalOrder,capture:PaypalCapture,event?:{id:string;type:string}){
  assertOrderIdentity(order,row); assertCaptureIdentity(capture,row);
  let state:string;
  if(event?.type==="PAYMENT.CAPTURE.REFUNDED" || capture.status==="REFUNDED" || capture.status==="PARTIALLY_REFUNDED")state="refunded";
  else if(event?.type==="PAYMENT.CAPTURE.REVERSED")state="reversed";
  else if(event?.type==="PAYMENT.CAPTURE.DENIED" || capture.status==="DENIED" || capture.status==="DECLINED" || capture.status==="FAILED")state="denied";
  else if(capture.status==="PENDING")state="pending";
  else if(capture.status==="COMPLETED") {
    const checked=validateCompletedOrder(order,{localId:row.id,paypalId:row.paypal_order_id!,amountCents:row.amount_cents,currency:row.currency,merchantId:process.env.PAYPAL_MERCHANT_ID});
    if(!checked || checked.captureId!==capture.id)throw new PaymentUnavailableError();
    state="completed";
  }else throw new PaymentUnavailableError();
  const full=await databaseRequest<boolean>("rpc/destiny_apply_payment",{method:"POST",body:{p_order:row.id,p_paypal_order:row.paypal_order_id,p_capture:capture.id,p_amount:row.amount_cents,p_currency:row.currency,p_state:state,p_event_id:event?.id ?? null,p_event_type:event?.type ?? null}});
  return full ? "completed" : state==="completed" ? "revoked" : state;
}
export async function reconcileOrder(row:ReportOrder,allowCapture=false){
  if(!row.paypal_order_id || row.mode!==paypalMode())throw new PaymentUnavailableError();
  let order=await fetchPaypalOrder(row.paypal_order_id);
  assertOrderIdentity(order,row);
  if(allowCapture && order.status==="APPROVED"){
    try { order=await capturePaypalOrder(row.paypal_order_id,row.id); }
    catch { order=await fetchPaypalOrder(row.paypal_order_id); }
    assertOrderIdentity(order,row);
  }
  const captures=order.purchase_units?.[0]?.payments?.captures;
  if(!captures?.length)return "pending";
  if(captures.length!==1 || !captures[0].id)throw new PaymentUnavailableError();
  // Capture details catch refunds even before the webhook arrives.
  const capture=await fetchPaypalCapture(captures[0].id);
  return applyCapture(row,order,capture);
}
