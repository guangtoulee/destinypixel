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
JUDGEMENT_DIR = ROOT / "content/judgement-update-20261103"
JUDGEMENT_PATHS = frozenset({"content/tarot/zh/judgement.json"})
MOON_DIR = ROOT / "content/moon-update-20261103"
MOON_PATHS = frozenset({"content/tarot/zh/moon.json"})
SUN_DIR = ROOT / "content/sun-update-20261103"
SUN_PATHS = frozenset({"content/tarot/zh/sun.json"})


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
    if sample_key(path) in JUDGEMENT_PATHS:
        validate_judgement_record(path)
        return (JUDGEMENT_DIR / "previous" / sample_key(path)).read_bytes()
    if sample_key(path) in EIGHT_SWORDS_PATHS:
        validate_eight_swords_record(path)
        return (EIGHT_SWORDS_DIR / "previous" / sample_key(path)).read_bytes()
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
    if sample_key(path) in MOON_PATHS:
        current, _ = validate_moon_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in SUN_PATHS:
        current, _ = validate_sun_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in JUDGEMENT_PATHS:
        current, _ = validate_judgement_record(path)
        return sha(current["articleMarkdown"])
    if sample_key(path) in EIGHT_SWORDS_PATHS:
        current, _ = validate_eight_swords_record(path)
        return sha(current["articleMarkdown"])
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
