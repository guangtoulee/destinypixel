"""Independently check received originals and complete integrated tarot editions."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/tarot-depth-20261008"
LOCALES = ("zh", "zh-TW", "en", "ru")
try:
    import jsonschema
except ImportError:
    jsonschema = None


def sha(raw):
    return hashlib.sha256(raw if isinstance(raw, bytes) else raw.encode()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def parts(body):
    matches = list(re.finditer(r"^## ([^\n]+)\n\n", body, re.M))
    assert matches
    intro = body[:matches[0].start()].strip().split("\n\n")
    sections = [(match[1], body[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(body)].strip())
                for i, match in enumerate(matches)]
    return intro, sections


def shape(body):
    opening, sections = parts(body)
    return (len(opening), [(len(text.split("\n\n")), len(re.findall(r"^- ", text, re.M))) for _, text in sections])


m = read(DATA / "manifest.json")
v = read(DATA / "revisions.json")
catalog = read(ROOT / "lib/tarot-learning/catalog.json")
schema = read(ROOT / "content/tarot/article.schema.json")
sources = {}
for batch in sorted((DATA / "incoming").glob("*")):
    raw = (batch / "source.json").read_bytes()
    receipt = read(batch / "receipt.json")
    assert sha(raw) == receipt["sourcePackageSha256"], batch.name
    package = json.loads(raw)
    records = package["records"]
    assert len(records) == len(receipt["records"])
    for original, record_receipt in zip(records, receipt["records"]):
        card = original["cardId"]
        assert card != "sun" and card in m["cards"] and card not in sources
        assert card == record_receipt["cardId"]
        body = original["bodyMarkdown"]
        assert sha(body) == original["bodySha256"] == record_receipt["articleSha256"] == m["cards"][card]["sourceArticleSha256"], card
        assert m["cards"][card]["sourceBatch"] == batch.name
        assert len(body) == record_receipt["characters"] >= 1500
        assert len(parts(body)[1]) == record_receipt["sectionCount"] >= 6
        sources[card] = original

assert set(sources) == {card for card, state in m["cards"].items() if state["sourceBatch"]}
translated = set()
translation_count = 0
for review_path in sorted((DATA / "translations").glob("*/review.json")):
    report = read(review_path)
    assert report["nativeHumanReview"] is False
    assert report["batchId"] == review_path.parent.name
    for key, hashes in report["editions"].items():
        locale, card = key.split("/")
        assert locale in ("en", "zh-TW", "ru") and card in sources
        raw = (review_path.parent / locale / f"{card}.json").read_bytes()
        edition = json.loads(raw)
        assert sha(raw) == hashes["fileSha256"] and sha(edition["bodyMarkdown"]) == hashes["bodySha256"]
        assert edition["cardId"] == card and edition["title"] and all(edition["quickTake"].values())
        assert shape(edition["bodyMarkdown"]) == shape(sources[card]["bodyMarkdown"])
        assert re.findall(r"\]\((https?://[^)]+)\)", edition["bodyMarkdown"]) == re.findall(r"\]\((https?://[^)]+)\)", sources[card]["bodyMarkdown"])
        assert m["cards"][card]["locales"][locale] in ("translated", "integrated", "validated")
        translated.add(card)
        translation_count += 1
    batch_cards = {key.split("/")[1] for key in report["editions"]}
    assert set(report["editions"]) == {f"{locale}/{card}" for card in batch_cards for locale in ("en", "zh-TW", "ru")}
integrated = set(v["cards"])
assert integrated <= sources.keys()
assert set(v["editions"]) == set(v["articleMarkdownSha256"]) == {f"{locale}/{card}" for card in integrated for locale in LOCALES}
for card in sorted(integrated):
    source = sources[card]
    for locale in LOCALES:
        key = f"{locale}/{card}"
        edition = read(DATA / "editions" / locale / f"{card}.json")
        path = ROOT / "content/tarot" / locale / f"{card}.json"
        raw = path.read_bytes()
        article = json.loads(raw)
        if jsonschema:
            jsonschema.validate(article, schema)
        previous = ROOT / f"content/tarot/revisions/2026-10-08/{card}.{locale}.json"
        baseline = subprocess.check_output(["git", "show", f"{m['baselineCommit']}:{path.relative_to(ROOT)}"], cwd=ROOT)
        assert previous.read_bytes() == baseline, f"Archive changed: {key}"
        old = json.loads(baseline)
        for field in ("cardId", "deckOrder", "number", "arcana", "locale", "image", "articleSlug", "keywords", "relatedCards"):
            assert article[field] == old[field], (key, field)
        body = edition["bodyMarkdown"]
        assert edition["cardId"] == card and article["title"] == edition["title"]
        assert article["quickTake"] == edition["quickTake"]
        assert article["articleMarkdown"] == f"# {edition['title']}\n\n{body}"
        assert sha(body) == v["editions"][key]["bodySha256"] == article["contentProvenance"]["editionBodySha256"]
        assert sha(raw) == v["editions"][key]["recordSha256"]
        assert sha(article["articleMarkdown"]) == v["articleMarkdownSha256"][key]
        assert article["sources"] == source["sources"], f"Source metadata lost: {key}"
        if locale == "zh":
            assert body == source["bodyMarkdown"] and edition["title"] == source["title"] and edition["quickTake"] == source["quickTake"]
        assert shape(body) == shape(source["bodyMarkdown"]), f"Incomplete translation structure: {key}"
        assert re.findall(r"\]\((https?://[^)]+)\)", body) == re.findall(r"\]\((https?://[^)]+)\)", source["bodyMarkdown"]), key
        intro, sections = parts(body)
        assert [(s["title"], s["bodyMarkdown"]) for s in article["sections"]] == sections, f"Visible sections lost or rewritten: {key}"
        visible_intro = intro[2:] if source["bodyMarkdown"].startswith("正位先读一句：") else intro
        assert [article["hook"], *article["openingParagraphs"]] == visible_intro
        cases = [s for s in article["sections"] if s["role"] in ("case-1", "case-2")]
        assert len(cases) == 2 and cases[0]["bodyMarkdown"] != cases[1]["bodyMarkdown"]
        assert all(len(s["bodyMarkdown"].split("\n\n")) >= 3 for s in cases), f"Truncated cases: {key}"
        ids = [s["id"] for s in article["sections"]]
        ids += article.get("legacyIntroAnchors", []) + article.get("legacyRelatedAnchors", [])
        ids += [anchor for s in article["sections"] for anchor in s.get("legacyAnchors", [])]
        assert len(ids) == len(set(ids)), f"Duplicate HTML anchors: {key}"
        assert {s["id"] for s in old["sections"]} <= set(ids), f"Broken old anchors: {key}"
        entry = next(c for c in catalog[locale] if c["cardId"] == card)
        assert all(entry[f] == article[f] for f in ("title", "hook", "quickTake")), f"Catalog stale: {key}"
        assert article["publishedAt"] == "2026-10-07" and article["updatedAt"] == "2026-10-08"
        assert article["review"]["nativeHumanReview"] is False
        assert m["cards"][card]["locales"][locale] in ("integrated", "validated")

print(f"PASS {len(sources)} exact received Chinese manuscripts; {len(integrated)} integrated cards / {len(integrated) * 4} full editions")
print(f"PASS {len(translated)} translated cards / {translation_count} retained full translations with exact hashes and structural parity")
print("PASS full body and section parity, two complete cases, source metadata, exact archives, old anchors, catalog and dates; HTTP/build/browser checks are separate")
