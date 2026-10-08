"""Verify imported records reconstruct the exact approved four locale collections."""
import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1];data=root/'content/tarot';manifest=json.loads((data/'provenance.json').read_text());base=None
try:
 import jsonschema
except ImportError:
 jsonschema=None
schema=json.loads((data/'article.schema.json').read_text())
def original_record(path,locale):
 archive=data/f'revisions/2026-10-08/{path.stem}.{locale}.json'
 if path.stem=='sun':archive=data/f'revisions/2026-10-07/sun.{locale}.json'
 return json.loads((archive if archive.exists() else path).read_text())
chinese={p.stem:original_record(p,'zh') for p in (data/'zh').glob('*.json')}
# Reconstruct the original approved collection using the retained Sun editions.
# Current revised editions are validated separately by validate-tarot-editorial.py.
chinese['sun']=json.loads((data/'revisions/2026-10-07/sun.zh.json').read_text())
for locale in ['en','zh','zh-TW','ru']:
 records=[original_record(p,locale) for p in (data/locale).glob('*.json')];records.sort(key=lambda r:r['deckOrder'])
 assert len(records)==78 and [r['deckOrder'] for r in records]==list(range(78))
 assert len({r['cardId'] for r in records})==78
 sourceLocale='zh-CN' if locale=='zh' else locale
 raw=(json.dumps({'schemaVersion':'destinypixel.tarot.collection.v3','locale':sourceLocale,'articleCount':78,'records':records},ensure_ascii=False,indent=2)+'\n').encode()
 assert hashlib.sha256(raw).hexdigest()==manifest['sourceCollectionSha256'][sourceLocale],f'{locale}: source collection changed'
 for r in records:
  if jsonschema:jsonschema.validate(r,schema)
  assert r['locale']==sourceLocale and r['articleSlug'] is None
  assert len(r['sections'])>=7 and len(r['articleMarkdown'])>=1500
  assert hashlib.sha256(r['articleMarkdown'].encode()).hexdigest()==manifest['articleMarkdownSha256'][locale+'/'+r['cardId']]
  assert (root/'public/tarot/rws'/(r['cardId']+'.webp')).is_file()
  assert r['quickTake']['upright'] and r['quickTake']['reversed'] and r['hook']
  assert len({s['id'] for s in r['sections']})==len(r['sections'])
  assert all(s['bodyMarkdown'].strip() for s in r['sections'])
  # Content checks from the original package validator, scoped to imported records.
  # Archive reading bundles and package-manifest checksums are not validated here.
  original=chinese[r['cardId']];md=r['articleMarkdown']
  assert md.index(r['quickTake']['upright'])<md.index(r['quickTake']['reversed'])<md.index(r['hook'])
  assert r['review']['nativeHumanReview'] is False
  assert re.findall(r'https?://[^\s)]+',md)==re.findall(r'https?://[^\s)]+',original['articleMarkdown'])
  assert [s['url'] for s in r['sources']]==[s['url'] for s in original['sources']]
  assert [s.get('sourceMetadata') for s in r['sources']]==[s.get('sourceMetadata') for s in original['sources']]
  assert [x['cardId'] for x in r['relatedCards']]==[x['cardId'] for x in original['relatedCards']]
  assert all(x['cardId'] in chinese for x in r['relatedCards'])
  assert r['image']==original['image']
  assert r['contentProvenance']['sourceArticleSha256']==hashlib.sha256(original['articleMarkdown'].encode()).hexdigest()
  if locale in ['en','ru']:assert not re.search(r'[\u3400-\u9fff]',md)
 identity=[(r['cardId'],r['deckOrder'],r['number'],[(s['id'],s['role'],len(s['bodyMarkdown'].split('\n\n'))) for s in r['sections']]) for r in records]
 if base is None:base=identity
 else:assert identity==base,locale+' section/paragraph mismatch'
 print(f'PASS {locale}: 78 complete records; exact collection/text hashes, section/paragraph parity, existing assets'+('; JSON Schema' if jsonschema else ''))
print('PASS original 312 approved records reconstructed from unchanged live records and exact archives; revision validators check new text separately')
