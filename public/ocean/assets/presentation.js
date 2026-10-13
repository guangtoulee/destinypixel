(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let manifest, sceneIndex = 0, mode = 'effect', activeTab = 'overview', modelScript, galleryFilter = 'all';
  const modeNames = { effect: '效果图', native: '模型材质', white: '白模' };
  const modeNotes = {
    effect: ['空间与氛围', '效果图表达展厅的照明、色彩与材质意向，可与白模和模型材质视图对照。'],
    native: ['空间与展陈', '由本版三维模型输出，查看展墙、展柜、模型和文字界面的实际位置。'],
    white: ['空间与几何', '查看本版真实建筑、分区与实体展项的几何关系。'],
  };
  function element(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
  function media(path) { return encodeURI(path.startsWith('/') ? path : `/ocean/media/${path}`); }
  function openModel() {
    if (window.startOceanModel) { window.startOceanModel(); return; }
    if (modelScript) return;
    modelScript = document.createElement('script'); modelScript.src = '/ocean/assets/viewer.js'; modelScript.async = true;
    modelScript.onload = () => { if (activeTab === 'model') window.startOceanModel?.(); };
    modelScript.onerror = () => { modelScript.remove(); modelScript = null; $('model-status').firstElementChild.textContent = '三维场馆暂时无法打开'; $('model-status').lastElementChild.textContent = '请刷新页面后重试。'; };
    document.head.append(modelScript);
  }
  function openTab(tab) {
    if (!manifest || !['overview', 'gallery', 'plan', 'model', 'proposal'].includes(tab)) return;
    activeTab = tab;
    document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== `${tab}-panel`; p.classList.toggle('active', !p.hidden); });
    document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    history.replaceState(null, '', `#${tab}`);
    if (tab === 'model') openModel();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function updateGallery() {
    const scene = manifest.scenes[sceneIndex];
    if (!scene.images[mode]) mode = Object.keys(modeNames).find(m => scene.images[m]);
    const path = scene.images[mode];
    $('main-image').src = media(path); $('main-image').alt = `${scene.title} · ${modeNames[mode]}`;
    $('original-link').href = media(path);
    $('scene-number').textContent = scene.number || String(sceneIndex + 1).padStart(2, '0');
    $('scene-title').textContent = scene.title; $('scene-description').textContent = scene.description || '';
    $('image-kind').textContent = modeNames[mode]; $('image-position').textContent = `${sceneIndex + 1} / ${manifest.scenes.length}`;
    $('scene-tags').replaceChildren(...(scene.tags || []).map(t => element('span', t)));
    $('mode-note-title').textContent = modeNotes[mode][0]; $('mode-note').textContent = modeNotes[mode][1];
    document.querySelectorAll('[data-mode]').forEach(b => { b.disabled = !scene.images[b.dataset.mode]; b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
    document.querySelectorAll('.scene-card').forEach((b, i) => b.setAttribute('aria-pressed', String(i === sceneIndex)));
  }
  function visibleScenes() { return manifest.scenes.map((s,i)=>i).filter(i=>galleryFilter==='all'||manifest.scenes[i].group===galleryFilter); }
  function filterGallery(filter) {
    galleryFilter = filter;
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    document.querySelectorAll('.scene-card').forEach((b,i)=>b.hidden=filter!=='all'&&manifest.scenes[i].group!==filter);
    const available=visibleScenes(); if(!available.includes(sceneIndex))sceneIndex=available[0]; updateGallery();
  }
  function stepGallery(direction) {const indices=visibleScenes();sceneIndex=indices[(indices.indexOf(sceneIndex)+direction+indices.length)%indices.length];updateGallery();}
  function buildGallery() {
    $('scene-strip').replaceChildren(...manifest.scenes.map((s, i) => {
      const b = element('button', undefined, 'scene-card'); b.type = 'button'; b.setAttribute('aria-label', `${i + 1} ${s.title}`);
      const img = element('img'); img.src = media(s.thumbnail || s.images.effect || s.images.native || s.images.white); img.alt = `${s.title}缩略图`; img.loading = 'lazy';
      const label = element('div', undefined, 'scene-card-body'); label.append(element('span', String(i + 1).padStart(2, '0'), 'scene-card-num'), element('span', s.title, 'scene-card-title')); b.append(img, label);
      b.onclick = () => { sceneIndex = i; updateGallery(); }; return b;
    }));
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; updateGallery(); });
    $('prev-scene').onclick = () => stepGallery(-1);
    $('next-scene').onclick = () => stepGallery(1);
    document.querySelectorAll('[data-filter]').forEach(b=>{b.disabled=!manifest.scenes.some(s=>b.dataset.filter==='all'||s.group===b.dataset.filter);b.onclick=()=>filterGallery(b.dataset.filter);});
    $('fullscreen-image').onclick = () => $('image-stage').requestFullscreen?.(); updateGallery();
  }
  function choosePlan(kind) {
    const plan = manifest.plan[kind]; if (!plan) return;
    $('plan-image').src = media(plan.path); $('plan-image').alt = plan.title || (kind === 'route' ? '参观动线' : '展厅分区平面');
    $('plan-caption').textContent = plan.caption || ''; $('plan-original').href = media(plan.original || plan.path);
    document.querySelectorAll('[data-plan]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.plan === kind)); b.disabled = !manifest.plan[b.dataset.plan]; });
  }
  function buildProposal() {
    const chapterNodes = [], navNodes = [];
    manifest.chapters.forEach((c, i) => {
      const id = `chapter-${i + 1}`, n = c.number || String(i + 1).padStart(2, '0');
      const article = element('article', undefined, 'chapter'); article.id = id;
      article.append(element('span', `CHAPTER ${n}`, 'eyebrow'), element('h2', c.title));
      if (c.summary) article.append(element('div', c.summary, 'chapter-summary'));
      for (const s of c.sections || []) {
        if (s.title) article.append(element('h3', s.title));
        for (const p of s.paragraphs || []) article.append(element('p', p));
        if (s.bullets?.length) { const ul = element('ul'); ul.append(...s.bullets.map(x => element('li', x))); article.append(ul); }
      }
      chapterNodes.push(article);
      const a = element('a'); a.href = `#${id}`; a.append(element('span', n), element('strong', c.title)); a.onclick = e => { e.preventDefault(); article.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }; navNodes.push(a);
    });
    $('chapters').replaceChildren(...chapterNodes); $('chapter-nav').replaceChildren(...navNodes);
    $('overview-chapters').replaceChildren(...(manifest.overviewChapters || manifest.chapters.slice(0, 3)).map((c, i) => {
      const card = element('article', undefined, 'narrative-card'); card.append(element('span', c.number || String(i + 1).padStart(2, '0'), 'number'), element('h3', c.title), element('p', c.summary || '')); return card;
    }));
  }
  async function start() {
    try {
      const response = await fetch('/ocean/media/manifest.json', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('manifest');
      manifest = await response.json(); window.OceanManifest = manifest;
      const p = manifest.project;
      document.title = `${p.title} · 展览设计方案`; $('project-title').textContent = p.title; $('institution').textContent = p.institution;
      $('hero-title').textContent = p.heroTitle || p.title; $('hero-summary').textContent = p.summary; $('project-stage').textContent = p.stage; $('footer-stage').textContent = p.stage; $('project-date').textContent = p.date;
      const hero = manifest.hero || { path: manifest.scenes[0].images.effect || manifest.scenes[0].images.native, label: manifest.scenes[0].title };
      $('hero-image').src = media(hero.path); $('hero-image').alt = hero.label || p.title; $('hero-image-label').textContent = hero.label || '';
      $('project-stats').replaceChildren(...(p.stats || []).map(s => { const d = element('div', undefined, 'stat'); d.append(element('div', s.value, 'stat-value'), element('div', s.label, 'stat-label')); return d; }));
      for (const format of ['pdf','ppt']) if (manifest[format]?.path) for (const id of [`${format}-top`, `${format}-main`]) { $(id).href = media(manifest[format].path); $(id).download = manifest[format].name || `展览设计方案.${format==='ppt'?'pptx':'pdf'}`; $(id).hidden = false; }
      $('model-dimensions').textContent = manifest.model.label || '';
      $('model-views').replaceChildren(...manifest.model.views.map(v => { const b = element('button', v.label); b.type = 'button'; b.dataset.modelView = v.id; b.setAttribute('aria-pressed', String(v.id === 'axis')); return b; }));
      window.OceanModelConfig = { ...manifest.model, path: media(manifest.model.path) };
      document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => openTab(b.dataset.tab));
      document.querySelectorAll('[data-open]').forEach(b => b.onclick = e => { e.preventDefault(); openTab(b.dataset.open); });
      document.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => choosePlan(b.dataset.plan));
      $('plan-notes').replaceChildren(...(manifest.plan.notes || []).map(n => { const d = element('div'); d.append(element('h3', n.title), element('p', n.text)); return d; }));
      buildGallery(); buildProposal(); choosePlan('layout'); $('page-status').hidden = true;
      window.OceanReady = true; window.dispatchEvent(new Event('ocean-ready')); openTab(location.hash.slice(1) || 'overview');
    } catch (error) { $('page-status').textContent = '方案暂时无法打开，请刷新页面后重试。'; }
  }
  document.addEventListener('keydown', e => {
    if (activeTab !== 'gallery' || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); $('prev-scene').click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); $('next-scene').click(); }
  });
  start();
})();
