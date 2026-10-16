"""Stage only frozen R3 private sources, including engineering and independent C variants."""
import argparse,hashlib,json,shutil
from pathlib import Path
from PIL import Image
p=argparse.ArgumentParser();p.add_argument('manifest',type=Path);p.add_argument('--output',type=Path,default=Path('private/deepsea'));a=p.parse_args()
data=json.loads(a.manifest.read_text());assert data['release']['edition']=='deepsea_revision_20261016_R3'
a.output.mkdir(parents=True,exist_ok=True);records={};used={}
def copy_asset(source):
 file=Path(source).expanduser().resolve();assert file.is_file(),file
 digest=hashlib.sha256(file.read_bytes()).hexdigest();name=file.name
 if name in used and used[name]!=digest:name=digest[:12]+'_'+name
 used[name]=digest;target=a.output/name
 if file!=target.resolve():shutil.copy2(file,target)
 records[name]={'filename':name,'bytes':file.stat().st_size,'sha256':digest};return name
for scene in data['scenes']:
 scene['images']={mode:copy_asset(file)for mode,file in scene['images'].items()if file}
 preferred=scene['images'].get('effect')or scene['images'].get('native')or scene['images'].get('white');assert preferred
 thumb='thumb_'+Path(preferred).stem+'.jpg';target=a.output/thumb
 with Image.open(a.output/preferred)as im:
  im=im.convert('RGB');im.thumbnail((480,300),Image.Resampling.LANCZOS);im.save(target,quality=84,optimize=True,progressive=True)
 scene['thumbnail']=thumb;records[thumb]={'filename':thumb,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
def transform(value,key=''):
 if isinstance(value,str):return copy_asset(value)if key in ['path','original']else value
 if isinstance(value,list):return[transform(v,key)for v in value]
 if isinstance(value,dict):return{k:transform(v,k)for k,v in value.items()}
 return value
for key in ['hero','plan','model','independentNodes','pdf','ppt','attachments','drawings','parameterBoards']:
 if key in data:data[key]=transform(data[key])
for board in data.get('parameterBoards',[]):
 thumb='thumb_'+Path(board['path']).stem+'.jpg';target=a.output/thumb
 with Image.open(a.output/board['path'])as im:
  im=im.convert('RGB');im.thumbnail((840,594),Image.Resampling.LANCZOS);im.save(target,quality=88,optimize=True,progressive=True)
 board['thumbnail']=thumb;records[thumb]={'filename':thumb,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(a.output/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');rows=list(records.values());(a.output/'media-checksums.json').write_text(json.dumps({'assets':rows},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'assets':len(rows),'total_bytes':sum(x['bytes']for x in rows),'manifest':str(a.output/'manifest.json')},ensure_ascii=False))
