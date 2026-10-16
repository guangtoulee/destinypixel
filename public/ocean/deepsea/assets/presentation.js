(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let manifest, sceneIndex = 0, mode = 'effect', activeTab = 'overview', modelScript, galleryFilter = 'all';
  const modeNames = { effect: '效果图', native: '模型材质', white: '白模' };
  const modeNotes = {
    effect: ['空间与氛围', '效果图表达展厅的照明、色彩与材质意向，可与白模和模型材质视图对照。'],
    native: ['空间与展陈', '由本版三维模型输出，查看展墙、展柜、模型和文字界面的实际位置。'],
    white: ['空间与几何', '查看本次源墙、分区与实体展项的几何关系。'],
  };
  function element(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
  function media(path) { return encodeURI(path.startsWith('/') ? path : `/ocean/deepsea/media/${path}`); }
  const imageLoads = new WeakMap();
  let imageGeneration = 0;
  window.OceanNetworkDiagnostics = { imageFailures: 0, imageRecoveries: 0, modelFailures: 0, modelRecoveries: 0 };
  function setImageSource(img, source, onState) {
    const url = new URL(source, location.href).href;
    const previous = imageLoads.get(img);
    if (previous?.source === url && img.dataset.imageState !== 'unavailable') { onState?.(img.dataset.imageState, img, previous); return; }
    previous?.cancel();
    const state = { source: url, current: url, attempts: 0, timer: null, timeout: null, cancelled: false, generation: ++imageGeneration };
    const startedConnected = img.isConnected;
    const active = (requestImage, attempt) => !state.cancelled && state.attempts === attempt && imageLoads.get(requestImage) === state && (!startedConnected || requestImage.isConnected);
    function clearTimers() { clearTimeout(state.timer); clearTimeout(state.timeout); state.timer = null; state.timeout = null; }
    state.cancel = () => { state.cancelled = true; clearTimers(); img.onload = null; img.onerror = null; };
    function changed(value) { img.dataset.imageState = value; onState?.(value, img, state); }
    function load() {
      if (state.cancelled) return;
      // Each request owns an image element. Old downloads and late load events
      // cannot repaint the element belonging to a newer selection or retry.
      if (img.isConnected && img.hasAttribute('src')) {
        const oldImage = img;
        img = oldImage.cloneNode(false); img.removeAttribute('src'); img.removeAttribute('srcset');
        oldImage.onload = null; oldImage.onerror = null; oldImage.replaceWith(img); oldImage.removeAttribute('src');
      }
      state.attempts += 1;
      const attempt = state.attempts, requestImage = img;
      imageLoads.set(requestImage, state);
      const next = new URL(state.source);
      if (state.attempts > 1) next.searchParams.set('ocean-retry', String(state.attempts - 1));
      state.current = next.href;
      img.dataset.imageGeneration = String(state.generation);
      img.dataset.imageSource = state.source;
      img.dataset.imageAttempts = String(state.attempts);
      let settled = false;
      function failed() {
        if (settled || !active(requestImage, attempt)) return;
        settled = true; clearTimeout(state.timeout); state.timeout = null;
        window.OceanNetworkDiagnostics.imageFailures += 1;
        if (attempt >= 3) { changed('unavailable'); return; }
        changed('retrying');
        state.timer = setTimeout(() => { state.timer = null; if (active(requestImage, attempt)) load(); }, attempt * 500);
      }
      requestImage.onload = () => {
        if (settled || !active(requestImage, attempt)) return;
        if (!requestImage.naturalWidth) { failed(); return; }
        settled = true; clearTimers(); changed('ready');
        if (attempt > 1) window.OceanNetworkDiagnostics.imageRecoveries += 1;
      };
      requestImage.onerror = failed;
      changed(attempt > 1 ? 'retrying' : 'loading');
      // Offscreen lazy thumbnails have not started a request yet.
      if (requestImage.loading !== 'lazy') state.timeout = setTimeout(failed, 20000);
      requestImage.src = state.current;
    }
    load();
  }
  function galleryImageState(value, img, state) {
    const stage = $('image-stage');
    let feedback = $('gallery-image-status');
    if (!feedback) {
      feedback = element('div'); feedback.id = 'gallery-image-status'; feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
      Object.assign(feedback.style, { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', maxWidth: '75%', padding: '16px 20px', background: '#102b3c', color: '#fff', fontSize: '12px', lineHeight: '1.8', textAlign: 'center' });
      stage.append(feedback);
    }
    stage.dataset.imageState = value; stage.setAttribute('aria-busy', String(value === 'loading' || value === 'retrying'));
    img.style.opacity = value === 'ready' ? '' : '0';
    feedback.hidden = value === 'ready'; feedback.replaceChildren();
    if (value !== 'ready') {
      feedback.append(element('span', value === 'unavailable' ? '这张图片暂时没有载入，请重新载入。' : value === 'retrying' ? `图片载入中，正在重试（${state.attempts} / 3）…` : '正在切换场景，载入图片…'));
      if (value === 'unavailable') {
        const retry = element('button', '重新载入'); retry.type = 'button'; retry.id = 'gallery-image-retry';
        Object.assign(retry.style, { color: '#fff', borderColor: '#a7774c', display: 'block', margin: '12px auto 0' }); retry.onclick = updateGallery; feedback.append(retry);
      }
    }
    window.OceanGalleryDiagnostics = { sceneIndex, mode, requestedSource: state.source, displayedSource: value === 'ready' ? img.currentSrc || img.src : null, state: value, attempts: state.attempts, generation: state.generation };
  }
  function openModel() {
    if (window.startOceanModel) { window.startOceanModel(); return; }
    if (modelScript) return;
    modelScript = document.createElement('script'); modelScript.src = '/ocean/deepsea/assets/viewer.js'; modelScript.async = true;
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
    else window.cancelOceanModelLoad?.();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function updateGallery() {
    const scene = manifest.scenes[sceneIndex];
    if (!scene.images[mode]) mode = Object.keys(modeNames).find(m => scene.images[m]);
    const path = scene.images[mode];
    setImageSource($('main-image'), media(path), galleryImageState); $('main-image').alt = `${scene.title} · ${modeNames[mode]}`;
    $('original-link').href = media(path);
    $('scene-number').textContent = scene.number || String(sceneIndex + 1).padStart(2, '0');
    $('scene-title').textContent = scene.title; $('scene-description').textContent = scene.description || '';
    $('image-kind').textContent = scene.imageLabels?.[mode] || modeNames[mode]; $('image-position').textContent = `${sceneIndex + 1} / ${manifest.scenes.length}`;
    $('scene-tags').replaceChildren(...(scene.tags || []).map(t => element('span', t)));
    $('mode-note-title').textContent = scene.isIndependentNode ? '独立深化节点' : modeNotes[mode][0]; $('mode-note').textContent = scene.isIndependentNode || mode==='effect' ? scene.designStatus || modeNotes[mode][1] : modeNotes[mode][1];
    $('gallery-model-button').textContent=scene.independentModelPage?'打开独立切片 3D ↗':scene.isIndependentNode?'查看展厅总模型 ↗':'查看三维空间 ↗';
    $('gallery-model-button').onclick = () => { if(scene.independentModelPage) location.href = scene.independentModelPage; else openTab('model'); };
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
      const img = element('img'); img.loading = 'lazy'; setImageSource(img, media(s.thumbnail || s.images.effect || s.images.native || s.images.white)); img.alt = `${s.title}缩略图`;
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
    setImageSource($('plan-image'), media(plan.path)); $('plan-image').alt = plan.title || (kind === 'route' ? '参观动线' : '展厅分区平面');
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
        for (const table of s.tables || []) {
          const wrap = element('div', undefined, 'chapter-table-wrap');
          wrap.tabIndex = 0; wrap.setAttribute('aria-label', table.caption || '设计资料表格');
          const node = element('table', undefined, 'chapter-table');
          if (table.caption) node.append(element('caption', table.caption));
          if (table.headers?.length) {
            const head = element('thead'), row = element('tr');
            row.append(...table.headers.map(text => { const cell = element('th', text); cell.scope = 'col'; return cell; }));
            head.append(row); node.append(head);
          }
          const body = element('tbody');
          for (const cells of table.rows || []) { const row = element('tr'); row.append(...cells.map(text => element('td', text))); body.append(row); }
          node.append(body); wrap.append(node); article.append(wrap);
        }
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
      const response = await fetch('/ocean/deepsea/media/manifest.json', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('manifest');
      manifest = await response.json(); window.OceanManifest = manifest;
      const p = manifest.project;
      document.title = `${p.title} · 展览设计方案`; $('project-title').textContent = p.title; $('institution').textContent = p.institution;
      $('hero-title').textContent = p.heroTitle || p.title; $('hero-summary').textContent = p.summary; $('project-stage').textContent = p.stage; $('footer-stage').textContent = p.stage; $('project-date').textContent = p.date;
      const hero = manifest.hero || { path: manifest.scenes[0].images.effect || manifest.scenes[0].images.native, label: manifest.scenes[0].title };
      setImageSource($('hero-image'), media(hero.path)); $('hero-image').alt = hero.label || p.title; $('hero-image-label').textContent = hero.label || '';
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
    } catch { $('page-status').textContent = '方案暂时无法打开，请刷新页面后重试。'; }
  }
  document.addEventListener('keydown', e => {
    if (activeTab !== 'gallery' || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); $('prev-scene').click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); $('next-scene').click(); }
  });
  start();
})();
