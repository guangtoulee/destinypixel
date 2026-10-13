# 2026-10-13 周二内容维护：生肖配对与八字匹配

## 选题依据

本轮只修订现有 `/journal/bazi-vs-chinese-zodiac-compatibility`，英文、简体、繁体与俄文同步。保留 URL 和 2026-09-20 首发日期，实际修改日期为 2026-10-13。未增加同义页面。

优先依据 10/12 复盘发现的事实不一致：旧文四语把30%八字、70%行星写成通用评分，实际未知时辰版采用两项八字主题等权平均。10/12读取的 GSC 数据窗口为10/3–10/9（网页搜索，主站 URL-prefix资源，未筛查询/页面/国家/设备）：`bazi compatibility calculator`6次曝光、`bazi marriage compatibility calculator`2次、`bazi love calculator`1次，均0点击。这些是本站曝光，不是市场搜索量，也没有查询与文章的交叉归因。本次未重新打开后台，不把昨天的记录称作实时数据。

原始复盘在本任务 `outputs/seo-review-20261012/`。本次优先级主要来自确认过的说明错误，而非小样本流量排名。

## 修订内容

- 八节完整指南：生肖与四柱的比较范围、五行相生相克、本站原创动物意象、两种输入模式、分数解释、虚构情侣示例与可实践的对话。
- 明确完整资料版：四维等权，每维30%八字与70%指定行星比较。前三维的八字部分为日干关系，日常节奏为五行相对分布。
- 明确一方或双方未知时辰：日干五行关系50%、可用柱五行相对分布50%；缺失柱排除，可能星座只供说明，不参与相位评分。
- 不补午时、不推断缺失时柱、上升或宫位；节气边界不确定的年/月柱排除。已知时间者保留其计算资料。
- 60–100是编辑尺度，不是成功率、传统统一标准或经验证的关系概率；两种模式分数不能直接比较。AI不决定分数或找回时辰。
- 示例明确是虚构、设定五行关系的阅读练习，无编造出生时间、真实用户报告或效果证据。
- 标题、描述、H1与正文聚焦BaZi／Chinese zodiac compatibility、生肖配对与八字合婚。正文内链连接既有五行指南、未知时辰指南、免费工具和产品事实页，避免重复解释页面。
- 沿用journal的表格、步骤、四语转换与元数据。繁体逐项检查并在本文章内修正“配對錶”“曆法”转换，不改全站转换规则。

## 来源及实际代码

2026-10-13读取香港天文台官方干支资料（HTTP200）：<https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm>。只用于干支、四柱与六十循环的历法说明，不用于证明感情预测。其余产品方法以本站代码为第一依据：

- `lib/compatibility/model.ts`：每人独立timeKnown、两种评分、权重、归一化与60–100尺度。
- `lib/compatibility/date-window.ts`：当地民用日期、午夜日柱、节气边界、缺失时柱、行星逐小时可能范围。
- `lib/compatibility/ai.ts` 与 `time-copy.ts`：AI输入和解释边界、日期版不使用相位。
- `lib/compatibility/birth-time-article.ts` 与公开 `/product-facts`：与已有输入说明对齐。

## 安全与验证

- 根仓库 `/Users/lee/destinypixel` 保持干净的 `backup/dirty-pre-tuteng-20260904`，HEAD `6c117d3`，未改动。
- 复用自有干净工作树，从`140ac9e`安全fast-forward到当时最新`origin/main` `33fb421`，新建分支`codex/compatibility-guide-20261013`。发布前再次fetch确认基线未前进。
- 他人的48个上游提交完整保留；本次只修改文章模块与注册。未扩写日柱、不处理相关PR、不改索引规则、不动Prompt Radar、支付、账户或计算算法。
- 21项journal/SEO/guide测试通过，生产webpack构建与TypeScript通过，`git diff --check`通过。繁体修正后已重跑测试、重建并重验。
- 四语本地生产HTML均200，完整逐段正文、单H1、自指canonical、互惠hreflang/x-default、Article原始发布/修改日期、sitemap日期及工具回链通过。
- 四语表格每个单元格、步骤与上下文链接均在初始HTML；17个不同正文、来源、工具链接均HTTP200。
- 浏览器1280px桌面、320px四语检查；窄屏文档宽305px（含滚动条视口320px），scrollWidth305px，表格宽263px，无整页横向溢出。检查目录跳转、语言切换、繁体修订词和CTA到繁体匹配工具；两人未知时辰选项可见。未提交生日或调用AI/保存/支付。
- 本地及生产验收日志保存在本任务`outputs/seo-publication-20261013/`，浏览器记录见`browser-qa.json`。

## 发布

内容提交：`f401519e2ad588654ea16d3742b5cd110dc6fcee`，正常推送`HEAD:main`。对应Vercel部署：<https://vercel.com/destinypixel/destinypixel/HpjoftiqqnJRgf48nTSyY5MQVsk8>。

正式域名四语已通过`check-journal-search.ts`：HTTP200、完整新版正文、单H1、自指canonical、四语hreflang/x-default、Article首发2026-09-20/更新2026-10-13、sitemap修改日期以及合盘工具回链。额外逐项核实四语表格与步骤在生产HTML中，繁体“配對表”修正已生效。浏览器打开正式繁体页，确认新标题、八節正文与真实修订日期。

发布状态接口第一次返回pending；第二次未在约一分钟内返回，停止等待，没有把接口记作success。上述正式域名检查确认内容已经上线；它们不证明Google已重新抓取、更新索引、获得AI引用或带来访问增长。未提交索引请求或新增自动化。
