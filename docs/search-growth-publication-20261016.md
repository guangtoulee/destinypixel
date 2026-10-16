# 2026-10-16 周五内容维护：太阳、月亮与上升

## 选题依据与范围

本次完成一篇原创指南 `/journal/sun-moon-rising-signs-explained`，英文、简体、繁体、俄文同步；首发和实际修改日期均为2026-10-16。沿用journal，没有另外创建同义工具页。

采用10/12复盘中的第二项内容机会：当时GSC网页搜索、`https://www.destinypixel.com/`资源、全部国家与设备，10/3–10/9的`sun moon rising calculator`为18次曝光，前一窗口9/26–10/2为4次。这是本站在指定窗口的曝光，不是市场搜索量；查询表与页面表未交叉，不能归因到某篇文章。本轮没有重新读取后台，不把10/12记录称作实时趋势。原始记录位于本任务`outputs/seo-review-20261012/`。

现有出生资料指南解决“输入什么”，本篇解决“算完怎么读”：以太阳、月亮、上升的不同问题切入，连到整宫制、相位容许度、未知时间边界和实际操作。星盘专题三个指南入口调整为本篇、出生资料、未知时辰合盘；旧八字对比文章保留，其内容和URL未改。

## 正文与事实核对

- 七节完整正文，包括三要素对照表、虚构人物场景、宫位、相位、时间限制、逐步读盘与AI/保存说明；无名人、用户出生资料或私人报告。
- 示例明确为人为设定的阅读练习：太阳金牛14°、月亮水瓶16°、上升狮子8°。使用实际`fullAspects`校验黄经44°/316°的短弧88°、刑相容许度2°，并核对整宫制第十/第七宫。没有称其为真实生日星盘。
- 对照`lib/celestial/astrology.ts`、`lib/celestial/natal-reading.ts`、`components/celestial/astrology-experience.tsx`与公开产品说明，确认热带黄道、整宫制、五种主要相位及≤6°容许度；当前列表不包括上升/天顶相位。
- 独立星盘需要日期、当地时间与地点，没有未知时辰模式。未知时辰合盘是另一工具，不补午时，不提供上升/宫位或精确相位。AI不能找回缺失时辰。
- 详细AI文本覆盖十个天体、十二宫和至多十二组最紧密主要相位；计算结果完整相位仍可浏览。已有解读可随星盘保存，重新查看无需重跑相同AI文本。未改计算、账户、保存、支付或额度逻辑。
- 明确传统象征、本站原创例子和可复核的角度计算是不同层次；没有把占星解释写成科学验证或结果保证。

来源：Astrodienst的[Sun](https://www.astro.com/astrowiki/en/Sun)、[Moon](https://www.astro.com/astrowiki/en/Moon)、[Ascendant](https://www.astro.com/astrowiki/en/Ascendant)、[Aspect](https://www.astro.com/astrowiki/en/Aspect)及[宫制说明](https://www.astro.com/astrology/in_house1_e.htm)用于术语和传统解释。直接打开部分Astrodienst页面遇到JS检查，采用搜索索引中可读取的原站文本核对，不将其记作直接完整页面读取。[Astronomy Engine官方说明](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md)用于坐标/时间计算，不作为性格解释的证据。来源随相关正文段落展示。

## 仓库安全与验证

- `/Users/lee/destinypixel`仍为干净的`backup/dirty-pre-tuteng-20260904`、HEAD`6c117d3`，未改动。
- 复用自有干净`work/destinypixel-astrology-tarot`工作树，从`994ece2`安全fast-forward至当时`origin/main`的`af3faff`；新分支`codex/sun-moon-rising-guide-20261016`。发布前再次fetch，基线没有前进。完整保留其他任务的上游提交。
- 内容只涉及`lib/journal-sun-moon-rising.ts`、`lib/journal-search-growth.ts`、`lib/topic-journeys.ts`。日柱升级继续暂停，不合并日柱PR、不批量noindex、不动Prompt Radar或独立应用。
- 按更新后的锁文件执行`npm ci`；22项journal、SEO、guide、topic-journeys测试通过，生产webpack构建与TypeScript通过，`git diff --check`通过。
- 四语初始HTML均包含完整正文、表格与步骤，单H1、自指canonical、四语hreflang/x-default、Article日期和sitemap日期通过。16个不同内部链接目标均HTTP200；四语journal目录与星盘工具均有本篇入口。
- 浏览器核对1280px英文桌面和320px四语窄屏：桌面文档1265px/scrollWidth1265px，窄屏305px/scrollWidth305px；已检查的表格窄屏263px，无整页横向溢出。目录定位、语言切换、俄语文章→星盘→文章往返通过，控制台无捕获到的error。未提交生日、调用AI或保存记录。
- 浏览器检查发现最初误用塔罗教育页模板，已移除本文章的`kind`，恢复通用journal页眉；随后重新构建并复核。繁体用本篇范围的替换修正“別只看”、滑鼠、點選、登入、儲存等，不改全站转换规则。

## 发布及线上复核

内容提交：`c1da91225baeb35f9618f959d567341fa733901d`，正常推送`HEAD:main`。GitHub中对应Vercel状态为`success`，部署链接：<https://vercel.com/destinypixel/destinypixel/Gwy91uMZNfpakwnYSG7FFff2JweH>。

Vercel管理连接器的项目读取返回团队权限403；未改权限或账户，仍通过原有Git发布。发布结果由该提交的GitHub/Vercel状态与正式域名检查共同核验。

正式四语页面通过`check-journal-search.ts`：HTTP200、完整正文、单H1、canonical、hreflang、Article首发/修改日期2026-10-16及sitemap。补充脚本确认表格、步骤、正文链接、四语星盘回链及journal目录；16个内部目标均200。正式中文页320px浏览器复核标题、七节正文、表格与日期，文档和scrollWidth均305px。初次浏览器导航超时后页面已正常加载，后续读取及截图确认成功。

本地与线上证据位于本任务`outputs/seo-publication-20261016/`：`build.log`、`tests.log`、`local-http.log`、`production-http.log`、`local-links.json`、`production-links.json`、`browser-qa.json`。这些结果证明内容已发布且可访问，不证明Google已收录、AI已引用或流量增加。没有提交索引请求、外部发帖或新增自动化。
