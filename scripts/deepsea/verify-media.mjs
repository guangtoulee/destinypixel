import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const assetsOnly = process.argv.includes('--assets-only');
const directory = path.resolve(process.argv.slice(2).find(a=>!a.startsWith('--')) || 'private/deepsea');
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
// Immutable private assets may be preuploaded from frozen model/image inputs.
// Publication still requires the complete accepted document and final release.
requireValue(assetsOnly ? manifest.release?.mediaInputsFrozen : manifest.release?.frozen && manifest.release.documentStatus === 'accepted', assetsOnly ? 'Frozen model and image inputs required' : 'Accepted document and frozen release required');
requireValue(manifest.release.edition === 'deepsea_revision_20261016_R2', 'This uploader only accepts the R2 release');
requireValue(manifest.release.primaryVisualCount >= 21, 'At least 21 new R2 primary visuals are required');
if (!assetsOnly) requireValue(manifest.release.documentPages > 0, 'Verified document page count required');
requireValue(manifest.project.title.includes('深海考古'), 'Wrong exhibition title');
requireValue(manifest.scenes.length >= 12 && manifest.scenes.length === manifest.release.gallerySceneCount, 'Gallery count mismatch');
const imageFiles = manifest.scenes.map(scene => scene.images.effect);
requireValue(new Set(imageFiles.map(filename => files.get(filename)?.sha256)).size === imageFiles.length, 'Gallery images must be distinct');
const primary = manifest.scenes.filter(scene => !scene.isIndependentNode && !scene.isSourceReference);
requireValue(primary.length === manifest.release.primaryVisualCount, 'Primary visual count mismatch');
for (const scene of primary) {
  requireValue(scene.modelSha256 === manifest.release.modelGlbSha256, 'Scene belongs to another model revision');
  for (const mode of ['effect', 'native', 'white']) requireValue(files.has(scene.images[mode]), 'Missing R2 comparison view: ' + mode);
}
requireValue(manifest.chapters.length >= 10 && manifest.release.webTableCount === 12, 'Complete source chapters and all twelve tables required');
requireValue(manifest.model.views.length >= 8, 'Model camera presets required');
requireValue(manifest.release.modelMeshCount > 50, 'Detailed model required');
for (const filename of [manifest.hero.path, manifest.model.path, ...(!assetsOnly ? [manifest.pdf?.path, manifest.ppt?.path] : []), ...imageFiles]) requireValue(files.has(filename), 'Missing staged file: ' + filename);
for (const node of manifest.independentNodes || []) {
  requireValue(files.has(node.path) && /\.glb$/i.test(node.path), 'Independent node GLB required');
  requireValue(node.views?.length >= 2, 'Independent node calibrated and side viewpoints required');
}
requireValue(/\.glb$/i.test(manifest.model.path), 'GLB model required');
if (!assetsOnly) requireValue(/\.pdf$/i.test(manifest.pdf.path) && /\.pptx$/i.test(manifest.ppt.path), 'PDF and editable PPTX required');
console.log(JSON.stringify({ verified: true, assetsOnly, assets: files.size, gallery: manifest.scenes.length, pages: manifest.release.documentPages, privateBytes: checks.assets.reduce((sum, asset) => sum + asset.bytes, 0) }));
