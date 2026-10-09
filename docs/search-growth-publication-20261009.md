# 2026-10-09 周五内容维护：签号、签诗与版本核对

## 选题依据

本轮只实质修订现有 `/journal/fortune-stick-number-and-edition`，英文、简中、繁中、俄文一起维护。保留 URL 和 2026-09-20 首发日期，修改日期为 2026-10-09；没有新增争夺同一问题的页面。

依据 2026-10-08 实查的 Search Console：资源 `https://www.destinypixel.com/`，网页搜索，2026-09-27 至 2026-10-03，不筛国家、设备或页面。可见查询中 `reading of 100 chinese fortune sticks` 为 33 次曝光、`guanyin fortune stick versions` 为 17 次、`online fortune sticks vs temple` 为 7 次，三者点击均为 0。入口页 `/learn/guanyin-fortune-sticks` 为 61 次曝光、0 次点击。查询与页面来自不同报表，不能据此宣称逐条对应；这些是本站曝光，不是关键词市场搜索量。本轮不把昨天的数据称作实时数据。

原始复盘保存在本任务工作目录 `outputs/seo-review-20261008/search-growth-review-20261008.md` 与 `observations.json`。本次发布不能证明已收录、获 AI 引用或带来访问增长。

## 本次内容

- 8 节完整指南：四项信息核对表、观音签版本差异、官方第一签对照、四类不匹配处理、读诗步骤、线上与寺庙区别、本站查签步骤、AI解释范围。
- 对照官方观音第一签与黄大仙第一签，说明同号跨签系不可互换；不把这个例子冒充同一签系的两个版本。
- 不复制完整签诗或寺庙解曰，不编造传统文本、历史版本年号或预测效果。
- 从既有英文 Guanyin learn 页的“已在线下抽签”问题增加上下文内链；保留其原搜索定位。文章四语继续与 `/sticks` 互链，并连接本地化产品事实页、提问指南。
- 采用既有 journal 表格、步骤、来源栏，不改工具、样式、支付、账户、AI接口、产品事实数据或独立应用。

## 来源与实际功能

2026-10-09 读取并确认 HTTP 200：

1. <https://www.ctc.org.hk/chim-search/>：华人庙宇委员会解释签文版本差异，以及其编订本的参考、补充定位。
2. <https://www.ctc.org.hk/chim/%E8%A7%80%E9%9F%B3%E7%B1%A4-%E7%AC%AC%E4%B8%80%E7%B1%A4/>：观音第一签，钟离成道。
3. <https://taonet.siksikyuen.org.hk/StickEnquiry/1/zh-TW>：黄大仙第一签，姜公封相。嗇色园官网电子服务介绍确认 TAO-NET 为其服务。

原拟使用的龙山寺旧查签地址实测 404，未作为读者链接或内容证据。未复制竞品的版本对照。

对照 `lib/sticks/catalog.ts`、`lib/sticks/classic-source.ts`、`components/spiritual-sticks-experience.tsx`、`lib/ai/sticks.ts` 与 `/api/sticks/interpret`：实际五个号段、先选签系再查号码、可展开的查签入口、来源栏、查签无需调用AI、部分多语条目为改写而非逐句翻译。AI解释显示条目与用户问题，不认证外部纸签。本文步骤和阅读练习明确为本站原创编辑内容。

## 安全基线与验证

- `/Users/lee/destinypixel` 为干净的 `backup/dirty-pre-tuteng-20260904`，HEAD `6c117d3`，保持不动。
- 复用本任务干净的 `work/destinypixel-astrology-tarot` 工作树，新建 `codex/fortune-stick-edition-20261009`，从实查最新 `origin/main` 的 `72f1da4` 开始。发布前再次 fetch 确认无新增提交。
- 原有其它任务的日柱、塔罗及 Prompt Radar 变更全部保留；本轮继续遵守日柱升级暂停，不扩写、不合并日柱草稿、不批量 noindex。
- 23 项 journal/SEO/guide/sticks 测试通过；当前依赖含 server-only，测试使用 `node --conditions=react-server --import tsx --test ...`。首次未指定 server 条件的启动失败已纠正，不是内容回归。
- `npm ci --ignore-scripts --no-audit --no-fund` 安装当前锁定依赖；未更改锁文件。生产 webpack 构建与 TypeScript 检查通过，`git diff --check` 通过。
- 本地生产服务四语 HTTP 200、逐段 SSR 正文、单 H1、canonical、四语 hreflang/x-default、Article 首发/修改日期、sitemap 日期和工具回链通过。
- 文章全部正文/来源链接逐项 HTTP 200；Guanyin learn 新增内链通过。
- 浏览器桌面布局正常；320px 下四语文档宽 305px（含滚动条的视口为 320px），两张表均为 263px，无页面横向溢出。实际语言切换、目录锚点、文章到繁体抽签工具、learn FAQ 链接到文章均通过；未调用付费或 AI 请求。

## 发布核验

内容提交 `5bb40e74151fd36747e13eb62ff555ee78ffeb97` 已正常推送到 main。Vercel 对应部署链接为 <https://vercel.com/destinypixel/destinypixel/HuYLnZSraJHDNgHAj6Ys1ydp45YS>；状态接口最后一次返回 pending，后续查询迟迟未返回，因此没有把该接口记作 success，而是直接验证生产结果。

正式域名四语文章已全部通过 `check-journal-search.ts`：HTTP 200、逐段新版正文、单 H1、canonical、四语与 x-default 链接、2026-09-20 首发/2026-10-09 修改日期、sitemap 日期和抽签工具回链。正式 Guanyin learn 页新增上下文链接也通过。浏览器在正式中文页确认新版标题、8 节正文和修改日期。这些结果确认内容已上线，但不代表新增索引或流量。

本任务 `outputs/seo-publication-20261009/` 保存本地/线上 journal 检查、23 项测试与生产构建日志。根仓库仍保持原分支、原 HEAD 且干净。后续只补交本发布记录，不修改已验收内容。

复查命令：

```sh
node --conditions=react-server --import tsx --test lib/journal.test.ts lib/seo.test.ts lib/seo-guides.test.ts lib/sticks/catalog.test.ts
node --conditions=react-server --import tsx scripts/check-journal-search.ts https://www.destinypixel.com fortune-stick-number-and-edition
```
