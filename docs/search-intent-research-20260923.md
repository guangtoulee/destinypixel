# DestinyPixel 多语言搜索意图研究与部署

研究日期：2026-09-23。范围：玄学主站的日柱、感情配对、抽签及相关原创指南。目的：让已经在搜索这些问题的人，能从搜索标题判断网站是否有用，并在进入后完成对应任务。

## 结论与证据边界

可优先承接的是三个明确任务：**查自己的日柱/日主五行、比较两人的八字关系、求签或理解签意**。动物意象卡是结果的特色，但首次来访者未必认识本站自创的名称。标题和入口应先说明实际功能，进入结果后再展示卡片和解读。

本轮以 AnySearch 通用网页搜索进行了 8 次查询，每次取 5 条结果，共 40 个结果样本。没有指定某一个国家的 Google 登录环境，也没有取得 Keyword Planner、付费搜索量或关键词难度数据。这些是**搜索结果与用词样本**，不是月搜索量、本站排名或全市场需求量。优先级依据产品匹配程度、结果页意图和当前页面缺口，不按虚构的流量大小排序。

本轮未重新取得 GSC 查询表。9 月 23 日前一轮审计中，该资源可见的数据窗口为 9 月 17–20 日，20 次曝光、0 次点击，没有可用的查询明细；这是历史记录，不代表本轮实时数据。不能据此判断哪个关键词已经成功或失败，也不能用 Vercel 总访客代替自然搜索人数。

## 搜索样本

