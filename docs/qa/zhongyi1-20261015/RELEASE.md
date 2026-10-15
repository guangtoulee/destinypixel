# 燕赵本草长卷 · 发布说明

生产目标：<https://www.destinypixel.com/zhongyi1>。

本次在独立复制仓库分支 `codex/zhongyi1-20261015` 开发。原仓库 `/Users/lee/destinypixel` 停在干净的旧备份分支，未改动；已读取相关只读历史。实际仓库及隔离副本最初均无 `.agents/skills`，Next dev 临时自动生成的通用 AGENTS/CLAUDE 文件在读取相关 Next 文档后清理，未随产品发布。

开始从已知主线 `35812aa` 同步至 `3d9bba8`，开发期间合入当前生产 `94f5379`，保留其他人刚上线的 `/zhongyi2`。发布前再次 fetch 核对主线。产品修改只在 `app/zhongyi1/`、`public/zhongyi1/`，另附本次 QA 证据；全站布局、导航、robots、sitemap、proxy、next.config、依赖和既有产品未改。

体验包含艺术书坊入口、三页收集、依线索排序、上墨/覆纸/刷印/揭纸、程序化真实 3D 青瓷药罐与三观察点、可下载 SVG 纪念卡。拖动、划动均有点选替代；支持静音、返回、跳过、重玩、低性能/WebGL 静态替代和图片加载失败的装饰背景。

该页面是独立历史文化演示，非正式官方博物馆。书坊与任务为互动创作，不包含账户、舌照、诊断、医疗服务、疗效宣称、具体药方或 AI 接口。新路由 metadata 为 noindex/nofollow，未加入站点导航或 sitemap。

背景来自主线程提供的 Library 图 `libfile_e419b11aee748191976b55cabdb56b2d`。用受支持的 signed-transfer 流程下载本机，确认并实际查看 1672×941 PNG；原图留在本任务 `assets/yanzhao-library-backdrop.png`。实际发布桌面 WebP 269,728 字节、手机 WebP 114,898 字节。3D 复用现有 Three，不下载模型或视频，第四幕才加载、按交互渲染。

构建 `npm run build`、TypeScript 和本次 TSX 的现有 ESLint 规则均通过；418 页静态生成完成，/zhongyi1 为静态页。构建中既有 Edge Runtime/Node localstorage 警告未升级为无关修复。详细实际浏览器检查和已发现问题的修复复验见 README 与 JSON 报告。手机测试为真实 Chrome 的触控移动视口和原生 CDP 触控事件，未做实体手机或 Safari 验证。

发布前已有路径基线见 production-before.jsonl：首页、塔罗、Journal、Learn、正骨及 /zhongyi2 均200。/jiankangbao 在本次发布前已404；本任务不改变或修复其既有状态。发布后对相同路径进行比较。

Vercel 连接器显式团队项目详情返回403，已用现有 CLI 认证只读核对同一项目和生产域名成功：project prj_slMeI1x88MXzQ04gXZG8hg3pizxU、team team_5OQidQba1dLcpLhkVoOWXZsK、Node24。未修改安全设置、创建凭据或购买服务。发布使用现有 Git→Vercel 生产流程，不另建项目。
