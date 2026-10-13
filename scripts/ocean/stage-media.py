"""Copy an approved source manifest into ignored, gated /ocean/media files."""
import argparse, hashlib, json, shutil
from pathlib import Path
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('manifest', type=Path)
p.add_argument('--output', type=Path, default=Path('private/ocean'))
a = p.parse_args()
data = json.loads(a.manifest.read_text())
a.output.mkdir(parents=True, exist_ok=True)
records = []
used = {}
def copy_asset(source):
    file = Path(source).expanduser().resolve()
    if not file.is_file(): raise SystemExit(f'Missing approved asset: {file}')
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    name = file.name
    if name in used and used[name] != digest: name = digest[:12] + '_' + name
    used[name] = digest
    target = a.output / name
    if file != target.resolve(): shutil.copy2(file, target)
    if not any(r['filename'] == name for r in records): records.append({'filename': name, 'bytes': file.stat().st_size, 'sha256': digest})
    return name
for scene in data['scenes']:
    scene['images'] = {mode: copy_asset(file) for mode, file in scene['images'].items() if file}
    if not scene['images']: raise SystemExit(f'No approved image for scene {scene["title"]}')
    preferred = scene['images'].get('effect') or scene['images'].get('native') or scene['images'].get('white')
    thumb_name = 'thumb_' + Path(preferred).stem + '.jpg'
    thumb_path = a.output / thumb_name
    with Image.open(a.output / preferred) as image:
        image = image.convert('RGB')
        image.thumbnail((480, 300), Image.Resampling.LANCZOS)
        image.save(thumb_path, quality=84, optimize=True, progressive=True)
    scene['thumbnail'] = thumb_name
    records.append({'filename': thumb_name, 'bytes': thumb_path.stat().st_size, 'sha256': hashlib.sha256(thumb_path.read_bytes()).hexdigest()})
data['hero']['path'] = copy_asset(data['hero']['path'])
for kind in ['layout', 'route']:
    if kind in data['plan']:
        for key in ['path', 'original']:
            if data['plan'][kind].get(key): data['plan'][kind][key] = copy_asset(data['plan'][kind][key])
data['model']['path'] = copy_asset(data['model']['path'])
for format in ['pdf', 'ppt']:
    if data.get(format, {}).get('path'): data[format]['path'] = copy_asset(data[format]['path'])
(a.output / 'manifest.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
(a.output / 'media-checksums.json').write_text(json.dumps({'assets': records}, ensure_ascii=False, indent=2))
print(json.dumps({'assets': len(records), 'total_bytes': sum(r['bytes'] for r in records), 'manifest': str(a.output / 'manifest.json')}, ensure_ascii=False))
