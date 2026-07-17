# 正骨三维解剖科普

这是 `/zhenggu` 的可维护源代码。页面使用 Three.js 加载经过 DRACO 压缩的 Z-Anatomy / BodyParts3D 人体模型，并通过 Next.js 路由中的 iframe 发布静态构建。

## 本地开发

```bash
npm install
npm run dev
```

## 发布构建

```bash
npm run build:deploy
```

将生成的 `dist/` 同步到仓库根目录的 `public/zhenggu-assets/`，Next.js 页面入口位于 `app/zhenggu/page.tsx`。

## 新增师傅手法

在 `src/data.ts` 的 `techniques` 数组中新增配置。每条手法包含：

- `master`：师傅或流派名称
- `region`：对应解剖部位
- `contact` / `stabilize`：主接触和固定结构
- `contacts`：三维接触点坐标
- `vectors`：受力起点、终点和方向标签
- `principle`：解剖与力学原理
- `contraindications`：禁忌和停止信号

高速度、旋转类手法只用于专业原理展示，不应制作成面向患者的可模仿操作步骤。

## 授权

模型和衍生适配按 CC BY-SA 4.0 使用和分发。完整来源与署名见 `public/THIRD_PARTY_LICENSES.md`。
