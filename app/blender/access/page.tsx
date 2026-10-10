import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BLENDER_COOKIE_NAME, isBlenderAccessConfigured, verifyBlenderSession } from "@/lib/blender-access";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "访问口令 · 三维场馆" },
  robots: { index: false, follow: false },
};

const messages = new Map([
  ["invalid", "口令不正确，请重新输入。"],
  ["unavailable", "访问服务暂未就绪，请稍后再试。"],
  ["origin", "请在当前页面重新输入口令。"],
  ["rate", "尝试次数较多，请在 15 分钟后再试。"],
]);

export default async function BlenderAccessPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  if (verifyBlenderSession((await cookies()).get(BLENDER_COOKIE_NAME)?.value)) redirect("/blender");
  const configured = isBlenderAccessConfigured();
  const { error } = await searchParams;
  const message = !configured ? messages.get("unavailable") : typeof error === "string" ? messages.get(error) : undefined;
  return (
    <main className={styles.screen}>
      <div className={styles.orbit} aria-hidden="true" />
      <section className={styles.card} aria-labelledby="access-title">
        <div className={styles.brand}><span className={styles.mark} aria-hidden="true">D</span> DestinyPixel <span className={styles.brandDivider}>/</span> 3D SPACE</div>
        <div className={styles.eyebrow}>近代沉舰考古专题展</div>
        <h1 id="access-title">进入三维场馆</h1>
        <p className={styles.intro}>输入访问口令，浏览场馆模型与展陈细节。</p>
        <form action="/blender/auth" method="post" className={styles.form}>
          <label htmlFor="access-password">访问口令</label>
          <input id="access-password" type="password" name="password" autoComplete="current-password" required maxLength={256} placeholder="请输入访问口令" autoFocus aria-describedby={message ? "access-message" : undefined} disabled={!configured} />
          {message ? <p id="access-message" className={styles.message} role="alert">{message}</p> : null}
          <button type="submit" disabled={!configured}>进入场馆 <span aria-hidden="true">↗</span></button>
        </form>
        <div className={styles.footer}><span className={styles.dot} aria-hidden="true" /> 私密分享 · 可交互三维白模</div>
      </section>
    </main>
  );
}
