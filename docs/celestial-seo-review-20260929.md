# 星盘与塔罗搜索入口优化、外部 SEO 草稿审阅

日期：2026-09-29。范围：审阅昨日外部团队改动，增强现有星盘和塔罗工具页的搜索入口。没有读取本轮 GSC 查询或 Vercel 流量，不报告新增排名、搜索量或访问增长。

## 先核对是否已经发布

GitHub 只读 API 与分支源码核对：

- PR #12 `Publish full Yi Hai and Jia Chen day-pillar articles`，head `fa0b9a2`，2026-09-28 更新；当前 open、draft、merged=false。正文增加乙亥和甲辰各 EN/简中/RU 模块，繁体沿用转换。**这两篇深度稿尚未进入 main**；线上旧 URL 仍是现有简版。https://github.com/guangtoulee/destinypixel/pull/12
- PR #11 `noindex incomplete day-pillar portraits`，head `fb65f5a`，当前 open、draft、merged=false。提议把当时 57 篇简版的 228 个语言 URL 设为 noindex 并移出 sitemap。**尚未上线**。https://github.com/guangtoulee/destinypixel/pull/11
- 9/28 主分支可见的相关变更为本站星盘、塔罗及后续交互/保存功能；不能因为 PR 更新时间就是昨天，就把草稿当成生产改动。
- 工作基线为干净的 `codex/astrology-tarot-20260928`；只 fast-forward 到 `720b5df` 保留远端现有内容，不修改 Prompt Radar。主目录的历史 backup 分支未动。

## PR #12 内容判断

可用的部分：两篇不是换动物名称的模板。乙亥用“感受变化快、回话慢、创作需要收尾”的具体场景；甲辰写长期经营、承担与过度替人做决定的关系摩擦。都有性格、感情、事业、钱财习惯、实践、生日案例与日期边界说明。明确动物名是本站原创、场景是举例、生日相同不能证明人格或成就来自日柱，这些值得保留。

尚不能直接作为已验收发布：

1. **结构冲突**：分支基于 `90d4067`。main 今日已把 `fullPillarProfiles` 改成 `{ updatedAt, translations }` 并加入丁卯，PR 仍使用裸 translations 加另一张日期映射表。合并时应采用 main 新结构，只加入两篇，保留丁卯及所有真实日期。不能照搬分支文件覆盖。
2. **来源缺口**：甲辰开头“古书形容灯火能照到日月照不到的地方”，以及两篇的纳音、藏干描述，只在该节链接香港天文台干支介绍和本站入门。该天文台页面并不足以承载这些具体古籍描述。发布前补明确原典版本，或删去古书归属并标为本站意象延伸。
3. **生日复核的边界**：本轮用当前 `calculateDateDayPillar` 复算 1934-03-05、1940-06-01 得乙亥；1931-02-18、1891-11-14 得甲辰，与稿件一致。Nobel facts 正文及 API 本轮请求返回 403；官方检索结果可核对 Kahneman 与 Banting 的生日，Thorne/Morrison 的完整外部事实检查本轮未完成。不能把仅有日期复算写成四人全资料已独立核实。
4. PR 将新标题 60 字符设为测试硬限制，属于编辑偏好，不是 Google 收录门槛；不要为了机械长度丢掉关键语义。正文首段可再强调“传统象征画像”，避免 description 的人物断言被截取后脱离文章边界。
5. 两篇中文来源链接中部分 `/learn/... ?locale=zh` 实际仍是英语指南，应标清语言或换同语言 journal 资料，不能因 query 参数存在就认为有中文正文。

本次只审阅并记录，未代改、合并或关闭外部 PR。文章不应推倒重写，完成上述修订并按现行四语发布流程核验即可采用。

## PR #11 收录方案

不在本轮采用批量 noindex。`portraitDepth` 是编辑状态，不能单独证明每个页面对读者无价值或正在损害整站。当前 main 已有四篇深度稿，其余 56 篇仍保留索引资格。需要逐页结合独特内容、实际查询/索引信息决定扩写、合并或 noindex；本轮没有取得这些后台证据。草稿未发布，因此也不能解释此前流量变化。

## 本轮实施的关键词与内容

以下为功能与问题驱动的目标词，不声称有搜索量数据：

