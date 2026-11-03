"""Check the Simplified Chinese Judgement supplement against its prior receipt."""
from editorial_revision_helpers import ROOT, validate_judgement_record

current, previous = validate_judgement_record(ROOT / "content/tarot/zh/judgement.json")
print(
    f"PASS zh: current JSON, exact previous/current file and complete-Markdown hashes; "
    f"all {len(previous['sections'])} section IDs retained; "
    "Pollack paragraphs only in section-01 and depth-comparison; "
    "English, Traditional Chinese and Russian records unchanged"
)
