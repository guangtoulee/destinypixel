"""Validate the bounded sample rollout without replacing legacy review history."""
import subprocess

from editorial_revision_helpers import ROOT, REVISION_DIR, SAMPLE_PATHS, revision_registry, sha, validate_sample_record


registry = revision_registry()
baseline = registry["baseCommit"]
assert baseline == "179c14e1f6d5bf19a244adeaef84d13ba79ce4b1", "Sample baseline must remain the recorded pre-edit commit"
locales = ("en", "zh", "zh-TW", "ru")
directories = [f"content/{family}/{locale}" for family in ("hexagrams", "tarot") for locale in locales]
baseline_paths = set(subprocess.check_output(["git", "ls-tree", "-r", "--name-only", baseline, "--", *directories], cwd=ROOT).decode().splitlines())
current_paths = {path.relative_to(ROOT).as_posix() for directory in directories for path in (ROOT / directory).glob("*.json")}
assert current_paths == baseline_paths, "The six samples must not add or remove article records"
changed_paths = set(subprocess.check_output(["git", "diff", "--name-only", baseline, "--", *directories], cwd=ROOT).decode().splitlines())
assert changed_paths == SAMPLE_PATHS, f"Unexpected current article changes: {changed_paths ^ SAMPLE_PATHS}"
saved_paths = {path.relative_to(REVISION_DIR / "previous").as_posix() for path in (REVISION_DIR / "previous").rglob("*.json")}
assert saved_paths == SAMPLE_PATHS, "Historical snapshot scope must contain only the six amended records"
for path in sorted(SAMPLE_PATHS):
    current, previous = validate_sample_record(ROOT / path)
    baseline_raw = subprocess.check_output(["git", "show", f"{baseline}:{path}"], cwd=ROOT)
    assert (REVISION_DIR / "previous" / path).read_bytes() == baseline_raw, f"Previous sample does not preserve the baseline bytes: {path}"
    assert registry["records"][path]["previousFileSha256"] == sha(baseline_raw)
    if path.startswith("content/hexagrams/"):
        assert current["id"] == previous["id"] == "hexagram-11"
        assert current["guaci"]["classical"] == previous["guaci"]["classical"]
        assert [line["classical"] for line in current["lineNotes"]] == [line["classical"] for line in previous["lineNotes"]]
        assert current["linesBottomUp"] == previous["linesBottomUp"] == [1, 1, 1, 0, 0, 0]
    else:
        assert current["cardId"] == previous["cardId"] in ("sun", "moon")
        assert current["number"] == previous["number"] == ("XIX" if current["cardId"] == "sun" else "XVIII")
        assert current["updatedAt"] == registry["updatedAt"]
    print(f"PASS {path}: exact current file/Markdown receipt; exact pre-edit bytes; retained legacy provenance/review and identity")
print(f"PASS exactly six amended records / {len(current_paths)} article records; four sample slugs in zh/en only; no added records or historical provenance rewrites")
