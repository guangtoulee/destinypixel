import {events} from './history-data.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titles=['伏羲文化','台西遗存','仲景著书','针灸铜人','易水传灯','赵州本草','本草成林','医脉至今'];
const eras=['文化记忆','商代','东汉','北宋','金元','13世纪','明代','近现代'];
const places=['新乐','藁城','全国医史','全国医史','真定 · 藁城','赵县','全国医史','藁城'];
const personNotes={all:'点击人名，沿亮起的路径追踪师承；著作将经验传给后来的读者。',zhang:'张元素 · 易县。易水学派的开创者，李杲、王好古与其学术传统相联系。',li:'李杲 · 真定。承张元素之学，发展脾胃学说；《脾胃论》是其代表作。',luo:'罗天益 · 藁城。承学于李杲，整理刊行师著，并著《卫生宝鉴》。',wang:'王好古 · 赵州。联系张元素、李杲的学术传统，以《汤液本草》等著述保存知识。'};
let scene=null,current=1,mode='journey',tourTimer=null,toastTimer=null,excavation=0,scrubbing=false;
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
$('#era-stops').innerHTML=events.map((e,i)=>`<button data-era="${i}" aria-label="${esc(e.era+'，'+e.yearLabel+'，'+titles[i])}"><small>${esc(eras[i])}</small><strong>${esc(titles[i])}</strong><i>${esc(places[i])}</i></button>`).join('');
function renderTools(event){
  const tools=$('#exploration-tools');tools.className='exploration-tools';
  if(event.id==='taixi'){
    tools.innerHTML='<p class="tool-kicker">动手打开历史<span>考古剖面 · 示意</span></p><label class="excavation-label" for="excavation-slider">拉开地层 <output id="excavation-value">0%</output></label><input class="excavation-range" id="excavation-slider" type="range" min="0" max="100" value="0" aria-label="拉开台西考古地层"><div class="action-chips"><button data-inspect="artifact_blade">拿起砭镰 ↗</button><button data-inspect="artifact_seeds">近看种仁 ↗</button></div><p class="operation-note">移动滑块分离土层，再拿起器物，从另一面观察。地层为展示示意。</p>';
    $('#excavation-slider').value=excavation*100;$('#excavation-value').textContent=Math.round(excavation*100)+'%';
    $('#excavation-slider').addEventListener('input',e=>{stopTour();excavation=Number(e.target.value)/100;$('#excavation-value').textContent=e.target.value+'%';scene?.setExcavation(excavation);});
  }else if(event.id==='yishui'){
    tools.classList.add('lineage-tools');tools.innerHTML='<p class="tool-kicker">追一条医脉<span>人 · 地 · 书</span></p><button class="action-button" id="lineage-expand">展开师承关系 <span>↗</span></button><div class="action-chips"><button data-person="zhang">张元素</button><button data-person="li">李杲</button><button data-person="luo">罗天益</button><button data-person="wang">王好古</button></div><p class="person-note" id="person-note">'+personNotes.all+'</p>';
    $('#lineage-expand').addEventListener('click',()=>{stopTour();showLineage('all');});
    document.querySelectorAll('[data-person]').forEach(b=>b.addEventListener('click',()=>{stopTour();showLineage(b.dataset.person);}));
  }else{
    const labels={fuxi:'环绕阴阳文化意象',zhangzhongjing:'走近著书与传抄',tongren:'环绕观察针灸铜人',wanghaogu:'近看本草与书卷',bencao:'走近书页与植物',luzhizheng:'走近当代传承书桌'};
    const names={tongren:'artifact_human',wanghaogu:'artifact_book',zhangzhongjing:'artifact_book',bencao:'artifact_plant'};
    tools.innerHTML=`<p class="tool-kicker">走近这一刻<span>真实三维 · 可环绕观察</span></p><button class="action-button" data-inspect="${names[event.id]||''}">${labels[event.id]} <span>↗</span></button><p class="operation-note">${esc(event.discovery)}</p>`;
  }
  document.querySelectorAll('[data-inspect]').forEach(b=>b.addEventListener('click',()=>{stopTour();if(!scene){toast('三维场景正在展开，请稍候');return;}if(!scene.inspect(b.dataset.inspect||undefined))scene.inspect();}));
}
function renderEvent(index,force=false){
  index=Math.max(0,Math.min(7,index));const changed=index!==current;current=index;const event=events[index];
  if(changed||force){
    $('#chapter-number').textContent=String(index+1).padStart(2,'0');
    $('#event-copy').innerHTML=`<span class="event-tag ${event.tag==='全国医史'?'national':event.tag==='文化记忆'?'memory':''}">${esc(event.tag)}${event.tag==='全国医史'?'':' · '+esc(places[index])}</span><h1>${esc(event.title).replace(' · ','<span class="title-divider"> · </span><br>')}</h1><p class="event-subtitle">${esc(event.subtitle)}</p><p class="event-summary">${esc(event.summary)}</p>`;
    $('#ambient-era').textContent=eras[index];$('#current-era-label').textContent=event.era.split(' · ')[0];$('#current-year').textContent=event.yearLabel;$('#step-count').textContent=`${String(index+1).padStart(2,'0')} / 08`;
    $('#previous-event').disabled=index===0;$('#next-event').disabled=index===7;renderTools(event);$('.event-panel').scrollTop=0;
    document.querySelectorAll('[data-era]').forEach(b=>{const active=Number(b.dataset.era)===index;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'step':'false');});
    if(changed&&window.innerWidth<=760)$(`[data-era="${index}"]`).scrollIntoView({block:'nearest',inline:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  $('#time-slider').setAttribute('aria-valuetext',`${event.era}，${event.yearLabel}，${titles[index]}`);
}
function updateProgress(p){if(scrubbing)return;$('#time-slider').value=Math.round(p*1000);$('#time-track-progress').style.width=(p/7*100)+'%';}
function setMode(value){mode=value;document.body.dataset.mode=mode;$('.event-panel').inert=mode!=='journey';$('.event-panel').setAttribute('aria-hidden',mode!=='journey'?'true':'false');$('#overview-caption').hidden=mode!=='overview';$('#inspection-bar').hidden=mode!=='inspect';$('#overview-button').classList.toggle('active',mode==='overview');$('#scene-hint').innerHTML=mode==='overview'?'点击一座场景<br>进入对应年代':'左右拖动穿越年代<br>点击场景，走近历史';}
function goTo(index){scrubbing=false;stopTour();scene?.setLineage('off');renderEvent(index);setMode('journey');if(scene)scene.goTo(current);else updateProgress(current);}
function showLineage(person){scene?.setLineage(person);if($('#person-note'))$('#person-note').textContent=personNotes[person]||personNotes.all;document.querySelectorAll('[data-person]').forEach(b=>b.classList.toggle('active',b.dataset.person===person));if($('#lineage-expand'))$('#lineage-expand').innerHTML='师承关系已展开 <span>◇</span>';}
function stopTour(){if(tourTimer){clearInterval(tourTimer);tourTimer=null;}$('#tour-button').setAttribute('aria-pressed','false');$('#tour-button').setAttribute('aria-label','自动漫游');$('#tour-button').querySelector('span').textContent='自动漫游';}
function startTour(){if(tourTimer){stopTour();return;}if(!scene){toast('场景载入后即可漫游');return;}scene.leaveInspect();scene.goTo(current);setMode('journey');$('#tour-button').setAttribute('aria-pressed','true');$('#tour-button').setAttribute('aria-label','暂停漫游');$('#tour-button').querySelector('span').textContent='暂停漫游';tourTimer=setInterval(()=>{if(current===7){stopTour();toast('长卷已走到今天。可再次选择任意年代。');return;}scene.setLineage('off');scene.goTo(current+1);},7500);}
function openEvidence(){const event=events[current];$('#evidence-content').innerHTML=`<p class="dialog-kicker">${esc(event.tag)} / ${esc(event.era)}</p><h2 id="evidence-title">${esc(event.title)}</h2>${event.detail.map(p=>`<p>${esc(p)}</p>`).join('')}<div class="discovery"><small>可以这样观察</small><p>${esc(event.discovery)}</p></div><h3>史料来源</h3>${event.sources.map(s=>`<div class="source-item"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><span>${esc(new URL(s.url).hostname)}</span></div>`).join('')}`;$('#evidence-dialog').showModal();stopTour();}
$('#time-slider').addEventListener('pointerdown',()=>{scrubbing=true;stopTour();});
$('#time-slider').addEventListener('pointercancel',()=>{scrubbing=false;scene?.goTo(Math.round(Number($('#time-slider').value)/1000));});
$('#time-slider').addEventListener('input',e=>{stopTour();const p=Number(e.target.value)/1000;$('#time-track-progress').style.width=(p/7*100)+'%';setMode('journey');if(scene)scene.setProgress(p);else{renderEvent(Math.round(p));updateProgress(p);}});
window.addEventListener('pointerup',()=>{if(scrubbing){const i=Math.round(Number($('#time-slider').value)/1000);scrubbing=false;scene?.goTo(i);renderEvent(i);updateProgress(i);}});
$('#time-slider').addEventListener('change',e=>{const i=Math.round(Number(e.target.value)/1000);scrubbing=false;scene?.goTo(i);renderEvent(i);updateProgress(i);});
document.querySelectorAll('[data-era]').forEach(b=>b.addEventListener('click',()=>goTo(Number(b.dataset.era))));
$('#previous-event').addEventListener('click',()=>goTo(current-1));$('#next-event').addEventListener('click',()=>goTo(current+1));$('#brand-home').addEventListener('click',()=>goTo(1));
$('#overview-button').addEventListener('click',()=>{stopTour();if(mode==='overview')goTo(current);else{scene?.overview();setMode('overview');}});$('#leave-overview').addEventListener('click',()=>goTo(current));
$('#tour-button').addEventListener('click',startTour);$('#reset-camera').addEventListener('click',()=>{stopTour();scene?.resetView();setMode('journey');});$('#leave-inspect').addEventListener('click',()=>scene?.leaveInspect());
$('#evidence-button').addEventListener('click',openEvidence);$('#read-history-button').addEventListener('click',openEvidence);$('#retry-button').addEventListener('click',()=>location.reload());
for(const id of ['about-button','credits-button'])$('#'+id).addEventListener('click',()=>{stopTour();$('#about-dialog').showModal();});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||(e.target?.tagName==='INPUT'&&e.target.id!=='time-slider'))return;if(e.key==='Escape'&&mode==='inspect'){scene?.leaveInspect();return;}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();goTo(current+(e.key==='ArrowRight'?1:-1));}else if(e.key==='Home'){e.preventDefault();goTo(0);}else if(e.key==='End'){e.preventDefault();goTo(7);}});
$('#history-canvas').addEventListener('pointerdown',stopTour);$('#history-canvas').addEventListener('wheel',stopTour,{passive:true});
renderEvent(1,true);updateProgress(1);setMode('journey');
try{
  const {initHistoryScene}=await import('./history-scene.js');
  scene=await initHistoryScene({canvas:$('#history-canvas'),events,onChange(index,p,nextMode){renderEvent(index);updateProgress(p);setMode(nextMode);},onInspectChange(active,label){setMode(active?'inspect':'journey');$('#inspection-label').textContent=label||'器物近看';},onPerson(person){showLineage(person);},onLoadProgress(state){$('#loading-progress').style.width=Math.round(state.progress*100)+'%';$('#loading-label').textContent=state.label||`载入场景 ${state.loaded} / ${state.total}`;},onReady(){}});
  $('#loading-progress').style.width='100%';$('#loading-screen').hidden=true;document.body.dataset.scene='ready';scene.goTo(current,{immediate:true});
}catch(error){console.error('History scene could not load',error);$('#loading-screen').hidden=true;$('#error-screen').hidden=false;document.body.dataset.scene='error';}
window.addEventListener('pagehide',()=>{stopTour();scene?.dispose();},{once:true});
