"""Check the Simplified Chinese Tower supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, validate_tower_record

current, previous = validate_tower_record(ROOT / "content/tarot/zh/tower.json")
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-03 and new depth-sequence; "
    "English, Traditional Chinese and Russian records unchanged"
)
