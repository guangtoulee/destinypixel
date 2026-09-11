import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/service-info.module.css";
export const metadata:Metadata={title:{absolute:"Report service guide | DestinyPixel"},description:"What a DestinyPixel basic or full report includes, payment confirmation and support.",alternates:{canonical:"/service"}};
export default async function ServicePage({searchParams}:{searchParams?:Promise<{locale?:string}>}){
  const zh=(await searchParams)?.locale==="zh";
  const sections=zh?[
    ["免费基础报告","基础版展示出生图谱、四柱与五行结构，并提供简短阅读提示。图腾与主站手串内容可以继续单独探索。"],
    ["完整报告如何购买","完整报告按份一次购买，没有自动续订。开放购买时，报告页面会明确显示美元价格和所含章节；只有 PayPal 确认成功收款后才解锁。未开放购买时不收取费用。微信支付尚未接入。"],
    ["一份报告包含什么","完整解读围绕日主、外在表现、内在自我、事业、关系、成长与生活节奏七个主题，并包含时运阅读。它结合传统象征体系和 AI 生成文字，用于文化体验与自我反思，不是对未来结果的保证。"],
    ["保存、生成和重试","请用自己的账号保存报告。已生成的正文会保存在服务器，之后可从账号中心再次打开。若生成失败，可重试或提供订单号联系支持；页面不会把失败的付费解读替换成已完成的 AI 报告。不要重复付款解决生成失败。"],
    ["付款问题与退款联系","取消或待确认的付款不会解锁报告。对于重复付款、无法交付或其他订单问题，请联系 anyulee@foxmail.com，并提供账号邮箱和订单号，不要发送银行卡信息。退款或支付撤销确认后，对应订单的完整报告访问将撤销。"],
    ["计算范围与使用边界","当前出生日期计算支持 1800–2100 年。采用历史时区规则，八字年、月柱按立春与节令切换，日时柱采用当地近似太阳时；大运显示包含近似取整。出生时间不确定会影响结果。请勿用报告替代医疗、法律、投资或其他专业判断。"],
  ]:[
    ["Free basic reports","The basic report shows your birth map, Four Pillars and element balance, with a short reading prompt. Birth Totem and the crystal atelier remain available to explore separately."],
    ["How full reports are purchased","Each full report is a one-time purchase with no automatic renewal. When checkout is available, the report page shows its USD price and included content before you choose PayPal. Access unlocks only after the payment is confirmed. Unavailable checkout does not charge you. WeChat Pay is not integrated yet."],
    ["What a full report includes","A full interpretation covers seven themes: day master, outer persona, inner self, career, relationships, growth and daily wellbeing, alongside timing readings. It combines traditional symbolic systems with AI-generated text for cultural exploration and personal reflection; it does not guarantee future outcomes."],
    ["Saving, generation and retries","Save reports to your own account. Generated text is stored on the server for later reading. If generation fails, retry or contact support with your order number. A failed paid generation is not presented as a completed AI report. Do not purchase again to resolve a generation failure."],
    ["Payment issues and refund support","Cancelled or pending payments do not unlock reports. For duplicate charges, delivery failures or other order issues, contact anyulee@foxmail.com with your account email and order number. Do not send card information. Once a refund or reversal is confirmed, access granted by that order is revoked."],
    ["Calculation scope and interpretation","The calculation supports birth years 1800–2100 and historical time-zone rules. Bazi year and month use exact LiChun and solar-term boundaries; day and hour use approximate local solar time. Luck-cycle display includes rounding. Uncertain birth times affect results. Reports do not replace medical, legal, investment or other professional advice."],
  ];
  return <main className={styles.shell}><div className={styles.container}><Link href={zh?"/?locale=zh":"/"}>← DestinyPixel</Link><header className={styles.hero}><p>DESTINYPIXEL</p><h1>{zh?"报告与购买说明":"Your report, clearly explained"}</h1></header>{sections.map(([title,body])=><section key={title} className={styles.card}><h2>{title}</h2><p>{body}</p></section>)}<p><Link href={zh?"/privacy?locale=zh":"/privacy"}>{zh?"数据与隐私说明":"Data and privacy"}</Link> · <Link href={zh?"/account?locale=zh":"/account"}>{zh?"我的账号":"Your account"}</Link></p></div></main>;
}
