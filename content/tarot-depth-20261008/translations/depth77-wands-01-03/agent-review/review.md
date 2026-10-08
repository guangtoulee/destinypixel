# Wands 01–03: source and translation handoff

Complete: 3 reviewed Chinese source records and 9 full translations (3 Traditional Chinese, 3 English, 3 Russian).

## Source preservation

`source.json` preserves every supplied field, including null slugs, source IDs, source types, titles, URLs, edition nulls where supplied, checkedOn dates, cardId and bodySha256. Each body is read from the previously saved original and matches the supplied SHA-256 exactly. JSON has been reserialized; no claim of byte-identical original JSON formatting is made.

- ace-of-wands: 1a81f984bc007e4fab75c1cde0e5eb98b1e5feea06960af241a6911c69da98e9
- two-of-wands: 40decb83091451f24453d78727d799c9a0b395023e16df3c9bb708b1e2d0b605
- three-of-wands: bcaef562e75058e676e572da6ffec9149c859fe51294b2dc984114029d403182

## Delivered edition format

`translations/{zh-TW,en,ru}/{cardId}.json` contains cardId, title, quickTake.upright, quickTake.reversed and complete bodyMarkdown. Adjacent Markdown files are readable copies. JSON body strings omit the final Markdown file newline, matching the supplied source-body convention.

All 9 editions pass the same structural comparison with their Chinese original: 9 level-two headings, 34 blank-line-delimited blocks, 3 source list entries, 3 identical source URLs in the same order, and 2 bold fictional-example labels. The opening upright/reversed paragraphs are preserved in full, alongside the separately localized quickTake fields. Exact translation hashes are in `structural-checks.json`.

## Model editorial review

All 9 translations were reviewed against the full Chinese originals; this is model review, not native-speaker certification. The comparison checked visible-image details against interpretive statements, historical and modern distinctions, both complete cases including alternative explanations and conditional next steps, and the limitations in each closing warning.

- Ace: retains image order (grasping before using), the initial-interest versus preparedness distinction, all three possible barriers to starting, spread-position nuance, the five-minute private podcast experiment with consent, and the sketching example's competing explanations and five-minute trial.
- Two: retains the free globe versus fixed wand contrast, Waite's irreconcilable meanings, information gaps versus unavoidable trade-offs, mutual consent in the three-month trial of living together, and the course example's actual friendship goal, budget condition and peer-feedback question.
- Three: retains uncertainty about visible ships' ownership and direction, Waite's distinct reversed ending-of-trouble meaning, preparation versus uncontrollable responses, the picture-book feedback and interruption alternative, and the travel example's absence of a shared commitment and non-coercive clarification.

Traditional Chinese began with the project's character converter and received manual phrase review, including 計畫, 資訊, 回饋, 透過, 訓練, 回顧, 訪談, 節目, 器材, 宣布, 發布 and Chinese quotation marks. No source URL was localized or changed.

No live content, shared progress manifest, route, renderer, image, git state, or publication status was modified by this subtask. Parent integration and site regression remain to be performed.
