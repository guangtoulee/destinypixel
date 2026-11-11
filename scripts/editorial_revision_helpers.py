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
EIGHT_SWORDS_DIR = ROOT / "content/eight-swords-update-20261102"
EIGHT_SWORDS_PATHS = frozenset(f"content/tarot/{locale}/eight-of-swords.json" for locale in ("en", "zh"))
SEVEN_CUPS_DIR = ROOT / "content/seven-cups-update-20261103"
SEVEN_CUPS_PATHS = frozenset(f"content/tarot/{locale}/seven-of-cups.json" for locale in ("en", "zh"))
TWO_SWORDS_DIR = ROOT / "content/two-swords-update-20261106"
TWO_SWORDS_PATHS = frozenset(f"content/tarot/{locale}/two-of-swords.json" for locale in ("en", "zh"))
KING_PENTACLES_DIR = ROOT / "content/king-pentacles-update-20261105"
KING_PENTACLES_PATHS = frozenset(f"content/tarot/{locale}/king-of-pentacles.json" for locale in ("en", "zh"))
JUDGEMENT_DIR = ROOT / "content/judgement-update-20261103"
JUDGEMENT_PATHS = frozenset({"content/tarot/zh/judgement.json"})
MOON_DIR = ROOT / "content/moon-update-20261103"
MOON_PATHS = frozenset({"content/tarot/zh/moon.json"})
SUN_DIR = ROOT / "content/sun-update-20261103"
SUN_PATHS = frozenset({"content/tarot/zh/sun.json"})
TOWER_DIR = ROOT / "content/tower-update-20261104"
TOWER_PATHS = frozenset({"content/tarot/zh/tower.json"})
DEVIL_DIR = ROOT / "content/devil-update-20261104"
DEVIL_PATHS = frozenset({"content/tarot/zh/devil.json"})
TEMPERANCE_DIR = ROOT / "content/temperance-update-20261105"
TEMPERANCE_PATHS = frozenset({"content/tarot/zh/temperance.json"})
WORLD_DIR = ROOT / "content/world-update-20261106"
WORLD_PATHS = frozenset({"content/tarot/zh/world.json"})
DEATH_DIR = ROOT / "content/death-update-20261107"
DEATH_PATHS = frozenset({"content/tarot/zh/death.json"})
HANGED_MAN_POLLACK_DIR = ROOT / "content/hanged-man-update-20261108"
HANGED_MAN_POLLACK_PATHS = frozenset({"content/tarot/zh/hanged-man.json"})
JUSTICE_DIR = ROOT / "content/justice-update-20261109"
JUSTICE_PATHS = frozenset({"content/tarot/zh/justice.json"})
WHEEL_DIR = ROOT / "content/wheel-update-20261110"
WHEEL_PATHS = frozenset({"content/tarot/zh/wheel.json"})


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
    # The Chinese Moon supplement keeps the 2026-10-11 sample bytes in its previous/ snapshot.
    if key in MOON_PATHS:
        raw = (MOON_DIR / "previous" / key).read_bytes()
    elif key in SUN_PATHS:
        raw = (SUN_DIR / "previous" / key).read_bytes()
    else:
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
    if key in MOON_PATHS:
        validate_moon_record(path)
    if key in SUN_PATHS:
        validate_sun_record(path)
    return current, previous


