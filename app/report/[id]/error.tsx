"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CircleAlert } from "lucide-react";
import styles from "@/components/report-unlock.module.css";

function ErrorCard({ reset, zh }: { reset: () => void; zh: boolean }) {
  return <main className={styles.privatePage} lang={zh ? "zh-Hans" : "en"}><section className={styles.privateCard} role="alert"><CircleAlert size={28} aria-hidden="true" /><h1>{zh ? "报告服务暂时不可用。" : "The report service is temporarily unavailable."}</h1><p>{zh ? "这次未能读取报告，请稍后重试，或从账号页面重新打开。" : "We could not load the report this time. Try again shortly, or reopen it from your account."}</p><div className={styles.actions}><button type="button" className={styles.primary} onClick={reset}>{zh ? "重新加载" : "Try again"}</button><Link className={styles.textLink} href={zh ? "/account?locale=zh" : "/account"}>{zh ? "我的账号" : "Your account"}<ArrowRight size={14} aria-hidden="true" /></Link></div></section></main>;
}
function LocalizedError({ reset }: { reset: () => void }) {
  const locale = useSearchParams().get("locale");
  return <ErrorCard reset={reset} zh={locale === "zh" || locale === "zh-TW"} />;
}
export default function ReportError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <Suspense fallback={<ErrorCard reset={reset} zh={false} />}><LocalizedError reset={reset} /></Suspense>;
}
