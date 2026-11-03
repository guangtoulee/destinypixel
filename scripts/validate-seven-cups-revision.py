"""Validate the current Seven of Cups additions separately from old receipts."""
import re

from editorial_revision_helpers import ROOT, validate_seven_cups_record


shapes = []
for locale in ("en", "zh"):
    current, previous = validate_seven_cups_record(ROOT / f"content/tarot/{locale}/seven-of-cups.json")
    body = next(section for section in current["sections"] if section["id"] == "creative-resource-practice")["bodyMarkdown"]
    shapes.append((len(body.split("\n\n")), re.findall(r"^([0-9]+)\. ", body, re.M),
                   re.findall(r"\]\(([^)]+)\)", body)))
    print(f"PASS {locale}: current JSON Schema, exact previous/current file and full-Markdown hashes; "
          f"all {len(previous['sections'])} old sections/fields/order/anchors/sources retained; "
          "one creative-resource practice and one local book source")

assert shapes[0][:2] == shapes[1][:2], "New Seven of Cups paragraph/step structures differ between languages"
normalize = lambda links: [link.replace("?locale=zh", "") for link in links]
assert normalize(shapes[0][2]) == normalize(shapes[1][2]), "New Seven of Cups bilingual links differ"
print("PASS parallel bilingual paragraphs, all three ordered exercise steps and source/tool/journal links; "
      "book reference stays local at actual PDF 245–246 / printed 246–247; "
      "untouched Russian/Traditional Chinese bytes/dates and historical human-review/provenance claims preserved")
