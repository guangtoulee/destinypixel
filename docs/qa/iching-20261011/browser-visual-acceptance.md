# 最终浏览器验收 · 2026-10-11

本地最终生产构建在 `http://127.0.0.1:3035` 验收通过。完整驱动退出码为 0：**175 项检查、104 个响应式视图、37 个交互工作流、40 个 Googlebot SSR 页面**，覆盖四语起卦工具、八卦目录和全部 32 篇八卦文章。40 个相应 sitemap 目的地全部存在，整份 sitemap 的 982 个 URL 无重复。

最终报告为 `browser-final/report.json`，完整日志为 `browser-final.log`。应用 page errors、同源 HTTP failures、实际或尝试中的 API 写入均为 0。308 条控制台错误只有 `Failed to load resource: net::ERR_FAILED`，来自测试主动禁用 Vercel analytics/speed-insights，已完整保留；没有把这些预期隔离消息当作产品错误。驱动产生 87 张截图，另补 1 张完整中文结果元素截图。

功能矩阵包括逐次六次三钱与一次六爻生成、逐枚原始钱值复核、底到顶爻序、同一 JavaScript 任务中连续六次点击的锁、动画中切方法/重起/撤回/返回/离页再返回、减动效、活动方法重复点击保留结果、手动四态与 18 枚钱录入、全阴/全阳/全动四个基准、数字 1/5/酉 10 → 44 四爻动 → 57、七类无效数字字面及上限、春节/午夜/23:00/00:59→01:00/闰月、三个浏览器时区的北京时间独立性，以及本卦和变卦文章新标签保留起卦记录。首页和工具目录入口通过，原有 Tarot 独立导航、文章目录与返回通过。

已使用 `view_image` 实际查看最终中文 320、俄文 320、英文桌面、四语正文、三爻图、钱值记录和完整结果。中文 320 标题的孤行已消除；英文/俄文学堂链接箭头改 SVG 后正常。320 俄文钱值记录没有横向溢出，六行、钱值和动作能完整显示。四语正文段落与实际语言对应；繁体正文保持繁体，经典《说卦》引文在四语中明确标为原文，现代解释分别使用对应语言。中文三爻图明确标出上/中/初爻及由下往上数的约定。全 32 篇正文、反思、上下卦/相关文章链接和图形还通过了源文本及独立位图比对。

完整中文结果图已额外用生产浏览器实际生成并读取：**本卦困 47、初/四爻动、变卦节 60**，上/下卦、两套六爻图及 `6 · 7 · 8 · 9 · 7 · 8` 和六次三钱原值均同时展示；该补图执行中 page errors 和写入尝试也为 0。

建议提交以下 10 张代表图片，其余全量图片保留本地：

| 图片（位于 `browser-final/`） | 证据 |
| --- | --- |
| `zh-iching-320.png` | 窄中文标题修复 |
| `en-iching-1440.png` | 桌面工具及 SVG 箭头 |
| `zh-coins-raw-faces-390.png` | 六次逐枚钱值、老阴/老阳说明 |
| `ru-coins-record-320.png` | 窄俄文爻序、钱值与操作布局 |
| `en-trigram-qian-body-390.png` | 英文正文、经典/原创区分 |
| `zh-trigram-qian-body-390.png` | 简体正文、经典/原创区分 |
| `zh-TW-trigram-qian-body-390.png` | 繁体正文、经典/原创区分 |
| `ru-trigram-qian-body-390.png` | 俄文正文、经典/原创区分 |
| `zh-trigram-qian-figure-390.png` | 三爻图及上下计数说明 |
| `zh-coins-complete-result-390.png` | 完整 47 → 60 结果与原始记录 |

最初全局 `[role=alert]` 查询把 main 外空的 Next.js route-announcer 算作产品错误。实际 DOM 已核实，驱动已限定 workbench 内错误；旧失败及诊断保存在 `browser-initial-fixture-failure.json` 与 `.log`，最终完整矩阵重新执行通过。

线上验证仍受执行环境网络限制。Chromium 对 Preview 的 `/iching?locale=zh` 和 `https://www.destinypixel.com/` 均返回 `net::ERR_TUNNEL_CONNECTION_FAILED`，停在 `about:blank`，没有 HTTP 响应。证据为 `browser-public-probe.json`。因此本报告没有宣称实际线上部署、版本或交互已验证，也没有调整代理或部署安全设置。
