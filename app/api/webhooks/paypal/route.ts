import { databaseRequest } from "@/lib/commerce/database";
import { privateJson, commerceError } from "@/lib/commerce/http";
import { verifyPaypalWebhook, fetchPaypalCapture, fetchPaypalOrder, PaymentUnavailableError } from "@/lib/commerce/paypal";
import { applyCapture, type ReportOrder } from "@/lib/commerce/orders";
import { paypalMode } from "@/lib/commerce/config";
export const runtime="nodejs";
export const maxDuration=120;
type PaymentEvent={id?:string;event_type?:string;resource?:{id?:string;supplementary_data?:{related_ids?:{capture_id?:string;order_id?:string}};links?:Array<{rel:string;href:string}>}};
export async function POST(request:Request){
  try {
    // Stream a bounded body; a webhook has no browser Origin or member cookie.
    const reader=request.body?.getReader(); if(!reader)return privateJson({error:"Empty body."},400);
    const chunks:Uint8Array[]=[];let length=0;
    while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>128*1024){await reader.cancel();return privateJson({error:"Body too large."},413);}chunks.push(value);}
    let event:PaymentEvent;
    try{event=JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{return privateJson({error:"Invalid JSON."},400);}
    if(!await verifyPaypalWebhook(request,event))return privateJson({error:"Invalid signature."},400);
    if(!event.id || event.id.length>200 || !event.event_type)return privateJson({error:"Invalid event."},400);
    if(!["PAYMENT.CAPTURE.COMPLETED","PAYMENT.CAPTURE.PENDING","PAYMENT.CAPTURE.DENIED","PAYMENT.CAPTURE.REFUNDED","PAYMENT.CAPTURE.REVERSED"].includes(event.event_type))return privateJson({received:true});
    let captureId=event.event_type==="PAYMENT.CAPTURE.REFUNDED" ? event.resource?.supplementary_data?.related_ids?.capture_id : event.resource?.id;
    if(!captureId){const up=event.resource?.links?.find(l=>l.rel==="up");if(up){const url=new URL(up.href);if(["api-m.paypal.com","api-m.sandbox.paypal.com","api.paypal.com","api.sandbox.paypal.com"].includes(url.hostname)&&url.protocol==="https:")captureId=url.pathname.match(/^\/v2\/payments\/captures\/([A-Za-z0-9]+)$/)?.[1];}}
    if(!captureId || !/^[A-Za-z0-9]{1,100}$/.test(captureId))throw new PaymentUnavailableError();
    const capture=await fetchPaypalCapture(captureId);
    const paypalId=capture.supplementary_data?.related_ids?.order_id;
    const [row]=await databaseRequest<ReportOrder[]>(`destiny_report_orders?${paypalId&&/^[A-Za-z0-9]{1,100}$/.test(paypalId)?`paypal_order_id=eq.${paypalId}`:`capture_id=eq.${captureId}`}&mode=eq.${paypalMode()}&limit=1`);
    // Valid PayPal events may belong to another product using this account.
    if(!row)return privateJson({received:true});
    if(!row.paypal_order_id)throw new PaymentUnavailableError();
    const order=await fetchPaypalOrder(row.paypal_order_id);
    await applyCapture(row,order,capture,{id:event.id,type:event.event_type});
    return privateJson({received:true});
  }catch(error){return commerceError(error);}
}
