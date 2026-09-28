import { destinySupportEmail } from "@/lib/support-contact";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/service-info.module.css";
export const metadata:Metadata={title:{absolute:"Data and privacy | DestinyPixel"},description:"How DestinyPixel handles birth details, account access, reports and payment records.",alternates:{canonical:"/privacy"}};
export default async function PrivacyPage({searchParams}:{searchParams?:Promise<{locale?:string}>}){
  const zh=(await searchParams)?.locale==="zh";
  const sections=zh?[
    ["排盘与报告","姓名或昵称、出生日期、时间与城市用于建立报告。请只填写你有权提供的信息，无需上传身份证、出生证明或详细地址。保存的报告与出生数据由服务器数据库管理；报告页不提供给搜索引擎索引。"],
    ["免费双人适配","双方出生资料仅提交给服务器计算，不写入账号或报告数据库。DeepSeek 接收计算后的八字与星盘，不接收原始生日、城市或姓名。为减少重复请求，生成的解读可能在服务器内存中暂存最多 15 分钟；安全限流使用哈希识别键。请获得另一方同意后再提交资料。"],
    ["星盘与塔罗保存记录","默认计算不会建立账号记录。只有点击保存时，才会将当前星盘（含计算时刻与坐标）或塔罗牌阵、可选问题及已有 AI 解读存入你的账号。重新打开不会再次请求 AI。你可在账号内删除记录，授权管理员也可删除；列表不公开私人问题或解读。星盘与塔罗的 AI 请求只使用计算后的星体位置或所选牌面，不包含原始姓名和出生日期。"],
    ["账号与访问","账号保存邮箱、可选昵称、加盐密码哈希与会话记录，不保存可直接读取的密码。登录使用 HttpOnly Cookie。未登录报告通过当前浏览器持有的临时凭据访问，有效期七天；登录后请保存到自己的账号，避免丢失访问入口。"],
    ["服务提供方","网站运行于 Vercel，会员与报告存储使用 Supabase，AI 解读使用 DeepSeek。生成解读时，出生信息和计算结果会发送到 AI 服务。开放付款时由 PayPal 处理付款；本站记录订单标识、金额、币种和状态，不收集支付卡完整信息。配置邮件恢复服务后，由 Resend 发送重置邮件。"],
    ["使用统计与安全","主站使用 Vercel 使用统计与性能监测。自定义统计不发送表单值、报告正文或账号邮箱；报告链接中的私人标识及 URL 中的出生信息、付款参数和重置凭据会在统计上报前移除。安全限流保存经哈希处理的识别键。"],
    ["查看与删除请求",`你可以在账号中心查看已保存报告和订单。星盘和塔罗记录可自行删除。删除账号及其他历史数据需联系 ${destinySupportEmail}，从账号邮箱说明请求。我们会先核实身份及相关订单记录；不要通过邮件发送密码或支付卡信息。`],
  ]:[
    ["Birth maps and reports","A name or nickname, birth date, time and city are used to create a report. Only provide information you are entitled to share. No identity document, birth certificate or street address is required. Saved reports and birth details are held in the server database, and private report pages are not offered for search indexing."],
    ["Free relationship compatibility","Both birth records are sent to the server for calculation, without being written to account or report storage. DeepSeek receives derived Bazi and planetary data, not original dates, cities or names. Generated readings may be cached in server memory for up to 15 minutes to reduce repeat requests; rate limits use hashed identification keys. Obtain the other person’s permission before submitting their details."],
    ["Saved astrology and tarot records","Calculation does not create an account record by default. Only choosing Save stores the current chart (including calculated time and coordinates) or tarot layout, optional question and existing AI interpretation in your account. Reopening does not request AI again. You can delete records in your account; authorized administrators can also delete them. Lists do not expose private questions or interpretations. Astrology and tarot AI requests use derived positions or chosen cards, not original names and birth dates."],
    ["Accounts and access","Accounts store an email, optional name, salted password hash and session records, rather than a readable password. Login uses an HttpOnly cookie. Guest reports use a temporary access credential held by the current browser for seven days. Sign in and save a report to retain access through your account."],
    ["Service providers","Vercel hosts the website, Supabase stores accounts and reports, and DeepSeek generates AI interpretations. Birth information and calculated context are sent to the AI service when generating a reading. When checkout is available, PayPal handles payment. DestinyPixel stores order identifiers, amounts, currency and status, not complete payment-card details. Resend delivers password-reset emails when email recovery is configured."],
    ["Usage and security","The main site uses Vercel Analytics and performance monitoring. Custom events do not include form values, report text or account emails. Private report identifiers and birth, payment and reset parameters are removed from analytics URLs before submission. Security rate limits use hashed identification keys."],
    ["Access and deletion requests",`Your account shows saved reports and orders. You can delete saved astrology and tarot records yourself. To request account or other historical-data deletion, email ${destinySupportEmail} from your account email. Identity and relevant order records need to be verified first. Do not send passwords or card details by email.`],
  ];
  return <main className={styles.shell}><div className={styles.container}><Link href={zh?"/?locale=zh":"/"}>← DestinyPixel</Link><header className={styles.hero}><p>DESTINYPIXEL</p><h1>{zh?"数据与隐私说明":"Data and privacy"}</h1><p>{zh?"更新于 2026 年 9 月 28 日":"Updated September 28, 2026"}</p></header>{sections.map(([title,body])=><section key={title} className={styles.card}><h2>{title}</h2><p>{body}</p></section>)}<p><Link href={zh?"/service?locale=zh":"/service"}>{zh?"报告与购买说明":"Report service guide"}</Link></p></div></main>;
}
