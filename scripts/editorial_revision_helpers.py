"""Keep the six sample revisions separate from their original review receipts."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVISION_DIR = ROOT / "content/encyclopedia-samples-20261011"
SAMPLE_PATHS = frozenset({
    f"content/hexagrams/{locale}/hexagram-11.json"
    for locale in ("en", "zh")
} | {
    f"content/tarot/{locale}/{card}.json"
    for locale in ("en", "zh") for card in ("sun", "moon")
})
SAMPLE_SLUGS = frozenset({"ding-you-day-pillar", "hexagram-11", "tarot-sun", "tarot-moon"})


def sha(raw):
    return hashlib.sha256(raw if isinstance(raw, bytes) else raw.encode()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def sample_key(path):
    return Path(path).resolve().relative_to(ROOT).as_posix()


def revision_registry():
    registry = read(REVISION_DIR / "revisions.json")
    assert registry["updatedAt"] == "2026-10-11"
    assert set(registry["articles"]) == SAMPLE_SLUGS, "Unexpected sample article scope"
    for slug, article in registry["articles"].items():
        assert set(article["notes"]) == {"en", "zh"}, f"Unexpected language scope: {slug}"
        assert all(isinstance(note, str) and note.strip() for note in article["notes"].values())
    assert set(registry["records"]) == SAMPLE_PATHS, "Exactly six explicit sample record hashes are required"
    for key, record in registry["records"].items():
        assert set(record) == {"fileSha256", "articleMarkdownSha256", "previousFileSha256"}, key
        assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values()), key
    return registry


def is_sample(path):
    return sample_key(path) in SAMPLE_PATHS


def validate_sample_record(path):
    """Validate new bytes without assigning the old receipt to the new prose."""
    key = sample_key(path)
    assert key in SAMPLE_PATHS, f"Not an authorized sample record: {key}"
    record = revision_registry()["records"][key]
    raw = Path(path).read_bytes()
    previous_raw = (REVISION_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    assert sha(raw) == record["fileSha256"], f"Current sample file differs from revision receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current sample Markdown differs from revision receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"], f"Historical sample file differs from revision receipt: {key}"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n"), key
    # These fields describe original delivery/review, not a new human review.
    for field in ("contentProvenance", "review", "reviewStatus", "sourceContentHash", "sourceIds", "publicationStatus", "publishedAt"):
        if field in previous:
            assert current[field] == previous[field], f"Legacy provenance/review changed: {key}/{field}"
    if "review" in current:
        assert current["review"]["nativeHumanReview"] is False, key
    if "reviewStatus" in current:
        assert current["reviewStatus"]["nativeExpertReview"] == "not_performed", key
    return current, previous


def historical_bytes(path):
    if not is_sample(path):
        return Path(path).read_bytes()
    validate_sample_record(path)
    return (REVISION_DIR / "previous" / sample_key(path)).read_bytes()


def historical_record(path):
    return json.loads(historical_bytes(path))


def approved_markdown_sha(path, legacy_hash):
    if not is_sample(path):
        return legacy_hash
    validate_sample_record(path)
    return revision_registry()["records"][sample_key(path)]["articleMarkdownSha256"]


def validate_current_tarot_sample(path, schema=None, catalog_entry=None):
    current, previous = validate_sample_record(path)
    if schema is not None:
        import jsonschema
        jsonschema.validate(current, schema)
    for field in ("cardId", "deckOrder", "number", "arcana", "locale", "image", "articleSlug", "keywords", "relatedCards"):
        assert current[field] == previous[field], (sample_key(path), field)
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-10-11"
    md = current["articleMarkdown"]
    assert current["quickTakeLabel"] and current["quickTakeLabel"] in md
    assert set(current["shortAnswer"]) == {"title", "body"}
    for text in [current["hook"], *current.get("openingParagraphs", []), *current["quickTake"].values(), *current["shortAnswer"].values()]:
        assert text.strip() and text in md, f"Sample opening missing from complete Markdown: {sample_key(path)}"
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current["sourceAppendix"]
    assert appendix["title"] and appendix["summary"] and appendix["summary"] in md
    ids.append(appendix["id"])
    assert len(ids) == len(set(ids)), f"Duplicate current sample anchors: {sample_key(path)}"
    previous_ids = {section["id"] for section in previous["sections"]}
    previous_ids.update(previous.get("legacyIntroAnchors", []))
    previous_ids.update(previous.get("legacyRelatedAnchors", []))
    previous_ids.update(anchor for section in previous["sections"] for anchor in section.get("legacyAnchors", []))
    if previous.get("sourceAppendix"):
        previous_ids.add(previous["sourceAppendix"]["id"])
    assert previous_ids <= set(ids), f"Old sample anchors lost: {sample_key(path)}"
    for section in current["sections"]:
        assert section["bodyMarkdown"].strip()
        assert f"## {section['title']}\n\n{section['bodyMarkdown']}" in md, f"Current sample section differs from complete Markdown: {sample_key(path)}/{section['id']}"
    assert len(current["sections"]) >= len(previous["sections"])
    for role in ("case-1", "case-2", "example", "practice"):
        retained = [section for section in previous["sections"] if section["role"] == role]
        assert len([section for section in current["sections"] if section["role"] == role]) == len(retained), (sample_key(path), role)
    assert current["sources"] and all(source["title"].strip() and source["url"] and source["url"] in md for source in current["sources"])
    assert all(source["url"].startswith("https://") for source in current["sources"])
    if catalog_entry is not None:
        assert all(catalog_entry[field] == current[field] for field in ("title", "hook", "quickTake")), f"Current sample catalog stale: {sample_key(path)}"
    return current
