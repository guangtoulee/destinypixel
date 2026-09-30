# 可直接转发给外部机器人：DestinyPixel 只读巡检

任务是提供可复核证据，不写内容、不改站、不发文章。无需碰 Git、Vercel 配置、账号或支付。

## 每天北京时间 10:15：一次公开页面巡检

1. 检查 www.destinypixel.com 的首页、/compatibility、/astrology、/tarot、/sticks、/product-facts、/journal/compatibility-without-birth-time。后六页检查默认英文、?locale=zh、?locale=zh-TW、?locale=ru。
2. 记录最终 URL、HTTP 状态、页面标题、canonical、robots、四种语言互返链接。200 但正文是报错、登录墙或空壳，要单独标出。使用公开 GET，不提交测算表单，不调用 AI，不保存个人资料。
3. 检查 /sitemap.xml、/llms.txt、/api/products.json、/api/ai-profile.json、/.well-known/agent-products.json。JSON 应可解析，三个事实接口的产品 ID 应一致；agent-products 与 products 内容应一致。产品目录只包含玄学主站工具。
4. 对照可见产品页面，报告事实冲突：时辰未知是否仍能选择、是否误写必须双方时间、收费是否与页面不一致、签文来源是否被写成完整权威庙本。不要凭猜测“修正”。
5. 发现异常，五分钟后仅复查异常 URL 一次。输出：北京时间、URL、预期、实测、截图或原始响应片段；不提供凭证或私人数据。正常不刷群；每周汇总一次即可。

## 每周一 10:30：数据抄录（仅限已经获得权限）

- Search Console：准确属性、起止日期、数据是否完整、Web 搜索类型；导出最近完整 7 天与之前 7 天的曝光、点击、查询、入口页、国家/设备。当前未完整日期单独说明。不要用 site: 查询代替 GSC。
- Vercel：Production，先记录所选 hostname；报告相同日期范围访客、PV、引荐、工具事件。说明 tool_start/tool_success 的实际定义，不把总访客当自然搜索。
- 没权限、没查询行或报告仍处理中，写“未取得”，不要写 0，不购买升级套餐。不要因缺连接器就声称网站从未配置 GSC。
- 只提交导出与事实差异，不自行判断算法惩罚、恢复流量或增长因果。

## 工作边界

不得发布、改标题/正文、提交代码、回滚、批量 noindex、删 sitemap URL、反复申请索引或改 GSC 设置。日柱升级继续暂停，不处理相关草稿 PR。不把 Prompt、剧本、图片、英语应用并入主站。不得自动发社媒、注册平台、联系第三方或更改支付/账号。新问题交由 Lee/Codex 判断。

以上是待 Lee 转发的任务说明；本文件本身没有给机器人发消息，也没有在第三方平台建立定时任务。

## 巡检结果的表述校准（9 月 30 日补充）

- HTTP 200、没有 noindex、允许抓取，表示“技术上可索引”；只有取得 GSC URL 检查等证据才称“已收录”。sitemap 列出 URL 也不等于已收录。
- 品牌在标题前面或后面都可以；检查标题是否已经包含 DestinyPixel，不要求固定后缀。
- 免费工具/预览与可选完整报告分别检查。0 元的免费 Offer 并非自动出错；应核对该 Offer 的名称、对应范围，以及付费报告是否另有准确说明。
- 语言检查分开报告根 html、主内容 main 的 lang、实际初始正文、canonical、hreflang；不能只因根 html 为 en 就判断非英语内容没有被搜索引擎识别。
- /ultra 是保留访问的旧 3D 体验，设为 noindex 并移出 sitemap 属于预期，不报成新故障。日柱页面仍待逐页评审，不自行合并批量 noindex PR。
