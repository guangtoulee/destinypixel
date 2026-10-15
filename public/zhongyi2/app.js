import { exhibits, timeline, sources } from './content.js';

const $ = (s) => document.querySelector(s);
const storageKey = 'yanzhao-study-v1';
let completed = new Set();
try { const saved=JSON.parse(localStorage.getItem(storageKey)||'[]'); if(Array.isArray(saved)) completed=new Set(saved.filter(id=>exhibits.some(e=>e.id===id))); } catch {}
let scene=null, activeExhibit=null, previousFocus=null, toastTimer;
const characters={book:'卷',cabinet:'本',print:'印',lamp:'传'};
const labels={book:'读书',cabinet:'识物',print:'刊印',lamp:'传承'};
const escapeHTML = (str) => String(str).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

$('#timeline').innerHTML=timeline.map(item=>`<article class="timeline-item"><span class="stage">${item.stage}</span><span class="person">${escapeHTML(item.person)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.text)}</p></article>`).join('');
$('#source-list').innerHTML=sources.map(source=>`<article class="source-entry"><a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} ↗</a><p>${escapeHTML(source.note)}</p></article>`).join('');

function toast(message){ clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500); }
function saveProgress(){try{localStorage.setItem(storageKey,JSON.stringify([...completed]));}catch{} updateProgress();}
function updateProgress(){
  $('#header-count').textContent=completed.size;
  $('#study-progress-text').textContent=`已收集 ${completed.size} / 4 枚印记`;
  $('#study-progress-fill').style.width=`${completed.size*25}%`;
  $('#study-button').innerHTML=completed.size===4?'查看旅行纪念卡 <span>→</span>':`${completed.size?'继续书斋寻迹':'领取第一枚印记'} <span>→</span>`;
  document.querySelectorAll('[data-exhibit]').forEach(button=>{const done=completed.has(button.dataset.exhibit);button.classList.toggle('complete',done);if(button.closest('.hotspots'))button.querySelector('span').textContent=done?'✓':'↗';button.setAttribute('aria-label',`${labels[button.dataset.exhibit]}${done?'，已获印记':''}`);});
}
function syncScrollLock(){document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]')||$('#scene-wrap').classList.contains('immersive'));}
function openDialog(dialog){previousFocus=document.activeElement;if(!dialog.open)dialog.showModal();syncScrollLock();}
function closeDialog(dialog){dialog.close();syncScrollLock();previousFocus?.focus();}
function firstRemaining(){return exhibits.find(e=>!completed.has(e.id))?.id;}
function openExhibit(id){
  const item=exhibits.find(e=>e.id===id);if(!item)return;activeExhibit=id;
  if($('#notebook-dialog').open)closeDialog($('#notebook-dialog'));
  scene?.focus(id);
  const earned=completed.has(id);
  $('#exhibit-content').innerHTML=`<div class="exhibit-head" data-character="${characters[id]}"><p class="eyebrow">${escapeHTML(item.kicker)}</p><h2 id="exhibit-title">${escapeHTML(item.title)}</h2></div><div class="exhibit-body">${item.description.map(p=>`<p>${escapeHTML(p)}</p>`).join('')}<ul class="fact-list">${item.facts.map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul><div class="quiz-title">${earned?'印记已收集 · 可以再次温习':'书斋小问 · 答对即可集章'}</div><p class="quiz-prompt">${escapeHTML(item.question.prompt)}</p><div class="quiz-options">${item.question.options.map((o,i)=>`<button class="quiz-option" data-option="${i}"><span>${String.fromCharCode(65+i)}</span>${escapeHTML(o)}</button>`).join('')}</div><p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p><div class="exhibit-footer"><a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.sourceTitle)} ↗</a><button class="primary-button" id="next-exhibit">${earned?'继续探索':'稍后再答'} <span>→</span></button></div></div>`;
  $('#next-exhibit').addEventListener('click',()=>{closeDialog($('#exhibit-dialog'));const next=firstRemaining();if(next&&next!==id)openExhibit(next);else if(completed.size===4)openNotebook();});
  document.querySelectorAll('[data-option]').forEach(button=>button.addEventListener('click',()=>answerQuestion(item,Number(button.dataset.option),button)));
  if(id==='print')installPrintPuzzle(item);
  const inspectButton=document.createElement('button');inspectButton.className='inspect-button';inspectButton.textContent='在书斋中近看此物 ↗';inspectButton.addEventListener('click',()=>{closeDialog($('#exhibit-dialog'));$('#museum').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});toast('拖动旋转观察，点击探索点可继续研学');});$('#exhibit-content .exhibit-head').appendChild(inspectButton);
  openDialog($('#exhibit-dialog'));
}
function installPrintPuzzle(item){
  const options=$('.quiz-options');const prompt=$('.quiz-prompt');prompt.textContent='让一本书抵达读者，先后需要经历什么？';
  const stages=[{id:2,text:'刊行流通'},{id:0,text:'作者著述'},{id:3,text:'读者研读'},{id:1,text:'整理校订'}];let selected=[];
  options.innerHTML='<div class="puzzle-track" id="puzzle-track" aria-live="polite"><span>按先后顺序，依次点选四张卡片</span></div><div class="puzzle-choices">'+stages.map(s=>`<button class="puzzle-choice" data-stage="${s.id}">${s.text}<span>＋</span></button>`).join('')+'</div><button class="text-button puzzle-reset" id="puzzle-reset">重新排列 ↺</button>';
  const draw=()=>{$('#puzzle-track').innerHTML=selected.length?selected.map((id,i)=>`<span class="selected-stage"><b>${i+1}</b>${stages.find(s=>s.id===id).text}</span>`).join('<i>→</i>'):'<span>按先后顺序，依次点选四张卡片</span>';};
  document.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>{selected.push(Number(button.dataset.stage));button.disabled=true;draw();if(selected.length===4){if(selected.every((id,i)=>id===i)){answerQuestion(item,item.question.correctIndex,button);$('#quiz-feedback').textContent='从著述到整理校订，再到刊行流通、读者研读，你让这部书继续旅行。这里呈现的是传播概念的简化顺序。';}else{$('#quiz-feedback').textContent='有两步似乎走在了前面。先有作者写下文字，接下来呢？可以重新排列。';$('#quiz-feedback').className='quiz-feedback';}}}));
  $('#puzzle-reset').addEventListener('click',()=>{selected=[];draw();document.querySelectorAll('[data-stage]').forEach(b=>{b.disabled=false;b.classList.remove('correct');});$('#quiz-feedback').textContent='';});
}
function answerQuestion(item,index,button){
  const feedback=$('#quiz-feedback');
  document.querySelectorAll('.quiz-option').forEach(b=>b.classList.remove('wrong','correct'));
  if(index!==item.question.correctIndex){button.classList.add('wrong');feedback.className='quiz-feedback';feedback.textContent='再想一想，线索就在上面的讲解里。';return;}
  button.classList.add('correct');feedback.className='quiz-feedback success';feedback.textContent=item.question.explanation;
  const newlyEarned=!completed.has(item.id);completed.add(item.id);saveProgress();
  $('#next-exhibit').innerHTML=completed.size===4?'查看研学册 <span>→</span>':'前往下一站 <span>→</span>';
  if(newlyEarned)toast(`「${labels[item.id]}」印记已收入研学册 · ${completed.size} / 4`);
}
function openNotebook(){
  $('#notebook-summary').textContent=completed.size===4?'你已完成四站探索。让这一页，留下今天的发现。':`你已收集 ${completed.size} 枚印记。还有 ${4-completed.size} 个故事，等你走近。`;
  $('#stamp-grid').innerHTML=exhibits.map(item=>`<button class="stamp ${completed.has(item.id)?'earned':''}" data-stamp="${item.id}"><span>${characters[item.id]}</span><small>${labels[item.id]} · ${completed.has(item.id)?'已收集':'待探索'}</small></button>`).join('');
  $('#notebook-actions').innerHTML=completed.size===4?'<p class="completion-copy">一部书的旅行，也有了你的足迹。</p><button class="primary-button" id="download-card">保存旅行纪念卡 <span>↓</span></button><button class="text-button" id="reset-progress">重新开始</button>':'<button class="primary-button" id="continue-study">继续探索 <span>→</span></button>';
  document.querySelectorAll('[data-stamp]').forEach(b=>b.addEventListener('click',()=>openExhibit(b.dataset.stamp)));
  $('#continue-study')?.addEventListener('click',()=>openExhibit(firstRemaining()));
  $('#download-card')?.addEventListener('click',downloadCard);
  $('#reset-progress')?.addEventListener('click',()=>{completed.clear();saveProgress();openNotebook();toast('新的书斋旅行，开始了。');});
  openDialog($('#notebook-dialog'));
}
async function downloadCard(){
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f4f0e6';ctx.fillRect(0,0,1200,1600);ctx.strokeStyle='#c7bfa8';ctx.lineWidth=2;ctx.strokeRect(55,55,1090,1490);ctx.strokeRect(69,69,1062,1462);
  ctx.fillStyle='#a03d2c';ctx.fillRect(100,105,78,78);ctx.fillStyle='#f4f0e6';ctx.font='52px "Songti SC",serif';ctx.fillText('医',113,164);
  ctx.fillStyle='#293c32';ctx.font='32px "Songti SC",serif';ctx.fillText('燕赵医脉',204,145);ctx.font='15px sans-serif';ctx.fillStyle='#8b8d76';ctx.fillText('YANZHAO MEDICAL HERITAGE',204,175);
  ctx.textAlign='center';ctx.font='25px sans-serif';ctx.fillText('书 斋 旅 行 纪 念',600,330);ctx.fillStyle='#293c32';ctx.font='90px "Songti SC",serif';ctx.fillText('一部书的旅行',600,480);ctx.fillStyle='#a03d2c';ctx.font='36px "Songti SC",serif';ctx.fillText('书页有尽，传承无尽。',600,570);
  ctx.strokeStyle='#c7bfa8';ctx.beginPath();ctx.moveTo(180,660);ctx.lineTo(1020,660);ctx.stroke();ctx.fillStyle='#7b806c';ctx.font='25px sans-serif';ctx.fillText('我已完成四站探索，集齐四枚印记',600,740);
  exhibits.forEach((item,i)=>{const x=370+(i%2)*460,y=900+Math.floor(i/2)*260;ctx.save();ctx.translate(x,y);ctx.rotate((i%2===0?-4:4)*Math.PI/180);ctx.strokeStyle='#a03d2c';ctx.lineWidth=4;ctx.strokeRect(-63,-63,126,126);ctx.lineWidth=1;ctx.strokeRect(-56,-56,112,112);ctx.fillStyle='#a03d2c';ctx.font='75px "Songti SC",serif';ctx.fillText(characters[item.id],0,25);ctx.restore();ctx.font='24px "Songti SC",serif';ctx.fillStyle='#5c6c54';ctx.fillText(labels[item.id],x,y+110);});
  const date=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric'}).format(new Date());ctx.fillStyle='#8b8d76';ctx.font='21px sans-serif';ctx.fillText(date+' · 云上相逢',600,1410);ctx.font='17px sans-serif';ctx.fillText('石家庄中医云博物馆 · 交互概念样板',600,1460);
  canvas.toBlob(blob=>{if(!blob){toast('暂时无法生成图片，请稍后重试');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='燕赵医脉-书斋旅行纪念卡.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('旅行纪念卡已生成');},'image/png');
}
document.querySelectorAll('[data-exhibit]').forEach(b=>b.addEventListener('click',()=>openExhibit(b.dataset.exhibit)));
$('#explore-button').addEventListener('click',()=>openExhibit(firstRemaining()||'book'));
$('#start-task').addEventListener('click',()=>completed.size===4?openNotebook():openExhibit(firstRemaining()));
$('#study-button').addEventListener('click',()=>completed.size===4?openNotebook():openExhibit(firstRemaining()));
$('#notebook-button').addEventListener('click',openNotebook);
$('#close-exhibit').addEventListener('click',()=>closeDialog($('#exhibit-dialog')));
$('#close-notebook').addEventListener('click',()=>closeDialog($('#notebook-dialog')));
$('#close-about').addEventListener('click',()=>closeDialog($('#about-dialog')));
for(const id of ['about-button','sources-button'])$('#'+id).addEventListener('click',()=>openDialog($('#about-dialog')));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);}});dialog.addEventListener('close',syncScrollLock);});
$('#reset-view').addEventListener('click',()=>scene?.reset());
function toggleExpand(forceClose=false){const expanded=forceClose?false:!$('#scene-wrap').classList.contains('immersive');$('#scene-wrap').classList.toggle('immersive',expanded);$('#expand-view').textContent=expanded?'×':'⛶';$('#expand-view').setAttribute('aria-label',expanded?'返回页面':'放大展厅');syncScrollLock();window.dispatchEvent(new Event('resize'));}
$('#expand-view').addEventListener('click',()=>toggleExpand());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&$('#scene-wrap').classList.contains('immersive'))toggleExpand(true);});
updateProgress();
try{
  const {initScene}=await import('./scene.js');
  scene=initScene({canvas:$('#museum-canvas'),onSelect:openExhibit,onReady:()=>{$('#scene-loading').hidden=true;document.body.dataset.scene='ready';}});
}catch(error){console.error('3D scene unavailable:',error);$('#scene-loading').hidden=true;$('#scene-fallback').hidden=false;$('#scene-tip').textContent='点击下方探索点，开始研学';document.body.dataset.scene='fallback';}
