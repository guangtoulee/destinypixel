"""Validate the imported complete records, not unrelated original archive files."""
from pathlib import Path
import json,hashlib,re
import jsonschema
root=Path(__file__).resolve().parents[1];data=root/'content/hexagrams'
read=lambda p:json.loads(p.read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=read(data/'provenance.json');sources=read(data/'sources.json');source_ids={s['id'] for s in sources}
schema=jsonschema.Draft202012Validator(read(data/'article.schema.json'))
identities=read(data/'identities.verified.json')['hexagrams'];assert len(identities)==64
assert sha((data/'identities.verified.json').read_bytes())=='acabd13d4c297d955b3bd6dd192c438e6301d6c2ef8f373d537788c1b2f38d83'
assert sha((data/'source-corrections.json').read_bytes())=='950c32f9bf0e718606c7643ba9a9e6b2e8ed2b230f0d7dd5fdabe2932ccc42f2'
chinese={p.stem:read(p) for p in (data/'zh').glob('*.json')}
assert len(source_ids)==132 and len(chinese)==64
for locale in ['zh','en','zh-TW','ru']:
 articles=[read(p) for p in sorted((data/locale).glob('*.json'))];assert len(articles)==64
 collection={'schemaVersion':2,'editionId':manifest['editionId'],'locale':locale,'articleCount':64,'articles':articles,'sources':sources}
 assert sha((json.dumps(collection,ensure_ascii=False,indent=2)+'\n').encode())==manifest['sourceCollectionSha256'][locale]
 for n,(a,identity) in enumerate(zip(articles,identities),1):
  schema.validate(a);s=chinese[a['id']];md=a['articleMarkdown']
  assert a['id']==f'hexagram-{n:02}' and a['kingWenNumber']==n and a['locale']==locale
  assert a['unicode']==chr(0x4dc0+n-1) and a['codePoint']==f'U+{0x4dc0+n-1:04X}'
  assert a['linesBottomUp']==identity['linesBottomUp']==a['lowerTrigram']['linesBottomUp']+a['upperTrigram']['linesBottomUp']
  assert a['upperTrigram']['id']==identity['upperTrigram']['id'] and a['lowerTrigram']['id']==identity['lowerTrigram']['id']
  assert a['sourceContentHash']==s['sourceContentHash']
  assert a['sourceIds']==s['sourceIds'] and set(a['sourceIds'])<=source_ids
  for key in ['guaci','tenWings']:
   assert a[key]['sourceRefs']==s[key]['sourceRefs'] and len(a[key]['paragraphs'])==len(s[key]['paragraphs'])
  assert a['guaci']['classical']==s['guaci']['classical']
  for key in ['introduction','misreadings','practice','related']:assert len(a[key])==len(s[key])
  assert len(a['practice'])==3 and len(a['modernExample']['paragraphs'])==len(s['modernExample']['paragraphs'])==3
  assert [r['id'] for r in a['related']]==[r['id'] for r in s['related']]
  assert all(r['id'] in chinese for r in a['related'])
  assert len(a['lineNotes'])==6
  for i,(line,original,bit) in enumerate(zip(a['lineNotes'],s['lineNotes'],a['linesBottomUp']),1):
   label=('初'+('九' if bit else '六')) if i==1 else ('上'+('九' if bit else '六')) if i==6 else ('九' if bit else '六')+'二三四五'[i-2]
   assert line['label']==label and line['position']==i and line['polarity']==('yang' if bit else 'yin')
   assert line['classical']==original['classical'] and line['sourceRefs']==original['sourceRefs']
   assert len(line['paragraphs'])==len(original['paragraphs'])
  if n in (1,2):
   assert a['specialStatement']['classical']==s['specialStatement']['classical']
   assert len(a['specialStatement']['paragraphs'])==len(s['specialStatement']['paragraphs'])
  else:assert a['specialStatement'] is None
  assert sha(md.encode())==manifest['articleMarkdownSha256'][locale+'/'+a['id']]
  assert md.startswith('# '+a['title']+'\n') and md.index(a['plainSummary'])<md.index(a['introduction'][0])
  blocks=a['introduction']+a['misreadings']+a['practice']+a['guaci']['paragraphs']+a['tenWings']['paragraphs']+a['modernExample']['paragraphs']+[a['identityText'],a['closing'],a['guaci']['classical']]
  for line in a['lineNotes']:blocks+=line['paragraphs']+[line['focus'],line['classical']]+([line['classicalTranslation']] if line['classicalTranslation'] else [])
  if a['specialStatement']:blocks+=a['specialStatement']['paragraphs']+[a['specialStatement']['classical']]
  blocks += [r['paragraph'] for r in a['related']]
  assert all(t in md for t in blocks)
  strokes=re.findall(r'^([━─—-]+(?: +[━─—-]+)*) {2,}((?:初|上)[六九]|[六九][二三四五])\s*$',md,re.M);assert len(strokes)==6
  for (stroke,label),line in zip(strokes,reversed(a['lineNotes'])):assert label==line['label'] and (' ' not in stroke)==(line['polarity']=='yang')
  assert not a['reviewStatus']['published'] and a['reviewStatus']['nativeExpertReview']=='not_performed'
 print(f'PASS {locale}: 64 full articles, exact collection and article hashes, schema, six lines and source quotes')
assert '未付酬的劳动' in chinese['hexagram-11']['lineNotes'][3]['paragraphs'][1]
assert chinese['hexagram-11']['sourceContentHash']=='6de6e0ce3eb996ba94147c9f359ffc602abe8e53e27e24d66b9b4ab7f8046bc5'
print('PASS 256 complete editions, 1536 regular line explanations, 8 separate special statements, 64 verified identities; archive-wide packaging not evaluated')
