// Source Blender procedural wood has no glTF BaseColor fallback. These linear
// RGB values are the exact source material inputs in build_mother_ship.py.
// This display adapter preserves frozen GLB bytes; it does not bake wood grain.
const sourceWood={
 'C_WOOD_外板深栗木':[.21,.075,.026],
 'C_WOOD_肋骨樟木':[.43,.23,.09],
 'C_WOOD_甲板蜂蜜木':[.54,.34,.14],
 'C_WOOD_水密隔舱壁':[.27,.14,.05],
 'C_WOOD_龙骨深木':[.13,.055,.02],
};
export function applyCSourceMaterialFallback(root){
 const visited=new Set();let adjusted=0;
 root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(visited.has(m))continue;visited.add(m);const rgb=sourceWood[Object.keys(sourceWood).find(name=>m.name===name||m.name.startsWith(name+'_'))];
  if(rgb&&!m.map&&m.color&&Math.min(m.color.r,m.color.g,m.color.b)>.999){m.color.setRGB(...rgb);m.userData.sourceMaterialDisplayFallback=true;m.needsUpdate=true;adjusted++;}
 }});return adjusted;
}
