# 搜索入口改进：发布与验证记录

日期：2026-09-23。依据：[多语言搜索意图研究](search-intent-research-20260923.md)、[24 项语言—页面映射](search-keyword-map-20260923.csv)。不是根据未取得的关键词搜索量制作。

## 范围

改进四语言 `/discover` 的搜索标题、可索引的实际说明、免费日干支/元素结果；首页按钮、抽签/配对同语言内链和俄文标题；修正一处 I Ching/Tarot 产品描述矛盾。保留现有生日卡分享路径。没有修改支付、账户、评分算法、用户资料存储或 Prompt Radar。

## 仓库安全

从刚获取的 `origin/main` 4f7d67d 建立隔离工作树 `codex/search-intent-20260923`，未切换原仓库备份分支，未动兼容性工作树中的两份未跟踪记录。发布前再次 fetch；HEAD 与 origin/main 的提交差异为 0/0。只提交本次文件。

## 本地验证

- `npm run build`：通过。
- 日期计算、日柱内容、SEO、旧指南、journal 相关测试：28 通过，0 失败。
- `tsx scripts/check-search-entrypoints.ts http://localhost:3039`：4 种语言的初始 HTML、单 H1、标题、canonical、hreflang、WebApplication 语言、日历来源、sitemap 与 8 个工具入口内链均通过。
- 60 干支 × 4 语言的既有元素/生肖映射字段检查：240 组完整。
- 浏览器：1280px 桌面及 320px 窄屏检查；英/繁/俄首次查询 1990-01-01 正常，显示丙寅、阳火、虎及对应卡片。修复窄屏全局最小宽度的影响后，英/俄页面内容宽度 305px 等于有效视口宽度 305px，无越界元素。
- `git diff --check`：通过。

## 发布状态

本提交记录本地验证，尚不把它当作线上部署或 Google 收录证据。推送及生产验收后补充下方记录。

## 后续检查命令

```sh
node_modules/.bin/tsx scripts/check-search-entrypoints.ts https://www.destinypixel.com
```

脚本只读公开页面，不提交出生资料，不调用付费功能；检查发布状态与页面内容，不声称能验证 Google 已索引或带来流量。
