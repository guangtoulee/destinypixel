"""Retain complete model-reviewed translations separately from live articles."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/tarot-depth-20261008"


def shape(body):
    parts = re.split(r"^## (.+)\n\n", body, flags=re.M)
    return len(parts[0].strip().split("\n\n")), [(len(text.strip().split("\n\n")), len(re.findall(r"^- ", text, re.M))) for text in parts[2::2]]


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("batch")
parser.add_argument("translations", type=Path)
args = parser.parse_args()
source = json.loads((DATA / "incoming" / args.batch / "source.json").read_text())
manifest = json.loads((DATA / "manifest.json").read_text())
report = {"batchId": args.batch, "review": "full model review reported by translation agent; structure independently checked", "nativeHumanReview": False, "editions": {}}
pending = []
for original in source["records"]:
    card = original["cardId"]
    assert hashlib.sha256(original["bodyMarkdown"].encode()).hexdigest() == original["bodySha256"]
    for locale in ("en", "zh-TW", "ru"):
        raw = (args.translations / locale / f"{card}.json").read_bytes()
        edition = json.loads(raw)
        assert edition["cardId"] == card and edition["title"] and all(edition["quickTake"].values())
        body = edition["bodyMarkdown"]
        assert shape(body) == shape(original["bodyMarkdown"]), f"Structure differs: {card}/{locale}"
        assert re.findall(r"\]\((https?://[^)]+)\)", body) == re.findall(r"\]\((https?://[^)]+)\)", original["bodyMarkdown"]), f"Citation differs: {card}/{locale}"
        dest = DATA / "translations" / args.batch / locale / f"{card}.json"
        assert not dest.exists(), f"Do not overwrite reviewed translation: {dest}"
        assert manifest["cards"][card]["locales"][locale] == "awaiting_source"
        report["editions"][f"{locale}/{card}"] = {"bodySha256": hashlib.sha256(body.encode()).hexdigest(), "fileSha256": hashlib.sha256(raw).hexdigest()}
        pending.append((dest, raw))
        manifest["cards"][card]["locales"][locale] = "translated"
for dest, raw in pending:
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
(DATA / "translations" / args.batch / "review.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
(DATA / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
print(f"Staged {len(source['records'])} cards / {len(pending)} full translations; live content unchanged")
