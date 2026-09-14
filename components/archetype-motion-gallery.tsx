"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ReportLocale } from "@/lib/report-i18n";
import { archetypeMotion, archetypePosterPath, archetypeVideoPath } from "@/lib/archetype-motion";
import ArchetypeMotionPlayer from "./archetype-motion-player";
import styles from "./archetype-motion.module.css";

const copy={
 en:{eyebrow:"THE COLLECTION IN MOTION",title:"A little closer.\nA little more alive.",body:"Morning light, a quiet galaxy, a spark of fire. Step into five moving portraits from the collection—and find the character behind your own birthday.",hint:"Choose a scene",action:"Find my free character",play:"Play animation",pause:"Pause animation"},
 zh:{eyebrow:"让意象，鲜活起来",title:"走近一点，\n看见它的生命力。",body:"晨光里的玉兔，星河下的灵牛，火焰中的神猿。走进五幅会动的意象，再从生日出发，找到属于自己的那一张。",hint:"选择一段意象",action:"免费寻找我的意象",play:"播放动画",pause:"暂停动画"},
 ru:{eyebrow:"КОЛЛЕКЦИЯ В ДВИЖЕНИИ",title:"Чуть ближе.\nЧуть больше жизни.",body:"Утренний свет, тихая галактика, вспышка огня. Откройте пять живых образов коллекции и найдите свой по дню рождения.",hint:"Выберите образ",action:"Найти мой образ бесплатно",play:"Включить анимацию",pause:"Приостановить анимацию"},
};
export default function ArchetypeMotionGallery({locale}:{locale:ReportLocale}) {
 const lang=locale==="ru"?"ru":locale==="en"?"en":"zh";
 const text=copy[lang];const [selected,setSelected]=useState(0);const item=archetypeMotion[selected];
 return <section id="motion" className={styles.gallery} aria-labelledby="motion-title">
   <div className="white-container">
     <div className={styles.stage}>
       <img className={styles.ambience} src={archetypePosterPath(item.slug)} alt="" aria-hidden="true" loading="lazy" width={720} height={960}/>
       <div className={styles.intro}><p className={styles.eyebrow}><Sparkles size={14}/>{text.eyebrow}</p><h2 id="motion-title">{text.title}</h2><p className={styles.body}>{text.body}</p><a className={styles.action} href={locale==="en"?"/discover":`/discover?locale=${locale}`}>{text.action}<ArrowRight size={16}/></a></div>
       <div className={styles.showcase} data-landscape={item.landscape}>
         <ArchetypeMotionPlayer key={item.slug} src={archetypeVideoPath(item.slug)} poster={archetypePosterPath(item.slug)} label={item.name[lang]} playLabel={text.play} pauseLabel={text.pause}/>
         <p className={styles.caption} aria-live="polite">{item.name[lang]}</p>
       </div>
     </div>
     <div className={styles.selector} role="group" aria-label={text.hint}>{archetypeMotion.map((clip,i)=><button key={clip.slug} type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}><img src={archetypePosterPath(clip.slug)} alt="" loading="lazy" width={72} height={96}/><span>{clip.name[lang]}</span><span className={styles.index}>0{i+1}</span></button>)}</div>
   </div>
 </section>;
}
