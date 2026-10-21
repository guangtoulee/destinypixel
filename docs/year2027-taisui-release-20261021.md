# 2027 生肖榜、太岁科普与平安灯

本次是用户明确批准实现、检查、常规合并及正式发布的新任务，并包含后来追加的免费平安灯；不是之前只读调研的自动任务。全程在云端 `/workspace/destinypixel` 完成，没有调用付费或额度 AI。

## 页面与范围

- 生肖星级与个人手册：`/2027`、`/2027?locale=zh`；`#zodiac-ranking` 和 `#your-year` 可直接定位。
- 新科普：`/journal/ben-ming-nian-tai-sui`、`/journal/ben-ming-nian-tai-sui?locale=zh`。
- 免费平安灯：`/taisui`、`/taisui?locale=zh`。
- 文章有两类原创 SVG 图解（各中英一版）、术语定义表与 2027 对照表，图解可打开原图。三类页面互链。新增稿件仅简中和英文，现有俄语文章、URL 和入口保留。
- 各页使用本地化标题描述、自 canonical、双语 hreflang、正确的初始 HTML lang 和结构化数据。sitemap 仅列新稿已写成的两个语言版本；llms.txt 补充实际功能、语言范围与限制。

开工先检查干净的原工作树并拉取远端，从 `origin/main` 的 `1f4cbd3` 新建 `codex/2027-zodiac-taisui-20261021`。逐项检查未合并 PR #3、#9、#10、#11、#12、#14 及各自文件，没有本任务的重复开发；保留旧 PR 原状。共享 journal/sitemap 的改动仅为新稿的实际语言范围接入，没有导入旧 PR 草稿。

## 评分依据与文献

这是原创现代编辑的阅读提示，采用 1–5 星释义，本版只使用 2–4 星。各生肖从 3 星中性起，午未六合、亥卯未同组的联结意象用于鼓励合作（4 星）；冲、害、破仅在对应的核对／沟通分项给 2 星。分项的选择是编辑判断，不是古籍计算出的事业、感情或财运结论。综合独立编写，不平均分项；相同星级并列。羊本命年为中性 3 星，不扣分。它不是统计概率、科学预测或完整个人八字。

文献核对：

