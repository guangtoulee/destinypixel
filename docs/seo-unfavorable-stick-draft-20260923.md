# Draft note: unfavorable fortune-stick journal (2026-09-23)

Journal slug: `unfavorable-fortune-stick-reading`  
Registry: `lib/journal-search-growth.ts` (English, simplified Chinese, Russian; traditional Chinese is derived in `lib/journal.ts`).  
Dates: publishedAt and updatedAt `2026-09-23`.  
Related article: `how-to-ask-fortune-sticks`.

This note is for Codex’s merge. It does not change the sticks tool page.

## 1. Files changed

- `lib/journal-search-growth.ts` — journal entry, per-article dates, source labels
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
["yuelao-love-fortune-conversation", "how-to-ask-fortune-sticks", "unfavorable-fortune-stick-reading", "fortune-stick-number-and-edition"]
```

The card copy then comes from the journal itself. Exact strings as of this draft:

| Locale | Title | Description | href |
| --- | --- | --- | --- |
| en | What to do after an unfavorable fortune-stick reading | An unfavorable or lower lot is a caution to pause and check observable facts, not a guarantee of failure. See what another draw does on DestinyPixel, then read the source note. | `/journal/unfavorable-fortune-stick-reading` |
| zh | 抽到不顺签或下签，要不要重抽、要不要改计划？ | 不顺签、谨慎签和下签是放慢、小心或等待的提醒，不是注定失败。先看再抽和来源说明，再核对可以观察的事实。 | `/journal/unfavorable-fortune-stick-reading?locale=zh` |
| zh-TW | （由简体自动转繁） | （由简体自动转繁） | `/journal/unfavorable-fortune-stick-reading?locale=zh-TW` |
| ru | Неблагоприятный жребий: осторожность, повтор и смена плана | Неблагоприятный или нижний жребий — напоминание замедлиться, проявить осторожность или подождать, а не гарантия неудачи. Посмотрите, что делает повтор на DestinyPixel, и прочитайте примечание об источнике. | `/journal/unfavorable-fortune-stick-reading?locale=ru` |

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

## 3. Sources after the fact-check table

Cited, and opened on 2026-09-23:

- Taiwan Temple Culture Network, “Chinese Fortune Sticks Guide”: shake a stick, confirm with moon blocks, then read the poem. A laugh or yin block does not confirm that stick: put it back and draw again. Repeated laugh blocks there can mean an unclear question, that you already know the answer, or that the timing is not ready. A bad omen is a warning, not a sentence. Do not ask the same question twice. For health, seek professional medical care first; the sticks are not a diagnosis. Burning a bad slip is described as some customs, not a rule for every temple. https://taiwantemple.org/language/en/chinese-fortune-sticks-guide-how-to-ask-for-divine-guidance-the-8-step-ritual/
- Grandmaster JinBodhi, moon-block guide: Sheng is one convex face and one flat face, read as yes; a laugh block is both faces flat, read as no clear answer; yin is both faces convex, read as no. Some temples want three Sheng throws in a row, and some accept one. Ask that temple’s staff. https://www.jinbodhi.org/en/how-to-properly-ask-questions-with-moon-blocks/
- Baidu Baike, 掷杯筊: listed only for the names Sheng, laugh, and yin. Face meanings in the article come from the JinBodhi page, not from Baidu. https://baike.baidu.com/item/%E6%8E%B7%E6%9D%AF%E7%AD%8A/3690017

Not cited:

- kuanyin.sg. Do not link it.
- Any “must wait 2 hours” or “must wait 3 months” rule.
- Third-party “18 lower lots” counts for Wong Tai Sin.
- Hong Kong Tourism Board, Wen Wei Po, and both Wikipedia kau-chim pages. They were in an earlier draft of this article and are removed from its further reading.
- The Taiwan page’s roughly 15-minute incense wait, and its line about doing good deeds to resolve disasters. Neither is used.
- Baidu’s “three consecutive Sheng” sentence and its anecdotal probability paragraph. The Baidu overview also carries a user note that some yin/yang wording was disputed, so this article does not copy Baidu’s face definitions.

Still unverified, and left unchanged:

- Catalog verses were not re-audited against paper temple booklets. The article tells readers to use the source note on the result they received.
- The English learn page `/learn/guanyin-fortune-sticks` says “Do not redraw the same question immediately.” The product button still becomes “Draw again” / 「再求一签」. This article follows the button and the `/sticks` FAQ. The learn-page sentence was left unchanged.

## 4. Scope confirmation

- No Codex five-elements files were edited. No change to `/journal/five-elements-relationship-compatibility`, the `/compatibility` entry, or related five-elements theme files.
- No homepage layout, route, canonical, robots, global analytics, middleware, billing, or login changes.
- `components/product-search-content.tsx` and `lib/product-search-content.ts` were not edited.

## Fact-check pass

Shared terms: unfavorable / cautionary / lower lot; 不顺签、谨慎签、下签; неблагоприятный, предостерегающий, нижний жребий. A lower lot is a reminder to slow down, take care, or wait. It is not a destined failure and not a reason to refuse an offer, cancel a trip, or end a relationship.

Redraw follows the `/sticks` FAQ: another draw is allowed in the product, a new number is not more reliable, pause and return if the situation changes. After a confirming throw, a common admonition is one matter, one lot. Folk comfort redraws are not a universal permission to continue until an upper or good lot. Rephrase when the question was vague, the subject was wrong, or the situation has materially changed. Do not change the question or the plan from emotion alone.

DestinyPixel has no cylinder and no moon blocks. The draw is a program-assisted symbolic selection with `crypto.getRandomValues` in one of five collections. Counts 100 / 100 / 60 / 60 / 100 are this product’s ranges. A random number does not prove temple oracles empty, and it does not by itself make the number a divinatory verdict. English and Russian readings are not line-by-line ancient poems. Optional AI discusses the displayed entry against the question. It does not authenticate a temple slip, predict an outcome, or read another person’s mind. Financial, medical, and major relationship decisions are out of scope. A health question starts with medical care.

Internal links only: `how-to-ask-fortune-sticks`, `fortune-stick-number-and-edition`, and `yuelao-love-fortune-conversation`, plus `/sticks`. `relatedSlug` remains `how-to-ask-fortune-sticks`.

Two original scenarios: a new offer with unclear contract details (clarify two or three facts with the hiring contact before signing), and a weekend trip with unsettled weather or tickets (check the official travel notice and weather forecast; if the ticket or the forecast fails, reschedule).

## Full English text for 玄姐 line check

Word count of introduction, takeaway, section titles, and paragraphs: 982. `lib/journal.test.ts`: 6 passed.

**Title.** What to do after an unfavorable fortune-stick reading

**Description.** An unfavorable or lower lot is a caution to pause and check observable facts, not a guarantee of failure. See what another draw does on DestinyPixel, then read the source note.

**Topic.** After an unfavorable lot

**Introduction.** An unfavorable, cautionary, or lower lot is a symbolic reminder to slow down, take care, or wait. It is not a destined failure. This guide is about a result you dislike: how to separate the layers, whether to draw again, and what to check next. A temple ritual and DestinyPixel are different procedures.

**Takeaway.** On DestinyPixel you can draw again. A new number is not more reliable. Pause, note what the text brings to mind, and return if the situation changes. Do not use a lot for a medical, financial, or major relationship decision. For a health question, seek medical care first.

**After a disliked result, pause before you redraw or change the plan**

On /sticks the button reads “Draw my stick,” then “Draw again.” Simplified Chinese uses 「再求一签」. The product lets you draw again. The sticks FAQ says a new number does not make the answer more reliable: keep one reading, note what it brings to mind, and return when the situation changes. The asking guide adds one pause: separate the image from a fact, then note the question and one check. Some people redraw in folk practice for comfort. That is not a rule that you may keep drawing until an upper or good lot. After a stick is confirmed, a common admonition is one matter, one lot: do not redraw only because you dislike it. Rephrase when the question was vague, the subject was wrong, or the situation has materially changed. Do not change the question or the plan from emotion alone. Blocked, Wait, 小阻, and 待时 are cautionary labels. They do not mean you must quit, cancel a trip, or end a relationship.

**Moon blocks, a lower lot, and what varies by temple**

A common sequence is to shake a stick, confirm it with moon blocks, and only then read the poem. A Taiwan Temple Culture Network guide describes that order. On that page a laugh or yin block does not confirm the stick: put it back and draw again. Repeated laugh blocks there can mean an unclear question, that you already know the answer, or that the timing is not ready. The page calls a bad omen a warning, not a sentence, and says it can be better to hold. It also says not to ask the same question twice, and to seek medical care before a health question; the sticks are not a diagnosis. Burning a bad slip appears there as a local custom, not a rule for every temple or for DestinyPixel. JinBodhi defines Sheng as one curved face and one flat face, read as yes; a laugh block, both flat, as no clear answer; and yin, both curved, as no. That page says some temples want three Sheng throws in a row and some accept one. Ask the temple. Baidu Baike is listed only for those three names. These accounts are not one law for every temple.

**DestinyPixel does not repeat the temple ritual**

This site has no cylinder and no moon blocks. The draw is a program-assisted symbolic selection in one of five collections: Guanyin, Guandi, Yuelao, the Five Wealth Gods, and Wong Tai Sin. Guanyin, Guandi, and Wong Tai Sin use 1–100. Yuelao and the Five Wealth Gods use 1–60. Those ranges belong to this product. The page chooses an integer in the selected range with crypto.getRandomValues. The question does not choose the number. You may type it or leave it blank. “Already drew offline?” opens this library’s entry in that range and does not certify a temple slip. “Draw again” repeats the same selection. A random number does not prove that temple oracles are empty, and it does not by itself make the number a divinatory verdict. The card may mix traditional material and a modern symbolic reading. Check the source note.

**Read the source note, then use the other guides for the rest**

English and Russian text here is not a line-by-line ancient poem. Many Guandi and Wong Tai Sin numbers keep classic Chinese in the Chinese edition; the other language notes say so. Seeds may mark a traditional theme and say the wording can differ. Generated entries are modern symbolic readings with catalog labels. Wealth notes say that set is not one canonical temple book. This library is not a verbatim archive, and the same number can differ by collection or edition. How to ask, how editions differ, and what to say after a Yuelao love reading are the three guides linked at the end.

**Optional AI discusses the entry already on screen**

“Interpret with my question” posts the collection, number, on-screen sign, topic, and question to /api/sticks/interpret. The question may be blank. The model discusses that displayed entry against your question. It does not choose a new number, authenticate a temple slip, or predict an outcome. It cannot read another person’s mind. If the request fails, the page shows the plain reading already on the card. Use the result, including any AI paragraph, for culture and reflection only.

**Original scenario: a new offer with unclear terms**

Original scenario — work. Editorial example only. A new offer is in front of you, the contract details are unclear, and the lot is cautionary or lower. That result is not a reason to refuse the offer. Before you sign, ask the hiring contact to clarify two or three facts, such as the duties, the hours, and how the role is reviewed. Drawing again for a kinder label is not more reliable.

**Original scenario: a weekend trip still unsettled**

Original scenario — travel. Editorial example only. You are planning a weekend trip, and the weather or the tickets are still unsettled. A cautionary or lower lot is not a reason to cancel. Check the official travel notice and the official weather forecast. Decide in advance: if the ticket or the forecast fails, reschedule. If you draw again later, ask about that new fact.
