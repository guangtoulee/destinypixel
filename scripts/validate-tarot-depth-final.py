"""Verify exact final Library packages, extracted records, and installed translations."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/tarot-depth-20261008"
FINAL = DATA / "final-reviewed"


def read(path):
    return json.loads(path.read_text())


def sha(value):
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode()).hexdigest()


manifest = read(FINAL / "manifest.json")
sources = {r["cardId"]: r for p in (DATA / "incoming").glob("*/source.json") for r in read(p)["records"]}
correction = read(DATA / "corrections/page-of-cups.zh.corrected.json")
assert manifest["review"] == "parent_final_independent_review"
assert manifest["publication"] == "private_local_only"
assert len(manifest["files"]) == 15
records = {}
aggregates = {locale: [] for locale in ("zh-TW", "en", "ru")}
for item in manifest["files"]:
    locale, group = item["locale"], item["group"]
    raw = (FINAL / "packages" / item["fileName"]).read_bytes()
    assert len(raw) == item["bytes"] and sha(raw) == item["wholeFileSha256"], item["fileName"]
    package = json.loads(raw)
    expected = {card for card in sources if ("-of-" not in card if group == "major" else card.endswith(f"-of-{group}"))}
    assert len(package) == item["cardCount"] and {r["cardId"] for r in package} == expected
    aggregates[locale].extend(package)
    for edition in package:
        card = edition["cardId"]
        key = f"{locale}/{card}"
        assert key not in records
        records[key] = edition
        assert read(FINAL / f"{key}.json") == edition, f"Final extracted record changed: {key}"
        index = manifest["editions"][key]
        assert index["fileName"] == item["fileName"] and index["libraryFileId"] == item["libraryFileId"]
        assert index["wholeFileSha256"] == item["wholeFileSha256"]
        assert sha((FINAL / f"{key}.json").read_bytes()) == index["recordSha256"]
        accepted = {sources[card]["bodySha256"]}
        if card == "page-of-cups":
            accepted.add(correction["bodySha256"])
        assert edition["sourceBodySha256"] in accepted
        assert sha(edition["bodyMarkdown"]) == edition["translatedBodySha256"] == index["translatedBodySha256"]
        assert read(DATA / "editions" / f"{key}.json") == edition, f"Candidate or rewritten edition installed: {key}"
        article = read(ROOT / "content/tarot" / f"{key}.json")
        assert article["articleMarkdown"] == f"# {edition['title']}\n\n{edition['bodyMarkdown']}"
        assert article["sources"] == edition["sources"]
        assert [s.get("url") for s in edition["sources"]] == [s.get("url") for s in sources[card]["sources"]]
        assert article["review"]["type"] == "parent_final_independent_translation_review"
        assert article["review"]["published"] is False
        proof = article["contentProvenance"]
        assert proof["translationSourceBodySha256"] == edition["sourceBodySha256"]
        assert proof["translationPackageSha256"] == item["wholeFileSha256"]
        assert proof["translationLibraryFileId"] == item["libraryFileId"]
        assert proof["translationRecordSha256"] == index["recordSha256"]
assert set(records) == set(manifest["editions"]) == {f"{locale}/{card}" for locale in aggregates for card in sources}
for locale, expected in {"en": "ff465b9f1b6fa203139cbfab54eb9ebe99151f19fc348a7c662cf005dc80fe16",
                         "ru": "40f11d966812813d4a7dd91e82a8a7bc0cf013e67f820e07a046377c6ef90cdb"}.items():
    assert sha(json.dumps(aggregates[locale], ensure_ascii=False, indent=2) + "\n") == expected
print("PASS 15 exact final files / 231 installed reviewed translations; per-file, source/body/record and English/Russian aggregate hashes match")
