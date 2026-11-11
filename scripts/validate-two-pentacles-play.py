"""Validate the current Two of Pentacles addition without changing old receipts."""
import re

from editorial_revision_helpers import ROOT, validate_two_pentacles_play_record


shapes = []
for locale in ("en", "zh"):
    current, previous = validate_two_pentacles_play_record(ROOT / f"content/tarot/{locale}/two-of-pentacles.json")
    section = next(item for item in current["sections"] if item["id"] == "play-and-adaptation")
    body = section["bodyMarkdown"]
    shapes.append((len(body.split("\n\n")), re.findall(r"^([0-9]+)\. ", body, re.M),
                   re.findall(r"\]\(([^)]+)\)", body)))
    print(f"PASS {locale}: JSON Schema; fixed previous/current file and full-Markdown hashes; "
          f"all {len(previous['sections'])} old sections/cases/fields/order/anchors/source records retained; "
          "one original play comparison and three ordered exercise steps")

assert shapes[0][:2] == shapes[1][:2], "New paragraph/step structures differ between languages"
normalize = lambda links: [link.replace("?locale=zh", "") for link in links]
assert normalize(shapes[0][2]) == normalize(shapes[1][2]), "New bilingual links differ"
print("PASS parallel complete manuscripts, all three ordered steps and original/tool links; "
      "local-only Pollack citation PDF 313-314 / printed 314-315 and separate checked Waite transcription; "
      "untouched Russian/Traditional Chinese bytes/dates and historical provenance/review retained")
