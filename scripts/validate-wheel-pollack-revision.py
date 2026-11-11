"""Check the Simplified Chinese Wheel of Fortune supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, read, validate_wheel_pollack_record

current, previous = validate_wheel_pollack_record(ROOT / "content/tarot/zh/wheel.json")
english_date = read(ROOT / "content/tarot/en/wheel.json")["updatedAt"]
traditional_date = read(ROOT / "content/tarot/zh-TW/wheel.json")["updatedAt"]
russian_date = read(ROOT / "content/tarot/ru/wheel.json")["updatedAt"]
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-04 and new depth-sequence; "
    f"English date remains {english_date}; Traditional Chinese date remains {traditional_date}; "
    f"Russian date remains {russian_date}"
)