| 原始查询 | 代表结果 | 能支持的判断 |
| --- | --- | --- |
| `free bazi compatibility calculator birth date` | [XuanSeal](https://xuanseal.com/chinese-astrology/compatibility/calculator)、[Shen-Shu](https://www.shen-shu.com/en/bazi-compatibility)、[Your Chinese Astrology](https://www.yourchineseastrology.com/calendar/bazi/marriage-compatibility/) | 样本集中在双人输入和兼容性计算。页面应直接说明需要什么资料、会给什么结果。 |
| `guanyin fortune sticks online meaning` | [OpenFate](https://openfate.ai/en/lingqian)、[Access Chinese](https://accesschinese.com/divination/guanyin/guanyin-fortune-telling.php)、[KauCim](https://www.kaucim.ai/en/articles/guanyin-vs-wong-tai-sin) | 抽签工具、签意与签系辨识是不同但相连的需求；不应把同一签号当成跨版本通用答案。 |
| `day pillar calculator day master free` | [MyBaZi](https://mybazi.app/en/bazi-calculator/)、[Vicki Iskandar](https://vickiiskandar.com/chart)、[Master Sean Chan](https://www.masterseanchan.com/bazi-calculator/) | Day Pillar / Day Master 是可识别的功能词；本站只输入日期的工具不能包装成完整四柱排盘。 |
| `八字合婚 免费 五行 配对` | [OpenFate](https://openfate.ai/zh-hans/compatibility/bazi/marriage)、[算命网工具](https://www.suanming.com.tw/tool/hehun)、[周易文化](https://m.zhouyi.cc/bazi/hh/) | 简体可采用“八字配对、五行关系”说明输入与输出，页面应解释评分的含义和局限。 |
| `觀音靈籤 線上求籤 解籤` | [Lifemap](https://www.lifemap.com.tw/draw-lot/chouqian_guanyin)、[潭水亭](https://www.tanshuiting.org.tw/?act=menuinfo&ml_id=20220912004)、[慈悲心网站](https://cycompassion.org/guanyin-lingke.php) | 繁体版本用“觀音靈籤、線上求籤”更直接；寺庙原文、现代反思和 AI 解读需标清来源。 |
| `бацзы совместимость калькулятор бесплатно` | [Mingli](https://www.mingli.ru/bazi/)、[TvoiBazi](https://tvoibazi.ru/)、[Calculatorov](https://calculatorov.ru/baczy-kalkulyator/) | 俄文应自然使用 Бацзы、совместимость、калькулятор，不能只翻译成笼统的“关系画像”。 |
| `бацзы элемент личности калькулятор` | [TvoiBazi 元素查询](https://tvoibazi.ru/short)、[Mingli](https://www.mingli.ru/bazi/)、[Art Feng Shui](https://art-fenshui.ru/rasschitat-stolpy-sudby.html) | “элемент личности”可作为日主入口词；必须实际输出元素，不能只有动物卡。 |
| `гадание Гуаньинь онлайн` | [Predskazanie](https://www.predskazanie.ru/orakul-guan-yin/)、[Magya Online](https://magya-online.ru/prochee/guan_in)、[Astrocentr](https://www.astrocentr.ru/index.php?przd=guan_in&str=len) | “Гуаньинь / гадание”能明确工具用途，优于没有传统名称的抽象标题。 |

以上主要核对结果标题、摘要与目的。另读了 OpenFate 抽签页的可取得正文；TvoiBazi 仅取得部分表单内容；双人配对结果页面提取失败。因此不声称审查过这些网站的付费功能、算法或转化表现。竞争页面的命理效果表述不作为事实引用。

## 关键词与页面分工

完整四语映射见同目录 `search-keyword-map-20260923.csv`。具体分工如下：

| 入口 | 应回答的问题 | 主要词组 | 页面职责 |
| --- | --- | --- | --- |
| `/discover` 及四语版本 | 我的日柱和日主是什么？ | Day Pillar / Day Master calculator；日柱查询／日主五行；日柱查詢；столп дня / элемент личности | 日期输入后直接给干支、日主五行、日支生肖与卡片。已有免费查询功能作为核心，解释在表单之后。 |
| `/compatibility` 及四语版本 | 两个人怎样相处，五行和星盘各看什么？ | BaZi compatibility calculator；八字合婚／五行配对；八字合婚／五行配對；совместимость по Бацзы | 两人输入、可读对比、评分方法与不确定性；不承诺测出关系结局。 |
| `/sticks` 及四语版本 | 想求签，或者已经有一个签号 | Chinese fortune sticks / Guanyin；观音灵签／在线抽签；觀音靈籤／線上求籤；гадание Гуаньинь онлайн | 选签系、提问、抽签或查签号，清楚区分传统材料与本站现代解释。 |
| `/journal/...` | 方法、差异、怎么读结果 | 不知道出生时间能合婚吗；怎么向观音求签；同一签号为什么不同 | 一篇解决一个实际问题，提供例子、来源和下一步工具链接。已有指南优先完善。 |
| `/day-pillar` | 浏览/分享已有动物意象卡 | Birthday character card / 六十动物卡 | 目前仍是英简双语旧体验和分享目的地。保留分享链接；本轮不做未经评估的整页重定向。查询入口集中指向四语 `/discover`。 |

同一意图不另建一批近义 URL。“免费合婚”“免费八字配对”应由同一个有内容的工具页承接。日柱查询、介绍日柱的指南、单张卡的故事分别承担查结果、理解概念、读个案三个任务。

手串是主站相关内容，但本轮没有专门研究其搜索结果，不把它假称为已验证的大流量主题。先维持五行文化与材质保养的真实内容，不使用健康、转运效果保证来争流量。

## 本轮实施

1. `/discover` 英简繁俄标题、简介与首屏改用日柱 / Day Pillar / Day Master / Бацзы 的准确用语。保留动物卡特色，不隐藏八字文化来源。
2. 免费结果增加真实计算对应的日柱、日主五行、日支生肖，而非仅增加关键词。沿用日期计算与既有干支映射。
3. 四语初始 HTML 增加完整解释：日柱与日主的区别、1990-01-01 → 丙寅的可复现例子、未知出生时刻、午夜换日、日主与缺失/喜用五行的区别。历法来源与本站原创解读分开。
4. 生日入口、配对页、抽签页建立同语言上下文链接。俄语/繁体读者不再从这两个工具的日柱入口被送到英简旧页。
5. 首页按钮明确“查日柱”“比较八字与星盘”“在线求签”等任务。俄文配对和抽签搜索标题补足本地常见术语。
6. 修正 I Ching vs Tarot 引言与本站组合式工具行为的矛盾；没有声称已将整个旧指南库全面改写。
7. 更新生日入口的真实 sitemap 修改日期，并新增 HTTP 检查脚本；维持自指 canonical、四语言互链和 WebApplication 数据。没有增加重复索引页面。
8. 窄屏生日页取消本页受到的全局 320px 最小宽度限制；极窄屏结果的卡图与说明改为上下排列。

## 接下来做什么

按下列顺序执行，后续真实 GSC 查询可调整优先级：

1. **先补强已有观音求签说明页。** 补清如何选签系、写问题、看签号、辨别诗文版本；与现有提问/签号指南分工，加入真实工具示例。英简繁俄完整同步。不要复制一百个空壳签号页，也不能冒充某寺庙的全本。
2. **补强现有八字感情配对说明。** 用匿名演绎的“相生但沟通不顺”和“相克但能协作”两个例子，明确日柱动物、五行、星盘各自贡献。解释分数是本站组织结果的方法，不是经科学验证的婚姻概率。与已有“生肖 vs 八字”“未知出生时间”文章互链。
3. **梳理旧生日卡与查询入口。** 审计站内链接和实际 GSC 落地页之后，决定哪些纯查询入口迁到 `/discover`，哪些分享/卡片链接保留。不要用跨页 canonical 把不同内容硬合并。
4. **补首页繁体服务端正文。** 当前已知首页繁体依赖浏览器转换，因此不应先补一个没有对应初始正文的 hreflang。四语独立工具已能服务端输出，是本轮优先入口。

这些是当前产品与搜索结果支持的内容机会，不是已确认有曝光的查询。保持原有周一复盘、周二/五单项实质更新，不为了更新频率写重复文章。先把现有四语做好，再评估是否需要新增其他语言。

## SEO 与 GEO 的做法

- 开头直接说明能查什么、需要哪些资料、哪些结果免费；正文给可引用的短解释、例子和来源。不要只给客户端空壳或一段品牌宣言。
- 作者/编辑说明、真实发布日期、原始历法来源、本站原创与 AI 解释的界限保持清楚；没有依据的十维宇宙理论不能当科学证据写进工具的计算说明。
- 各语言有完整可读正文、自指 canonical 和对应语言链接。Google 说明语言识别依靠页面内容；标签本身不能替代翻译。[Google 多语言页面指南](https://developers.google.com/search/docs/specialty/international/localized-versions)
- 以原创帮助和完成任务为目标，不批量制造关键词变体页或只重写别人的摘要。[Google 有用内容指南](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- `llms.txt`、结构化数据或更多关键词不能保证 AI 推荐、索引或排名。此轮不把它们包装成独立的流量开关。
- 历法说明引用[香港天文台干支资料](https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm)，它支持历法背景，不支持命理预测准确率。计算例子另外按本站现行代码验证。

## 测量与站外入口

每周记录 Google 的查询、曝光、点击、入口页及日期窗口。样本允许时，再比较两个完整且不重叠的 14 天或 28 天窗口，区分品牌/非品牌、语言和页面；不足时保留“尚不能判断”。不要把发布当天和不完整的今日数据用于宣布增长或下降。

Vercel 单独记录 Production + 主域名的来源及 `tool_start → tool_success / tool_error / tool_fallback`，有数据才计算漏斗。总访客、页面浏览、Google 点击、AI 引荐是不同口径。不能将未知引荐自动记为自然搜索。

站外推广优先匹配具体内容：

- **Pinterest**：一个问题＋结果预览，链接到相应语言工具或指南；延用已写的推广文案包。以站外访问和完成查询为观察目标。
- **YouTube 搜索教程**：“Day Master vs zodiac animal”“How to ask Guanyin fortune sticks”一类有明确答案的教程，使用真实页面演示。视频仍只交付脚本。
- **TikTok**：熟悉的生活情境开头，讲完一个有用结论，再邀请免费查日柱或关系对比；不要求观众先认识本站六十个动物名称。
- **相关社区**：仅在规则允许时回答真实问题，公开说明与网站的关系；不自动批量发帖、不造推荐或外链。

以上是渠道匹配建议，不是已经测试出赢家。链接可带不含个人资料的 `utm_source/utm_medium/utm_campaign`；没有可取得的 UTM 报表时不能编造渠道转化。

发布与验证见 `search-growth-publication-20260923.md`。
