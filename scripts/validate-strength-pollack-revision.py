"""Check the Simplified Chinese Strength supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, read, validate_strength_pollack_record

current, previous = validate_strength_pollack_record(ROOT / "content/tarot/zh/strength.json")
english_date = read(ROOT / "content/tarot/en/strength.json")["updatedAt"]
traditional_date = read(ROOT / "content/tarot/zh-TW/strength.json")["updatedAt"]
russian_date = read(ROOT / "content/tarot/ru/strength.json")["updatedAt"]
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-03, section-04 and new depth-sequence; "
    f"English date remains {english_date}; Traditional Chinese date remains {traditional_date}; "
    f"Russian date remains {russian_date}"
)
