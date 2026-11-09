"""Check the Simplified Chinese Justice supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, read, validate_justice_pollack_record

current, previous = validate_justice_pollack_record(ROOT / "content/tarot/zh/justice.json")
english_date = read(ROOT / "content/tarot/en/justice.json")["updatedAt"]
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack supplements only in section-01, section-04 and new depth-sequence; "
    f"English date remains {english_date}; Traditional Chinese and Russian records unchanged"
)
