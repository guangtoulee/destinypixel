"""Archive complete incoming manuscripts without changing published content."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "content/tarot-depth-20261008"
MANIFEST = DATA / "manifest.json"
LOCALES = ("zh", "zh-TW", "en", "ru")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def read_manifest():
    return json.loads(MANIFEST.read_text())


def receive(args):
    manifest = read_manifest()
    assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.batch), "Invalid batch ID"
    target = DATA / "incoming" / args.batch
    assert not target.exists(), "Batch already archived; never overwrite a received original"
    raw = Path(args.source).read_bytes()
    digest = sha(raw)
    if args.sha256:
        assert digest == args.sha256, "Package hash differs from confirmed source"
    package = json.loads(raw)
    records = package if isinstance(package, list) else package.get("records", package.get("articles"))
    assert isinstance(records, list) and records, "Expected records/articles array containing full manuscripts"
    seen = set()
    receipt = []
    for record in records:
        card_id = record["cardId"]
        assert card_id in manifest["cards"], f"Out-of-scope or unknown card: {card_id}"
        assert card_id not in seen, f"Duplicate card: {card_id}"
        seen.add(card_id)
        state = manifest["cards"][card_id]
        assert state["sourceBatch"] is None, f"Already received: {card_id}; explicitly reconcile revisions first"
        assert record.get("locale", "zh-CN") in ("zh", "zh-CN"), "Incoming source must be Chinese"
        md = record.get("articleMarkdown", record.get("bodyMarkdown"))
        assert isinstance(md, str) and len(md) >= 1500, f"Missing/short full manuscript: {card_id}"
        assert re.search(r"^# .+", md, re.M) and len(re.findall(r"^## .+", md, re.M)) >= 6, f"Missing full article structure: {card_id}"
        article_hash = sha(md.encode())
        if record.get("sha256"):
            assert article_hash == record["sha256"], f"Manuscript hash mismatch: {card_id}"
        source_slug = record.get("articleSlug")
        assert source_slug in (None, state["slug"]), f"Route identity mismatch: {card_id}"
        receipt.append({"cardId": card_id, "route": state["route"], "articleSha256": article_hash,
                        "characters": len(md), "sectionCount": len(re.findall(r"^## .+", md, re.M))})
    # Validate the whole batch before writing anything. Original bytes are retained.
    target.mkdir(parents=True)
    (target / "source.json").write_bytes(raw)
    (target / "receipt.json").write_text(json.dumps({"batchId": args.batch, "sourcePackageSha256": digest,
        "origin": args.origin, "records": receipt, "editorialReview": "pending",
        "translationReview": "pending", "nativeHumanReview": False}, ensure_ascii=False, indent=2) + "\n")
    for entry in receipt:
        state = manifest["cards"][entry["cardId"]]
        state["sourceBatch"] = args.batch
        state["sourceArticleSha256"] = entry["articleSha256"]
        state["locales"]["zh"] = "received"
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"Archived {len(receipt)} complete Chinese manuscripts; package SHA-256 {digest}")
    for entry in receipt:
        print(f"  {entry['cardId']}: {entry['characters']} characters, {entry['sectionCount']} sections -> {entry['route']}")
    print("Published content unchanged. Editorial review and all translations remain pending.")


def status(_args):
    m = read_manifest()
    print(f"Baseline {m['baselineCommit']}; {len(m['cards'])} cards; Sun excluded")
    for locale in LOCALES:
        counts = {}
        for card in m["cards"].values():
            state = card["locales"][locale]
            counts[state] = counts.get(state, 0) + 1
        print(locale, json.dumps(counts, ensure_ascii=False))
    for card_id, card in m["cards"].items():
        if card["sourceBatch"]:
            print(card_id, card["sourceBatch"], json.dumps(card["locales"], ensure_ascii=False))


def check_scope(_args):
    m = read_manifest()
    baseline = m["baselineCommit"]
    allowed = {f"content/tarot/{locale}/{card}.json" for locale in LOCALES for card in m["cards"]}
    allowed.update({"content/tarot/article.schema.json", "lib/tarot-learning/catalog.json",
        "lib/tarot-learning/metadata.ts", "lib/tarot-learning/content.ts", "lib/tarot-learning/learning.test.ts",
        "components/tarot-learning-article.tsx", "scripts/validate-tarot-learning.py",
        "scripts/check-tarot-learning.tsx", "scripts/check-tarot-learning-browser.mjs"})
    prefixes = ("content/tarot-depth-20261008/", "content/tarot/revisions/2026-10-08/",
                "docs/qa/tarot-depth-20261008/", "scripts/tarot-depth-", "scripts/check-tarot-depth-",
                "scripts/validate-tarot-depth-")
    changed = set(git("diff", "--name-only", baseline).decode().splitlines())
    changed.update(git("ls-files", "--others", "--exclude-standard").decode().splitlines())
    unexpected = sorted(p for p in changed if p not in allowed and not p.startswith(prefixes))
    assert not unexpected, f"Changes outside this batch scope: {unexpected}"
    for card_id, card in m["cards"].items():
        for locale in LOCALES:
            path = f"content/tarot/{locale}/{card_id}.json"
            old = json.loads(git("show", f"{baseline}:{path}"))
            current = json.loads((ROOT / path).read_text())
            for field in ("cardId", "deckOrder", "number", "arcana", "locale", "image"):
                assert current[field] == old[field], f"Identity/image changed: {path} {field}"
        assert card["slug"] == f"tarot-{card_id}" and card["route"] == f"/journal/tarot-{card_id}"
    for batch in (DATA / "incoming").glob("*") if (DATA / "incoming").exists() else []:
        receipt = json.loads((batch / "receipt.json").read_text())
        assert sha((batch / "source.json").read_bytes()) == receipt["sourcePackageSha256"], f"Source altered: {batch.name}"
    print("PASS scope: protected Sun/editorials/hexagrams/assets/tools unchanged; 77 card identities/images retained; source packages intact")


parser = argparse.ArgumentParser(description=__doc__)
commands = parser.add_subparsers(dest="command", required=True)
incoming = commands.add_parser("receive")
incoming.add_argument("batch")
incoming.add_argument("source")
incoming.add_argument("--origin", required=True, help="Confirmed message/package source, without credentials")
incoming.add_argument("--sha256", help="Confirmed complete package SHA-256, if supplied")
incoming.set_defaults(run=receive)
commands.add_parser("status").set_defaults(run=status)
commands.add_parser("check-scope").set_defaults(run=check_scope)
arguments = parser.parse_args()
arguments.run(arguments)
