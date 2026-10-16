import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { put, head, BlobNotFoundError } from '@vercel/blob';
// Run with `vercel env run -e production -- node ...` from the verified linked
// project. Credentials stay in the child environment, without reading .env files.
const assetsOnly = process.argv.includes('--assets-only');
const directory = path.resolve(process.argv.slice(2).find(a=>!a.startsWith('--')) || 'private/deepsea');
const prefix = 'ocean/deepsea-su-20261016-r3/';
const check = spawnSync(process.execPath, ['scripts/deepsea/verify-media.mjs', directory, ...(assetsOnly ? ['--assets-only'] : [])], { encoding: 'utf8' });
if (check.status !== 0) throw new Error('Frozen media verification must pass before upload.');
const source = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const hashes = JSON.parse(fs.readFileSync(path.join(directory, 'media-checksums.json'), 'utf8'));
const mapping = new Map();
const results = [];
for (const asset of hashes.assets) {
  const body = fs.readFileSync(path.join(directory, asset.filename));
  const sha = crypto.createHash('sha256').update(body).digest('hex');
  if (sha !== asset.sha256 || body.length !== asset.bytes) throw new Error('Media changed after freeze: ' + asset.filename);
  const relative = `assets/${sha}/${asset.filename}`, pathname = prefix + relative;
  let metadata;
  try { metadata = await head(pathname); if (metadata.size !== body.length) throw new Error('Existing private object length mismatch'); }
  catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
    metadata = await put(pathname, body, { access: 'private', addRandomSuffix: false, multipart: body.length > 8 * 1024 * 1024 });
  }
  if (!new URL(metadata.url).hostname.endsWith('.private.blob.vercel-storage.com')) throw new Error('Private store required');
  mapping.set(asset.filename, relative); results.push({ filename: asset.filename, pathname, sha256: sha, bytes: body.length });
  console.log(JSON.stringify({ uploadedOrPresent: results.length, total: hashes.assets.length, filename: asset.filename }));
}
function transform(value, field = '') {
  if (typeof value === 'string') return ['path','original','thumbnail','effect','native','white'].includes(field) ? mapping.get(value) || value : value;
  if (Array.isArray(value)) return value.map(item=>transform(item, field));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,val])=>[key,transform(val,key)]));
  return value;
}
const manifest = transform(source);
fs.writeFileSync(path.join(directory, 'published-manifest.json'), JSON.stringify(manifest));
// The pointer updates only after every immutable media object is present.
if (!assetsOnly) {
await put(prefix + 'media-checksums.json', JSON.stringify({ assets: results }), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
await put(prefix + 'manifest.json', JSON.stringify(manifest), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
}
fs.writeFileSync(path.join(directory, assetsOnly ? 'private-assets-upload-record.json' : 'private-upload-record.json'), JSON.stringify({ prefix, assets: results, completedAt: new Date().toISOString() }, null, 2));
console.log(JSON.stringify({ complete: true, privateMediaFiles: results.length, bytes: results.reduce((n,r)=>n+r.bytes,0), manifestUpdated: !assetsOnly }));
