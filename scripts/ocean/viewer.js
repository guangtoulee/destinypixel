import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
let renderer,scene,camera,controls,model,box,center,size,savedMaterials=new Map(),loading=false,loaded=false,view='axis',materialStyle='native';
const $=id=>document.getElementById(id);
function status(title,message){$('model-status').hidden=false;$('model-status').innerHTML='';const strong=document.createElement('strong'),p=document.createElement('p');strong.textContent=title;p.textContent=message;$('model-status').append(strong,p);}
function render(){if(renderer&&scene&&camera){renderer.render(scene,camera);if(window.OceanModelDiagnostics)window.OceanModelDiagnostics.camera={position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),zoom:camera.zoom,target:controls?.target.toArray()};}}
function resize(){if(!renderer||!camera)return;const stage=$('model-stage');const w=Math.max(stage.clientWidth,1),h=Math.max(stage.clientHeight,1);renderer.setSize(w,h,false);if(camera.isOrthographicCamera&&box)fitCamera(view,false);else{camera.aspect=w/h;camera.updateProjectionMatrix();render();}}
function getPrefix(o){const name=String(o.userData?.collection||o.userData?.source_collection||o.name||'');return /^(04|05|07)[_ ]/.exec(name)?.[1];}
function setLayers(){if(!model)return;const state={};document.querySelectorAll('[data-model-layer]').forEach(i=>state[i.dataset.modelLayer]=i.checked);model.traverse(o=>{const p=getPrefix(o);if(p)o.visible=state[p];});render();}
function applyMaterial(style){materialStyle=style;if(!model)return;model.traverse(o=>{if(!o.isMesh)return;if(style==='white'){if(!savedMaterials.has(o))savedMaterials.set(o,o.material);o.material=whiteMaterial;}else if(savedMaterials.has(o))o.material=savedMaterials.get(o);});render();}
const whiteMaterial=new THREE.MeshStandardMaterial({color:0xe0e1df,roughness:.83,metalness:0});
function fitCamera(type){if(!box)return;const preset=window.OceanModelConfig?.views?.find(v=>v.id===type);if(preset?.position&&preset?.target){fitPreset(preset);return;}const stage=$('model-stage'),aspect=Math.max(stage.clientWidth,1)/Math.max(stage.clientHeight,1);const radius=size.length()/2;const near=Math.max(radius/10000,.005),far=Math.max(radius*100,100);
 if(type==='perspective'){camera=new THREE.PerspectiveCamera(43,aspect,near,far);camera.up.set(0,1,0);camera.position.copy(center).add(new THREE.Vector3(.95,1.05,1.2).normalize().multiplyScalar(radius/Math.sin(THREE.MathUtils.degToRad(43/2))*1.12));camera.lookAt(center);}
 else{camera=new THREE.OrthographicCamera(-1,1,1,-1,near,far);const direction=type==='plan'?new THREE.Vector3(0,1,0):new THREE.Vector3(.95,1.02,1.13).normalize();camera.up.set(0,type==='plan'?0:1,type==='plan'?-1:0);camera.position.copy(center).add(direction.multiplyScalar(radius*3));camera.lookAt(center);camera.updateMatrixWorld(true);let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}const height=Math.max(maxY-minY,(maxX-minX)/aspect)*1.15;camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();}
 finishCamera(type,center,radius);}
