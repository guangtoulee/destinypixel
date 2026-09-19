# DestinyPixel 搜索增长计划

研究日期：2026-09-19。目标：让海外访客通过搜索或有明确意图的内容，进入免费抽签、情感匹配与日柱体验，再自然了解完整报告。

## 现状与证据边界

- 本轮公开搜索中，精确查询 `"destinypixel.com"` 仅返回第三方域名目录，`site:destinypixel.com` 没有返回本站页面；但随后 Search Console URL 检查确认首页 `/`、`/sticks`、`/compatibility` **均已收录到 Google、网页已编入索引，HTTPS 有效**。此前公开搜索样本没有反映实际索引状态，不能用它断言未收录或零自然流。
- 已取得 Vercel Web Analytics 实际访问基线，筛选为 Production、hostname `destinypixel.com`。数据来源：[Vercel 项目分析](https://vercel.com/destinypixel/destinypixel/analytics)（需授权登录）。下表时间按后台界面记录，未另作时区换算。
- 已通过 HTML meta 验证 Search Console 的 `https://www.destinypixel.com/` 资源，并提交 sitemap。Google 显示 Success、69 个已发现 URL；**已发现不等于已收录**，已单独确认收录的是上述三个核心 URL。效果页面当前提示“正在处理数据，请过 1 天左右再来查看”，Google 曝光、点击及非品牌查询基线仍待处理完成。
- 英文 `free bazi compatibility calculator` 样本出现直接输入两人生日的工具；`Guanyin fortune sticks online` 样本出现在线抽签和按号码查签的页面。中文样本同样以工具和签文查询为主。这支持把工具页当作搜索入口，不证明这些词比所有其他关键词流量大。
- 搜索样本：[TryBazi](https://trybazi.com/bazi-compatibility-calculator)、[Bazi.sg](https://www.bazi.sg/bazi-compatibility)、[Guanyitang 英文抽签](https://guanyitang.com/en/qiuqian/guanyin)、[Guanyitang 中文抽签](https://guanyitang.com/qiuqian/guanyin)。这些是竞争页面与意图样本，不是命理有效性的证据，也不是流量数据源。

| Vercel 观察窗口 | 访客数 | 页面浏览量 | 跳出率 |
| --- | ---: | ---: | ---: |
| 2026-09-12 14:00 至 2026-09-19 14:59 | 130 | 357 | 40% |
| 2026-08-20 14:00 至 2026-09-19 14:59 | 155 | 451 | 44% |

7 天窗口里，`/sticks` 为 10 位访客，`/compatibility` 为 4 位访客，移动端占 67%。后台可见引荐来源为 ChatGPT 2 位访客／3 次浏览、Bing 1／1、Google Android 搜索应用 1／1、Telegram 1／1；30 天窗口另外显示 PayPal 与 Sandbox PayPal 各 1 位访客。引荐来源只是来源信号，不能把未归因访问直接算为自然搜索，也不能据此区分真实用户与开发自测。

可以确认网站已有访问、可识别的搜索与 AI 引荐很少；目前不能给出可靠的自然搜索总人数。现有 Vercel 账号未启用 Web Analytics Plus，UTM 报表需要该功能，尚不能按素材参数在此后台核验推广转化。

## 本轮实际改动与验收

- 基线审计：发布前 sitemap 中 68/68 URL 返回 200，均有单一 H1、独立标题和描述、自指 canonical；语言互链目标可达，已有 JSON-LD 可解析。额外 22 条公开内链全部 200。没有发现全站性的硬抓取错误。
- robots.txt 对 Googlebot、Bingbot、OAI-SearchBot 允许主站核心工具；这只是规则和 HTTP 检查，不是服务器日志里的真实爬虫到访证据，也不能证明 CDN 对真实爬虫 IP 没有限制。
- 首页桌面导航新增抽签，感情匹配直达独立页；手机保留现有入口，链接随语言变化。
- 抽签与匹配新增四语言、服务器可读的使用说明、方法、问答和相关链接。抽签繁体正文改为初始 HTML 输出，与四语言 canonical、hreflang 和 sitemap 对齐。
- 更新两个工具的搜索标题与描述、抽签分享图和 WebApplication 数据。抽签来源说明、合婚模型范围与掌纹指南同步纠正；俄语签文不再混入英文拼接句。
- 修正情感匹配漏统计，补两个工具开始、成功、失败或 AI 回退事件；生日、姓名、城市、问题和报告内容不进入事件属性。新指标从发布后累计，不能补回历史事件。
- 为未隔离的图片工具及健康宝路径补 noindex。独立实验应用不加入主站目录与 sitemap。已经被 robots 阻止的旧侧站 URL 若仍被搜索收录，需要取得 GSC 证据后安排定向清理；noindex 不是即时删除服务。
- 本地验收：生产构建及 36 项测试通过；两重点页的四语言 HTML 均有正确 canonical、5 个语言 alternate（含 x-default）和可解析结构化数据。320px 下抽签与匹配无横向溢出，首次操作可出结果，1280px 俄语首页导航可用。
- 已上线搜索优化提交 `3829c36` 与站点验证提交 `51507b2`；Search Console 验证、sitemap 成功状态已在后台确认。
- Search Console 分别检查首页、抽签页与情感匹配页，三者均已编入 Google 索引且 HTTPS 有效。无需对已收录 URL 重复申请索引；已提交的 sitemap 状态成功，后续观察更新抓取与搜索表现。

技术改动、三个核心 URL 的收录状态与 Vercel 访问基线已核实。接下来等 Search Console 效果数据处理完成，再观察查询、曝光与点击；不要把已收录、sitemap 成功或 69 个已发现 URL 当成已经取得搜索流量。

## 关键词与页面职责

| 优先级 | 搜索意图 | 英文词组 | 中文词组 | 主页面 |
| --- | --- | --- | --- | --- |
| P1 | 免费比较两个人 | free BaZi compatibility calculator; Chinese astrology compatibility; birth date compatibility | 八字合婚、八字配对、情侣匹配、情感匹配 | `/compatibility` |
| P1 | 立即抽签或查号 | Chinese fortune sticks online; Guanyin fortune sticks; Kau Cim online | 在线抽签、观音灵签、灵签解签、免費求籤 | `/sticks` |
| P2 | 理解比较方法 | BaZi compatibility vs zodiac compatibility; compatibility without birth time | 八字合婚和生肖配对的区别、不知道出生时间能合盘吗 | 工具页方法说明、独立指南 |
| P2 | 学会提问和读签 | how to read Chinese fortune sticks; Guanyin lot meaning | 求签怎么问问题、观音灵签怎么看、抽到下签怎么办 | 签堂说明、独立指南 |
| P2 | 了解自己的出生信息 | day pillar calculator; Day Master calculator | 日柱查询、日柱性格、五行查询 | `/day-pillar` 与日柱故事 |
| 后续 | 特定签号与特定意象 | Guanyin lot + number; day pillar + relationship | 观音第 X 签、某日柱感情特点 | 只扩充已核对且有独特价值的详情页 |

中文内容同时维护简体与繁体；英文以自然表达为主，俄文保持实际功能与说明一致。保留 BaZi、Chinese astrology、fortune sticks 等访客能识别和搜索的名称，60 动物作为视觉与解释特色，不要求首次访客先学会原创命名体系。

`/compatibility` 不宣称完整传统合婚或完整西方合盘。现有模型使用日干五行、四柱表层元素分布及指定行星关系；不计算上升、宫位或婚期。60–100 是本站编辑尺度，不是关系成功概率。

`/sticks` 不宣称所有签系都有完整、逐字、已核对的庙本。现有签库混合部分传统来源与本站现代象征解读，且某些语言版本不是原文逐句翻译。新增查签详情页前，应核对来源、版本和译文，不能把模板补充内容包装成古籍原文。

## 已上线的内容结构

两个工具保留主要操作区，下方已添加能被服务器直接输出的简短说明、方法、真正有用的问答及相关内链。

- 抽签：是什么、五种签系及本站签号范围、抽签与查号步骤、具体提问例子、传统文本和现代解释的区别。
- 情感匹配：四柱与日干五行、60 动物、四种相处维度、实际计算范围与输入要求。补充问答避免重复已有的免费、分数和出生时间三问。
- 相关链接直接指向准备出生资料指南、日柱工具、匹配或月老签，不引入与玄学主站无关的剧本、提示词、图片工具。
- 私人生日、姓名、提问和报告不放入公开链接、索引或分析事件。可索引的内容使用方法说明与匿名示例。

## SEO 与 GEO：值得做什么

1. 先检查 Googlebot、Bingbot、OAI-SearchBot 能否获取重要页面；CDN、robots.txt 与响应状态要一致。
2. 核对 canonical、真实语言内容、hreflang、可爬内链与 sitemap。一个页面负责一个主要用户任务，避免把同义关键词拆成大量薄页。
3. 工具说明、输入条件、免费范围、方法和结果示例应在填写前可读。主要信息不能只存在于结果请求中。
4. 用真实的编辑者、联系方式、修订日期和来源支持内容；不虚构专家审核、用户评价、名人出生时刻或科学验证。
5. AI 解读与确定性计算分开；避免用提高分数、命定关系或预言式标题制造转化。

Google 当前官方指南说明：GEO 仍建立在 SEO、可访问内容与有用信息之上；无需特殊文件。Google Search 不使用 `llms.txt` 改善可见度，它既不会帮助也不会损害 Google 排名。该文件可保留作其他服务的辅助说明，不应当成核心获客投入。[Google AI 优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Google 已于 2026-05-07 停止 FAQ 富结果，6 月移除对应文档。可见 FAQ 仍能帮助用户，但不能承诺 FAQ schema 带来富结果或 AI 引用。[Google 文档更新](https://developers.google.com/search/updates)

OpenAI 的 `OAI-SearchBot` 用于搜索，`GPTBot` 用于训练，两者开关独立；还需避免基础设施封锁允许的搜索爬虫。允许抓取不保证获得推荐。[OpenAI 爬虫说明](https://developers.openai.com/api/docs/bots)

Bing 强调可抓取、可渲染、清晰内链和真实结构化数据，也明确 SEO 不保证排名、GEO 不保证引用。对新增或更新内容可考虑 IndexNow，但不能用它替代索引质量检查。[Bing 站长指南](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a)

## 推广优先级与具体路径

以下顺序按现有素材、制作成本与出站路径制定，属于待验证假设，不是流量保证。不要同时铺开十个平台。

| 平台 | 第一轮内容 | 到站路径 | 核心衡量 |
| --- | --- | --- | --- |
| Pinterest | 五行沟通对照、两种相处习惯、精美签文加一句解释；复用现有卡图，但标题先回答具体问题 | 每张 Pin 直接到对应工具或指南，单独 UTM | 站外点击、到站后完成测算、每小时制作带来的有效访问 |
| 已有 TikTok | 20–40 秒具体场景，例如一方想马上说清、另一方想先安静；先给有用解释，再展示两人结果 | 先检查账号是否已开放网站入口，再链接对应工具；未开放时用明确品牌和置顶使用说明 | 主页访问、到站、工具完成；播放量只是上游指标 |
| YouTube | 2–5 分钟搜索型教程：BaZi 与生肖配对区别、如何读中国签文；从长片剪短片 | 长视频说明或频道链接到工具；Shorts 用相关视频连接长片 | 搜索观看、相关视频流入、站外访问、工具完成 |

Pinterest Analytics 能分别报告站外点击与站外点击率；因此不要把 Pin 点开或收藏当成已经进入网站。[Pinterest Analytics](https://help.pinterest.com/en/business/article/pinterest-analytics)。认领网站有助于将保存内容与账号关联，实施需使用实际账号的验证信息。[Pinterest 网站认领](https://help.pinterest.com/en/business/article/claim-your-website)

YouTube Shorts 描述和评论中的普通 URL 不可点击。频道链接与 Shorts 的相关视频有不同的可点击路径，长视频外链还需具备对应功能权限。[YouTube 链接规则](https://support.google.com/youtube/answer/13748639?hl=en)

Reddit 可留作后续少量反馈实验：先读社区规则，公开开发者身份，在相关讨论中提供完整帮助。不要机器人批量投链接，也不要把讨论伪装成独立推荐。本次未联系他人、未注册或发布任何社媒内容。

## 30 天实验

| 时间 | 交付 | 判断方式 |
| --- | --- | --- |
| 第 1–3 天 | Vercel 7／30 天基线、GSC 验证和三个核心 URL 收录已确认；等待 Google 效果数据处理完成，再核验查询及新工具事件 | 分开观察已识别来源和未归因访问，核验开始与成功事件，不把来源不明当自然流 |
| 第 4–10 天 | 两工具的导航、说明、元数据与语言关系已上线；继续处理索引检查发现的问题 | 验证响应、canonical、语言、索引资格、移动端操作，不用“已提交”代替“已收录” |
| 第 11–20 天 | 4 篇不同意图的指南；8–12 张 Pin；4–6 条 TikTok；2 条搜索型 YouTube 教程 | 先记录平台出站点击、工时与站内工具事件；UTM 精细归因需具备实际可用报表后核验 |
| 第 21–30 天 | 复盘获曝光的查询、有点击的页面、真正带来测算的内容 | 只扩表现最好的主题；样本不足时继续观察，不凭几次访问宣布胜负 |

首批四篇指南选题：

1. BaZi compatibility vs Chinese zodiac compatibility：用匿名两人示例解释年生肖为什么不足。
2. What if I don’t know my birth time?：明确当前工具要求，并提供日柱免费体验的合适入口。
3. How to ask a useful fortune-stick question：给事业、关系、变化三个具体问题及改写。
4. A temple number is not a universal verse：说明签系、版本、译文的差别，教读者核对来源。

工具事件按当前实际名称观察：`tool_start → tool_success`；异常分别用 `tool_error`、`tool_fallback`。不要查询并不存在的 `tool_complete`。后续购买转化如需纳入，先核对实际已有事件及后台是否能收到数据。属性只包括工具类型、语言、来源和成功/失败，不记录姓名、生日、城市、完整问题或解读正文。当前已核实的是访问、页面与引荐数据，新工具事件的实际完成量仍需后续核验，不能由页面浏览量推算。

每周看：

- 搜索：非品牌查询曝光与点击、按语言/国家拆分的工具入口、核心页索引状态。
- 转化：工具开始率、完成率、失败率；有真实付费数据后再看购买率。
- 内容：每条内容的站外点击、有效到站、工具完成、制作工时。
- AI 搜索：Google Generative AI 报告、Bing AI Performance 的引用变化，另用站内来源确认访问；引用次数不能当作点击量。

Google 当前已提供 Generative AI 专项报告；不要再沿用“所有 AI 数据只能混在 Web 搜索里”的旧判断。[Google 报告公告](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)。Bing 官方发布文章可确认 AI Performance 展示引用次数、被引用页面和检索关键词样本；这些引用指标不是本站实际点击数据，需要与站内来源数据分开观察。[Bing AI Performance 官方发布](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)

30 天的目标是建立可信基线、修复发现路径并找到内容方向。稳定自然流需要继续观察，不承诺发布日期后的固定排名、访客量或收入。本计划没有创建定时任务；后续持续执行应根据实际数据调整。

## 可直接使用的第一轮推广链接

- Pinterest → 抽签：<https://www.destinypixel.com/sticks?utm_source=pinterest&utm_medium=social&utm_campaign=temple_sticks>
- TikTok → 情感匹配：<https://www.destinypixel.com/compatibility?utm_source=tiktok&utm_medium=video&utm_campaign=love_compatibility>
- YouTube → 情感匹配：<https://www.destinypixel.com/compatibility?utm_source=youtube&utm_medium=video&utm_campaign=love_compatibility>

这些参数已进入隐私白名单，可保留为后续归因约定。已核实当前未启用 Web Analytics Plus，Vercel 的 UTM 报表需要该功能；目前使用这些链接不等于能在现有后台按活动查看结果。精确到每条素材的归因还需受控素材编号及可用分析工具，不能随意塞入姓名、生日或自由文本。本次没有升级分析套餐。
