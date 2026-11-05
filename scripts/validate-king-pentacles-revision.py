"""Validate the current King of Pentacles additions separately from old receipts."""
import re

from editorial_revision_helpers import ROOT, validate_king_pentacles_record


shapes = []
for locale in ("en", "zh"):
    current, previous = validate_king_pentacles_record(ROOT / f"content/tarot/{locale}/king-of-pentacles.json")
    body = next(section for section in current["sections"] if section["id"] == "resources-and-freedom")["bodyMarkdown"]
    shapes.append((len(body.split("\n\n")), re.findall(r"^([0-9]+)\. ", body, re.M),
                   re.findall(r"\]\(([^)]+)\)", body)))
    print(f"PASS {locale}: current JSON Schema, exact previous/current file and full-Markdown hashes; "
          f"all {len(previous['sections'])} old sections/fields/order/anchors/sources retained; "
          "one King/Fool comparison and one local book source")

assert shapes[0][:2] == shapes[1][:2], "New King of Pentacles paragraph/step structures differ between languages"
normalize = lambda links: [link.replace("?locale=zh", "") for link in links]
assert normalize(shapes[0][2]) == normalize(shapes[1][2]), "New King of Pentacles bilingual links differ"
print("PASS parallel bilingual paragraphs, all three ordered exercise steps and source/Fool/Nine/tool links; "
      "book reference stays local at actual PDF 286–287 / printed 287–288; "
      "untouched Russian/Traditional Chinese bytes/dates and historical human-review/provenance claims preserved")
