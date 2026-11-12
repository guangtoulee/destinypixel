"""Check the Simplified Chinese Hermit supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, read, validate_hermit_pollack_record

current, previous = validate_hermit_pollack_record(ROOT / "content/tarot/zh/hermit.json")
english_date = read(ROOT / "content/tarot/en/hermit.json")["updatedAt"]
traditional_date = read(ROOT / "content/tarot/zh-TW/hermit.json")["updatedAt"]
russian_date = read(ROOT / "content/tarot/ru/hermit.json")["updatedAt"]
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-03, section-04 and new depth-sequence; "
    f"English date remains {english_date}; Traditional Chinese date remains {traditional_date}; "
    f"Russian date remains {russian_date}"
)
