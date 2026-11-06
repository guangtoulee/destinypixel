# 出生资料指南修订 · 2026-11-06

周五仅完成一项内容更新：实质修订 `/journal/prepare-birth-date-time-place`。保留原 URL、2026-09-11 发布日期及六个既有章节锚点，修订日期为 2026-11-06；英文、简体、繁体、俄文同步。没有新增竞争文章、恢复日柱专题或改计算、账户、支付及 Prompt Radar。

## 选题依据与内容

- 依据 11/02 已保存复盘的第二项机会及 9/20 执行计划中跨城市、夏令时、生日边界的待办；没有读取新的后台数据或编造搜索趋势。11/03 已完成未知时辰合盘教程，本次提供输入准备与时区解释，并回链那篇完整流程。
- 增加三种工具的填写对照：独立本命星盘、个人八字出生图、双人合盘。修正旧文未区分工具而造成的“没有未知时间模式”歧义。
- 核对独立星盘的自定义地点功能：经纬度和 IANA 时区必需；八字与合盘仍使用支持城市列表。不把单独工具功能推广成全站通用能力。
- 新增虚构纽约实例：1990-07-01 00:10、New York，对应 UTC 04:10；八字近似太阳钟为 1990-06-30 23:10，修正约 −59.55 分钟。说明原始记录不跟着改日期，也不能把校正值填回表单；未知时辰模式仍采用民用日期。
- 增补真实调钟情形：纽约 2024-03-10 02:30 不存在，2024-11-03 01:30 重复，当前程序拒绝两者而不代选。普通加载失败不能据此归因用户输入；本次没有声称修复星盘错误事件。
- 新增星盘、八字表单、合盘、产品事实及两篇相关指南的上下文内链。沿用 Article、canonical、四语言互链、x-default 与 sitemap；实质修订才更新 lastmod。

## 依据与复现

产品代码核验：`lib/engines/time.ts`、`lib/engines/bazi.ts`、`lib/engines/astrology.ts`、`lib/celestial/astrology.ts`、`components/celestial/astrology-experience.tsx`、`lib/compatibility/model.ts`、`lib/compatibility/date-window.ts`。示例使用公开城市坐标与虚构日期，在本地直接运行现有计算函数，没有调用 AI 或读取私人报告。

重新核对公开来源：

- [IANA 时区数据库](https://www.iana.org/time-zones) 与 [北美历史规则](https://data.iana.org/time-zones/tzdb/northamerica)。
- [NOAA 太阳位置公式](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)：用于区分时区、经度、均时差的作用，不声称本站使用与 NOAA 完全相同的近似公式。
- [Astronomy Engine 文档](https://github.com/cosinekitty/astronomy/tree/master/source/js)：UTC 时刻与地心坐标。
- [Lunar 干支说明](https://6tail.cn/calendar/lunar.ganzhi.html) 与 [NIST 调钟规则](https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst)。

这些资料支持历法和时间换算，不作为性格、关系或未来预测效果的证据。

## 工作树与验收

从最新 `origin/main` fd74ca0 建立隔离工作树 `work/destinypixel-birth-input-guide-20261106`，分支 `codex/birth-input-guide-20261106`。主目录保留原分支和未跟踪的 museum 工作。已有工作树均不切换、不覆盖；依赖锁文件与现有安装一致，仅建立 node_modules 链接，无环境文件复制。

- Node 22 生产构建通过。
- Journal、SEO、主题、时间换算、星盘与日期版合盘 51 项测试通过；ESLint 与 diff 检查通过。
- 额外复现纽约实例，核对 UTC、太阳钟和原锚点保留；四语言均八节完整正文，链接文字存在且语言路径一致。
- 本地 HTTP 检查四版通过：200、标题/H1、完整段落、canonical、hreflang/x-default、Article 日期、sitemap 和工具链接。
- 浏览器：四语言 320px 无整页横向溢出；中文表格与俄文实例可读，章节目录可跳转；1280px 英文实例表格正常，文章链接可到本命星盘表单。

证据存于本地 `outputs/seo-publication-20261106/`，包括计算示例、修改前后正文、测试/构建日志、HTTP 检查与移动/桌面截图；未加入公开仓库。

## 发布

待正常 main 推送后核验生产部署和四语言线上正文；尚不宣称搜索收录或流量变化。
