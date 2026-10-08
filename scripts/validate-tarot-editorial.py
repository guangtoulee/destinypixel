"""Verify source delivery, all full translations, and the live Sun revision."""
import hashlib
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = root / 'content/tarot-editorial'
digest = lambda text: hashlib.sha256(text.encode()).hexdigest()
source_text = (data / 'source/integration.zh.json').read_text()
assert digest(source_text) == '9bffeb2c3b6eb876cf89706a3a4ae34246e95111c7bb011e8d2255f75b640feb'
source = json.loads(source_text)
manifest = json.loads((data / 'provenance.json').read_text())
catalog = json.loads((root / 'lib/tarot-learning/catalog.json').read_text())
editorial_catalog = json.loads((root / 'lib/tarot-editorial/catalog.json').read_text())
assert manifest['sourceBundleSha256'] == digest(source_text)
assert len(source['articles']) == 4
for original in source['articles']:
    baseline = None
    slug = original['slug']
    for locale in ['en', 'zh', 'zh-TW', 'ru']:
        a = json.loads((data / f'{locale}.json').read_text())[slug]
        md = (data / locale / f'{slug}.md').read_text()
        provenance = manifest['manuscripts'][f'{locale}/{slug}']
        assert a['articleMarkdown'] == md
        assert digest(md) == provenance['sha256']
        assert provenance['sourceArticleSha256'] == original['sha256']
        if locale == 'zh':
            assert md == original['bodyMarkdown']
            assert digest(md) == original['sha256']
        rebuilt = '# ' + a['title'] + '\n\n' + '\n\n'.join(a['opening'])
        rebuilt += ''.join('\n\n## ' + s['title'] + '\n\n' + s['bodyMarkdown'] for s in a['sections']) + '\n'
        assert rebuilt == md, (locale, slug, 'truncated structured article')
        assert len({s['id'] for s in a['sections']}) == len(a['sections'])
        signature = (len(a['opening']), [(s['id'], len(s['bodyMarkdown'].split('\n\n')), len(re.findall(r'^- ', s['bodyMarkdown'], re.M)), [x['href'] for x in s['sources']]) for s in a['sections']])
        if baseline is None:
            baseline = signature
        assert signature == baseline, (locale, slug, 'translation structure')
        assert '&amp;' not in md
        if locale in ['en', 'ru']:
            assert not re.search(r'[\u3400-\u9fff]', md)
        if locale == 'ru':
            assert re.search(r'[А-Яа-яЁё]', a['title'])
        assert editorial_catalog[locale][slug]['title'] == a['title']
        if slug == 'tarot-sun':
            path = root / f'content/tarot/{locale}/sun.json'
            sun = json.loads(path.read_text())
            assert digest(path.read_text()) == manifest['sunRecordSha256'][locale]
            assert sun['articleMarkdown'] == md
            assert sun['title'] == a['title']
            assert sun['hook'] == a['opening'][2]
            assert sun['openingParagraphs'] == a['opening'][3:]
            assert [(s['id'], s['title'], s['bodyMarkdown']) for s in sun['sections']] == [(s['id'], s['title'], s['bodyMarkdown']) for s in a['sections']]
            assert [s['url'] for s in sun['sources']] == re.findall(r'\]\((https?://[^)]+)\)', md)
            assert sun['contentProvenance']['sourceArticleSha256'] == original['sha256']
            assert sun['contentProvenance']['articleSha256'] == digest(md)
            assert sun['publishedAt'] == '2026-10-07' and sun['updatedAt'] == '2026-10-08'
            previous = json.loads((root / sun['contentProvenance']['previousRecord']).read_text())
            assert sun['image'] == previous['image']
            assert sun['relatedCards'] == previous['relatedCards']
            entry = next(c for c in catalog[locale] if c['cardId'] == 'sun')
            for field in ['title', 'hook', 'quickTake']:
                assert entry[field] == sun[field]
    print(f'PASS {slug}: four complete editions; exact source hash, full text, sections, paragraphs, lists and sources')
print('PASS all 16 editorial editions; original Chinese bundle preserved exactly; Sun catalog/provenance/image/date checks')