| 页面 | 英语 | 简/繁体 | 俄语 |
| --- | --- | --- | --- |
| /astrology | free birth chart calculator; natal chart; Sun Moon rising; houses; aspects; birth time | 免费星盘查询 / 免費星盤查詢；本命盘；太阳/月亮/上升星座；十二宫；相位 | натальная карта онлайн бесплатно; асцендент; Солнце и Луна; дома; аспекты |
| /tarot | free online tarot reading; three-card tarot; love tarot; Celtic Cross; upright and reversed meanings | 在线塔罗 / 線上塔羅；三张牌阵；感情塔罗；正逆位牌义；凯尔特十字 | Таро онлайн бесплатно; расклад на три карты; Таро на отношения; Кельтский крест; перевёрнутые карты |

- 保留 `/astrology` 与 `/tarot`，每页 EN/简中/繁中/RU。title、description、H1、首页卡片与链接文案同步；不堆 meta keywords，不拆同义薄页。
- 两页增加初始 HTML 可读的入门说明、三步使用、三组核心解释、实际使用问答及四个相关入口。私人成果仍在既有交互区，不输出用户资料供搜索收录。
- 星盘明确热带黄道、整宫制、6°容许度、出生时间限制与计算/AI的区别；塔罗说明真实五种牌阵、78张牌、手选/随机、正逆位、AI提问及保存范围。没有改变算法、免费额度、支付或账户逻辑。
- 保留原有 WebApplication，补对应 WebPage 与可见面包屑的 BreadcrumbList；四语自指 canonical、互返 hreflang 和 x-default 保持一致，两个工具 sitemap lastmod 更新到真实修订日。
- 旧 `/insights/i-ching-vs-tarot` 增加独立手选塔罗与旧 Oracle 的区别和直达链接；`/learn/what-is-bazi-birth-chart` 增加西方星盘入口，保留二者区别。两篇旧英文指南本身未宣称新增四语。
- `llms.txt` 补准确工具入口与方法，仅作辅助说明，不把它当成排名机制。

## 来源与方法

- Google Search Essentials：可识别的检索词放入标题、主标题、链接等自然位置。https://developers.google.com/search/docs/essentials
- Google title links：避免堆词，标题需准确表达页面。https://developers.google.com/search/docs/appearance/title-link
- Google 支持的 meta：meta keywords 不用于索引/排名。https://developers.google.com/search/docs/crawling-indexing/special-tags
- Google 多语言版本：https://developers.google.com/search/docs/specialty/international/localized-versions
- Google AI 搜索指南：可抓取、有用、清晰且减少重复的内容仍是基础。https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- 产品依据：`lib/celestial/astrology.ts`、`tarot.ts`、`natal-reading.ts`、`records.ts` 和当前交互代码。象征解释与天体计算分别说明。

## 验证

- 25 项 celestial/SEO/guide 测试通过；生产 webpack 构建通过，TypeScript 与 diff 空白检查通过。
- `scripts/check-celestial-search.ts http://localhost:3045`：8个语言工具页的200、完整SSR正文、单H1、title/description、canonical、互返语言、WebApplication/WebPage/BreadcrumbList、真实lastmod及相关内链通过；首页四语入口、两篇旧指南反向链接与 llms 入口通过。
- 1280px 桌面星盘/塔罗指南、320px 繁体星盘和俄语塔罗显示正常；俄语问答可点击展开。发现并局部修复原有 body 最小 320px 在占宽滚动条环境造成的 15px 横向溢出，两页实际 scrollWidth 与 clientWidth 一致。无浏览器控制台错误。属于浏览器视口检查，不是实体手机测试。
- 内容提交 `c85812801adce6f03a2c0c6142125ce30084811f` 已正常推送到 main；Vercel 部署 `5YiJtrEfV5YFejx1NaQ6kD6jPEqG` 状态 success。
- 生产域名的8个语言工具页检查全部通过：HTTP 200、初始 HTML 完整正文、单 H1、语言化标题描述、canonical/hreflang、结构化数据、lastmod和内链；首页四语入口、旧指南入口及 llms 链接通过。
- 生产中文塔罗指南与繁体星盘页面已在浏览器核对。本次没有读取新的 Search Console 或访问统计，以上仅确认发布和可抓取内容，不能当作已经收录、排名提升或流量增长。
