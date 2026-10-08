"""Integrate one received, fully translated batch without changing other cards."""
import argparse
import copy
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/tarot-depth-20261008"
LOCALES = ("zh", "zh-TW", "en", "ru")


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def split_body(body):
    chunks = re.split(r"^## (.+)\n\n", body, flags=re.M)
    assert len(chunks) > 2 and len(chunks) % 2 == 1
    return chunks[0].strip().split("\n\n"), [(chunks[i], chunks[i + 1].strip()) for i in range(1, len(chunks), 2)]


def structure(body):
    opening, sections = split_body(body)
    return len(opening), [(len(text.split("\n\n")), len(re.findall(r"^- ", text, re.M)),
        re.findall(r"\]\((https?://[^)]+)\)", text)) for _, text in sections]


def profile(card_id):
    # Explicitly reviewed structural profiles for the first five cards of each suit.
    rank, suit = card_id.split("-of-")
    assert rank in ("ace", "two", "three", "four", "five"), "Review the next source structure before extending this adapter"
    if suit == "wands":
        return ["image", "tradition", "upright", "reversed", "case-1", "case-2", "practice", "common_misread", "sources"]
    if suit == "pentacles":
        return ["image", "image-reasoning", "tradition", "upright", "reversed", "situations", "case-1", "case-2", "practice", "common_misread", "reflection", "sources"]
    if suit == "cups":
        return ["image", "tradition", "upright", "reversed", "positions", "case-1", "case-2", "practice", "sources"]
    if suit == "swords":
        return ["image", "tradition", "image-reasoning", "upright", "reversed", "case-1", "case-2", "situations", "practice", "common_misread", "sources"]
    raise AssertionError("Source profile requires editorial review")


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("batch")
parser.add_argument("translations", type=Path)
args = parser.parse_args()
manifest = json.loads((DATA / "manifest.json").read_text())
received = DATA / "incoming" / args.batch
source_raw = (received / "source.json").read_bytes()
receipt = json.loads((received / "receipt.json").read_text())
assert hashlib.sha256(source_raw).hexdigest() == receipt["sourcePackageSha256"]
source = json.loads(source_raw)
versions_path = DATA / "revisions.json"
versions = json.loads(versions_path.read_text()) if versions_path.exists() else {"cards": {}, "articleMarkdownSha256": {}, "editions": {}}
catalog_path = ROOT / "lib/tarot-learning/catalog.json"
catalog = json.loads(catalog_path.read_text())
pending = []

