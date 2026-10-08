# Reviewed handoff: depth77-cups-01

Completed 3 supplied Chinese records and 9 complete translations. Only this batch directory was written; no live content, routes, images, shared manifests or Git state were changed.

## Inputs

`source.json` preserves every supplied record field, including null slugs, `sources`, nested `sourceMetadata`, and exact unmodified `bodyMarkdown`. All three body SHA-256 values match the parent-approved source message. File SHA-256: `5b0030800bfc7478c3b6b2b877081295a6f52369c4d435d48c3e33bb02a4cbb6`.

## Deliverables

- `translations/{zh-TW,en,ru}/{ace-of-cups,two-of-cups,three-of-cups}.json`: final handoff objects with `cardId`, `title`, `quickTake`, and complete `bodyMarkdown`.
- Corresponding `.md` files provide readable full copies; JSON is the integration handoff.
- `verification.json` records each source and translated body hash and its structural verification.
- `finish-and-verify.py` reconstructs English/Russian handoff JSON from Markdown and validates all nine translations against source block types, section count, case markers, list item count and exact citation URL order.

Every article has nine sections, 35 Markdown blocks, two complete cases, and all original links. No source paragraph is omitted or replaced with a summary. The original cases retain their factual setup, question, spread position, image-to-situation reasoning, alternative interpretation, evidence that changes the reading, and bounded next action.

## Model language and fidelity review

All three translations per article were reviewed against the full Chinese source. This is a model review, not native-human certification. Traditional Chinese began with character conversion and was contextually reviewed throughout; corrections included 聖杯 / 金杯, 療癒, 計畫, 舊帳, 不是只, and natural usage for public transport, group chats, messages and event organisation.

The Ace of Cups preserves the distinction between four streams in the cited English transcription and five visible in the examined Pam-A image. It retains the Christian Communion context and distinguishes modern emotional applications from Waite's reversed meanings. The Two of Cups explicitly distinguishes no separate reversed entry in Part III §2 from passion in the additional meanings in §4. Russian calls these sections, not chapters. The Three of Cups does not infer affairs from the number of people and does not turn historical healing terminology into a medical claim.

Images, identities, section IDs and historical anchor compatibility remain the integrator's responsibility; these translation files do not create routes from null slugs.
