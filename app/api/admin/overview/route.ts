import { currentMember } from "@/lib/commerce/access";
import { databaseRequest } from "@/lib/commerce/database";
import { checkoutOffer, isAdminMember, paidReportsEnabled, paypalConfigured, paypalMode } from "@/lib/commerce/config";
import { getMemberAuthReadiness } from "@/lib/member-store";
import { privateJson, commerceError } from "@/lib/commerce/http";
import { journalArticles, journalHref } from "@/lib/journal";
export const runtime="nodejs";
export async function GET() {
  try {
    const member = await currentMember();
    if (!member) return privateJson({error:"Please sign in."},401);
    if (!isAdminMember(member)) return privateJson({error:"Administrator access required."},403);
    const [stats, recent] = await Promise.all([
      databaseRequest<{members:number;reports:number;paidOrders:number;pendingOrders:number;revenue:Array<{currency:string;amount:string}>}>("rpc/destiny_admin_counts",{method:"POST",body:{}}),
      databaseRequest<Array<{id:string;report_id:string;status:string;amount_cents:number;currency:string;mode:string;created_at:string;destiny_members:{email:string}}>>("destiny_report_orders?select=id,report_id,status,amount_cents,currency,mode,created_at,destiny_members(email)&order=created_at.desc&limit=50"),
    ]);
    return privateJson({counts:{members:stats.members,reports:stats.reports,paidOrders:stats.paidOrders,pendingOrders:stats.pendingOrders},revenue:stats.revenue,
      recentOrders:recent.map(o=>({id:o.id,reportId:o.report_id,status:o.status,amount:(o.amount_cents/100).toFixed(2),currency:o.currency,mode:o.mode,createdAt:o.created_at,memberEmail:o.destiny_members?.email ?? ""})),
      readiness:{database:true,paypal:paypalConfigured(),paypalMode:paypalMode(),emailRecovery:getMemberAuthReadiness().passwordResetAvailable,paidReportsEnabled:paidReportsEnabled()&&checkoutOffer(member).available},
      articles:journalArticles.map(a=>({title:a.translations.en.title,url:journalHref("en",a.slug),date:a.publishedAt})),
    });
  }catch(error){return commerceError(error);}
}
