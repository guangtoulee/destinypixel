"""Verify final private Library text packages before archiving complete translations.

The caller reconstructs official full-read windows without rewriting any manuscript.
This script never reads a candidate translation or performs a network operation.
"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/tarot-depth-20261008"


def sha(raw):
    return hashlib.sha256(raw if isinstance(raw, bytes) else raw.encode()).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("intake", type=Path)
args = parser.parse_args()
manifest = json.loads((args.intake / "final-manifest.json").read_text())
receipts = json.loads((args.intake / "read-receipts.json").read_text())
sources = {record["cardId"]: record for path in (DATA / "incoming").glob("*/source.json")
           for record in json.loads(path.read_text())["records"]}
corrected = json.loads((DATA / "corrections/page-of-cups.zh.corrected.json").read_text())
target = DATA / "final-reviewed"
assert not target.exists(), "Final intake already archived; do not replace silently"
assert len(manifest["files"]) == 15
records = {}
packages = []
for item in manifest["files"]:
    locale, group = item["locale"], item["group"]
    assert locale in ("zh-TW", "en", "ru")
    raw = (args.intake / f"{group}-{locale}" / item["fileName"]).read_bytes()
    assert len(raw) == item["bytes"] and sha(raw) == item["wholeFileSha256"], item["fileName"]
    read_receipt = next(r for r in receipts["files"] if r["libraryFileId"] == item["libraryFileId"])
    windows = read_receipt["windows"]
    assert windows[0]["start_line"] == 1 and windows[-1]["end_line"] == item["totalLines"]
    assert windows[-1]["has_more"] is False
    assert all(a["end_line"] + 1 == b["start_line"] for a, b in zip(windows, windows[1:]))
    package = json.loads(raw)
    expected = {card for card in sources if ("-of-" not in card if group == "major" else card.endswith(f"-of-{group}"))}
    assert len(package) == item["cardCount"] and {r["cardId"] for r in package} == expected
    for edition in package:
        card = edition["cardId"]
        assert edition.get("id", card) == card and edition.get("locale", locale) == locale
        accepted_source_hashes = {sources[card]["bodySha256"]}
        if card == "page-of-cups":
            accepted_source_hashes.add(corrected["bodySha256"])
        assert edition["sourceBodySha256"] in accepted_source_hashes
        assert sha(edition["bodyMarkdown"]) == edition["translatedBodySha256"]
        key = f"{locale}/{card}"
        assert key not in records
        records[key] = {"record": edition, "fileName": item["fileName"], "libraryFileId": item["libraryFileId"],
                        "wholeFileSha256": item["wholeFileSha256"]}
    packages.append((item["fileName"], raw))
assert set(records) == {f"{locale}/{card}" for locale in ("zh-TW", "en", "ru") for card in sources}
# Write only after the complete 231-edition intake is verified in memory.
for name, raw in packages:
    path = target / "packages" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
index = {}
for key, value in records.items():
    write(target / f"{key}.json", value["record"])
    index[key] = {k: v for k, v in value.items() if k != "record"}
    index[key].update(sourceBodySha256=value["record"]["sourceBodySha256"],
                      translatedBodySha256=value["record"]["translatedBodySha256"],
                      recordSha256=sha((target / f"{key}.json").read_bytes()))
write(target / "manifest.json", {**manifest, "review": "parent_final_independent_review", "publication": "private_local_only", "editions": index})
write(target / "read-receipts.json", receipts)
print("PASS archived 15 exact final packages / 231 complete translations; no candidate used; no runtime change")
