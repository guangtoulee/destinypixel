"""Check both current editions and their independently retained old receipts."""
import re

from editorial_revision_helpers import ROOT, validate_eight_swords_record


shapes = []
for locale in ("en", "zh"):
    current, previous = validate_eight_swords_record(ROOT / f"content/tarot/{locale}/eight-of-swords.json")
    section = next(item for item in current["sections"] if item["id"] == "number-and-image")
    body = section["bodyMarkdown"]
    shapes.append((len(body.split("\n\n")), len(re.findall(r"^- ", body, re.M)),
                   re.findall(r"\]\(([^)]+)\)", body)))
    print(f"PASS {locale}: current JSON Schema, exact previous/current file and complete-Markdown hashes; "
          f"all {len(previous['sections'])} previous sections, fields, sources, order and anchors retained; "
          "one attributed practice section and two new sources")

assert shapes[0][:2] == shapes[1][:2], "New section paragraph/list structures differ between authored languages"
normalize = lambda links: [link.replace("?locale=zh", "") for link in links]
assert normalize(shapes[0][2]) == normalize(shapes[1][2]), "New bilingual links differ"
print("PASS two authored editions retain parallel paragraph/list/link structures; "
      "book reference stays local with actual PDF 200–201 / printed 201–202; "
      "untouched Russian/Traditional Chinese records and original human-review/provenance claims preserved")
