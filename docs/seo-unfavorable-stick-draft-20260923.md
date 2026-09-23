# Draft note: unfavorable fortune-stick journal (2026-09-23)

Journal slug: `unfavorable-fortune-stick-reading`  
Registry: `lib/journal-search-growth.ts` (English, simplified Chinese, Russian; traditional Chinese is derived in `lib/journal.ts`).  
Dates: publishedAt and updatedAt `2026-09-23`.  
Related article: `how-to-ask-fortune-sticks`.

This note is for Codex’s merge. It does not change the sticks tool page.

## 1. Files changed

- `lib/journal-search-growth.ts` — new journal entry, per-article dates, source labels
- `app/llms.txt/route.ts` — one public index line for the new slug
- `docs/seo-unfavorable-stick-draft-20260923.md` — this note

## 2. Recommended tool-page links (do not merge here)

Leave `components/product-search-content.tsx` and `lib/product-search-content.ts` for Codex.

### Placement A — sticks reading cards

In `components/product-search-content.tsx`, the sticks branch of `articleSlugs` already builds same-language cards from journal title and description:

```ts
["yuelao-love-fortune-conversation", "how-to-ask-fortune-sticks", "fortune-stick-number-and-edition"]
```

Recommended addition, after `how-to-ask-fortune-sticks`:

```ts
"unfavorable-fortune-stick-reading"
```

The card copy then comes from the journal itself. Exact strings as of this draft:

| Locale | Title | Description | href |
| --- | --- | --- | --- |
| en | What to do after an unfavorable fortune-stick reading | Drew a stick you dislike? See what DestinyPixel’s redraw button does, how to read the source note, and how to turn the result into one question you can check. | `/journal/unfavorable-fortune-stick-reading` |
| zh | 抽到不喜欢的签，要不要重抽、要不要改计划？ | 签不顺时，先看本站的再抽按钮、来源说明和可选AI各管哪一层，再把结果收成一个可以核实的问题。 | `/journal/unfavorable-fortune-stick-reading?locale=zh` |
| zh-TW | （由简体自动转繁） | （由简体自动转繁） | `/journal/unfavorable-fortune-stick-reading?locale=zh-TW` |
| ru | Неприятный жребий: перетягивать ли палочку и менять ли план | Если выпавший жребий не понравился, разделите обычай храма, кнопку повторного выбора DestinyPixel, примечание об источнике и необязательный текст ИИ. | `/journal/unfavorable-fortune-stick-reading?locale=ru` |

### Placement B — existing sticks FAQ, optional sentence only

`lib/product-search-content.ts` already answers “Should I keep drawing until I like the answer?” / “要一直抽到喜欢的答案为止吗？” and correctly says another draw is allowed. Do not replace that answer. Optional last sentence:

- EN: For redraw, the source note, and whether to change a plan, read “What to do after an unfavorable fortune-stick reading.”
- ZH: 关于再抽、来源说明，以及要不要改计划，见《抽到不喜欢的签，要不要重抽、要不要改计划？》。
- RU: О повторном выборе, примечании об источнике и смене плана: «Неприятный жребий: перетягивать ли палочку и менять ли план».

### Placement C — optional line beside the result source note

`components/spiritual-sticks-experience.tsx`, near the existing source-note line. Recommendation only:

- EN: If this result feels unfavorable, read what to do next.
- ZH: 如果这支签不顺眼，先看接下来可以怎么做。
- RU: Если жребий не понравился, прочитайте, что делать дальше.

## 3. Unverified items for 玄姐

Checked on 2026-09-23 and used in the article:

- Hong Kong Tourism Board, Wong Tai Sin Temple page: visitors shake a bamboo cylinder until a stick falls; stalls interpret kau cim. The page does not state a redraw ban. https://www.discoverhongkong.com/eng/place-to-go/travel.guide-wong-tai-sin-temple.html
- Wen Wei Po, 27 January 2026, column by Sik Sik Yuen abbot 李耀輝（義覺）: 100 sticks, one matter per stick, shake until one stick leaves; some worshippers toss moon blocks and copy the number only after a confirming throw; free slips by number; grades 上上 / 上吉 / 中吉 / 中平 / 下下; reading follows situation, time, place and state of mind. https://www.tkww.hk/epaper/view/newsDetail/2015847422080716800.html
- Chinese Wikipedia 求籤: regional differences, including Fujian/Taiwan moon-block confirmation and some Japanese shrines leaving an unlucky slip on a rack. Encyclopedia summary, not one temple’s rulebook. https://zh.wikipedia.org/wiki/%E6%B1%82%E7%B1%A4
- English Wikipedia Kau chim: many sets have 100 sticks, other counts exist, several sticks falling at once are often not counted, and a further try in that description confirms the draw. https://en.wikipedia.org/wiki/Kau_chim

Not verified, and not cited as settled fact:

- `http://www.wongtaisintemple.org.hk/en/index` returned 404. The Chinese homepage `http://www.wongtaisintemple.org.hk/` loaded hours, address and history. The fetched text did not include a redraw rule, so the homepage is not used as a procedure source.
- `https://taonet.siksikyuen.org.hk/StickEnquiry` was request-rejected. The temple’s online lookup was not checked.
- Fujian, Taiwan and Japanese customs above are Wikipedia’s summary. No individual temple instruction page for those regions was opened in this pass.
- Catalog verses were not re-audited against paper temple booklets. The article tells readers to use the source note on the result they received.
- The Guandi Chinese layer names the `dreamer2q/fortune_telling` dataset in its source notes. License and line-by-line fidelity were not re-checked here.
- The English learn page `/learn/guanyin-fortune-sticks` says “Do not redraw the same question immediately.” The product button still becomes “Draw again” / 「再求一签」. This article follows the button and does not claim DestinyPixel forbids a second draw. The learn-page sentence was left unchanged.
- Tourist and commercial pages (kaucim.ai, hkwongtaisin.com, hongkong-trip.com, and similar) were not used.

## 4. Scope confirmation

- No Codex five-elements files were edited. No change to `/journal/five-elements-relationship-compatibility`, the `/compatibility` entry, or related five-elements theme files.
- No homepage layout, route, canonical, robots, global analytics, middleware, billing, or login changes.
- `components/product-search-content.tsx` was not edited.
