import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const assetsOnly=process.argv.includes('--assets-only'),directory=path.resolve(process.argv.slice(2).find(a=>!a.startsWith('--'))||'private/deepsea');
const m=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'))),checks=JSON.parse(fs.readFileSync(path.join(directory,'media-checksums.json'))),files=new Map();
const ok=(v,s)=>{if(!v)throw Error(s);};
for(const a of checks.assets){ok(path.basename(a.filename)===a.filename,'Flat filenames only');const b=fs.readFileSync(path.join(directory,a.filename));ok(b.length===a.bytes&&crypto.createHash('sha256').update(b).digest('hex')===a.sha256,'Asset bytes changed: '+a.filename);files.set(a.filename,a);}
ok(m.release.edition==='deepsea_revision_20261016_R3','Wrong revision');ok(assetsOnly?m.release.mediaInputsFrozen:m.release.frozen&&m.release.documentStatus==='accepted','Release not frozen/accepted');
ok(m.release.primaryVisualCount===28&&m.release.newEffectCount===28,'Exactly 28 new GPTImage primary visuals required');ok(m.release.venueVisualCount===22&&m.release.independentVisualCount===6,'22 venue and 6 independent C');
const primary=m.scenes.filter(s=>!s.isTechnical);ok(primary.length===28,'Primary scene count');ok(m.scenes.length===m.release.gallerySceneCount,'Scene count');ok(new Set(primary.map(s=>files.get(s.images.effect)?.sha256)).size===28,'28 distinct frozen images');
const venue=primary.filter(s=>!s.isIndependentNode);ok(venue.length===22,'22 venue scenes');for(const s of venue){ok(s.modelSha256===m.release.modelGlbSha256,'Scene model mismatch');for(const mode of['effect','native','white'])ok(files.has(s.images[mode]),'Missing comparison '+s.id+': '+mode);}
ok(m.release.modelMeshCount===1897&&m.release.modelPrimitiveCount===1901,'R3 model geometry count');ok(m.release.frozenModelCameraCount===33&&m.release.webTableCount===12&&m.release.sourceParagraphCount===356,'Complete model/Word sources required');
for(const f of[m.hero.path,m.model.path,...(!assetsOnly?[m.pdf?.path,m.ppt?.path]:[])])ok(files.has(f),'Missing core asset '+f);
for(const s of m.scenes)for(const f of Object.values(s.images))ok(files.has(f),'Missing scene image');
const node=m.independentNodes.find(n=>n.id==='treasure-ship-C');ok(node&&node.panelCount===32&&node.models.length===5,'C32 with five source models required');ok(node.angleMode==='absolute_local_Y'&&JSON.stringify(node.angleRange)===JSON.stringify([-3,3]),'Absolute C angle contract');
for(const n of node.models){ok(files.has(n.path)&&files.get(n.path).sha256===n.sha256,'C asset mismatch');ok(n.views.length>0,'C viewpoint missing');}
for(const d of[...(m.attachments||[]),...(m.drawings||[])])ok(files.has(d.path),'Missing drawing or specialty '+d.title);
for(const b of m.parameterBoards||[])ok(files.has(b.path)&&files.get(b.path).sha256===b.sha256&&files.has(b.thumbnail),'Missing or changed parameter board '+b.id);
if(!assetsOnly)ok(m.parameterBoards?.length===18&&m.release.parameterDesignBoardCount===18,'18 reviewed Image parameter boards required');
if(!assetsOnly){ok(m.release.documentPages>0,'Accepted document page count');ok(m.drawings.length===240,'240 actual drawing files required');ok(/\.pdf$/i.test(m.pdf.path)&&/\.pptx$/i.test(m.ppt.path),'PDF and editable PPTX required');}
console.log(JSON.stringify({verified:true,assetsOnly,assets:files.size,gallery:m.scenes.length,primary:28,cameras:33,drawings:m.drawings?.length??0,pages:m.release.documentPages,privateBytes:checks.assets.reduce((n,a)=>n+a.bytes,0)}));