def historical_bytes(path):
    if sample_key(path) in WHEEL_PATHS:
        validate_wheel_pollack_record(path)
        return (WHEEL_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in JUSTICE_PATHS:
        validate_justice_pollack_record(path)
        return (JUSTICE_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in TWO_SWORDS_PATHS:
        validate_two_swords_record(path)
        return (TWO_SWORDS_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in KING_PENTACLES_PATHS:
        validate_king_pentacles_record(path)
        return (KING_PENTACLES_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in SEVEN_CUPS_PATHS:
        validate_seven_cups_record(path)
        return (SEVEN_CUPS_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in JUDGEMENT_PATHS:
        validate_judgement_record(path)
        return (JUDGEMENT_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in TOWER_PATHS:
        validate_tower_record(path)
        return (TOWER_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in DEVIL_PATHS:
        validate_devil_record(path)
        return (DEVIL_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in TEMPERANCE_PATHS:
        validate_temperance_record(path)
        return (TEMPERANCE_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in WORLD_PATHS:
        validate_world_record(path)
        return (WORLD_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in DEATH_PATHS:
        validate_death_record(path)
        return (DEATH_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in EIGHT_SWORDS_PATHS:
        validate_eight_swords_record(path)
        return (EIGHT_SWORDS_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in STAR_PATHS:
        validate_star_record(path)
        return (STAR_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in HANGED_MAN_PATHS:
        if sample_key(path) in HANGED_MAN_POLLACK_PATHS:
            validate_hanged_man_pollack_record(path)
        validate_hanged_man_record(path)
        return (HANGED_MAN_DIR / "previous" / sample_key(path)).read_bytes()
    if not is_sample(path):
        return Path(path).read_bytes()
    validate_sample_record(path)
    return (REVISION_DIR / "previous" / sample_key(path)).read_bytes()


def historical_record(path):
    return json.loads(historical_bytes(path))


def approved_markdown_sha(path, legacy_hash):
    if sample_key(path) in WHEEL_PATHS:
        current, _ = validate_wheel_pollack_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in JUSTICE_PATHS:
        current, _ = validate_justice_pollack_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in TWO_SWORDS_PATHS:
        current, _ = validate_two_swords_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in KING_PENTACLES_PATHS:
        current, _ = validate_king_pentacles_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in SEVEN_CUPS_PATHS:
        current, _ = validate_seven_cups_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in MOON_PATHS:
        current, _ = validate_moon_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in SUN_PATHS:
        current, _ = validate_sun_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in JUDGEMENT_PATHS:
        current, _ = validate_judgement_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in TOWER_PATHS:
        current, _ = validate_tower_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in DEVIL_PATHS:
        current, _ = validate_devil_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in TEMPERANCE_PATHS:
        current, _ = validate_temperance_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in WORLD_PATHS:
        current, _ = validate_world_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in DEATH_PATHS:
        current, _ = validate_death_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in EIGHT_SWORDS_PATHS:
        current, _ = validate_eight_swords_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in STAR_PATHS:
        current, _ = validate_star_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in HANGED_MAN_POLLACK_PATHS:
        current, _ = validate_hanged_man_pollack_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in HANGED_MAN_PATHS:
        current, _ = validate_hanged_man_record(path)
        return sha(current["articleMarkdown"])
    if not is_sample(path):
        return legacy_hash
    validate_sample_record(path)
    return revision_registry()["records"][sample_key(path)]["articleMarkdownSha256"]


def validate_two_swords_record(path):
    """Preserve the old complete record while validating today's single addition."""
    import jsonschema

    key = sample_key(path)
    assert key in TWO_SWORDS_PATHS, f"Not a Two of Swords revision: {key}"
    registry = read(TWO_SWORDS_DIR / "revisions.json")
    assert registry["baseCommit"] == "d8e059ed1a895e409c625865b64909126566dd82"
    assert registry["updatedAt"] == "2026-11-06"
    assert set(registry["articles"]) == {"tarot-two-of-swords"}
    notes = registry["articles"]["tarot-two-of-swords"]["notes"]
    assert set(notes) == {"en", "zh"} and all(isinstance(note, str) and note.strip() for note in notes.values())
    assert set(registry["records"]) == TWO_SWORDS_PATHS
    receipt = registry["records"][key]
    assert set(receipt) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in receipt.values())
    raw = Path(path).read_bytes()
    previous_raw = (TWO_SWORDS_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    locale = Path(path).parent.name
    legacy_key = f"{locale}/two-of-swords"
    assert sha(raw) == receipt["fileSha256"], f"Current Two of Swords bytes differ from receipt: {key}"
    assert sha(current["articleMarkdown"]) == receipt["articleMarkdownSha256"], f"Current Two of Swords full manuscript differs from receipt: {key}"
    assert sha(previous_raw) == receipt["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Two of Swords approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == receipt["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Two of Swords full manuscript approval changed: {key}"

    allowed = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() == {"editorialRevision"}, f"Unexpected new metadata: {key}"
    assert previous.keys() <= current.keys(), f"Original metadata lost: {key}"
    for field in previous.keys() - allowed:
        assert current[field] == previous[field], f"Original Two of Swords field changed: {key}/{field}"
    assert current["review"]["nativeHumanReview"] is False
    assert previous["updatedAt"] == "2026-10-08"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-06"
    old_sections = previous["sections"]
    assert len(old_sections) == 11 and len(current["sections"]) == 12
    added = [section for section in current["sections"] if section["id"] == "armed-truce"]
    assert len(added) == 1 and added[0]["role"] == "practice"
    section = added[0]
    assert section.keys() == {"id", "role", "title", "bodyMarkdown"}
    assert section["title"].strip() and section["bodyMarkdown"].strip()
    insertion = next(i for i, old in enumerate(old_sections) if old["id"] == "section-02") + 1
    assert current["sections"] == old_sections[:insertion] + [section] + old_sections[insertion:], f"Original text/order/anchors changed: {key}"
    assert re.findall(r"^([0-9]+)\. ", section["bodyMarkdown"], re.M) == ["1", "2", "3"], f"Missing three-step learning exercise: {key}"
    assert current["sources"][:-1] == previous["sources"], f"Original source receipts changed: {key}"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    source = current["sources"][-1]
    assert source["sourceId"] == "two-swords-waite-recheck-20261106"
    assert source["type"] == "original_text_crosscheck"
    assert source["url"] == "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-swords"
    assert source["title"].strip() and source["checkedOn"] == "2026-11-06"
    assert "](" + source["url"] + ")" in section["bodyMarkdown"]
    assert not ({"pdfPages", "printedPages", "readScopePdf"} & source.get("sourceMetadata", {}).keys()), f"HTML recheck must not gain invented book pages: {key}"

    md = current["articleMarkdown"]
    block = f"## {section['title']}\n\n{section['bodyMarkdown']}\n\n"
    following = old_sections[insertion]
    marker = f"## {following['title']}\n\n{following['bodyMarkdown']}"
    assert previous["articleMarkdown"].count(marker) == 1
    assert md == previous["articleMarkdown"].replace(marker, block + marker), f"Manuscript changed outside addition: {key}"
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in md
    ids = [item["id"] for item in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for item in current["sections"] for anchor in item.get("legacyAnchors", [])]
    assert len(ids) == len(set(ids)), f"Duplicate anchor: {key}"
    suffix = "?locale=zh" if locale == "zh" else ""
    assert f"](/tarot{suffix})" in section["bodyMarkdown"]
    assert (TWO_SWORDS_DIR / f"manuscript-{locale}.md").read_text() == md.rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/two-swords-update-20261106/revisions.json"
    assert revision["updatedAt"] == "2026-11-06" and revision["scope"].strip()
    projected = {**current, "sections": old_sections, "sources": previous["sources"],
                 "articleMarkdown": md.replace(block, "", 1), "updatedAt": previous["updatedAt"]}
    projected.pop("editorialRevision")
    assert projected == previous, f"Inverse projection changed original record: {key}"
    assert sha(json.dumps(projected, ensure_ascii=False, indent=2) + "\n") == receipt["previousFileSha256"], f"Inverse projection fails original byte hash: {key}"
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/two-of-swords.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/two-of-swords"]["recordSha256"]
        assert read(unedited)["updatedAt"] == "2026-10-08"
    jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_king_pentacles_record(path):
    """Check the current comparison exercise without rewriting its old approval."""
    import jsonschema

    key = sample_key(path)
    assert key in KING_PENTACLES_PATHS, f"Not a King of Pentacles revision: {key}"
    registry = read(KING_PENTACLES_DIR / "revisions.json")
    assert registry["baseCommit"] == "c06f5d96327a59ad65f441fa4d012e209839fc54"
    assert registry["updatedAt"] == "2026-11-05"
    assert set(registry["articles"]) == {"tarot-king-of-pentacles"}
    notes = registry["articles"]["tarot-king-of-pentacles"]["notes"]
    assert set(notes) == {"en", "zh"} and all(isinstance(note, str) and note.strip() for note in notes.values())
    assert set(registry["records"]) == KING_PENTACLES_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw = Path(path).read_bytes()
    previous_raw = (KING_PENTACLES_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    locale = Path(path).parent.name
    legacy_key = f"{locale}/king-of-pentacles"
    assert sha(raw) == record["fileSha256"], f"Current King of Pentacles file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current King of Pentacles complete Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical King of Pentacles file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical King of Pentacles Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected King of Pentacles metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original King of Pentacles metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original King of Pentacles metadata changed: {key}/{field}"
    assert previous["updatedAt"] == "2026-10-08"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-05"
    assert current["review"]["nativeHumanReview"] is False

    old_sections = previous["sections"]
    assert len(old_sections) == 12 and len(current["sections"]) == 13
    added = [section for section in current["sections"] if section["id"] == "resources-and-freedom"]
    assert len(added) == 1 and added[0]["role"] == "practice"
    section = added[0]
    assert section.keys() == {"id", "role", "title", "bodyMarkdown"}
    assert section["title"].strip() and section["bodyMarkdown"].strip()
    assert [item for item in current["sections"] if item["id"] != section["id"]] == old_sections, f"Original King of Pentacles text/order/anchors changed: {key}"
    insertion = next(i for i, item in enumerate(old_sections) if item["id"] == "depth-image-reasoning") + 1
    assert current["sections"] == old_sections[:insertion] + [section] + old_sections[insertion:], f"King of Pentacles practice inserted elsewhere: {key}"
    assert re.findall(r"^([0-9]+)\. ", section["bodyMarkdown"], re.M) == ["1", "2", "3"], f"King of Pentacles exercise must keep all three steps: {key}"
    assert current["sources"][:len(previous["sources"])] == previous["sources"], f"Historical King of Pentacles source receipts changed: {key}"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "king-pentacles-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["title"].strip() and book["checkedOn"] == "2026-11-05"
    metadata = book["sourceMetadata"]
    assert metadata["layer"] == "modern_author_interpretation"
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "Chapter 10, King of Pentacles" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == [286, 287] and metadata["printedPages"] == [287, 288]
    assert metadata["readScopePdf"] == [286, 287]

    md = current["articleMarkdown"]
    block = f"## {section['title']}\n\n{section['bodyMarkdown']}\n\n"
    following = old_sections[insertion]
    marker = f"## {following['title']}\n\n{following['bodyMarkdown']}"
    assert previous["articleMarkdown"].count(marker) == 1
    assert md == previous["articleMarkdown"].replace(marker, block + marker), f"King of Pentacles complete Markdown changed outside its new section: {key}"
    assert md.startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in md
    ids = [item["id"] for item in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for item in current["sections"] for anchor in item.get("legacyAnchors", [])]
    if current.get("sourceAppendix"):
        ids.append(current["sourceAppendix"]["id"])
    assert len(ids) == len(set(ids)), f"Duplicate King of Pentacles anchors: {key}"
    suffix = "?locale=zh" if locale == "zh" else ""
    assert "](https://sacred-texts.com/tarot/pkt/pktpeki.htm)" in section["bodyMarkdown"]
    assert f"](/tarot{suffix})" in section["bodyMarkdown"]
    assert f"](/journal/tarot-fool{suffix})" in section["bodyMarkdown"]
    assert f"](/journal/tarot-nine-of-pentacles{suffix})" in section["bodyMarkdown"]
    assert (KING_PENTACLES_DIR / f"manuscript-{locale}.md").read_text() == md.rstrip() + "\n", f"Readable King of Pentacles manuscript differs from published source: {key}"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/king-pentacles-update-20261105/revisions.json"
    assert revision["updatedAt"] == "2026-11-05" and revision["scope"].strip()

    projected = {**current, "sections": old_sections, "sources": previous["sources"],
                 "articleMarkdown": md.replace(block, "", 1), "updatedAt": previous["updatedAt"]}
    projected.pop("editorialRevision")
    assert projected == previous, f"King of Pentacles inverse projection changed old fields: {key}"
    assert sha(json.dumps(projected, ensure_ascii=False, indent=2) + "\n") == record["previousFileSha256"], f"King of Pentacles inverse projection does not restore old bytes: {key}"
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/king-of-pentacles.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/king-of-pentacles"]["recordSha256"], f"Unedited King of Pentacles file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_seven_cups_record(path):
    """Check the current creative exercise without rewriting its old approval."""
    import jsonschema

    key = sample_key(path)
    assert key in SEVEN_CUPS_PATHS, f"Not a Seven of Cups revision: {key}"
    registry = read(SEVEN_CUPS_DIR / "revisions.json")
    assert registry["baseCommit"] == "8302ab6f9ac19cf0c8729c8f1bbec8b7368e4fe0"
    assert registry["updatedAt"] == "2026-11-03"
    assert set(registry["articles"]) == {"tarot-seven-of-cups"}
    notes = registry["articles"]["tarot-seven-of-cups"]["notes"]
    assert set(notes) == {"en", "zh"} and all(isinstance(note, str) and note.strip() for note in notes.values())
    assert set(registry["records"]) == SEVEN_CUPS_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw = Path(path).read_bytes()
    previous_raw = (SEVEN_CUPS_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    locale = Path(path).parent.name
    legacy_key = f"{locale}/seven-of-cups"
    assert sha(raw) == record["fileSha256"], f"Current Seven of Cups file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Seven of Cups complete Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Seven of Cups file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Seven of Cups Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Seven of Cups metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Seven of Cups metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Seven of Cups metadata changed: {key}/{field}"
    assert previous["updatedAt"] == "2026-10-08"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-03"
    assert current["review"]["nativeHumanReview"] is False

    old_sections = previous["sections"]
    assert len(old_sections) == 10 and len(current["sections"]) == 11
    added = [section for section in current["sections"] if section["id"] == "creative-resource-practice"]
    assert len(added) == 1 and added[0]["role"] == "practice"
    section = added[0]
    assert section.keys() == {"id", "role", "title", "bodyMarkdown"}
    assert section["title"].strip() and section["bodyMarkdown"].strip()
    assert [item for item in current["sections"] if item["id"] != section["id"]] == old_sections, f"Original Seven of Cups text/order/anchors changed: {key}"
    insertion = next(i for i, item in enumerate(old_sections) if item["id"] == "depth-positions") + 1
    assert current["sections"] == old_sections[:insertion] + [section] + old_sections[insertion:], f"Seven of Cups practice inserted elsewhere: {key}"
    assert re.findall(r"^([0-9]+)\. ", section["bodyMarkdown"], re.M) == ["1", "2", "3"], f"Seven of Cups exercise must keep all three steps: {key}"
    assert current["sources"][:len(previous["sources"])] == previous["sources"], f"Historical Seven of Cups source receipts changed: {key}"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "seven-cups-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["title"].strip() and book["checkedOn"] == "2026-11-03"
    metadata = book["sourceMetadata"]
    assert metadata["layer"] == "modern_author_interpretation"
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "Chapter 8, Seven of Cups" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == [245, 246] and metadata["printedPages"] == [246, 247]
    assert metadata["readScopePdf"] == [245, 246, 247]

    md = current["articleMarkdown"]
    block = f"## {section['title']}\n\n{section['bodyMarkdown']}\n\n"
    following = old_sections[insertion]
    marker = f"## {following['title']}\n\n{following['bodyMarkdown']}"
    assert previous["articleMarkdown"].count(marker) == 1
    assert md == previous["articleMarkdown"].replace(marker, block + marker), f"Seven of Cups complete Markdown changed outside its new section: {key}"
    assert md.startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in md
    ids = [item["id"] for item in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for item in current["sections"] for anchor in item.get("legacyAnchors", [])]
    if current.get("sourceAppendix"):
        ids.append(current["sourceAppendix"]["id"])
    assert len(ids) == len(set(ids)), f"Duplicate Seven of Cups anchors: {key}"
    suffix = "?locale=zh" if locale == "zh" else ""
    assert "](https://sacred-texts.com/tarot/pkt/pktcu07.htm)" in section["bodyMarkdown"]
    assert f"](/tarot{suffix})" in section["bodyMarkdown"]
    assert f"](/journal/how-to-keep-tarot-journal{suffix})" in section["bodyMarkdown"]
    assert (SEVEN_CUPS_DIR / f"manuscript-{locale}.md").read_text() == md.rstrip() + "\n", f"Readable Seven of Cups manuscript differs from published source: {key}"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/seven-cups-update-20261103/revisions.json"
    assert revision["updatedAt"] == "2026-11-03" and revision["scope"].strip()

    projected = {**current, "sections": old_sections, "sources": previous["sources"],
                 "articleMarkdown": md.replace(block, "", 1), "updatedAt": previous["updatedAt"]}
    projected.pop("editorialRevision")
    assert projected == previous, f"Seven of Cups inverse projection changed old fields: {key}"
    assert sha(json.dumps(projected, ensure_ascii=False, indent=2) + "\n") == record["previousFileSha256"], f"Seven of Cups inverse projection does not restore old bytes: {key}"
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/seven-of-cups.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/seven-of-cups"]["recordSha256"], f"Unedited Seven of Cups file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_eight_swords_record(path):
    """Validate the new practice section while retaining the original delivery."""
    # Schema validation is required for these new records, even when a caller
    # is reconstructing historical collections. Do not silently skip it.
    import jsonschema

    key = sample_key(path)
    assert key in EIGHT_SWORDS_PATHS, f"Not an Eight of Swords revision: {key}"
    registry = read(EIGHT_SWORDS_DIR / "revisions.json")
    assert registry["baseCommit"] == "7c162a22012d8909b8b8146df573c9d36e16d4b5"
    assert registry["updatedAt"] == "2026-11-02"
    assert set(registry["articles"]) == {"tarot-eight-of-swords"}
    notes = registry["articles"]["tarot-eight-of-swords"]["notes"]
    assert set(notes) == {"en", "zh"} and all(isinstance(note, str) and note.strip() for note in notes.values())
    assert set(registry["records"]) == EIGHT_SWORDS_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (EIGHT_SWORDS_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    locale = Path(path).parent.name
    legacy_key = f"{locale}/eight-of-swords"
    assert sha(raw) == record["fileSha256"], f"Current Eight of Swords file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Eight of Swords Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Eight of Swords file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Eight of Swords Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Eight of Swords metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Eight of Swords metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Eight of Swords metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-02"
    assert current["review"]["nativeHumanReview"] is False

    old_sections = previous["sections"]
    assert len(old_sections) == 11
    assert len(current["sections"]) == 12
    added = [section for section in current["sections"] if section["id"] == "number-and-image"]
    assert len(added) == 1 and added[0]["role"] == "practice"
    section = added[0]
    assert section.keys() == {"id", "role", "title", "bodyMarkdown"}
    assert section["title"].strip() and section["bodyMarkdown"].strip()
    assert [item for item in current["sections"] if item["id"] != "number-and-image"] == old_sections, f"Original Eight of Swords text/order/anchors changed: {key}"
    insertion = next(i for i, item in enumerate(old_sections) if item["id"] == "section-02") + 1
    assert current["sections"] == old_sections[:insertion] + [section] + old_sections[insertion:], f"Eight of Swords practice inserted at another position: {key}"
    assert current["sources"][:len(previous["sources"])] == previous["sources"], f"Original Eight of Swords source receipts changed: {key}"
    assert len(current["sources"]) == len(previous["sources"]) + 2
    book, historical_comparison = current["sources"][-2:]
    assert book["sourceId"] == "eight-swords-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["title"].strip() and book["checkedOn"] == "2026-11-02"
    metadata = book["sourceMetadata"]
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "Minor Arcana introduction" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == [200, 201] and metadata["printedPages"] == [201, 202]
    assert metadata["readScopePdf"] == [197, 198, 199, 200, 201, 202]
    assert historical_comparison["sourceId"] == "eight-swords-waite-wands-comparison-20261102"
    assert historical_comparison["type"] == "original_text_comparison"
    assert historical_comparison["checkedOn"] == "2026-11-02" and historical_comparison["title"].strip()
    assert historical_comparison["url"] == "https://sacred-texts.com/tarot/pkt/pktwa08.htm"

    md = current["articleMarkdown"]
    insertion_text = f"## {section['title']}\n\n{section['bodyMarkdown']}\n\n"
    following = old_sections[insertion]
    marker = f"## {following['title']}\n\n{following['bodyMarkdown']}"
    assert previous["articleMarkdown"].count(marker) == 1
    assert md == previous["articleMarkdown"].replace(marker, insertion_text + marker), f"Full Eight of Swords manuscript changed outside the new section: {key}"
    assert md.startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in md
    ids = [item["id"] for item in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for item in current["sections"] for anchor in item.get("legacyAnchors", [])]
    if current.get("sourceAppendix"):
        ids.append(current["sourceAppendix"]["id"])
    assert len(ids) == len(set(ids)), f"Duplicate Eight of Swords anchors: {key}"
    assert historical_comparison["url"] in section["bodyMarkdown"]
    suffix = "?locale=zh" if locale == "zh" else ""
    assert f"](/journal/tarot-eight-of-wands{suffix})" in section["bodyMarkdown"]
    assert f"](/tarot{suffix})" in section["bodyMarkdown"]
    manuscript = (EIGHT_SWORDS_DIR / f"manuscript-{locale}.md").read_text()
    assert manuscript == md.rstrip() + "\n", f"Readable Eight of Swords manuscript differs from published source: {key}"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/eight-swords-update-20261102/revisions.json"
    assert revision["updatedAt"] == "2026-11-02" and revision["scope"].strip()
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/eight-of-swords.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/eight-of-swords"]["recordSha256"], f"Unedited Eight of Swords file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_moon_record(path):
    """Validate the Chinese Pollack supplement without moving the 2026-10-11 sample receipt."""
    key = sample_key(path)
    assert key in MOON_PATHS, f"Not a Moon revision: {key}"
    registry = read(MOON_DIR / "revisions.json")
    assert registry["baseCommit"] == "48a44065c0a58e016cc2be7291fe21c46f01ea63"
    assert registry["updatedAt"] == "2026-11-03"
    assert set(registry["articles"]) == {"tarot-moon"}
    notes = registry["articles"]["tarot-moon"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert "欺骗鉴定" in notes["zh"]
    assert set(registry["records"]) == MOON_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (MOON_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    sample = revision_registry()["records"][key]
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    encyclopedia_previous = (REVISION_DIR / "previous" / key).read_bytes()
    assert sha(raw) == record["fileSha256"], f"Current Moon file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Moon Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == sample["fileSha256"], f"October 11 Moon sample file receipt changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == sample["articleMarkdownSha256"], f"October 11 Moon sample Markdown receipt changed: {key}"
    assert sha(encyclopedia_previous) == sample["previousFileSha256"] == depth["editions"]["zh/moon"]["recordSha256"], f"Depth Moon file receipt changed: {key}"
    assert sha(json.loads(encyclopedia_previous)["articleMarkdown"]) == depth["articleMarkdownSha256"]["zh/moon"]

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Moon metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Moon metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Moon metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-03"
    assert previous["updatedAt"] == "2026-10-11"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"] and current["shortAnswer"] == previous["shortAnswer"]
    assert current["cardId"] == "moon"

    assert [section["id"] for section in current["sections"]] == [section["id"] for section in previous["sections"]]
    changed = []
    for old, section in zip(previous["sections"], current["sections"]):
        assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
        if section != old:
            assert section["bodyMarkdown"] != old["bodyMarkdown"]
            changed.append(section["id"])
            assert {item: section[item] for item in section if item != "bodyMarkdown"} == {item: old[item] for item in old if item != "bodyMarkdown"}
    assert changed == ["section-01", "section-02"], f"Unexpected Moon section edits: {changed}"

    image = current["sections"][0]
    previous_image = previous["sections"][0]
    assert image["id"] == "section-01"
    assert image["bodyMarkdown"].startswith(previous_image["bodyMarkdown"] + "\n\n")
    added_image = image["bodyMarkdown"][len(previous_image["bodyMarkdown"]) + 2:]
    crayfish, strength = added_image.split("\n\n")
    assert crayfish.startswith("现稿已看见水边的甲壳动物。")
    for phrase in ("比野兽更深", "**还没完全成形**", "这是象征读法", "不是要你把不安命名成实体怪物", "更不是诊断"):
        assert phrase in crayfish, phrase
    assert strength == "在 Pollack 的象征读法里，相对力量：月亮阶段狂野更满，动物朝天嚎叫，力量牌里的动物性则被引导、被手稳住。"
    assert strength.count("。") == 1

    tradition = next(section for section in current["sections"] if section["id"] == "section-02")
    previous_tradition = next(section for section in previous["sections"] if section["id"] == "section-02")
    exit_paragraph, warning = previous_tradition["bodyMarkdown"].split("\n\n")
    assert "通向未知的出口" in exit_paragraph and "某个人正在骗我" in warning
    road = tradition["bodyMarkdown"][len(exit_paragraph) + 2:-(len(warning) + 2)]
    assert tradition["bodyMarkdown"] == f"{exit_paragraph}\n\n{road}\n\n{warning}"
    assert road.startswith("现稿已跟 Waite 写下：塔间小路像通向未知的出口。")
    for phrase in ("星星", "**没有**", "**入口**", "**那条路还在**", "有人设局欺骗", "看不清不等于无路"):
        assert phrase in road, phrase
    assert "阴谋" not in road and "有人在骗我" not in road
    for phrase in ("皇帝", "超我", "原我", "本我", "菩萨", "基督", "有人在骗我", "狼人", "动物自我"):
        assert phrase not in crayfish and phrase not in strength and phrase not in road, phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Moon source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "moon-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-03" and "78度的智慧" in book["title"]
    for source in previous["sources"]:
        if "checkedOn" in source:
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "The Moon" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [160, 162, 163, 164, 165]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-02"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    assert current["articleMarkdown"] == md, "Moon Markdown changed outside the two supplemented sections"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    manuscript = (MOON_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/moon-update-20261103/revisions.json"
    assert revision["updatedAt"] == "2026-11-03" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    english = ROOT / "content/tarot/en/moon.json"
    assert sha(english.read_bytes()) == revision_registry()["records"]["content/tarot/en/moon.json"]["fileSha256"], "English Moon file changed"
    assert read(english)["updatedAt"] == "2026-10-11"
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/moon.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/moon"]["recordSha256"], f"Unedited Moon file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_sun_record(path):
    """Validate the Chinese Pollack supplement without moving the 2026-10-11 sample receipt."""
    key = sample_key(path)
    assert key in SUN_PATHS, f"Not a Sun revision: {key}"
    registry = read(SUN_DIR / "revisions.json")
    assert registry["baseCommit"] == "6b87283f6e66995dc8f4e19089bc9af1b6c15290"
    assert registry["updatedAt"] == "2026-11-03"
    assert set(registry["articles"]) == {"tarot-sun"}
    notes = registry["articles"]["tarot-sun"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert "时间表" in notes["zh"] and "死而复生" in notes["zh"]
    assert set(registry["records"]) == SUN_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (SUN_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    sample = revision_registry()["records"][key]
    editorial = read(ROOT / "content/tarot-editorial/provenance.json")
    encyclopedia_previous = (REVISION_DIR / "previous" / key).read_bytes()
    assert sha(raw) == record["fileSha256"], f"Current Sun file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Sun Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == sample["fileSha256"], f"October 11 Sun sample file receipt changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == sample["articleMarkdownSha256"], f"October 11 Sun sample Markdown receipt changed: {key}"
    assert sha(encyclopedia_previous) == sample["previousFileSha256"] == editorial["sunRecordSha256"]["zh"], f"Historical Sun file receipt changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision", "relatedCards"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Sun metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Sun metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Sun metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-03"
    assert previous["updatedAt"] == "2026-10-11"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"] and current["shortAnswer"] == previous["shortAnswer"]
    assert current["cardId"] == "sun"

    assert [section["id"] for section in current["sections"]] == [section["id"] for section in previous["sections"]]
    changed = []
    for old, section in zip(previous["sections"], current["sections"]):
        assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
        if section != old:
            assert section["bodyMarkdown"] != old["bodyMarkdown"]
            changed.append(section["id"])
            assert {item: section[item] for item in section if item != "bodyMarkdown"} == {item: old[item] for item in old if item != "bodyMarkdown"}
    assert changed == ["sun-section-2"], f"Unexpected Sun section edits: {changed}"

    tradition = next(section for section in current["sections"] if section["id"] == "sun-section-2")
    previous_tradition = next(section for section in previous["sections"] if section["id"] == "sun-section-2")
    assert tradition["bodyMarkdown"].startswith(previous_tradition["bodyMarkdown"] + "\n\n")
    added = tradition["bodyMarkdown"][len(previous_tradition["bodyMarkdown"]) + 2:]
    moon_stage, later_stage = added.split("\n\n")
    assert moon_stage.startswith("现稿已把月亮与太阳对照成「看不清时的猜测」与「信息和表达变得明朗」。")
    for phrase in ("**放下硬控**", "可怕／陌生", "「有根的光」", "象征叙事", "牌面不保证时间表"):
        assert phrase in moon_stage, phrase
    assert later_stage.startswith("Pollack 提醒：太阳往往不是故事的句号。")
    for phrase in ("死而复生", "**感受到**", "**落成**", "终局奖状", "象征阶段叙事"):
        assert phrase in later_stage, phrase
    assert later_stage.count("。") <= 4
    for phrase in ("阿波罗", "莉托", "卡巴拉", "诺斯替", "卢里亚", "佛胎", "隐士", "命运之轮"):
        assert phrase not in added, phrase
    assert "小岚" not in added

    assert [card["cardId"] for card in previous["relatedCards"]] == ["moon", "star", "world"]
    assert [card["cardId"] for card in current["relatedCards"]] == ["moon", "star", "world", "judgement"]
    assert current["relatedCards"][:2] == previous["relatedCards"][:2]
    old_world, new_world = previous["relatedCards"][2], current["relatedCards"][2]
    assert {item: new_world[item] for item in new_world if item != "reason"} == {item: old_world[item] for item in old_world if item != "reason"}
    assert new_world["reason"].startswith(old_world["reason"])
    assert "太阳先感受到合一与生意，世界才落成" in new_world["reason"]
    judgement = current["relatedCards"][3]
    assert judgement == {"cardId": "judgement", "reason": "明亮之后的短桥：喜悦为「死而复生」做准备，不是终局奖状。", "nameZh": "审判"}

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Sun source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "sun-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-03" and "78度的智慧" in book["title"]
    metadata = book["sourceMetadata"]
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "The Sun" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [168, 169, 170]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    old_block = f"## {previous_tradition['title']}\n\n{previous_tradition['bodyMarkdown']}"
    new_block = f"## {tradition['title']}\n\n{tradition['bodyMarkdown']}"
    assert md.count(old_block) == 1
    assert current["articleMarkdown"] == md.replace(old_block, new_block), "Sun Markdown changed outside the tradition section"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    manuscript = (SUN_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/sun-update-20261103/revisions.json"
    assert revision["updatedAt"] == "2026-11-03" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    english = ROOT / "content/tarot/en/sun.json"
    assert sha(english.read_bytes()) == revision_registry()["records"]["content/tarot/en/sun.json"]["fileSha256"], "English Sun file changed"
    assert read(english)["updatedAt"] == "2026-10-11"
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/sun.json"
        assert sha(unedited.read_bytes()) == editorial["sunRecordSha256"][unedited_locale], f"Unedited Sun file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_judgement_record(path):
    """Validate the Chinese Pollack supplement and keep the prior receipt."""
    key = sample_key(path)
    assert key in JUDGEMENT_PATHS, f"Not a Judgement revision: {key}"
    registry = read(JUDGEMENT_DIR / "revisions.json")
    assert registry["baseCommit"] == "f888b6a68e64425cfd68840a7c22cd746e142d5a"
    assert registry["updatedAt"] == "2026-11-03"
    assert set(registry["articles"]) == {"tarot-judgement"}
    notes = registry["articles"]["tarot-judgement"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert set(registry["records"]) == JUDGEMENT_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (JUDGEMENT_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/judgement"
    assert sha(raw) == record["fileSha256"], f"Current Judgement file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Judgement Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Judgement file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Judgement Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Judgement metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Judgement metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Judgement metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-03"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]

    assert [section["id"] for section in current["sections"]] == [section["id"] for section in previous["sections"]]
    changed = []
    for old, section in zip(previous["sections"], current["sections"]):
        assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
        if section != old:
            assert section["bodyMarkdown"] != old["bodyMarkdown"]
            changed.append(section["id"])
            assert {key: section[key] for key in section if key != "bodyMarkdown"} == {key: old[key] for key in old if key != "bodyMarkdown"}
    assert changed == ["section-01", "depth-comparison"], f"Unexpected Judgement section edits: {changed}"
    call = current["sections"][0]
    previous_call = previous["sections"][0]
    assert call["bodyMarkdown"].startswith(previous_call["bodyMarkdown"] + "\n\n")
    added_call = call["bodyMarkdown"][len(previous_call["bodyMarkdown"]):].strip()
    assert added_call.count("\n\n") == 0
    for phrase in ("太阳之后", "内在渴望", "十字路口", "普通时间", "永恒感", "不是保证你"):
        assert phrase in added_call, phrase
    comparison = next(section for section in current["sections"] if section["id"] == "depth-comparison")
    previous_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    justice = "审判与正义都可能引出回顾。正义看行为与标准怎样对应，审判更关心回顾之后是否作出新的回答。"
    world = "与世界比较，审判像进入正式回应的门槛，世界则更偏向完成与整合。"
    assert previous_comparison["bodyMarkdown"].startswith(justice + world)
    assert comparison["bodyMarkdown"].startswith(justice + "\n\n")
    assert "死神" in comparison["bodyMarkdown"] and "重生" in comparison["bodyMarkdown"]
    assert "背对观者的孩子" in comparison["bodyMarkdown"]
    assert comparison["bodyMarkdown"].count("回应会改写共同处境") == 1
    assert world + "Pollack 进一步认为，回应会改写共同处境。" in comparison["bodyMarkdown"]
    assert comparison["bodyMarkdown"].endswith(previous_comparison["bodyMarkdown"][len(justice + world):])
    for phrase in ("菩萨", "基督", "无人真正单独解脱", "辛德勒"):
        assert phrase not in comparison["bodyMarkdown"]
        assert phrase not in call["bodyMarkdown"]
    assert "depth-case-1" in {section["id"] for section in current["sections"]}
    assert next(section for section in current["sections"] if section["id"] == "section-03") == next(section for section in previous["sections"] if section["id"] == "section-03")

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Judgement source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "judgement-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-03" and "78度的智慧" in book["title"]
    for source in previous["sources"]:
        if source["sourceId"].startswith("judgement-waite"):
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "Judgement" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [173, 174, 175, 176]
    assert "universal historical" in metadata["viewpoint"]

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "depth-comparison"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    assert current["articleMarkdown"] == md, "Judgement Markdown changed outside the two supplemented sections"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    manuscript = (JUDGEMENT_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/judgement-update-20261103/revisions.json"
    assert revision["updatedAt"] == "2026-11-03" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/judgement.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/judgement"]["recordSha256"], f"Unedited Judgement file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_tower_record(path):
    """Validate the Chinese Pollack supplement and keep the prior Tower receipt."""
    key = sample_key(path)
    assert key in TOWER_PATHS, f"Not a Tower revision: {key}"
    registry = read(TOWER_DIR / "revisions.json")
    assert registry["baseCommit"] == "0fedeffce0c2d85e876d03ebd154325751a6837b"
    assert registry["updatedAt"] == "2026-11-04"
    assert set(registry["articles"]) == {"tarot-tower"}
    notes = registry["articles"]["tarot-tower"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert set(registry["records"]) == TOWER_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (TOWER_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/tower"
    assert sha(raw) == record["fileSha256"], f"Current Tower file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Tower Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Tower file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Tower Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Tower metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Tower metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Tower metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-04"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么高塔排在恶魔与节制后面"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-03"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert "\n\n" not in added_text
        else:
            assert section == old, f"Original Tower section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")
    drops = image["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("yod", "恩典", "二十二", "十个和十二个", "不是 Waite 原文", "报应"):
        assert phrase in drops, phrase
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("恶魔", "节制", "水坝", "水闸", "不能都归到一个人身上", "事后清点", "早该知道", "星星", "157"):
        assert phrase in sequence, phrase
    assert sequence.count("\n\n") == 2
    reverse = next(section for section in current["sections"] if section["id"] == "section-03")["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("囚禁", "缓和", "第三种读法", "压抑"):
        assert phrase in reverse, phrase
    for phrase in ("巴别", "沃尔夫", "战车", "化约"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Tower source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "tower-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-04" and "78度的智慧" in book["title"]
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("tower-waite"):
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "The Tower" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [153, 154, 155, 156, 157]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-03"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Tower Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Tower anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (TOWER_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/tower-update-20261104/revisions.json"
    assert revision["updatedAt"] == "2026-11-04" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/tower.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/tower"]["recordSha256"], f"Unedited Tower file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_devil_record(path):
    """Validate the Chinese Pollack supplement and keep the prior Devil receipt."""
    key = sample_key(path)
    assert key in DEVIL_PATHS, f"Not a Devil revision: {key}"
    registry = read(DEVIL_DIR / "revisions.json")
    assert registry["baseCommit"] == "de587308cb06df26730be9c8286408d5f1ba73d1"
    assert registry["updatedAt"] == "2026-11-04"
    assert set(registry["articles"]) == {"tarot-devil"}
    notes = registry["articles"]["tarot-devil"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert set(registry["records"]) == DEVIL_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (DEVIL_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/devil"
    assert sha(raw) == record["fileSha256"], f"Current Devil file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Devil Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Devil file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Devil Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Devil metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Devil metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Devil metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-04"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么恶魔紧接在节制之后"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-03"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert "\n\n" not in added_text
        else:
            assert section == old, f"Original Devil section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")
    detail = image["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("半个立方体", "不完整的知识", "土星", "限制与约束", "灾祸", "魔术师", "别无其他", "脸上并无痛苦", "链圈", "错觉", "不是 Waite 原文", "147", "150"):
        assert phrase in detail, phrase
    assert detail.count("土星") == 1
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("节制", "化约为 6", "恋人的扭曲", "146", "149", "150", "高塔", "冲破旧结构", "/journal/tarot-tower?locale=zh#depth-sequence"):
        assert phrase in sequence, phrase
    assert sequence.count("\n\n") == 1
    reverse = next(section for section in current["sections"] if section["id"] == "section-03")["bodyMarkdown"]
    added_reverse = reverse.split("\n\n")[-1]
    assert "逆位可读成开始认出循环" in reverse
    for phrase in ("151", "枷锁", "更难受", "改错了方向", "选择是否在变多"):
        assert phrase in added_reverse, phrase
    for phrase in ("布莱克", "失乐园", "密宗", "Paul Douglas", "集体无意识", "赐福", "性犯罪", "148"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Devil source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "devil-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-04" and "78度的智慧" in book["title"]
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("devil-waite"):
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "The Devil" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [146, 147, 148, 149, 150, 151, 152]
    assert "148" in metadata["pageNote"] and "low-resolution" in metadata["pageNote"]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-03"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Devil Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Devil anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (DEVIL_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/devil-update-20261104/revisions.json"
    assert revision["updatedAt"] == "2026-11-04" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/devil.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/devil"]["recordSha256"], f"Unedited Devil file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_world_record(path):
    """Validate the Chinese Pollack supplement and keep the prior World receipt."""
    key = sample_key(path)
    assert key in WORLD_PATHS, f"Not a World revision: {key}"
    registry = read(WORLD_DIR / "revisions.json")
    assert registry["baseCommit"] == "92ac728529b86b7177defb3dcb7996a69aa3648d"
    assert registry["updatedAt"] == "2026-11-06"
    assert set(registry["articles"]) == {"tarot-world"}
    notes = registry["articles"]["tarot-world"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert set(registry["records"]) == WORLD_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (WORLD_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/world"
    assert sha(raw) == record["fileSha256"], f"Current World file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current World Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical World file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical World Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected World metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original World metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original World metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-06"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]
    assert current["relatedCards"] == previous["relatedCards"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么完成之后还要往下走"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-03"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert added_text.count("\n\n") == (0 if old["id"] == "section-01" else 1)
        else:
            assert section == old, f"Original World section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("Pollack", "魔术师", "女祭司", "显与隐", "行动与静观", "178", "从外部看见流转", "活着的整合", "不是 Waite 原文", "神秘等级", "/journal/tarot-wheel?locale=zh", "/journal/tarot-magician?locale=zh", "/journal/tarot-high-priestess?locale=zh"):
        assert phrase in image, phrase
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("Pollack", "合一与生意", "可辨认的阶段", "动态牌", "愚者的 0", "∞", "179", "下一程从哪一小步开始", "人生总决赛", "/journal/tarot-fool?locale=zh", "/journal/tarot-judgement?locale=zh", "/journal/tarot-sun?locale=zh"):
        assert phrase in sequence, phrase
    assert "绿色" not in sequence, "depth-sequence must not extend the green wreath"
    assert sequence.count("\n\n") == 1
    reverse = next(section for section in current["sections"] if section["id"] == "section-03")["bodyMarkdown"]
    added_reverse = reverse[len(next(section for section in previous["sections"] if section["id"] == "section-03")["bodyMarkdown"]):].strip()
    for phrase in ("Pollack", "182", "表象", "潜伏潜能", "完成永远作废", "证据", "潜能还在", "真实停滞", "拖延必须落地的收尾"):
        assert phrase in added_reverse, phrase
    for phrase in ("物质被提升", "神圣不要求离开", "现稿已", "太阳页已写", "湿婆", "亚当", "生命之树", "脉轮", "E=mc", "吊人"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original World source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "world-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-06" and book["title"] == "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；世界章，印刷／PDF 178–182"
    assert book["edition"] == "Sun Meijun translation, 商周出版, December 2010 first edition; local user-provided scan"
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("world-waite"):
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert set(metadata) == {"layer", "author", "translator", "publisher", "published", "section", "pdfPages", "printedPages", "localScanOnly", "viewpoint"}
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "The World" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [178, 179, 180, 181, 182]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-03"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "World Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate World anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (WORLD_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/world-update-20261106/revisions.json"
    assert revision["updatedAt"] == "2026-11-06" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/world.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/world"]["recordSha256"], f"Unedited World file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
        assert "Pollack" not in read(unedited)["articleMarkdown"]
        assert "depth-sequence" not in read(unedited)["articleMarkdown"]
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_wheel_pollack_record(path):
    """Validate the Chinese Pollack supplement and keep the 2026-10-08 Wheel receipt."""
    key = sample_key(path)
    assert key in WHEEL_PATHS, f"Not a Wheel Pollack revision: {key}"
    registry = read(WHEEL_DIR / "revisions.json")
    assert registry["baseCommit"] == "ff2898e2b0015efa6995f4e3d830627f36c6fed5"
    assert registry["updatedAt"] == "2026-11-10"
    assert set(registry["articles"]) == {"tarot-wheel"}
    notes = registry["articles"]["tarot-wheel"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    for phrase in ("死亡与新生同时存在", "不是已定论的埃及学事实", "象征总览", "未必是问牌人的责任", "只是举例", "不保证改变一定有意义", "补充而不替换", "外部推迟并不等于重复旧方法"):
        assert phrase in notes["zh"], phrase
    for phrase in ("现稿已", "该页还没有", "业力", "数秘", "TARO", "TORA", "ROTA", "维斯康提", "Visconti", "Fortuna", "佛图娜", "专家认证"):
        assert phrase not in notes["zh"], phrase
    assert set(registry["records"]) == WHEEL_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (WHEEL_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/wheel"
    assert sha(raw) == record["fileSha256"], f"Current Wheel file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Wheel Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Wheel file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Wheel Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Wheel metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Wheel metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Wheel metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-10"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]
    assert current["relatedCards"] == previous["relatedCards"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "从隐士的退后一步，到世界的整合"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]

    def cjk(text):
        return len(re.findall(r"[\u4e00-\u9fff]", text))

    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-04"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            if old["id"] == "section-01":
                parts = added_text.split("\n\n")
                assert len(parts) == 2, parts
                figures, books = parts
                assert 180 <= cjk(figures) <= 280, cjk(figures)
                assert 40 <= cjk(books) <= 120, cjk(books)
            else:
                assert added_text.count("\n\n") == 0
                assert 160 <= cjk(added_text) <= 280, cjk(added_text)
        else:
            assert section == old, f"Original Wheel section changed: {old['id']}"

    image_added = next(section for section in current["sections"] if section["id"] == "section-01")["bodyMarkdown"]
    image_added = image_added.split("\n\n")[-2:]
    figures, books = image_added
    for phrase in ("Pollack", "下行的蛇", "胡狼首", "持剑的斯芬克斯", "死亡与新生同时存在", "118", "赛特", "阿努比斯", "荷鲁斯", "作者象征", "不是已定论的埃及学事实", "不等同于 Waite 的原文", "不能用来预测疾病、死亡、成功或失败"):
        assert phrase in figures, phrase
    for phrase in ("早期基督徒", "福音圣徒", "116", "为什么有书", "宗教归属", "经文", "Pollack"):
        assert phrase in books, phrase
    for phrase in ("维斯康提", "Visconti", "Fortuna", "佛图娜", "先宣判谁将被翻转", "业力", "数秘", "TARO", "现稿已"):
        assert phrase not in figures + books, phrase

    sequence = added[0]["bodyMarkdown"]
    assert 100 <= cjk(sequence) <= 220, cjk(sequence)
    assert sequence.count("\n\n") == 1
    for phrase in ("Pollack", "隐士", "退后一步", "整只命运之轮", "115", "象征总览", "世界", "活出来", "114", "不是要求隐居", "不能覆盖 Waite", "/journal/tarot-hermit?locale=zh", "/journal/tarot-world?locale=zh", "/journal/tarot-justice?locale=zh#depth-sequence"):
        assert phrase in sequence, phrase
    for phrase in ("业力", "数秘", "TARO", "TORA", "ROTA", "转世", "佛陀", "中点", "圣杯", "年王", "维斯康提", "Visconti", "Fortuna", "佛图娜", "现稿已", "该页还没有", "/journal/tarot-hermit?locale=zh#depth-sequence", "/journal/tarot-world?locale=zh#depth-sequence", "必须隐居"):
        assert phrase not in sequence, phrase
    hermit = read(ROOT / "content/tarot/zh/hermit.json")
    assert all(section["id"] != "depth-sequence" for section in hermit["sections"])
    justice = read(ROOT / "content/tarot/zh/justice.json")
    assert any(section["id"] == "depth-sequence" for section in justice["sections"])

    waite_reversed = "他的逆位词条反而列了增加、丰盛与过量。"
    external_delay = "先看现实变化发生在哪儿。是排期被外部条件推迟，还是每次遇到反馈都重复旧做法？前者需要缓冲和备选安排，后者可能需要改方法。两者并不是同一种「运气差」。"
    reverse = next(section for section in current["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    old_reverse = next(section for section in previous["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    assert waite_reversed in old_reverse and external_delay in old_reverse
    assert old_reverse.endswith(external_delay) and reverse.startswith(old_reverse + "\n\n")
    added_reverse = reverse[len(old_reverse):].strip()
    assert reverse.index(waite_reversed) < reverse.index("Pollack 补一条界限")
    assert reverse.index(external_delay) < reverse.index("Pollack 补一条界限")
    for phrase in ("Pollack", "可能并不是问牌人的责任", "120", "书里举的", "并购", "失业", "关系结束", "只是举例，不是预测", "不能用来责备", "不保证改变「一定有意义」", "不能要求人立刻想开，或放下申诉", "抵抗已经发生的改变", "一向被动的人开始有新的觉知", "之后如何回应，不等于当初造成了这场改变", "补充而不替换", "增加、丰盛与过量", "外部推迟并不等于重复旧方法", "劳动咨询、法律程序或支持"):
        assert phrase in added_reverse, phrase
    for phrase in ("你会失业", "你将被裁", "你的感情会结束", "必将失业", "注定分手", "一定有意义，所以", "业力", "报应", "现稿已", "立刻想开吧", "放下申诉吧"):
        assert phrase not in added_reverse, phrase
    assert added_reverse.count("一定有意义") == 1
    for phrase in ("业力", "数秘", "TARO", "TORA", "ROTA", "报应", "佛陀", "转世", "维斯康提", "Visconti", "Fortuna", "佛图娜", "现稿已", "该页还没有", "中点", "圣杯", "年王", "专家认证", "母语审校"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Wheel source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    pages = [112, 113, 114, 115, 116, 117, 118, 119, 120]
    assert book["sourceId"] == "wheel-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-10"
    assert book["title"] == "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；命运之轮章，印刷／PDF 112–120"
    assert book["edition"] == "Sun Meijun translation, 商周出版, December 2010 first edition; local user-provided scan"
    metadata = book["sourceMetadata"]
    assert set(metadata) == {"layer", "author", "translator", "publisher", "published", "section", "pdfPages", "printedPages", "localScanOnly", "viewpoint"}
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "The Wheel of Fortune" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == pages
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("wheel-waite"):
            assert source["checkedOn"] == "2026-10-07"

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-04"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Wheel Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Wheel anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (WHEEL_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/wheel-update-20261110/revisions.json"
    assert revision["updatedAt"] == "2026-11-10" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    prior_date = depth["cards"]["wheel"]["updatedAt"]
    assert prior_date == "2026-10-08"
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/wheel.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/wheel"]["recordSha256"], f"Unedited Wheel file changed: {unedited_locale}"
        unedited_article = read(unedited)
        assert unedited_article["updatedAt"] == prior_date, f"Unedited Wheel date changed: {unedited_locale}"
        assert unedited_article["publishedAt"] == "2026-10-07"
        assert "Pollack" not in unedited_article["articleMarkdown"]
        assert "wheel-pollack-2010" not in {source.get("sourceId") for source in unedited_article["sources"]}
        assert all(section["id"] != "depth-sequence" for section in unedited_article["sections"])
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_justice_pollack_record(path):
    """Validate the Chinese Pollack supplement and keep the 2026-10-08 Justice receipt."""
    key = sample_key(path)
    assert key in JUSTICE_PATHS, f"Not a Justice Pollack revision: {key}"
    registry = read(JUSTICE_DIR / "revisions.json")
    assert registry["baseCommit"] == "eb98b14175d3805d4d4cbfedef045c8ffe1188c9"
    assert registry["updatedAt"] == "2026-11-09"
    assert set(registry["articles"]) == {"tarot-justice"}
    notes = registry["articles"]["tarot-justice"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    for phrase in ("心灵的正义律法", "理解、回应并承担责任", "责任不是道德指控", "可能不愿面对某些事实", "不是 Waite 原文"):
        assert phrase in notes["zh"], phrase
    for phrase in ("应得", "应该发生", "席米斯", "贾丝提昔亚", "现稿已", "社会法庭规则"):
        assert phrase not in notes["zh"], phrase
    assert set(registry["records"]) == JUSTICE_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (JUSTICE_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/justice"
    assert sha(raw) == record["fileSha256"], f"Current Justice file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Justice Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Justice file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Justice Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Justice metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Justice metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Justice metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-09"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]
    assert current["relatedCards"] == previous["relatedCards"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么正义夹在命运之轮与倒吊人之间"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-04"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert added_text.count("\n\n") == 0
            cjk = len(re.findall(r"[\u4e00-\u9fff]", added_text))
            assert (180 <= cjk <= 260) if old["id"] == "section-01" else (80 <= cjk <= 150), (old["id"], cjk)
        else:
            assert section == old, f"Original Justice section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("Pollack", "心灵的正义律法", "没有蒙眼", "向上的剑", "天平", "121", "122", "作者象征", "不等同于 Waite 的原文", "现实法庭的规则", "不能用来预测案件结果"):
        assert phrase in image, phrase
    for phrase in ("席米斯", "贾丝提昔亚", "Themis", "Justitia", "无法撤回", "紫色", "黄色", "红袍", "魔术师", "女祭司", "应得", "应该发生", "社会法庭规则"):
        assert phrase not in image, phrase
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("Pollack", "命运之轮", "观察", "理解并回应", "责任", "吊人", "接受与准备", "地震", "物质存在的限度", "经历会影响人", "并不等于这件事由这个人造成", "灾害或伤害", "责任没有道德指控", "123", "124", "128", "129", "不能拿来覆盖 Waite", "/journal/tarot-wheel?locale=zh", "/journal/tarot-hanged-man?locale=zh#depth-sequence"):
        assert phrase in sequence, phrase
    for phrase in ("应得", "应该发生", "中点", "数秘", "双蛇", "DNA", "圣杯", "佛陀", "现稿已", "/journal/tarot-wheel?locale=zh#depth-sequence"):
        assert phrase not in sequence, phrase
    assert sequence.count("\n\n") == 1
    # Justice still links to the Wheel page without #depth-sequence. That fragment is
    # already forbidden above. The Wheel page may carry its own later depth-sequence.
    hanged = read(ROOT / "content/tarot/zh/hanged-man.json")
    assert any(section["id"] == "depth-sequence" for section in hanged["sections"])
    ending = "抽到逆位不能证明你做错了，也不能证明别人不公。若你正反复自责，可先分开自己实际做过的事、能够补救的部分与根本不由你决定的结果。"
    reverse = next(section for section in current["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    old_reverse = next(section for section in previous["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    assert old_reverse.endswith(ending) and reverse.startswith(old_reverse + "\n\n")
    assert reverse.count(ending) == 1 and reverse.index(ending) < reverse.index("可能不愿面对某些事实，也可能确实遭遇不公")
    added_reverse = reverse[len(old_reverse):].strip()
    for phrase in ("Pollack", "可能不愿面对某些事实，也可能确实遭遇不公", "127", "作者解释", "定罪", "喊冤", "证据", "申诉", "法律程序"):
        assert phrase in added_reverse, phrase
    for phrase in ("应得", "应该发生", "瞧瞧每个人", "现稿已", "虚伪"):
        assert phrase not in added_reverse, phrase
    appeal = "面对不公时，你仍可申诉、求助并保护自己的权益。"
    assert appeal in next(section for section in current["sections"] if section["id"] == "section-07")["bodyMarkdown"]
    for phrase in ("应得", "应该发生", "席米斯", "贾丝提昔亚", "Themis", "Justitia", "无法撤回", "中点", "数秘", "现稿已", "/journal/tarot-wheel?locale=zh#depth-sequence"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Justice source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 2
    chapter, hanged_page = current["sources"][-2:]
    assert chapter["sourceId"] == "justice-pollack-2010"
    assert hanged_page["sourceId"] == "justice-pollack-hanged-man-chapter-2010"
    for book, title, section, pages in (
        (chapter, "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；正义章，印刷／PDF 121–127", "Justice", [121, 122, 123, 124, 125, 126, 127]),
        (hanged_page, "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；吊人章，印刷／PDF 128–129", "The Hanged Man", [128, 129]),
    ):
        assert book["type"] == "modern_author_interpretation" and book["url"] is None
        assert book["checkedOn"] == "2026-11-09" and book["title"] == title
        assert book["edition"] == "Sun Meijun translation, 商周出版, December 2010 first edition; local user-provided scan"
        metadata = book["sourceMetadata"]
        assert set(metadata) == {"layer", "author", "translator", "publisher", "published", "section", "pdfPages", "printedPages", "localScanOnly", "viewpoint"}
        assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
        assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
        assert metadata["section"] == section and metadata["localScanOnly"] is True
        assert metadata["pdfPages"] == metadata["printedPages"] == pages
        assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."
    assert chapter["sourceMetadata"]["pdfPages"] != hanged_page["sourceMetadata"]["pdfPages"]
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("justice-waite"):
            assert source["checkedOn"] == "2026-10-07"

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-04"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Justice Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Justice anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (JUSTICE_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/justice-update-20261109/revisions.json"
    assert revision["updatedAt"] == "2026-11-09" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    prior_date = depth["cards"]["justice"]["updatedAt"]
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/justice.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/justice"]["recordSha256"], f"Unedited Justice file changed: {unedited_locale}"
        unedited_article = read(unedited)
        assert unedited_article["updatedAt"] == prior_date, f"Unedited Justice date changed: {unedited_locale}"
        assert unedited_article["publishedAt"] == "2026-10-07"
        assert "Pollack" not in unedited_article["articleMarkdown"]
        assert "justice-pollack-2010" not in {source.get("sourceId") for source in unedited_article["sources"]}
        assert all(section["id"] != "depth-sequence" for section in unedited_article["sections"])
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_death_record(path):
    """Validate the Chinese Pollack supplement and keep the prior Death receipt."""
    key = sample_key(path)
    assert key in DEATH_PATHS, f"Not a Death revision: {key}"
    registry = read(DEATH_DIR / "revisions.json")
    assert registry["baseCommit"] == "dcae0eafabed42afde80a1dcea86832704815f4d"
    assert registry["updatedAt"] == "2026-11-07"
    assert set(registry["articles"]) == {"tarot-death"}
    notes = registry["articles"]["tarot-death"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    for phrase in ("四种态度", "白玫瑰", "阶段叙事", "不覆盖 Waite", "不诊断低落", "不预测寿命"):
        assert phrase in notes["zh"], phrase
    for phrase in ("献花", "干净的花", "现稿已", "节制页已写"):
        assert phrase not in notes["zh"], phrase
    assert set(registry["records"]) == DEATH_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (DEATH_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    link = read(ROOT / "content/tarot-link-maintenance-20261019.json")
    assert sha(raw) == record["fileSha256"], f"Current Death file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Death Markdown differs from receipt: {key}"
    # The saved previous file is the post-2026-10-19 URL maintenance edition, not the older depth file.
    assert sha(previous_raw) == record["previousFileSha256"], f"Historical Death file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == link["records"][key]["articleMarkdownSha256"], f"Historical Death Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Death metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Death metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Death metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-07"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]
    assert current["relatedCards"] == previous["relatedCards"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么死神夹在吊人与节制之间"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-04"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert added_text.count("\n\n") == (0 if old["id"] == "section-01" else 1)
        else:
            assert section == old, f"Original Death section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("Pollack", "四种态度", "僵化的小我", "信仰／意义框架", "少女", "画面中侧脸的年轻人", "全然天真", "白玫瑰", "欲望被净化", "神秘玫瑰＝生命", "136", "作者象征", "不是把画中人物写成客观事实", "哪一种态度", "哪一层欲望"):
        assert phrase in image, phrase
    for phrase in ("献花", "干净的花"):
        assert phrase not in image, phrase
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("Pollack", "阶段叙事", "不等于「转化」本身", "放下旧面具", "容许转化", "吊人", "准备", "节制", "重调", "135", "不能拿来覆盖 Waite", "意识转化", "/journal/tarot-hanged-man?locale=zh", "/journal/tarot-temperance?locale=zh#depth-sequence"):
        assert phrase in sequence, phrase
    assert sequence.count("\n\n") == 1
    reverse = next(section for section in current["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    added_reverse = reverse[len(next(section for section in previous["sections"] if section["id"] == "section-04")["bodyMarkdown"]):].strip()
    for phrase in ("Pollack", "138", "恐惧", "证据", "立刻结束", "低落", "诊断", "寿命", "支持系统", "重大决定", "现实事实"):
        assert phrase in added_reverse, phrase
    for phrase in ("献花", "干净的花", "现稿已", "节制页已写", "入门仪式", "迷幻", "数秘", "性隐喻", "犹大"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Death source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "death-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-07" and book["title"] == "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；死神章，印刷／PDF 133–138"
    assert book["edition"] == "Sun Meijun translation, 商周出版, December 2010 first edition; local user-provided scan"
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("death-waite"):
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert set(metadata) == {"layer", "author", "translator", "publisher", "published", "section", "pdfPages", "printedPages", "localScanOnly", "viewpoint"}
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "Death" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [133, 134, 135, 136, 137, 138]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-04"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Death Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Death anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (DEATH_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/death-update-20261107/revisions.json"
    assert revision["updatedAt"] == "2026-11-07" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited_key = f"content/tarot/{unedited_locale}/death.json"
        unedited = read(ROOT / unedited_key)
        assert sha(unedited["articleMarkdown"]) == link["records"][unedited_key]["articleMarkdownSha256"], f"Unedited Death text changed: {unedited_locale}"
        assert unedited["updatedAt"] == "2026-10-08"
        assert "Pollack" not in unedited["articleMarkdown"]
        assert "death-pollack-2010" not in {source.get("sourceId") for source in unedited["sources"]}
        assert all(section["id"] != "depth-sequence" for section in unedited["sections"])
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_temperance_record(path):
    """Validate the Chinese Pollack supplement and keep the prior Temperance receipt."""
    key = sample_key(path)
    assert key in TEMPERANCE_PATHS, f"Not a Temperance revision: {key}"
    registry = read(TEMPERANCE_DIR / "revisions.json")
    assert registry["baseCommit"] == "4f360e1f1b3c786e1a6c4d5ce2cf68c288e8b933"
    assert registry["updatedAt"] == "2026-11-05"
    assert set(registry["articles"]) == {"tarot-temperance"}
    notes = registry["articles"]["tarot-temperance"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    assert set(registry["records"]) == TEMPERANCE_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (TEMPERANCE_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    legacy_key = "zh/temperance"
    assert sha(raw) == record["fileSha256"], f"Current Temperance file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Temperance Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == depth["editions"][legacy_key]["recordSha256"], f"Historical Temperance file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == depth["articleMarkdownSha256"][legacy_key], f"Historical Temperance Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Temperance metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Temperance metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Temperance metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-05"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么节制夹在死神与恶魔、高塔之间"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-04"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert added_text.count("\n\n") == (0 if old["id"] == "section-01" else 1)
        else:
            assert section == old, f"Original Temperance section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("temperare", "按比例调和", "道德戒律", "物理上不可能的安排", "尚未成形的可能", "现实世界", "不是 Waite 原文", "139", "140", "141"):
        assert phrase in image, phrase
    for phrase in ("柱子", "山峰", "落地", "已经在做的行为"):
        assert phrase not in image, phrase
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("Iris", "鸢尾", "风暴之后的平静", "死神", "141", "恶魔", "高塔", "这一环是死神后的重整", "/journal/tarot-devil?locale=zh#depth-sequence", "/journal/tarot-tower?locale=zh#depth-sequence"):
        assert phrase in sequence, phrase
    assert sequence.count("\n\n") == 1
    reverse = next(section for section in current["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    added_reverse = reverse[len(next(section for section in previous["sections"] if section["id"] == "section-04")["bodyMarkdown"]):].strip()
    for phrase in ("143", "走极端", "碎片", "合适的行动", "更失衡", "证据"):
        assert phrase in added_reverse, phrase
    for phrase in ("送回", "力量", "重生"):
        assert phrase not in added_reverse, phrase
    for phrase in ("柱子", "落地", "送回力量", "狮鹰", "Wirth", "冥河", "四字", "战车", "炼金", "142", "144", "146"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Temperance source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 1
    book = current["sources"][-1]
    assert book["sourceId"] == "temperance-pollack-2010"
    assert book["type"] == "modern_author_interpretation" and book["url"] is None
    assert book["checkedOn"] == "2026-11-05" and book["title"] == "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；节制章，印刷／PDF 139–143"
    assert book["edition"] == "Sun Meijun translation, 商周出版, December 2010 first edition; local user-provided scan"
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("temperance-waite"):
            assert source["checkedOn"] == "2026-10-07"
    metadata = book["sourceMetadata"]
    assert set(metadata) == {"layer", "author", "translator", "publisher", "published", "section", "pdfPages", "printedPages", "localScanOnly", "viewpoint"}
    assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
    assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
    assert metadata["section"] == "Temperance" and metadata["localScanOnly"] is True
    assert metadata["pdfPages"] == metadata["printedPages"] == [139, 140, 141, 142, 143]
    assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-04"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Temperance Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Temperance anchors"
    assert set(previous_ids) <= set(ids)
    manuscript = (TEMPERANCE_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/temperance-update-20261105/revisions.json"
    assert revision["updatedAt"] == "2026-11-05" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    for unedited_locale in ("en", "zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/temperance.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/temperance"]["recordSha256"], f"Unedited Temperance file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


def validate_hanged_man_pollack_record(path):
    """Validate the Chinese Pollack supplement and keep the 2026-10-24 Hanged Man receipt."""
    key = sample_key(path)
    assert key in HANGED_MAN_POLLACK_PATHS, f"Not a Hanged Man Pollack revision: {key}"
    registry = read(HANGED_MAN_POLLACK_DIR / "revisions.json")
    assert registry["baseCommit"] == "73fcb222086507386d275dd306ba8614c275d89a"
    assert registry["updatedAt"] == "2026-11-08"
    assert set(registry["articles"]) == {"tarot-hanged-man"}
    notes = registry["articles"]["tarot-hanged-man"]["notes"]
    assert set(notes) == {"zh"} and notes["zh"].strip()
    for phrase in ("接受生命的节律", "主动加入", "正逆位", "社会压力", "有害处境", "不是 Waite 原文"):
        assert phrase in notes["zh"], phrase
    for phrase in ("臣服", "现稿已", "死神页已写", "12 是 21", "中点"):
        assert phrase not in notes["zh"], phrase
    assert set(registry["records"]) == HANGED_MAN_POLLACK_PATHS
    record = registry["records"][key]
    assert set(record) == {"previousFileSha256", "previousArticleMarkdownSha256", "fileSha256", "articleMarkdownSha256"}
    assert all(re.fullmatch(r"[a-f0-9]{64}", value) for value in record.values())

    raw, previous_raw = Path(path).read_bytes(), (HANGED_MAN_POLLACK_DIR / "previous" / key).read_bytes()
    current, previous = json.loads(raw), json.loads(previous_raw)
    prior = read(HANGED_MAN_DIR / "revisions.json")["records"][key]
    assert sha(raw) == record["fileSha256"], f"Current Hanged Man file differs from receipt: {key}"
    assert sha(current["articleMarkdown"]) == record["articleMarkdownSha256"], f"Current Hanged Man Markdown differs from receipt: {key}"
    assert sha(previous_raw) == record["previousFileSha256"] == prior["fileSha256"], f"2026-10-24 Hanged Man file approval changed: {key}"
    assert sha(previous["articleMarkdown"]) == record["previousArticleMarkdownSha256"] == prior["articleMarkdownSha256"], f"2026-10-24 Hanged Man Markdown approval changed: {key}"

    allowed_changes = {"sections", "sources", "articleMarkdown", "updatedAt", "editorialRevision"}
    assert current.keys() - previous.keys() <= {"editorialRevision"}, f"Unexpected Hanged Man metadata added: {key}"
    assert previous.keys() <= current.keys(), f"Original Hanged Man metadata lost: {key}"
    for field in previous.keys() - allowed_changes:
        assert current[field] == previous[field], f"Original Hanged Man metadata changed: {key}/{field}"
    assert current["publishedAt"] == "2026-10-07" and current["updatedAt"] == "2026-11-08"
    assert current["review"]["nativeHumanReview"] is False
    assert current["title"] == previous["title"] and current["hook"] == previous["hook"]
    assert current["quickTake"] == previous["quickTake"] and current["shortAnswer"] == previous["shortAnswer"]
    assert current["relatedCards"] == previous["relatedCards"]

    previous_ids = [section["id"] for section in previous["sections"]]
    added = [section for section in current["sections"] if section["id"] not in previous_ids]
    assert [section["id"] for section in current["sections"] if section["id"] in previous_ids] == previous_ids
    assert len(added) == 1 and added[0]["id"] == "depth-sequence"
    assert added[0]["role"] == "comparison" and added[0]["title"] == "为什么倒吊人连着世界，又为死神做准备"
    assert added[0].keys() == {"id", "role", "title", "bodyMarkdown"}
    insertion = previous_ids.index("depth-comparison") + 1
    assert [section["id"] for section in current["sections"]] == previous_ids[:insertion] + ["depth-sequence"] + previous_ids[insertion:]
    for old, section in zip(previous["sections"], [section for section in current["sections"] if section["id"] in previous_ids]):
        if old["id"] in ("section-01", "section-04"):
            assert section["id"] == old["id"] and section["title"] == old["title"] and section["role"] == old["role"]
            assert section["bodyMarkdown"].startswith(old["bodyMarkdown"] + "\n\n")
            added_text = section["bodyMarkdown"][len(old["bodyMarkdown"]):].strip()
            assert added_text.count("\n\n") == 0
            assert (200 <= len(added_text) <= 320) if old["id"] == "section-01" else (150 <= len(added_text) <= 230)
        else:
            assert section == old, f"Original Hanged Man section changed: {old['id']}"
    image = next(section for section in current["sections"] if section["id"] == "section-01")["bodyMarkdown"].split("\n\n")[-1]
    for phrase in ("Pollack", "态度与经验的逆转", "接受生命的节律", "主动加入", "不是被动等待", "128", "130", "131", "作者象征", "强烈", "生命经验", "倒挂身体", "不能保证等待必有回报", "有害处境"):
        assert phrase in image, phrase
    for phrase in ("臣服", "世界之树", "松开口径", "期限练习", "再等几天"):
        assert phrase not in image, phrase
    sequence = added[0]["bodyMarkdown"]
    for phrase in ("Pollack", "世界的舞者", "129", "不能改写已经记下的正逆位", "人物头朝下是构图", "整张牌再转半圈才是逆位", "倒挂身体", "握杖外伸", "双臂交叉在背后", "从热闹里撤一步", "日常外在活动", "准备", "135", "不能拿来覆盖 Waite", "我是在撤回一步", "/journal/tarot-world?locale=zh#depth-sequence", "/journal/tarot-death?locale=zh#depth-sequence"):
        assert phrase in sequence, phrase
    for phrase in ("12 是 21", "21 颠倒", "中点", "数秘", "命运之轮", "奥丁", "克劳利", "荒原", "4×3", "现稿已", "死神页已写", "女祭司"):
        assert phrase not in sequence, phrase
    assert sequence.count("\n\n") == 1
    reverse = next(section for section in current["sections"] if section["id"] == "section-04")["bodyMarkdown"]
    added_reverse = reverse[len(next(section for section in previous["sections"] if section["id"] == "section-04")["bodyMarkdown"]):].strip()
    for phrase in ("Pollack", "等太久了", "社会压力", "他人期望", "131", "132", "诊断", "安全", "生计", "责任", "证据", "支持系统", "有害处境", "作者解释"):
        assert phrase in added_reverse, phrase
    for phrase in ("臣服", "小我", "二手", "世界之树", "期限检查", "松开口径"):
        assert phrase not in added_reverse, phrase
    for phrase in ("臣服", "现稿已", "死神页已写", "12 是 21", "21 颠倒", "中点", "数秘", "奥丁", "克劳利", "荒原"):
        assert phrase not in current["articleMarkdown"], phrase

    assert current["sources"][:len(previous["sources"])] == previous["sources"], "Original Hanged Man source receipts changed"
    assert len(current["sources"]) == len(previous["sources"]) + 2
    chapter, death_page = current["sources"][-2:]
    assert chapter["sourceId"] == "hanged-man-pollack-2010"
    assert death_page["sourceId"] == "hanged-man-pollack-death-chapter-2010"
    for book, title, section, pages in (
        (chapter, "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；吊人章，印刷／PDF 128–132", "The Hanged Man", [128, 129, 130, 131, 132]),
        (death_page, "瑞秋·波拉克《78度的智慧》，孙梅君译，商周出版，2010年12月初版；死神章，印刷／PDF 135", "Death", [135]),
    ):
        assert book["type"] == "modern_author_interpretation" and book["url"] is None
        assert book["checkedOn"] == "2026-11-08" and book["title"] == title
        assert book["edition"] == "Sun Meijun translation, 商周出版, December 2010 first edition; local user-provided scan"
        metadata = book["sourceMetadata"]
        assert set(metadata) == {"layer", "author", "translator", "publisher", "published", "section", "pdfPages", "printedPages", "localScanOnly", "viewpoint"}
        assert metadata["author"] == "Rachel Pollack" and metadata["translator"] == "孙梅君"
        assert metadata["publisher"] == "商周出版" and metadata["published"] == "2010-12"
        assert metadata["section"] == section and metadata["localScanOnly"] is True
        assert metadata["pdfPages"] == metadata["printedPages"] == pages
        assert metadata["viewpoint"] == "Modern author interpretation, not a scientific fact or a universal historical meaning."
    assert 135 not in chapter["sourceMetadata"]["pdfPages"]
    assert chapter["sourceMetadata"]["pdfPages"] != death_page["sourceMetadata"]["pdfPages"]
    for source in previous["sources"]:
        if str(source.get("sourceId", "")).startswith("hanged-man-waite"):
            assert source["checkedOn"] == "2026-10-07"

    md = previous["articleMarkdown"]
    for section_id in ("section-01", "section-04"):
        old = next(section for section in previous["sections"] if section["id"] == section_id)
        new = next(section for section in current["sections"] if section["id"] == section_id)
        old_block = f"## {old['title']}\n\n{old['bodyMarkdown']}"
        new_block = f"## {new['title']}\n\n{new['bodyMarkdown']}"
        assert md.count(old_block) == 1
        md = md.replace(old_block, new_block)
    old_comparison = next(section for section in previous["sections"] if section["id"] == "depth-comparison")
    comparison_block = f"## {old_comparison['title']}\n\n{old_comparison['bodyMarkdown']}"
    sequence_block = f"## {added[0]['title']}\n\n{added[0]['bodyMarkdown']}"
    assert md.count(comparison_block) == 1
    md = md.replace(comparison_block, comparison_block + "\n\n" + sequence_block, 1)
    assert current["articleMarkdown"] == md, "Hanged Man Markdown changed outside the approved supplements"
    assert current["articleMarkdown"].startswith(f"# {current['title']}\n\n")
    for item in current["sections"]:
        assert f"## {item['title']}\n\n{item['bodyMarkdown']}" in current["articleMarkdown"]
    ids = [section["id"] for section in current["sections"]]
    ids += current.get("legacyIntroAnchors", []) + current.get("legacyRelatedAnchors", [])
    ids += [anchor for section in current["sections"] for anchor in section.get("legacyAnchors", [])]
    appendix = current.get("sourceAppendix")
    if appendix:
        ids.append(appendix["id"])
    assert "depth-sequence" in ids and len(ids) == len(set(ids)), "Duplicate Hanged Man anchors"
    assert set(previous_ids) <= set(ids)
    orientation = next(section for section in current["sections"] if section["id"] == "orientation-and-position")
    assert orientation == next(section for section in previous["sections"] if section["id"] == "orientation-and-position")
    manuscript = (HANGED_MAN_POLLACK_DIR / "manuscript-zh.md").read_text()
    assert manuscript == current["articleMarkdown"].rstrip() + "\n"
    revision = current["editorialRevision"]
    assert revision["registry"] == "content/hanged-man-update-20261108/revisions.json"
    assert revision["updatedAt"] == "2026-11-08" and revision["scope"].strip()
    assert revision["nativeHumanReviewClaimed"] is False
    english = read(ROOT / "content/tarot/en/hanged-man.json")
    assert sha((ROOT / "content/tarot/en/hanged-man.json").read_bytes()) == read(HANGED_MAN_DIR / "revisions.json")["records"]["content/tarot/en/hanged-man.json"]["fileSha256"]
    assert english["updatedAt"] == "2026-10-24"
    assert "Pollack" not in english["articleMarkdown"]
    assert all(section["id"] != "depth-sequence" for section in english["sections"])
    depth = read(ROOT / "content/tarot-depth-20261008/revisions.json")
    for unedited_locale in ("zh-TW", "ru"):
        unedited = ROOT / f"content/tarot/{unedited_locale}/hanged-man.json"
        assert sha(unedited.read_bytes()) == depth["editions"][f"{unedited_locale}/hanged-man"]["recordSha256"], f"Unedited Hanged Man file changed: {unedited_locale}"
        assert read(unedited)["updatedAt"] == "2026-10-08"
        assert "Pollack" not in read(unedited)["articleMarkdown"]
        assert "hanged-man-pollack-2010" not in {source.get("sourceId") for source in read(unedited)["sources"]}
        assert all(section["id"] != "depth-sequence" for section in read(unedited)["sections"])
    try:
        import jsonschema
    except ImportError:
        pass
    else:
        jsonschema.validate(current, read(ROOT / "content/tarot/article.schema.json"))
    return current, previous


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
    raw = (HANGED_MAN_POLLACK_DIR / "previous" / key).read_bytes() if key in HANGED_MAN_POLLACK_PATHS else Path(path).read_bytes()
    previous_raw = (HANGED_MAN_DIR / "previous" / key).read_bytes()
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
