"""Check the Simplified Chinese Temperance supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, validate_temperance_record

current, previous = validate_temperance_record(ROOT / "content/tarot/zh/temperance.json")
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-04 and new depth-sequence; "
    "English, Traditional Chinese and Russian records unchanged"
)
