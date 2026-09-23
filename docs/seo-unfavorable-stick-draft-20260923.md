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
| en | What to do after an unfavorable fortune-stick reading | An unfavorable or lower lot is a caution to pause and check one fact, not a guarantee of failure. See what redraw does on DestinyPixel, then read the source note. | `/journal/unfavorable-fortune-stick-reading` |
| zh | 抽到不顺签或下签，要不要重抽、要不要改计划？ | 不顺签、谨慎签和下签是谨慎、等待或有难度的提醒，不是注定失败。先看再抽按钮和来源说明，再写出一件可以核实的事。 | `/journal/unfavorable-fortune-stick-reading?locale=zh` |
| zh-TW | （由简体自动转繁） | （由简体自动转繁） | `/journal/unfavorable-fortune-stick-reading?locale=zh-TW` |
| ru | Неблагоприятный жребий: осторожность, повтор и смена плана | Неблагоприятный или нижний жребий — напоминание об осторожности, ожидании или трудности, а не гарантия неудачи. Посмотрите, что делает повтор на DestinyPixel, и прочитайте примечание об источнике. | `/journal/unfavorable-fortune-stick-reading?locale=ru` |

### Placement B — existing sticks FAQ, optional sentence only

`lib/product-search-content.ts` already answers “Should I keep drawing until I like the answer?” / “要一直抽到喜欢的答案为止吗？” and correctly says another draw is allowed. Do not replace that answer. Optional last sentence:

- EN: For redraw, the source note, and whether to change a plan, read “What to do after an unfavorable fortune-stick reading.”
- ZH: 关于再抽、来源说明，以及要不要改计划，见《抽到不顺签或下签，要不要重抽、要不要改计划？》。
- RU: О повторном выборе, примечании об источнике и смене плана: «Неблагоприятный жребий: осторожность, повтор и смена плана».

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

## Boundary pass (玄姐 pre-check)

Shared terms: unfavorable / cautionary / lower lot; 不顺签、谨慎签、下签; неблагоприятный, предостерегающий, нижний жребий. A lower lot is a reminder of caution, waiting, or difficulty. It is not a destined failure and not a reason to decline a job, cancel a trip, or end a relationship.

Redraw follows the `/sticks` FAQ and the “dislike the answer” note in `how-to-ask-fortune-sticks`: another draw is allowed, a new number is not more accurate, pause and compare with the situation. Folk practice sometimes includes another draw. The article does not say to continue until an upper or good lot appears. The Draw again button is a product fact, not a universal temple rule.

The library is not one temple’s verbatim archive. Counts 100 / 100 / 60 / 60 / 100 are this product’s ranges. English and Russian text is distinguished from a line-by-line ancient poem. Optional AI explains the displayed entry against the reader’s question and does not authenticate a temple lot or read another person’s mind. Financial, medical, and major relationship decisions are named as out of scope.

One-line boundaries only, with same-language links at the end, to `how-to-ask-fortune-sticks`, `fortune-stick-number-and-edition`, and `yuelao-love-fortune-conversation`.

## Full English text for 玄姐 line check

Word count of introduction, takeaway, section titles, and paragraphs: 999.

**Title.** What to do after an unfavorable fortune-stick reading

**Description.** An unfavorable or lower lot is a caution to pause and check one fact, not a guarantee of failure. See what redraw does on DestinyPixel, then read the source note.

**Topic.** After an unfavorable lot

**Introduction.** An unfavorable, cautionary, or lower lot is a symbolic reminder of caution, waiting, or difficulty. It is not a destined failure, and it does not guarantee that a plan will fail. This guide answers whether to draw again and whether to change a plan, then separates a temple’s custom, this site’s random draw, the library text, and optional AI.

**Takeaway.** You can draw again on DestinyPixel. A new number is not a more accurate answer. Pause, write the question you brought, and compare the image with your situation. The sticks are for culture and reflection. Do not use a result for a financial, medical, or major relationship decision.

**An unfavorable lot asks for caution, not a cancelled plan**

