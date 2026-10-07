# DestinyPixel 六十四卦四語完整文字包

64 卦 × 簡體中文、英語、臺灣繁體中文、俄語，共 256 篇完整學習稿。其中 64 篇為中文原稿，192 篇為完整譯稿。每篇保留白話速讀、卦體、卦辭、傳文、六爻逐條解說、完整現代情境、誤讀提醒、練習與來源。乾、坤的用九／用六另列，不當作第七爻。

全部原稿和譯稿已完成獨立模型全文編輯或語言複核及修後回讀，未經真人母語或經學專家認證。這是可供工程整合的稿件，沒有建立或發布網站頁面。

## 讀取與整合

- `data/articles.zh.json`、`data/articles.en.json`、`data/articles.zh-TW.json`、`data/articles.ru.json` 各含 64 筆完整記錄及 132 條來源。簡體中文的既有 locale 是 `zh`，不改成 `zh-CN`
- `articles.all-locales.json` 含全 256 筆記錄；`articles/<locale>/` 有各篇 JSON 與 Markdown；`reading/` 有四份完整閱讀合訂稿
- 每筆 `articleMarkdown` 是完整已審閱讀稿，與單篇 Markdown 逐位元組一致；結構化欄位同時完整保留，不需從摘要重建文章
- `article.schema.json` 是 v2 契約，支援四個 locale，並要求完整 `articleMarkdown`
- `translation-mapping.json` 保留原稿來源雜湊、核准正文雜湊與最終輸出雜湊；`normalization-ledger.json` 記錄本次僅改審閱狀態 metadata 的處理
- `validate_package.py` 使用 Python 標準函式庫檢查完整內容、來源對應、六爻圖、資料一致性與檔案清單；如有 jsonschema，亦可用所附 schema 驗證每筆記錄

第 11 卦六四的「未付出的劳动」已修正為「未付酬的劳动」，意為無償勞動仍有成本。三種譯文原已表達正確意思，正文不改，只同步來源雜湊。詳見 `source-corrections.json`。

## 來源與限制

`source-ledger.json` 保存版本、定位、來源網址與存取限制。原文、Legge 的歷史譯注、十翼傳文及本文現代類比分層保留；英俄古文譯意是清楚標示的原創編輯譯解，不冒稱逐字引用 Legge。中文引文保留各底本字形和明示異文。

本包只有文字與資料，沒有外部圖片位元組。六爻圖由保留的陰陽資料繪成文字，並保留 Unicode 卦符。全 64 章 Legge 史料已閱讀；未宣稱逐頁目視核驗 1882 掃描本。中文 1–12 原頁曾直接獨立取讀，13–64 的逐爻比對使用作者保存的真實來源摘錄。

Library 若無法傳送 ZIP 位元組，可直接讀取分語言 JSON；正文與同一文字包完全相同。本文不作現實結果保證或專業決策依據。
