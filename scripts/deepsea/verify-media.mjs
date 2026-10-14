import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const directory = path.resolve(process.argv[2] || 'private/deepsea');
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const checks = JSON.parse(fs.readFileSync(path.join(directory, 'media-checksums.json'), 'utf8'));
function requireValue(condition, message) { if (!condition) throw new Error(message); }
const files = new Map();
for (const asset of checks.assets) {
  requireValue(path.basename(asset.filename) === asset.filename, 'Asset must have a flat local filename');
  const bytes = fs.readFileSync(path.join(directory, asset.filename));
  requireValue(bytes.length === asset.bytes && crypto.createHash('sha256').update(bytes).digest('hex') === asset.sha256, 'Frozen media mismatch: ' + asset.filename);
  files.set(asset.filename, asset);
}
requireValue(manifest.release?.frozen && manifest.release.documentStatus === 'accepted', 'Accepted document and frozen release required');
requireValue(manifest.release.documentPages > 0, 'Verified document page count required');
requireValue(manifest.project.title.includes('深海考古'), 'Wrong exhibition title');
requireValue(manifest.scenes.length >= 12 && manifest.scenes.length === manifest.release.gallerySceneCount, 'Gallery count mismatch');
const imageFiles = manifest.scenes.map(scene => scene.images.effect);
requireValue(new Set(imageFiles.map(filename => files.get(filename)?.sha256)).size === imageFiles.length, 'Gallery images must be distinct');
requireValue(manifest.chapters.length >= 10 && manifest.release.webTableCount === 12, 'Complete source chapters and all twelve tables required');
requireValue(manifest.model.views.length >= 8, 'Model camera presets required');
requireValue(manifest.release.modelMeshCount > 50, 'Detailed model required');
for (const filename of [manifest.hero.path, manifest.model.path, manifest.pdf.path, manifest.ppt.path, ...imageFiles]) requireValue(files.has(filename), 'Missing staged file: ' + filename);
for (const node of manifest.independentNodes || []) {
  requireValue(files.has(node.path) && /\.glb$/i.test(node.path), 'Independent node GLB required');
  requireValue(node.views?.length >= 2, 'Independent node calibrated and side viewpoints required');
}
requireValue(/\.glb$/i.test(manifest.model.path), 'GLB model required');
requireValue(/\.pdf$/i.test(manifest.pdf.path) && /\.pptx$/i.test(manifest.ppt.path), 'PDF and editable PPTX required');
console.log(JSON.stringify({ verified: true, assets: files.size, gallery: manifest.scenes.length, pages: manifest.release.documentPages, privateBytes: checks.assets.reduce((sum, asset) => sum + asset.bytes, 0) }));
