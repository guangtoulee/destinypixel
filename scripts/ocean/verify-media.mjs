import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = path.resolve('private/ocean');
const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const files = [m.hero.path, m.model.path, m.pdf?.path, m.ppt?.path, ...m.scenes.flatMap(s => [...Object.values(s.images), s.thumbnail].filter(Boolean)), ...['layout', 'route'].flatMap(k => m.plan[k] ? [m.plan[k].path, m.plan[k].original].filter(Boolean) : [])].filter(Boolean);
for (const name of files) {
  if (path.isAbsolute(name) || path.resolve(root, name).startsWith(root + path.sep) === false) throw new Error(`Invalid media path ${name}`);
  if (!fs.statSync(path.resolve(root, name)).isFile()) throw new Error(`Missing media ${name}`);
}
const assetsOnly = process.argv.includes('--assets-only');
if ((!assetsOnly && (!m.pdf?.path || !m.ppt?.path)) || !m.plan.route?.path) throw new Error('Final PDF, editable PPT and route image are required for release.');
const effectCount = new Set(m.scenes.map(s => s.images.effect).filter(Boolean)).size;
if (effectCount < 21 || effectCount > 30) throw new Error('Twenty-one to thirty distinct approved effect images are required for release.');
if (!m.release?.frozen) throw new Error('An explicitly frozen image selection is required.');
if (m.model.views.length < 8) throw new Error('At least eight model views are required.');
if (execFileSync('git', ['ls-files', '--', 'private/ocean'], { encoding: 'utf8' }).trim()) throw new Error('Private ocean media must not be tracked by Git.');
for (const r of JSON.parse(fs.readFileSync(path.join(root, 'media-checksums.json'), 'utf8')).assets) {
  const b = fs.readFileSync(path.join(root, r.filename));
  if (b.length !== r.bytes || crypto.createHash('sha256').update(b).digest('hex') !== r.sha256) throw new Error(`Media changed after staging: ${r.filename}`);
}
console.log(JSON.stringify({ requiredMediaFiles: new Set(files).size, scenes: m.scenes.length, modelViews: m.model.views.length, proposalChapters: m.chapters.length, effectCount, assetsOnly, privateMediaTracked: false, mediaHashesVerified: true }));