function finishCamera(type,target,radius){controls?.dispose();controls=new OrbitControls(camera,$('model-canvas'));controls.target.copy(target);controls.enableDamping=false;controls.minDistance=Math.max(radius*.003,.02);controls.maxDistance=radius*10;controls.minZoom=.25;controls.maxZoom=25;controls.addEventListener('change',render);controls.update();view=type;document.querySelectorAll('[data-model-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modelView===type)));$('model-view-caption').textContent=window.OceanModelConfig?.views?.find(v=>v.id===type)?.label||'全馆剖透';$('model-stage').dataset.activeView=type;render();}
function fitPreset(preset){const aspect=Math.max($('model-stage').clientWidth,1)/Math.max($('model-stage').clientHeight,1),radius=size.length()/2;const position=new THREE.Vector3(...preset.position),target=new THREE.Vector3(...preset.target);camera=new THREE.PerspectiveCamera(preset.fov||THREE.MathUtils.radToDeg(2*Math.atan(36/(2*(preset.lens||24)))),aspect,.01,Math.max(radius*100,100));camera.position.copy(position);camera.up.set(0,1,0);camera.lookAt(target);camera.updateProjectionMatrix();finishCamera(preset.id,target,radius);}
function initRenderer(){if(renderer)return;renderer=new THREE.WebGLRenderer({canvas:$('model-canvas'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;scene=new THREE.Scene();scene.background=new THREE.Color(0xe3e9eb);scene.add(new THREE.HemisphereLight(0xeef5ff,0x737f83,2.7));const key=new THREE.DirectionalLight(0xfff4e0,3.2);key.position.set(30,55,40);scene.add(key);const fill=new THREE.DirectionalLight(0xddeeff,1.8);fill.position.set(-35,25,-25);scene.add(fill);camera=new THREE.PerspectiveCamera(43,1,.01,1000);new ResizeObserver(resize).observe($('model-stage'));document.querySelectorAll('[data-model-layer]').forEach(i=>i.addEventListener('change',setLayers));document.querySelectorAll('[data-model-view]').forEach(b=>b.onclick=()=>{if(loaded)fitCamera(b.dataset.modelView);});document.querySelectorAll('[data-model-material]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-model-material]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));applyMaterial(b.dataset.modelMaterial);});$('model-reset').onclick=()=>{if(loaded)fitCamera('axis');};$('model-fullscreen').onclick=()=>{const stage=$('model-stage');(stage.requestFullscreen||stage.webkitRequestFullscreen)?.call(stage);};$('model-retry').onclick=()=>{window.cancelOceanModelLoad();window.startOceanModel();};resize();}
let modelLoadGeneration=0,modelRetryTimer=null,modelLoadManager=null;
window.cancelOceanModelLoad=()=>{
 if(!loading&&modelRetryTimer===null)return;
 modelLoadGeneration+=1;clearTimeout(modelRetryTimer);modelRetryTimer=null;
 modelLoadManager?.abort();modelLoadManager=null;loading=false;
 $('model-stage').dataset.modelState='idle';
};
window.startOceanModel=()=>{
 if(location.protocol==='file:'||loading)return;
 if(loaded){resize();return;}
 try{initRenderer();}catch{status('当前浏览器无法打开3D','可继续查看轴测与正投图片，或换一个支持WebGL的浏览器。');return;}
 loading=true;status('正在载入本版模型','模型包含完整几何和中文墙面图文，请稍候。');
 $('model-retry').hidden=true;$('model-progress').hidden=false;
 const path=window.OceanModelConfig?.path||'/ocean/media/museum.glb';
 const generation=++modelLoadGeneration,manager=new THREE.LoadingManager();modelLoadManager=manager;
 const current=()=>generation===modelLoadGeneration&&loading&&path===(window.OceanModelConfig?.path||'/ocean/media/museum.glb');
 function load(attempt){
  if(!current())return;
  $('model-stage').dataset.modelAttempts=String(attempt+1);
  $('model-stage').dataset.modelState=attempt?'retrying':'loading';
  $('model-progress').firstElementChild.style.width='1%';
  const url=new URL(path,location.href);if(attempt)url.searchParams.set('ocean-retry',String(attempt));
  new GLTFLoader(manager).load(url.href,gltf=>{
   if(!current())return;
   model=gltf.scene;scene.add(model);box=new THREE.Box3().setFromObject(model);center=box.getCenter(new THREE.Vector3());size=box.getSize(new THREE.Vector3());
   if(box.isEmpty()){status('未读到模型几何','请使用完整GLB模型文件。');loading=false;modelLoadManager=null;$('model-progress').hidden=true;$('model-retry').hidden=false;return;}
   let meshes=0;model.traverse(o=>{if(o.isMesh)meshes++;});
   $('model-stage').dataset.modelState='ready';window.OceanModelDiagnostics={meshCount:meshes,loadAttempts:attempt+1,bounds:{min:box.min.toArray(),max:box.max.toArray()}};
   $('model-stage').dataset.meshCount=String(meshes);$('model-stage').dataset.dynamicBounds=JSON.stringify({min:box.min.toArray(),max:box.max.toArray()});
   if(attempt&&window.OceanNetworkDiagnostics)window.OceanNetworkDiagnostics.modelRecoveries+=1;
   loaded=true;loading=false;modelLoadManager=null;setLayers();applyMaterial(materialStyle);fitCamera('axis');$('model-progress').hidden=true;$('model-status').hidden=true;
  },event=>{if(current()&&event.lengthComputable)$('model-progress').firstElementChild.style.width=Math.max(1,Math.round(event.loaded/event.total*100))+'%';},()=>{
   if(!current())return;
   if(window.OceanNetworkDiagnostics)window.OceanNetworkDiagnostics.modelFailures+=1;
   if(attempt<2){
    modelRetryTimer=setTimeout(()=>{
     modelRetryTimer=null;
     if(!current())return;
     if(!$('model-panel').classList.contains('active')){window.cancelOceanModelLoad();return;}
     load(attempt+1);
    },(attempt+1)*500);
    return;
   }
   loading=false;modelLoadManager=null;$('model-stage').dataset.modelState='unavailable';$('model-progress').hidden=true;$('model-retry').hidden=false;
   status('模型暂时无法打开','图片审阅不受影响。请检查网络后点击“重新载入”。');
  });
 }
 load(0);
};
window.addEventListener('ocean-ready',()=>{if(document.getElementById('model-panel')?.classList.contains('active'))window.startOceanModel();});