- [国家博物馆：十二生肖陶俑](https://www.chnmuseum.cn/zp/zpml/kgfjp/202111/t20211116_252286.shtml)：生肖动物与十二地支对应；生肖只给出年支，不是完整年柱。
- [《三命通会》卷二](https://zh.wikisource.org/wiki/三命通會/卷二)：丑未冲、子未害、午未合、亥卯未三合组、丑未戌刑及原局／大运／太岁合看。只有同组三合两支不能称完整三合化局。
- [《论三刑》完整篇章](https://www.shidianguji.com/zh/book/SK1610/chapter/1kf5v6ol1zcpx)：保留条件及不同论法，不能见刑便断凶；未不在常见辰午酉亥自刑表中。
- [《六壬大全》卷一](https://zh.wikisource.org/wiki/六壬大全/1)：未戌破及刑的不同解释；明确这是相邻术数体系的文本，不用来统一所有八字流派。
- [香港天文台年界说明](https://www.hko.gov.hk/tc/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html)与[2027 对照表](https://www.hko.gov.hk/tc/gts/time/calendar/pdf/files/2027.pdf)：2027 丁未肖羊，香港日期立春 2 月 4 日，春节 2 月 6 日。历法来源不为命理效力背书。

2027 常见列表：羊值、牛冲、鼠害、狗破，牛狗另涉及丑未戌刑的条件讨论，标签有重叠；不是每年固定三四个生肖。文章不编年柱权重或百分比，现代舞台比喻和假设人物已标明。

个人模型未修改：从公历 1 月开始、八字按立春精确交节换年；未知时辰不补中午，保留既有不稳定项目的省略。当前个人手册不计算大运或完整旺衰喜用，文章已明确区分其范围。

平安灯只在当前页面状态中点亮，保留减少动态效果、键盘按钮、状态播报与再读聚焦。主动分享只传递 canonical 页面链接和固定祝福，不自动发布。没有姓名／生日／愿望输入，没有愿望存储、虚构人数、付费项或功效保证。

## 验证与衡量

- 70 项历法、个人模型、星级排序与并列、分析隐私、journal、SEO 和语言回归通过；TypeScript、指定现有 ESLint 配置、正式构建（424 个页面）通过。
- 生产构建的 HTTP 检查通过：双语初始 HTML、完整稿件、canonical/hreflang、schema、sitemap、robots、年度与平安灯分享图。
- 额外验证新文章未写成的 ru/zh-TW 变体转向英文，旧文章两种语言继续 HTTP 200 且索引保留。
- 手机检查发现 320px 英文表格横向多出约 7px，已用此文章专用固定列宽、换行和窄屏内边距修复。
- 使用现有 `tool_open` 单一点击监听，增加四个固定入口标签（榜单、科普、平安灯、个人手册）。不重复发送事件、不收集出生资料或心愿、不新增分析服务。评估上线效果应查看真实访问与后续有用入口点击；本次没有把展示次数、文章数当作访问增长，也不保证流量收益。

最终生产 bundle 的真实 Chromium 检查通过 13 组检查，包含三页 × 两语言 × 320/390/430/1280px 的 24 组页面布局。四种排序、48 个可访问星级、1/2 月年柱、已知／未知时辰手册、平安灯 Enter 操作／再读焦点／分享取消／复制和手动回退／reduced motion 及实际互链导航均通过。sitemap 有 992 个唯一 URL。零页面异常、意外控制台错误、HTTP 资源错误或横向溢出；501 个请求全为同源 GET，没有 API／外部请求。原生分享分支用测试桩模拟，没有实际向外发布。保存 20 张截图，并人工复核两语言手机图解、表格、单生肖卡、手册与点亮页面。

两处视觉修正均已在最后一次构建和浏览器运行中验证：320px 表格，以及英文箭头字符缺字（改用原生 SVG）。React 检查涵盖状态／事件处理、清理唯一全局监听、服务器端文章、固定 SVG 坐标、无资料持久化与可访问状态，不引入额外 UI／追踪依赖。锁文件未变；只补齐云环境已在 package.json 声明但未安装的依赖。

证据见 [browser-report.json](qa/taisui-20261021/browser-report.json)、[build.log](qa/taisui-20261021/build.log)、[tests.log](qa/taisui-20261021/tests.log) 和同目录截图；复现命令：

```sh
node --conditions=react-server --import tsx --test lib/year2027/*.test.ts lib/engines/time.test.ts lib/engines/bazi.test.ts lib/engines/astrology.test.ts lib/analytics.test.ts lib/document-locale.test.ts lib/journal.test.ts lib/seo.test.ts lib/topic-journeys.test.ts
npx tsc --noEmit --incremental false
npm run build
npm run start -- -H 127.0.0.1 -p 3038
NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node scripts/check-taisui-browser.mjs http://127.0.0.1:3038 docs/qa/taisui-20261021
node scripts/check-year2027-http.mjs http://127.0.0.1:3038
node --conditions=react-server --import tsx scripts/check-journal-search.ts http://127.0.0.1:3038 ben-ming-nian-tai-sui
```

## 发布证据边界

使用现有 `guangtoulee/destinypixel` 仓库 main → `destinypixel/destinypixel` Vercel 项目的 Git 集成，未新增项目、域名、收费服务或改发布设置。精确 PR、内容提交和部署结果由任务最终回报给出，避免文档写入自身提交哈希而触发第二次无必要部署。

正式域名及既有 vercel.app 别名的直接请求，在应用收到请求前被本环境代理以 `CONNECT tunnel failed, response 403` 阻断；网页读取工具也不可达。Vercel 项目只读检查返回 403，明确缺少 `destinypixel` 团队授权；环境没有可用 Vercel CLI 和其凭据。没有更改权限或尝试绕过。可通过授权 GitHub 连接读取 Vercel 对精确提交的部署状态，但这与正式页面的浏览器验收有别。该网络限制不代表站点故障；公开站点仍需在可达且已授权的云端浏览器完成独立验收。Safari／真实设备原生分享未实测。

主要内容通过 [PR #37](https://github.com/guangtoulee/destinypixel/pull/37) 合并：内容提交 `83ac7b2276fa1c38c1b0f448bc19894ab6d9e2f4`，main 合并提交 `b8749563d866e824154675a299b141ef7de5102d`。[该 main 的 Vercel 部署](https://vercel.com/destinypixel/destinypixel/5FFJUaTK9tFxQWjD7zsa5TCcoce9)于 2026-10-21 07:51:55 UTC 被 GitHub 状态接口确认为 success / Deployment has completed。随后直接复核三条中文正式 URL，仍全部在 CONNECT 代理阶段被阻断，没有抵达应用。

发布后补充收紧入口事件：同一路径的语言切换、普通文章章节链接不再标记为新入口，仅保留真实跨页入口和 `/2027` 的榜单／个人手册跳转。70 项回归、TypeScript、针对性 ESLint 和生产构建再次通过；隔离真实分析请求的浏览器检查确认语言切换／普通章节为零条入口事件，有用跳转每次只发一条。证据见 [analytics-browser.json](qa/taisui-20261021/analytics-browser.json) 及 `analytics-build.log`、`analytics-tests.log`。最终补充提交和部署状态在任务最终回报列出。
