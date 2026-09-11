import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CirclePause } from "lucide-react";
import styles from "@/components/report-unlock.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Checkout closed | DestinyPixel" }, robots: { index: false, follow: false } };

export default async function PaypalCancelPage({ searchParams }: { searchParams?: Promise<{ locale?: string }> }) {
  const params = await searchParams;
  const zh = params?.locale === "zh";
  return <main className={styles.privatePage} lang={zh ? "zh-Hans" : "en"}><section className={styles.privateCard}><CirclePause size={30} aria-hidden="true" /><h1>{zh ? "结账已关闭。" : "Checkout closed."}</h1><p>{zh ? "你可以回到账号，继续查看基础报告。如果已经在 PayPal 批准付款，请先查看购买记录中的确认状态，再决定是否重新结账。" : "Return to your account to continue exploring your basic report. If you already approved a payment in PayPal, check its confirmed status in your purchases before starting another checkout."}</p><div className={styles.actions}><Link className={styles.primary} href={zh ? "/account?locale=zh" : "/account"}>{zh ? "返回我的账号" : "Back to your account"}<ArrowRight size={15} aria-hidden="true" /></Link><Link className={styles.textLink} href={zh ? "/?locale=zh" : "/"}>{zh ? "返回首页" : "Back home"}</Link></div></section></main>;
}
