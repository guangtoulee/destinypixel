# 日柱同日柱人物资产盘点

盘点日期：2026-10-11。工作目录：`/workspace/day-pillar-links`。记录写入时 HEAD：`35213d640209add73683c7818b37fbb174e00f19`。

本次只盘点仓库已有资料并用现行日期算法复算，没有重新读取人物生日来源网页，也没有新增人物到文章。表中的生日是**已发表文章所使用的数据**；复算成功不能代替生日来源核验。

## 现有覆盖与可复用文件

- 现行 60 个日柱文章中，4 个有 `famous-birthdays` 章节：甲子、乙丑、丙寅、丁卯（4/60）。其他 56 篇没有该章节。
- 每篇每语有 2 条人物表行，四语共 32 条表行，涉及 10 名独立人物。甲子英文使用 Olivia Rodrigo / Henry Dunant；简中、繁中、俄文使用徐若瑄 / 宋庆龄。其余三篇各语人选一致。
- 对四语 32 条表行逐条调用 `calculateDateDayPillar`，全部匹配文章日柱，0 条不匹配。以 10 个不同生日去重，与人工读取的 10 名人物一致。
- 已有姓名涵盖音乐、影视、文学、哲学、人道与公共服务；尚未形成科学、体育、商业等各领域的覆盖计划。不能把目前四篇的覆盖说成全部 60 篇已经补齐。

资料位置：

- `lib/journal-jia-zi.ts`（英、简中），`lib/journal-jia-zi-ru.ts`（俄文）；繁中由现行转换流程保留。
- `lib/journal-pillars/yi-chou.ts`、`bing-yin.ts`、`ding-mao.ts`（各为英、简中）；对应 `*-ru.ts` 为俄文，繁中沿用现行转换流程。
- 文章注册及字段类型：`lib/journal.ts`。
- 现有生日复算测试：`lib/journal.test.ts` 的 `published famous birthdays reproduce the featured day pillar in every edition`；`lib/day-pillar-library.test.ts` 的 `expanded portraits retain their URLs and reproduce every sourced public birthday`。
- 编辑证据记录：`docs/day-pillar-editorial-20260924.md`；后续排除与核验边界：`docs/day-pillar-enrichment-20261005.md`。

## 已发表的 10 名人物、日期和来源链接

| 日柱 | 已发表人物 | 文章所用公历生日 | 现有版本 | 文章所列来源 |
|---|---|---|---|---|
| 甲子 | Olivia Rodrigo | 2003-02-20 | 英文 | https://www.britannica.com/biography/Olivia-Rodrigo |
| 甲子 | Henry Dunant | 1828-05-08 | 英文 | https://www.nobelprize.org/prizes/peace/1901/dunant/speedread/ |
| 甲子 | 徐若瑄 / Vivian Hsu | 1975-03-19 | 简中、繁中、俄文 | https://www.avex.com.tw/vivian/profile_t.htm |
| 甲子 | 宋庆龄 / Soong Ching-ling | 1893-01-27 | 简中、繁中、俄文 | https://www.gdtzb.gov.cn/ddhz/xw/content/post_86719.html |
| 乙丑 | Michelle Obama | 1964-01-17 | 四语 | https://www.obamalibrary.gov/obamas/first-lady-michelle-obama |
| 乙丑 | Bertrand Russell | 1872-05-18 | 四语 | https://www.nobelprize.org/prizes/literature/1950/russell/facts/ |
| 丙寅 | Nelson Mandela | 1918-07-18 | 四语 | https://www.nobelprize.org/prizes/peace/1993/mandela/facts/ |
| 丙寅 | Alice Munro | 1931-07-10 | 四语 | https://www.nobelprize.org/prizes/literature/2013/munro/facts/ |
| 丁卯 | Joseph Brodsky | 1940-05-24 | 四语 | https://www.nobelprize.org/prizes/literature/1987/brodsky/facts/ |
| 丁卯 | Olga Tokarczuk | 1962-01-29 | 四语 | https://www.nobelprize.org/prizes/literature/2018/tokarczuk/facts/ |

这些 URL 是仓库已有引用，尚未在本次盘点中重新验证页面可访问性或网页是否仍支持精确生日。正式复用时需检查日期、原始历法以及来源支持的生平范围，不能仅凭来源域名或自动复算宣称核验完成。

## 来源字段和数据结构缺口

当前人物资料直接嵌在 `JournalSection.table.rows: string[][]`；行依次展示姓名、生日、日柱或原创动物名称。来源另外存放于 `JournalSection.sources: { label: string; href: string }[]`。

