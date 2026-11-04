"""Check the Simplified Chinese Devil supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, validate_devil_record

current, previous = validate_devil_record(ROOT / "content/tarot/zh/devil.json")
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-03 and new depth-sequence; "
    "English, Traditional Chinese and Russian records unchanged"
)
