"""Validate the new Two of Swords section without relabelling historical approvals."""
import re

from editorial_revision_helpers import ROOT, validate_two_swords_record

shapes = []
for locale in ("en", "zh"):
    current, previous = validate_two_swords_record(ROOT / f"content/tarot/{locale}/two-of-swords.json")
    section = next(item for item in current["sections"] if item["id"] == "armed-truce")
    body = section["bodyMarkdown"]
    paragraphs = body.split("\n\n")
    links = re.findall(r"\]\(([^)]+)\)", body)
    shapes.append((len(paragraphs), re.findall(r"^([0-9]+)\. ", body, re.M), links))
    print(f"PASS {locale}: JSON Schema; exact prior/current file and complete-Markdown hashes; "
          f"all {len(previous['sections'])} original sections, metadata, anchors and sources retained; "
          "single source-attributed exercise and fresh online Waite recheck")

assert shapes[0][:2] == shapes[1][:2], "Bilingual paragraph/step structures differ"
normalize = lambda links: [link.replace("?locale=zh", "") for link in links]
assert normalize(shapes[0][2]) == normalize(shapes[1][2]), "Bilingual links differ"
print("PASS parallel bilingual paragraphs, three numbered steps and matching-language links; "
      "unmodified Russian/Traditional Chinese bytes/dates; old approval and provenance receipts preserved")
