"""Keep later editorial revisions separate from their original review receipts."""
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
HANGED_MAN_DIR = ROOT / "content/hanged-man-update-20261024"
HANGED_MAN_PATHS = frozenset(f"content/tarot/{locale}/hanged-man.json" for locale in ("en", "zh"))
STAR_DIR = ROOT / "content/star-update-20261025"
STAR_PATHS = frozenset(f"content/tarot/{locale}/star.json" for locale in ("en", "zh"))


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
    if sample_key(path) in STAR_PATHS:
        validate_star_record(path)
        return (STAR_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in HANGED_MAN_PATHS:
        validate_hanged_man_record(path)
        return (HANGED_MAN_DIR / "previous" / sample_key(path)).read_bytes()
    if not is_sample(path):
        return Path(path).read_bytes()
    validate_sample_record(path)
    return (REVISION_DIR / "previous" / sample_key(path)).read_bytes()


def historical_record(path):
    return json.loads(historical_bytes(path))


def approved_markdown_sha(path, legacy_hash):
    if sample_key(path) in STAR_PATHS:
        current, _ = validate_star_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in HANGED_MAN_PATHS:
        current, _ = validate_hanged_man_record(path)
        return sha(current["articleMarkdown"])
    if not is_sample(path):
        return legacy_hash
    validate_sample_record(path)
    return revision_registry()["records"][sample_key(path)]["articleMarkdownSha256"]


def validate_hanged_man_record(path):
    """Check the new two-language text and preserve its exact prior receipt."""
    key = sample_key(path)
    assert key in HANGED_MAN_PATHS, f"Not a Hanged Man revision: {key}"
    registry = read(HANGED_MAN_DIR / "revisions.json")
    assert registry["updatedAt"] == "2026-10-24"
    assert set(registry["articles"]) == {"tarot-hanged-man"}
    notes = registry["articles"]["tarot-hanged-man"]["notes"]
    assert set(notes) == {"en", "zh"} and all(note.strip() for note in notes.values())
    assert set(registry["records"]) == HANGED_MAN_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())
    raw, previous_raw = Path(path).read_bytes(), (HANGED_MAN_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    assert sha(raw) == record["fileSha256"], f"Current Hanged Man file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], key
    assert sha(previous_raw) == record["previousFileSha256"], f"Historical Hanged Man file differs from receipt: {key}"
    legacy_hash = read(ROOT / "content/tarot-depth-20261008/revisions.json")["articleMarkdownSha256"][f"{Path(path).parent.name}/hanged-man"]
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == legacy_hash, f"Historical Hanged Man approval changed: {key}"
    allowed_changes = {"shortAnswer", "sections", "sources", "sourceAppendix", "articleMarkdown", "updatedAt", "editorialRevision"}
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Hanged Man metadata changed: {key}/{field}"
    assert current["updatedAt"] == "2026-10-24" and current["publishedAt"] == "2026-10-07"
    assert current["review"]["nativeHumanReview"] is False
    previous_ids = {section["id"] for section in previous["sections"]}
    assert [section for section in current["sections"] if section["id"] in previous_ids] == previous["sections"], f"Original Hanged Man text/order/anchors changed: {key}"
    assert len(current["sections"]) > len(previous["sections"]), f"No substantive Hanged Man section added: {key}"
    assert current["sources"][:len(previous["sources"])] == previous["sources"], f"Original Hanged Man source receipts changed: {key}"
    assert len(current["sources"]) > len(previous["sources"])
    appendix = current["sourceAppendix"]
    assert all(appendix[field] == value for field, value in previous["sourceAppendix"].items()), f"Original Hanged Man source anchor changed: {key}"
    md = current["articleMarkdown"]
    assert md.startswith(f"# {current['title']}\n\n")
    assert set(current["shortAnswer"]) == {"title", "body"}
    for text in [*current["shortAnswer"].values(), current["hook"], *current["quickTake"].values()]:
        assert text.strip() and text in md, f"Hanged Man opening absent from complete Markdown: {key}"
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    ids.append(appendix["id"])
    assert len(ids) == len(set(ids)), f"Duplicate Hanged Man anchors: {key}"
    for section in current["sections"]:
        assert section["bodyMarkdown"].strip()
        assert f"## {section['title']}\n\n{section['bodyMarkdown']}" in md, f"Hanged Man section absent from complete Markdown: {key}/{section['id']}"
    for source in current["sources"]:
        assert source["title"].strip() and source["url"].startswith("https://") and source["url"] in md, f"Missing Hanged Man source: {key}"
    if appendix.get("summary"):
        assert appendix["summary"] in md
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_star_record(path):
    """Validate the two revised Star editions against their exact prior approval."""
    key = sample_key(path)
    assert key in STAR_PATHS, f"Not a Star revision: {key}"
    registry = read(STAR_DIR / "revisions.json")
    assert registry["baseCommit"] == "892ecef8aa32f0c97bb4200548a943db5fffa81b"
    assert registry["updatedAt"] == "2026-10-25"
    assert set(registry["articles"]) == {"tarot-star"}
    notes = registry["articles"]["tarot-star"]["notes"]
    assert set(notes) == {"en", "zh"} and all(isinstance(note, str) and note.strip() for note in notes.values())
    assert set(registry["records"]) == STAR_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())
    raw, previous_raw = Path(path).read_bytes(), (STAR_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = f"{Path(path).parent.name}/star"
    assert sha(raw) == record["fileSha256"], f"Current Star file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Star Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Star file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Star Markdown approval changed: {key}"
    allowed_changes = {"shortAnswer", "sections", "sources", "sourceAppendix", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= allowed_changes, f"Unexpected Star metadata added: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Star metadata changed: {key}/{field}"
    assert current["updatedAt"] == "2026-10-25" and current["publishedAt"] == "2026-10-07"
    assert current["review"]["nativeHumanReview"] is False
    previous_ids = {section["id"] for section in previous["sections"]}
    retained = [section for section in current["sections"] if section["id"] in previous_ids]
    assert len(previous["sections"]) == 8
    assert [section["id"] for section in retained] == [section["id"] for section in previous["sections"]], f"Original Star section order/IDs changed: {key}"
    for old, section in zip(previous["sections"], retained):
        if old["id"] == "section-02":
            assert {**section, "bodyMarkdown": old["bodyMarkdown"]} == old, f"Original Star tradition metadata changed: {key}"
            assert section["bodyMarkdown"].split("\n\n")[0] == old["bodyMarkdown"].split("\n\n")[0], f"Original Star Part II paragraph changed: {key}"
        else:
            assert section == old, f"Original Star section changed: {key}/{old['id']}"
    added = [(section["id"], section["role"]) for section in current["sections"] if section["id"] not in previous_ids]
    assert added == [("pollack-and-hope", "tradition"), ("facts-support-and-outcomes", "practice")], f"Unexpected Star section scope: {key}"
    assert current["sources"][:len(previous["sources"])] == previous["sources"], f"Original Star sources changed: {key}"
    assert len(current["sources"]) > len(previous["sources"])
    appendix = current["sourceAppendix"]
    assert all(appendix[field] == value for field, value in previous["sourceAppendix"].items()), f"Original Star source anchor changed: {key}"
    md = current["articleMarkdown"]
    assert md.startswith(f"# {current['title']}\n\n")
    assert set(current["shortAnswer"]) == {"title", "body"}
    for text in [*current["shortAnswer"].values(), current["hook"], *current["quickTake"].values(), *current.get("openingParagraphs", [])]:
        assert text.strip() and text in md, f"Star opening absent from complete Markdown: {key}"
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    ids.append(appendix["id"])
    assert len(ids) == len(set(ids)), f"Duplicate Star anchors: {key}"
    for section in current["sections"]:
        assert section["bodyMarkdown"].strip()
        assert f"## {section['title']}\n\n{section['bodyMarkdown']}" in md, f"Star section absent from complete Markdown: {key}/{section['id']}"
    for source in current["sources"]:
        assert source["title"].strip(), f"Untitled Star source: {key}"
        url = source["url"]
        assert url is None or isinstance(url, str) and url.startswith("https://") and url in md, f"Missing Star source: {key}"
    book = next(source for source in current["sources"] if source.get("sourceId") == "star-pollack-2010")
    assert book["url"] is None and book["title"] in md
    assert book["sourceMetadata"]["author"] == "Rachel Pollack"
    assert book["sourceMetadata"]["pdfPages"] == book["sourceMetadata"]["printedPages"] == [158, 159, 160, 161]
    if appendix.get("summary"):
        assert appendix["summary"] in md
    revision = current["editorialRevision"]
    assert revision["date"] == "2026-10-25" and revision["previousRecord"] == f"content/star-update-20261025/previous/{key}"
    assert revision["note"] == notes[Path(path).parent.name] and revision["nativeHumanReviewClaimed"] is False
    for locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{locale}/star.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{locale}/star"]["recordSha256"], f"Unedited Star file changed: {locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


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