On /sticks the button reads “Draw my stick,” then “Draw again.” Simplified Chinese uses 「再求一签」. Another draw is allowed. That is a product fact, not a rule every temple shares, and the site does not forbid it. The sticks FAQ says a new number does not make the answer more reliable: keep one reading, note what it brings to mind, and return when the situation changes. The asking guide adds: write the question, the phrase you noticed, and one thing you can check. Some people redraw in folk practice. A second number is still not “more accurate.” Do not keep drawing until you receive an upper or good lot. Blocked, Wait, 小阻, and 待时 are cautionary labels for difficulty or waiting. They do not mean you must decline a job, cancel a trip, or end a relationship.

**Temple pages describe local sequences**

Hong Kong Tourism Board, Wong Tai Sin: shake a bamboo cylinder until one stick falls, then take it to stalls for kau cim. That page states no redraw ban. Wen Wei Po, 27 January 2026, Sik Sik Yuen abbot 李耀輝（義覺）, on that temple: 100 sticks, one matter, shake until one leaves; some record the number only after a confirming moon-block throw; slips are free. Grades include 上上, 上吉, 中吉, 中平, and 下下, read with situation, time, place, and state of mind. A lower grade there is a reading to weigh, not destined failure. Chinese Wikipedia, 求籤: Guangdong and Hong Kong often shake until a stick falls; many Fujian and Taiwan temples return an unconfirmed stick; some Japanese shrines leave an unfavorable slip on a rack. English Wikipedia, Kau chim: many cups hold 100 sticks, other counts exist, and several sticks at once are often not counted. Another try in those accounts confirms the draw or replaces an unconfirmed stick. A disliked poem and an unconfirmed throw are different events.

**What the draw button on DestinyPixel does**

Five collections are on this page: Guanyin, Guandi, Yuelao, the Five Wealth Gods, and Wong Tai Sin. Guanyin, Guandi, and Wong Tai Sin use 1–100. Yuelao and the Five Wealth Gods use 1–60. Those ranges belong to this product, not to every temple. After a short shaking pause, the page chooses an integer in the selected range with crypto.getRandomValues. Your question does not choose the number. You can type it or leave it blank. “Already drew offline?” opens this library’s entry in that range and does not certify a temple slip. “Draw again” repeats the same step. The new number is another draw, not a more accurate one.

**How to read the source note and the level**

Read the source note on the result. This library is not one temple’s verbatim archive, and the same number can differ by collection and edition. The edition guide is linked at the end. Some notes mark traditional themes and say wording can differ. Many Guandi and Wong Tai Sin numbers show classic Chinese in the Chinese edition. English and Russian may show a localized reading instead, and the note says so. That localized text is not a line-by-line ancient poem. Other numbers are modern symbolic text, or are marked as still being checked. Wealth notes say that set is not one canonical temple book. Generated labels include Great Blessing, Good, Steady, Blocked, and Wait in English, and 上吉, 中吉, 中平, 小阻, and 待时 in Chinese. Blocked, Wait, 小阻, and 待时 are cautionary catalog labels. This article copies no numbered poem. How to ask, how editions differ, and what to say after a Yuelao love reading stay in the three guides linked at the end.

**What the optional AI paragraph adds**

“Interpret with my question” (Simplified Chinese 「结合问题解读」) posts the collection, number, on-screen sign, topic, and question to /api/sticks/interpret. The question may be blank. The model must explain that displayed entry against your question. It must not pick a new number. It cannot authenticate a temple lot, and it cannot read another person’s mind. If the request fails, the page shows the plain reading already on the card. Use the result, including any AI paragraph, for culture and reflection only.

**Original scenario: a work opportunity you are unsure about**

Original scenario — work-opportunity worry. Editorial example only. The written offer is in hand, the weekly hours are vague, and the level is a cautionary or lower label such as Blocked or 小阻. That label does not mean you must turn the offer down. Pause, write the question you brought, and compare it with the offer: which three duties, and which weekly hours, are in the written terms? Send that to the hiring contact and name a day to reread the reply. Drawing again for an upper or good label does not make the answer more accurate.

**Original scenario: anxiety before a booked trip**

Original scenario — travel anxiety. Editorial example only. The trip is booked, and the imagery sounds like delay. A cautionary or lower lot does not mean you must cancel. Before another draw, check one fact: passport dates, the first connection on the current timetable, or the local contact if a train slips. If the timetable holds, keep the booking. If the connection is too short, change the booking because of the timetable. A later draw needs a new question about the fact you just checked.

**Action.** Open a stick and read its source note → /sticks

