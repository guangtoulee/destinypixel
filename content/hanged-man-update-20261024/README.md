# Hanged Man — English and Simplified Chinese revision, 2026-10-24

One existing article, `/journal/tarot-hanged-man`, receives a direct answer and three sections: figure posture versus card orientation versus spread position; early Visconti–Sforza and RWS source comparison; practice with the existing tarot table and journal. Its title, URL, artwork, hook, quick takes, all nine prior sections, two fictional cases, original publication date and historical provenance fields remain intact. The other two editions receive no new prose or update date.

`previous/` preserves the exact pre-edit files from `091966f10d431ec4b0720971475d1fb99954d2a9`. `revisions.json` identifies this editorial revision and its current and historical file/Markdown hashes. Original review metadata describes the earlier delivery; it does not certify the additions. This is model-assisted original writing and translation, with independent model-assisted review, not human or native-speaker certification.

## Research and boundaries

Sources read on 2026-10-24:

- [Morgan M.630.11](https://ica.themorgan.org/manuscript/page/11/158525): official record, Milan, ca. 1450–1480, man hanging by a foot from a gallows. Supports an early design, not a historical divinatory rule. The object image could not be visually inspected through the available source tools; no claim about missing halos, figure identity, guilt or voluntary hanging was added.
- [Waite, Part II, XII](https://original.sacred-texts.com/tarot/pkt/pktar12.htm): living wood, expression and life in suspension, followed by his mystical interpretation and objection to reductive martyrdom readings.
- [Waite, Part III, §3, entry 12](https://original.sacred-texts.com/tarot/pkt/pkt0303.htm): a separate divinatory list, including sacrifice upright and a non-symmetrical reversed list. Modern deadlines and position exercises are explicitly the site's applications.

The existing source records retain their actual historical check dates. The newly checked Morgan record receives this revision's date; this note records the fresh check of the two existing Waite URLs. Their legacy URLs now redirect to the archive's readable current pages.

One competitor page was read in full: [Labyrinthos, The Hanged Man](https://labyrinthos.co/blogs/tarot-card-meanings-list/the-hanged-man-meaning-major-arcana-tarot-card-meanings). Its keyword and life-area coverage and deck images already address general meanings; it does not explicitly separate a head-down figure from a reversed card or distinguish Waite's symbolic text from his divinatory list. The update addresses those reader questions with independent organization and wording. No competitor text, imagery, colour-code interpretation or claim of voluntary suspension was copied.

BnF's Noblet catalog was readable but did not establish single-card visual details; its image/explanation pages were unavailable. It was not used in the published text. The general advice to inspect a Marseille or redesigned card afresh is an editorial method, not a description of an unobserved object. The user's local copy of *78 Degrees of Wisdom* was unavailable in this cloud environment; this work claims no new page reading from that book. No book files, scans, new image assets, dependencies or expert identities are included.

Tool wording was checked against `lib/celestial/copy.ts` and `components/celestial/tarot-experience.tsx`: placement rotation changes `rotation`; the separate orientation action changes `reversed`. The public text uses the actual Chinese label “切换正逆位”.

## Repository baseline

The checkout matched current `origin/main`; six open PRs (#3, #9, #10, #11, #12, #14) had no tarot overlap. No AGENTS.md or `.agents/skills` files were present in this saved checkout or the provided workspace `.agents` directory. Relevant content README and existing QA records were read.

Full `npm run lint` already fails because the repository has no root ESLint configuration. The existing depth-content and depth-final Python validators fail on unchanged main because later revisions are not all projected into their historical receipts. This update adds an explicit, hash-checked historical projection for the two Hanged Man records without replacing historical manifests or broadening the work to older unrelated revisions. Current-record validation is available through `validate_hanged_man_record` in `scripts/editorial_revision_helpers.py`.

Pre-release and production verification evidence belongs in `docs/qa/hanged-man-20261024/`. A successful commit or local build alone is not evidence of production publication.