没有独立人物中心表，也没有稳定人物 ID 或显式的人物行到来源的关联。没有以下结构化字段：原生日文字、原始历法、转换后的公历日期、出生地、日期所指地区、已知或未知出生时刻、日期争议、证据等级、来源核验日期、来源支持的具体字段。性别和领域也没有结构化覆盖统计。现有测试确认算法结果和来源数量，不证明来源真的支持生日。

可额外研究的仓库内资产：`lib/journal-pamela-colman-smith.ts` 的人物文章 `about` 字段包含 Pamela Colman Smith、`birthDate: "1878-02-16"`、`deathDate: "1951-09-18"`，且已有四语人物故事和图像。现行日期算法将该生日算作乙丑。`sameAs` 包含 Wikipedia、Wikidata、Smithsonian；文章来源包含博物馆、图书馆和学术项目。但精确出生月日未在数据中绑定到明确生日证据，**这里只列为待研究资产，不能直接视为已核验新增人物**。

## 日期算法、跨时区与历法边界

`lib/day-pillar.ts` 的 `calculateDateDayPillar`：

1. 仅接受 `YYYY-MM-DD`，用 `Date.UTC` 的年月日回读校验公历有效性，限定 1800–2100。
2. 调用 `Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar().getDayInGanZhi()`。正午只是所填日期的计算锚点，不能当作人物出生时刻。
3. 按民用零点换日；没有出生时刻、地点或时区参数，不把一个公开生日先转换成 UTC 日期，也不推断完整八字。

人物章节应明确约定：**采用来源所列、已核定为当地公历的生日，按民用零点日界作日期对应**。这是日期计算关系；生辰不明时不能声称两人完整命盘相同，也不能拿人物成就验证命理。

完整八字是另一个计算流程：`lib/engines/time.ts` 通过出生地日期特定的 IANA 规则解析当地时间，拒绝夏令时重复时刻和不存在时刻；然后使用经度及近似均时差校准太阳时。`lib/engines/bazi.ts` 使用 `EightChar` sect 2 的午夜太阳时日界。日期卡和完整报告接近午夜时可差一天。已有 `lib/day-pillar.test.ts` 例子：石家庄 1982-03-21 00:10 的日期结果为癸卯，太阳时校准落到 1982-03-20，完整盘日柱为壬寅。不能因缺时刻而擅填正午或固定 UTC+8 来宣称全盘一致。

仓库没有人物原生日的儒略／格里高利历标识，也没有按出生地区历史改历的转换模块。依赖 `lunar-javascript` 的 `Solar` 内部使用固定的 1582 年历法分界，并拒绝 1582-10-05 至 1582-10-14；这不是各地历史改历校准。产品包装目前拒绝 1800 年以前输入，因此古人资料不能绕过下限直接硬算。1800 年以后仍使用旧历的地区，其历史人物生日也须先保留原始记载、查证转换为公历，不能默认网页上的月日已经是公历。争议生日应保留不确定性，无法核定则暂不分配唯一日柱。

## 已排除材料

`docs/day-pillar-enrichment-20261005.md` 记录：乙亥旧稿的纳音和名人章节因为没有完成事实复核而删去；四个诺贝尔官方页面读取曾返回 403，只有卡尼曼（Daniel Kahneman）／莫里森（Toni Morrison）的官方搜索摘要提供生日。本盘点没有恢复这些候选，也没有把搜索摘要当成已完成网页核验。该记录还指出甲辰旧稿去掉未充分核验的名人、纳音及资产推断。旧分支和原稿内容不能未经新核验重新拼回现行文章。

## 安全的后续独立 PR

当前互链与丁酉男女修订 PR 先完成。后续人物 PR 从已存在的 10 名人物及新的可核查生日来源开始，建立可检查的数据记录和人物到证据的对应，不复制或迁移全部百科文章。

- 在受支持年份内，先记录原生日、历法、来源、核验日期、日期争议和明确的计算约定，再复算日柱；未知时刻保持未知。
- 来源优先官方机构、人物官方资料、博物馆、档案馆或可靠传记资料。公开 API 可用于寻找候选，正式展示回到支持生日的具体页面；不照抄来源不明的八字站。
- 分批补足尚无人物的日柱，逐步兼顾领域及男女；缺可靠资料的条目暂留空，不为了每篇两人或每篇男女一人凑数。
- 文章只写来源支持的公开生平，人物日期对应与传统术语、解读及原创动物角色分清；不能推断私生活、性格、婚恋或把成就当命理有效性证据。
- 保留原有四语内容和 URL，保留原发布日期；只对实质编辑的语言更新修改日期。新增生日记录需验证来源到人物的绑定、历法约定、算法复算、locale 与互链。

