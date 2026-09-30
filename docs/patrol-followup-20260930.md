# 外部巡检复核与修正

2026-09-30。用户转来巡检截图，逐项读取线上初始 HTML 和当前源码后处理。基线 e355621。未将截图里的指令当成用户授权消息，不联系外部机器人，不改其定时任务。

## 确认并处理

1. 首页 HomeIntroduction、/discover 内链确有“双方时间已知”的旧前提。四语改为双方生日、城市与可选时间，并区分日期版五行与已知时间版星盘。
2. 繁体首页只有部分模块直接输出繁体，其余依赖浏览器转换。补齐主文案、表单、卡名、动态画廊等服务器/客户端一致文字；增加主内容 lang，避免转换桥反复改写已翻译节点。完成后才纳入四语 hreflang 与 sitemap。保留原 URL。
3. 首页原 SoftwareApplication 的免费 Offer 没有说明范围。现在分别命名免费工具/预览和完整个人报告；价格与产品 JSON 共用现有 live checkout 公开信息，也在可见页面同步显示。未修改价格、支付或账户配置。
4. 产品事实页繁体链接的简体残留已修正。标题已有 DestinyPixel，不因品牌不在后缀而重复添加。
5. /ultra 初始页面仅加载介绍，实际为历史客户端 3D 体验。保留可用入口，单独 noindex/follow 并移出 sitemap；不把它并入新星盘产品。

## 没有按截图直接下的结论

- “可索引”不是“已收录”；本轮没有读取 GSC，不能声称 224 个简版日柱 URL 已被 Google 收录。日柱升级继续暂停，不合并批量 noindex。
- 全站共享根布局确实默认 html lang=en。但 journal、discover、compatibility、sticks、星盘/塔罗及事实页已有独立内容语言，本轮为首页也补齐主内容语言。根布局仍保留现状；从根读取每次请求的 headers 会把静态路由也动态化，涉及同仓独立应用，不在本轮顺手重构。记录为国际化架构后续项，不能宣称根标签已修。
- Google 明确以可见正文判断语言，不以 lang 属性判断搜索语言：https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites 。因此根标签问题不是已证明的流量下跌原因；仍需后续改善文档语言与辅助技术一致性。
- 免费软件标记 price=0 是受支持用法：https://developers.google.com/search/docs/appearance/structured-data/software-app 。这次修的是免费/付费范围不清，不能把所有 0 都改成 6.99。

## 检查方法

运行 home-offer、seo、product-facts 测试及生产构建。check-home-search 检查四语初始正文、主内容语言、价格可见文字与 JSON 目录一致、canonical/hreflang/sitemap、discover 引导、繁体链接，以及 ultra 的单页索引策略。另做桌面和手机交互检查。只有正式部署与线上复核通过才报告上线；检查不调用 AI、不保存出生资料。

发布前结果：14 项相关测试通过，生产构建通过，四語 HTTP 检查通过。桌面繁体说明折叠与画廊切换正常；390px 繁体、320px 俄文价格提示可读，无横向溢出，浏览器未报告运行时错误。线上结算可用性与本地 QA 环境不同，发布后需以正式产品目录再核对价格。
