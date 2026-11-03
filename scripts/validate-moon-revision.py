"""Check the Simplified Chinese Moon supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, validate_moon_record

current, previous = validate_moon_record(ROOT / "content/tarot/zh/moon.json")
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack paragraphs only in section-01 and section-02; "
    "English, Traditional Chinese and Russian records unchanged"
)
