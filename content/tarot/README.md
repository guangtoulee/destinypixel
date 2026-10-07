# DestinyPixel 塔罗78张四语完整文字包

78张牌 × 简体中文、英语、繁体中文、俄语，共312篇完整稿。包含78篇中文原稿及234篇完整译稿，已完成模型辅助独立编辑、语言与结构复核。没有母语人工或专家认证；没有创建学习页或发布网站。

## 入口

- reading/：每种语言各78篇完整阅读稿
- articles.all-locales.json：312条完整记录，键为 cardId + locale
- data/：按语言划分的78条JSON
- cards/{locale}/：每张牌独立完整Markdown与JSON
- article.schema.json / content-contract.json：统一v3多语约定
- translation-mapping.json：中文源文章与每个目标全文的SHA-256、路径与节映射
- source-ledger.json / source-ledger.md / image-manifest.json：来源URL、年代、观察版本、尺寸与哈希
- qa/：逐组独立审读报告与修订记录
- provenance/translation-inputs/：原始完整译稿输入，保留作者元数据以便追查
- validate_package.py：纯Python3完整性校验；可选用jsonschema验证article.schema.json

## 接入规则

直接使用每条完整articleMarkdown或全部sections，不要将它们替换为关键词或摘要。速读顺序为正位、逆位、引子。保持正式cardId；wheel和judgement不能改成别名。Strength为VIII，Justice为XI。articleSlug为null，原始sourceRecord内若有proposed slug，也不是已注册路由。

简体中文原文保持不变，译稿也保留经审定的完整文本。结构化元数据统一为v3：majorNumber是数值，number是显示字符串，所有语言共享deckOrder。段落数量及节ID/角色/顺序与中文源一致；原始译稿完整JSON另存用于溯源。

## 图片

本包不含任何图片字节。接入应复用仓库已有牌面资产，并在当前工程核对映射，不要直接替换成外部扫描图。image.observedAsset.packagePath为null；originalFullPackagePath仅记录历史完整存档路径，不是本包文件。

14张宝剑及圣杯国王曾实际查看固定提交站内WebP；其余图像观察依据各自所列Commons原图或标准缩图。不能因此声称所有站内图片与Commons逐像素一致。来源账本保留79份观察证据及SHA-256，未作全球版权法律保证。

## 验证

在本目录运行：python3 validate_package.py

通过后仍需在接入工程检查路由、当前资产路径、语言切换与阅读排版。本包的审核状态不代表已上线。