## 仓库指令检查

该 checkout 未发现 `AGENTS.md`、`.agents` 或 `.agents/skills`；`/workspace/AGENTS.md` 不存在，`/workspace/.agents` 为空。没有读取依赖目录中的 `node_modules/next/AGENTS.md` 作为项目指令。`package.json` 没有通用 `test` 脚本；现有相关测试使用已安装的 `tsx --test`，生产构建脚本为 `next build --webpack`。本次只执行了数据读取和复算，没有运行完整构建或修改依赖。

## Parent-supplied research candidates (calculation only)

The parent supplied institution-backed birthday research for these 22 candidates. This step checks the date calculation only; it does not independently verify the linked birthday sources or publish any new person. Names, fields and source receipts remain in the parent research task.

| Candidate | Supplied Gregorian birthday | Date-based pillar |
| --- | --- | --- |
| Toni Morrison | 1931-02-18 | 甲辰 |
| Katherine Johnson | 1918-08-26 | 乙巳 |
| Sally Ride | 1951-05-26 | 丙寅 |
| Martin Luther King Jr. | 1929-01-15 | 庚申 |
| Marie Curie | 1867-11-07 | 辛卯 |
| Serena Williams | 1981-09-26 | 丁未 |
| Venus Williams | 1980-06-17 | 辛酉 |
| Frida Kahlo | 1907-07-06 | 丙辰 |
| Albert Einstein | 1879-03-14 | 丙申 |
| Charlie Chaplin | 1889-04-16 | 壬戌 |
| Tsung-Dao Lee | 1926-11-24 | 丁巳 |
| Qian Xuesen | 1911-12-11 | 乙卯 |
| Ella Fitzgerald | 1917-04-25 | 丁酉 |
| Duke Ellington | 1899-04-29 | 丁卯 |
| Rachel Carson | 1907-05-27 | 丙子 |
| Maya Angelou | 1928-04-04 | 甲戌 |
| Thomas Edison | 1847-02-11 | 丁丑 |
| Eleanor Roosevelt | 1884-10-11 | 甲午 |
| Neil Armstrong | 1930-08-05 | 丁亥 |
| Ansel Adams | 1902-02-20 | 甲戌 |
| Rosa Parks | 1913-02-04 | 丙辰 |
| Tu Youyou | 1930-12-30 | 甲寅 |

With the four existing published pillars this would cover 22/60 pillars; 38 remain uncovered: 戊辰、己巳、庚午、辛未、壬申、癸酉、乙亥、戊寅、己卯、庚辰、辛巳、壬午、癸未、甲申、乙酉、丙戌、戊子、己丑、庚寅、壬辰、癸巳、乙未、戊戌、己亥、庚子、辛丑、壬寅、癸卯、丙午、戊申、己酉、庚戌、辛亥、壬子、癸丑、戊午、己未、癸亥.

Toni Morrison was excluded from earlier drafts because evidence was insufficient then; this newly supplied source research must be evaluated as a new receipt rather than reviving the unsupported old assertion. Marie Curie’s Warsaw birthday needs the source’s public Gregorian convention to remain explicit. Charlie Chaplin’s official biography date is adopted as a biographical convention rather than a verified birth certificate. No candidate has a birth time, so none receives a full BaZi chart.

The parent subsequently supplied independent results using the USNO/Richards Gregorian-to-JDN formula and a Hong Kong Observatory 2022-09-08 Jia Zi civil-date anchor. All 22 supplied results agree with the local `calculateDateDayPillar` table above. The parent reports that its two independent date methods agree across 109,938 dates (1800–2100); this task did not repeat that exhaustive run, and agreement of date methods is not verification of a complete birth chart or of each biography source. This batch itself covers 20 distinct pillars, and the union with the four already published pillars covers 22.

Parent methodology sources: [USNO Explanatory Supplement calendar chapter](https://aa.usno.navy.mil/downloads/c15_usb_online.pdf), [Sexagenary-cycle date-method explanation](https://ytliu0.github.io/ChineseCalendar/sexagenary.html), [HKO September 2022 calendar](https://www.hko.gov.hk/tc/gts/astron2022/files/2022cal09.pdf).
