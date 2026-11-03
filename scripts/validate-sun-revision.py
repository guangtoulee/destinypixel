"""Check the Simplified Chinese Sun supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, validate_sun_record

current, previous = validate_sun_record(ROOT / "content/tarot/zh/sun.json")
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack paragraphs only in sun-section-2; "
    "English, Traditional Chinese and Russian records unchanged"
)