for original in source["records"]:
    card_id = original["cardId"]
    assert card_id in manifest["cards"] and manifest["cards"][card_id]["sourceBatch"] == args.batch
    assert card_id not in versions["cards"], f"Already integrated: {card_id}; review revisions explicitly"
    assert digest(original["bodyMarkdown"]) == original["bodySha256"]
    roles = profile(card_id)
    for locale in LOCALES:
        edition = {k: original[k] for k in ("cardId", "title", "quickTake", "bodyMarkdown")} if locale == "zh" else json.loads((args.translations / locale / f"{card_id}.json").read_text())
        assert edition["cardId"] == card_id and edition["title"] and all(edition["quickTake"].values())
        assert structure(edition["bodyMarkdown"]) == structure(original["bodyMarkdown"]), f"Structure/citation mismatch: {locale}/{card_id}"
        opening, body_sections = split_body(edition["bodyMarkdown"])
        assert len(roles) == len(body_sections), f"Review section roles: {card_id}"
        if locale in ("en", "ru"):
            # Source labels may intentionally retain Chinese bibliographic titles; prose may not.
            prose = re.sub(r"\[[^\]]+\]\(https?://[^)]+\)", "", edition["bodyMarkdown"])
            assert not re.search(r"[\u3400-\u9fff]", prose), f"Untranslated prose: {locale}/{card_id}"
        live_path = ROOT / f"content/tarot/{locale}/{card_id}.json"
        baseline_bytes = subprocess.check_output(["git", "show", f"{manifest['baselineCommit']}:{live_path.relative_to(ROOT)}"], cwd=ROOT)
        old = json.loads(baseline_bytes)
        assert live_path.read_bytes() == baseline_bytes, f"Unreviewed live changes: {locale}/{card_id}"
        article = copy.deepcopy(old)
        old_roles = {s["role"]: s["id"] for s in old["sections"]}
        sections = [{"id": old_roles.get(role, f"depth-{role}"), "role": role,
                     "title": title, "bodyMarkdown": text} for role, (title, text) in zip(roles, body_sections)]
        by_role = {s["role"]: s for s in sections}
        article["legacyIntroAnchors"] = []
        article["legacyRelatedAnchors"] = []
        fallback = {"situations": "case-1", "common_misread": "practice"}
        for role, anchor in old_roles.items():
            if role in roles:
                continue
            if role == "intro":
                article["legacyIntroAnchors"].append(anchor)
            elif role == "related" and old["relatedCards"]:
                article["legacyRelatedAnchors"].append(anchor)
            else:
                target = "practice" if role == "related" else fallback.get(role)
                assert target in by_role, f"Missing semantic anchor mapping: {card_id}/{role}"
                by_role[target].setdefault("legacyAnchors", []).append(anchor)
        has_quick_opening = original["bodyMarkdown"].startswith("正位先读一句：")
        assert len(opening) >= (3 if has_quick_opening else 1)
        visible_opening = opening[2:] if has_quick_opening else opening
        article.update(title=edition["title"], quickTake=edition["quickTake"], hook=visible_opening[0],
            openingParagraphs=visible_opening[1:], plainLanguageSummary=None, sections=sections,
            articleMarkdown=f"# {edition['title']}\n\n{edition['bodyMarkdown']}",
            sources=copy.deepcopy(original["sources"]), sourceBatch=args.batch,
            publishedAt=old.get("publishedAt", "2026-10-07"), updatedAt="2026-10-08")
        for field in ("sourceRecord", "counts", "countsOriginal", "translationInputMetadata"):
            article.pop(field, None)
        archive = f"content/tarot/revisions/2026-10-08/{card_id}.{locale}.json"
        article["review"] = {"type": "parent_reviewed_chinese_and_model_translation_review", "nativeHumanReview": False,
            "checkedOn": "2026-10-08", "published": False}
        article["contentProvenance"] = {"sourceLocale": "zh-CN", "sourceBodySha256": original["bodySha256"],
            "sourceArticleSha256": original["bodySha256"], "sourceHashBasis": "exact delivered bodyMarkdown without added title",
            "articleSha256": digest(article["articleMarkdown"]), "sourcePackageSha256": receipt["sourcePackageSha256"],
            "previousRecord": archive, "editionBodySha256": digest(edition["bodyMarkdown"])}
        key = f"{locale}/{card_id}"
        versions["articleMarkdownSha256"][key] = digest(article["articleMarkdown"])
        versions["editions"][key] = {"bodySha256": digest(edition["bodyMarkdown"]), "recordSha256": digest(json.dumps(article, ensure_ascii=False, indent=2) + "\n"),
            "caseSections": [s["id"] for s in sections if s["role"] in ("case-1", "case-2")],
            "sourceBatch": args.batch}
        entry = next(c for c in catalog[locale] if c["cardId"] == card_id)
        for field in ("title", "hook", "quickTake"):
            entry[field] = article[field]
        pending.append((live_path, article, ROOT / archive, baseline_bytes, DATA / "editions" / locale / f"{card_id}.json", edition))
        manifest["cards"][card_id]["locales"][locale] = "integrated"
    versions["cards"][card_id] = {"sourceBatch": args.batch, "publishedAt": "2026-10-07", "updatedAt": "2026-10-08"}

# All editions validated in memory before touching live records. Preserve old bytes exactly.
for live, article, archive, old_bytes, edition_path, edition in pending:
    assert not archive.exists(), f"Archive exists: {archive}"
for live, article, archive, old_bytes, edition_path, edition in pending:
    archive.parent.mkdir(parents=True, exist_ok=True)
    archive.write_bytes(old_bytes)
    write_json(edition_path, edition)
    write_json(live, article)
write_json(catalog_path, catalog)
write_json(versions_path, versions)
write_json(DATA / "manifest.json", manifest)
receipt["editorialReview"] = "parent independently reviewed Chinese"
receipt["translationReview"] = "full model review and structural parity; not native-human certification"
write_json(received / "receipt.json", receipt)
print(f"Integrated {len(source['records'])} cards / {len(pending)} full editions from {args.batch}; original records archived; HTTP/build validation pending")
