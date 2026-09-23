# 六十日柱图文库：发布与后续编辑

## 本次范围

用户直接要求把已有六十日柱资料与六十张卡图做成独立搜索入口。本次新增59篇简明画像，修订既有甲子长文，合计60篇；均提供英语、简体、繁体、俄语。目录为 `/journal/day-pillars`，单篇为 `/journal/<stem>-<branch>-day-pillar`。甲子保留既有网址。所有版本沿用 journal、canonical、hreflang、自引用及 x-default、Article 和 sitemap，并加入对应卡图的 Article/分享元数据与 image sitemap。

简明画像正文约350词英文，重在可查阅的干支与五行信息、各自独有的性格/感情/事业段落和生活场景，不用重复段落凑到长篇指南的600词。测试分别检查参考画像的完整栏目、完整周期、独特场景与长篇指南的既有长度要求。没有把60张卡包装成已验证的心理测验。

## 资料与事实边界

- 性格、感情、事业采用 `lib/day-pillar-insights.ts` 已有公开编辑资料（原始卡片笔记改写）；新增日常场景为本站原创假设练习，不是假冒用户故事。
- 当前动物名称来自 `lib/compatibility/animal-names.json`，图片来自既有 `/archetypes/*.jpg?v=20260914-new`。查询结果改为同一名称，不再以旧树木意象称呼新动物卡面。
- 天干地支、顺序与日期算法核对香港天文台说明及实际日柱计算代码。地支五行表仅展示本气，不冒充完整藏干分析；不从两个主元素断全盘喜忌。
- 甲子既有的名人来源与生日复算保留，其他画像不补未经核实的名人，不猜出生时间。
- 公开来源：https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm 。五行解释链接已有五行关系指南及其来源。
- Google 内容质量说明已于2026-09-23读取：https://developers.google.com/search/docs/fundamentals/creating-helpful-content 。没有首选字数，也不应仅为制造新鲜度批量加页。此次目录的用途是让每个已存在的查询结果都有匹配的可阅读参考页。

## 关键词分工

每篇只服务自己的干支组合。例如甲子页对应 `甲子日柱 / Jia Zi Day Pillar / Цзя-цзы`，其动物名称作为易记的原创解释；目录负责 `六十甲子日柱 / 60 BaZi Day Pillars`；`/discover` 负责免费日期查询。不要再建立每个词各一页的同义网页。

此选择来自用户现有产品与资料覆盖，未声称取得60个词的搜索量、排名或后台查询趋势。首版发布不等于收录，更不等于已产生自然流量。

## 给外部团队的下一步指令（可以整段转发）

六十日柱的四语言图文库由 Codex 本轮统一完成，请不要定时重复发布60篇，也不要另建平行目录。后续工作是逐篇提升价值：

1. 先读取本文件与现有文章，认领一个具体干支，记录URL与当前commit。不同人不要同时改同一文章；不碰支付、账户、统计口径或其他独立应用。
2. 每次完成一项实质补充：一个更具体的感情/事业场景、对一个常见问题的解释，或有可信公开生日且已按本站算法复算的名人案例。不得猜时刻、宣称必然财富/婚姻结果，或把原创动物名冒充古籍称谓。
3. 如果有 Search Console 授权，提供明确日期窗口、查询、曝光、点击、入口页；没权限就明确写不可取得，不用 site: 结果当作收录证明，不编造关键词搜索量。
4. 同步英语、简中、繁中、俄语；英文标题保留可识别的 BaZi / Day Pillar 与拼音，正文用自然表达。艺术名称必须与卡面字样匹配。
5. 交付具体diff与资料来源，避免只交“已优化SEO”的结论。新增补充另放按日柱索引的数据模块，避免改共享模板导致60篇同时变化。
6. 在独立分支或工作树运行构建及相关检查，提交PR供合并；不要直接覆盖main，不批量改日期。保持原URL，只在实质修改文章时更新它的 updatedAt。
7. 视频只交脚本，不自动生成、上传或发帖。以一条具体的人际处境开场，结尾链接相应日柱页或免费查询；未确认自己日柱的观众应先去查询，不让观众猜自己属于哪个原创动物。

## 复盘

延续周一查看真实查询与入口页、周二/周五一次有价值更新的维护节奏。优先改已有曝光但点击少、或读者真实提出问题的页面，不继续机械扩张页数。所有60篇已经存在以后，没有必要再安排一次“逐日首发”。

## 验证命令

```sh
node --import tsx --test lib/day-pillar-library.test.ts lib/day-pillar.test.ts lib/day-pillar-insights.test.ts lib/journal.test.ts lib/seo.test.ts lib/seo-guides.test.ts
npm run build
node --import tsx scripts/check-journal-search.ts http://localhost:3041
node --import tsx scripts/check-day-pillar-library.ts http://localhost:3041
git diff --check
```

## 发布前验证（2026-09-23）

- `npm run build` 成功；31项相关测试全部通过；`git diff --check` 通过。
- 本地生产构建核验280个文章语言版本的正文、metadata、canonical、hreflang、Article与sitemap。
- 额外核验4个目录语言版本、60个文章入口、查询页入口及60张实际JPEG图片与image sitemap。
- 浏览器检查桌面1280px及手机320px/390px，目录与文章无横向溢出；繁体与俄语可读；使用合成日期1990-05-15，查询结果庚辰与文章、卡面一致。

## 线上发布记录（2026-09-23）

- 代码commit：`a7ef970b678dd68e87c9148a7b507e7edfe90c83`；从 `4718f54` 安全快进推送到 origin/main。
- Vercel部署：`CEa3AYAgkjkqbopZbTo4k9UM1sRv`，GitHub部署状态确认success。
- 生产 https://www.destinypixel.com 上280个文章语言版本全部通过正文、metadata、canonical、hreflang、Article与sitemap校验。
- 4个目录语言版本、60个文章入口、查询页入口和60张JPEG及image sitemap全部通过线上HTTP检查。
- 浏览器确认中文目录显示60个唯一文章URL，并能进入保留网址的甲子文章；新卡图与新动物名称一致。
- 本轮没有取得这些新页面的Search Console索引状态；以上上线与HTTP结果不代表已收录或已有自然流量。
