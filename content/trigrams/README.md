# Eight-trigram learning articles

Eight independent articles in English, Simplified Chinese, Traditional Chinese and Russian: 32 complete editions. Each record keeps an introduction, the three-line figure and its relation to six-line figures, traditional context, an original everyday example, common confusions, three reflection questions and reading connections. The three-line figures are counted from the bottom upward. Each doubled figure and every linked mixed figure is checked against the existing verified 64-hexagram identities.

The English and Russian editions are full original editorial adaptations in their actual languages, not English fallback pages. The Traditional Chinese edition was converted from the Simplified Chinese original using character conversion, then read back for terminology and wording. The everyday analogies are modern editorial applications; they do not claim predictive accuracy or identify medical, financial or relationship outcomes.

## Classical source

The short classical quotations were read and checked against the public-domain received *Shuo Gua* text, chapter 7, in [Wikisource revision 2614055](https://zh.wikisource.org/w/index.php?title=易傳/說卦&oldid=2614055), accessed 2026-10-11. Natural and historical associations are discussed with chapters 5 and 8–11 as context. The ancient source text is quoted separately; each modern-language gloss is explicitly identified as our editorial explanation. We do not claim a certain author or date for the commentary. Historical family, bodily and social correspondences are not prescribed as contemporary roles or diagnoses.

This is original model-authored educational content with editorial checks; it has not received native-human or classical-text specialist certification. Existing `content/hexagrams` articles and their source provenance are preserved.

## Checks

`lib/trigram-learning/learning.test.ts` checks all 32 editions for identity and locale consistency, substantial independent body text, source quotations, complete required sections and valid reading connections. It verifies all eight bottom-up patterns against the verified pure hexagrams, asymmetric orientations, invalid slug boundaries and the 36 reciprocal index/article language URLs. Run with the repository's server-test condition:

```sh
NODE_OPTIONS=--conditions=react-server node --import tsx --test lib/trigram-learning/learning.test.ts
```

Browser/HTTP acceptance is recorded by the main I Ching delivery task; this document does not claim it has already passed.
