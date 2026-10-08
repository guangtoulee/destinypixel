# Reviewed tarot editorial revision · 2026-10-08

This folder preserves four complete, user-authorised Chinese articles and their complete English, Traditional Chinese and Russian editions. It contains no new image assets, scans or third-party book text.

## Authoritative input

`source/integration.zh.json` is the complete structured source delivered directly through the task after the Library transfer failed. Its SHA-256 is exactly `9bffeb2c3b6eb876cf89706a3a4ae34246e95111c7bb011e8d2255f75b640feb`, matching the source author's value. All four Chinese Markdown hashes also match the delivered values. Restoring message-escaped `V&A` to literal characters is a format normalisation that recovers the original hash, not a content change.

The input references three review attachments; those attachments were not separately transferred and are not represented as present here. The received body, source links, metadata and all complete translations are present.

## Complete editions

- `{locale}/{slug}.md` preserves the entire article, including every opening paragraph, list and source link.
- `{locale}.json` carries exactly the same full Markdown plus ordered sections for the existing journal renderer. The validator reconstructs the complete Markdown from those sections and openings.
- English and Russian are full model-authored translations of the reviewed Chinese text. Traditional Chinese was converted and then reviewed, with wording/terminology corrections including 占辭, 反覆製作, 資訊 and 職位. This is not native-human certification.
- `provenance.json` records the exact source and translation hashes, section/block counts and current Sun record hashes.

The original four Sun records remain intact in `content/tarot/revisions/2026-10-07/`. `validate-tarot-learning.py` reconstructs the original approved collections using those archived Sun records and the other 308 unchanged current records. `validate-tarot-editorial.py` separately verifies all sixteen current editorial editions and the live Sun revision. Original provenance hashes are not silently replaced.

## Integration

The Sun retains `/journal/tarot-sun`, card identity, artwork and related cards. Its publication date remains 2026-10-07; only the Sun and the tarot directory receive the 2026-10-08 modification date. Old Sun section anchors remain available. Three new education articles use the existing journal route, four explicit language editions, existing metadata/sitemap functions and server-rendered Markdown. Article text is never passed to a client component.

Existing RWS images are reused with the existing attribution link. No external or modern deck images were added. Historical comparisons are textual. All seven reused site images were visually checked during integration.

```sh
python3 scripts/validate-tarot-editorial.py
python3 scripts/validate-tarot-learning.py
python3 scripts/validate-hexagram-learning.py
node --import tsx scripts/check-tarot-editorial.tsx http://127.0.0.1:3038
node scripts/check-tarot-editorial-browser.mjs http://127.0.0.1:3038
```
