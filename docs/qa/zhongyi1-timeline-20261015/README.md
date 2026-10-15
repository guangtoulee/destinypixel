# /zhongyi1 — 燕赵医脉 3D 时间长卷验证

默认进入真实 Three.js 伏羲文化场景，铜线连接台西、张元素、李东垣、罗天益、路志正六境。七件对象可聚焦、旋转、缩放并返回，原书坊游戏保留为次入口。所有造型均为程序化艺术示意。历史内容、出处与证据边界集中在 `app/zhongyi1/timeline/content.ts`。

只改本路由，保留远端 `fd80eb6` 的其他页面更新；没有新增依赖、AI调用、模型/视频下载、账户、医疗接口或安全设置。页面继续 noindex/nofollow。

## 实测

- `functional-production-local.json`：独立 Chrome 对优化构建执行桌面 1440×1000 与手机 390×844 全链，20组通过、14次对象检查，全部旋转/缩放以实际canvas像素变化断言。覆盖六境、七对象、时间滑杆、前后边界、滚轮、原生CDP触控拖动、来源与小游戏往返。0页面异常、0意外控制台错误、0 HTTP资源错误。随后仅增强顶栏及短横屏文字背后的深色衬底，重新构建。
- `landscape-final-fix-report.json`：844×390、667×375 两组通过，同屏无纵向滚动，查看器及来源按钮的命中测试和弹窗操作通过。
- `caption-markers-fix-report.json`：手机六境热点矩形避开页眉和底轴；阅读文字区域滚轮不推进相机；画布原生触控仍改变进度和像素。3组通过。
- `fallback-fix-*-report.json`：低内存手机14项、无WebGL桌面10项通过；静态降级可导航、读来源和重试，不显示失效3D控件。
- `fallback-reduced-report.json`：系统减弱动态4项通过。手动偏好跨小游戏往返另有3组本地开发专项通过。
- TypeScript、目标ESLint、`npm run build` 均通过。已有Edge Runtime及Node localstorage构建提示未由本次路由引入。

以上手机为Chrome移动视口与触控模拟，未验证实体手机或Safari。原始开发日志保留了已修缺陷，当前这里只收录通过的最终专项；截图与最终线上验证另行交付。

## 复跑主流程

使用已有 Playwright 与 Chrome，不需要创建凭据或调用收费服务。

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/test \
CHROME_PATH=/absolute/path/to/chrome \
QA_BASE=http://127.0.0.1:3061 QA_OUT=/tmp/zhongyi1-timeline-qa \
QA_SKIP_NARROW=1 QA_FAST_MOTION=1 \
node docs/qa/zhongyi1-timeline-20261015/verify-timeline.cjs
```

网络拦截仅允许目标源GET，屏蔽分析遥测；验证不会发送业务POST。图像与报告输出至QA_OUT。
