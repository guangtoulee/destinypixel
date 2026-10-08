# depth77-pentacles-01 — complete source and translations

This delivery contains the reviewed Simplified Chinese originals for `ace-of-pentacles`, `two-of-pentacles`, and `three-of-pentacles`, plus complete Traditional Chinese, English, and Russian translations.

- `source.json`: all supplied record fields preserved, including null slugs, complete source metadata, and the supplied body digests. Each digest has been verified against the exact UTF-8 `bodyMarkdown` value.
- `translations/{zh-TW,en,ru}/{cardId}.json`: the deliverable translation records, with `cardId`, `title`, both `quickTake` values, and full `bodyMarkdown`.
- Matching Markdown files are readable copies, with a final newline added to the JSON body value.
- `validation-report.json`: source/translation hashes and structural counts.
- `verify.py`: rerunnable integrity, paragraph-per-section, citation-order, list-count, and Markdown/JSON agreement checks.

All nine translated articles preserve the introduction and all twelve sections, including two separate three-paragraph fictional cases. Each article has 23 prose blocks and five linked citations, in the source order. The full source distinction between direct image observations, Waite's historical meanings, and modern applications is retained. No heading or paragraph has been condensed into a summary.

The Traditional Chinese text began with the project's character converter and received model editorial review with regional wording corrections, including 檔案、軟體、音訊、志工、字級、計畫、品質 and the distinction between 聯絡 and abstract 聯繫. English and Russian were translated in full and reviewed against the Chinese; a final check corrected “owning equipment” to “having equipment” in the borrowed-machine example and restored “last month's timetable” in Russian. This is model review, not native-human certification.

The translation JSON files are authoritative final copies; the initial assembly/conversion helper scripts are not a replacement for the final reviewed prose. `verify.py` is safe to rerun.

No live project files, routes, images, shared progress manifests, or Git history were modified by this translation subtask. Integration and application regression checks remain with the parent task.
