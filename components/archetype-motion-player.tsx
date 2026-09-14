"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./archetype-motion.module.css";

type Props = { src: string; poster: string; label: string; playLabel: string; pauseLabel: string; className?: string; };

/** Loads only near the viewport. Reduced motion and data saver start as a still image. */
export default function ArchetypeMotionPlayer({src,poster,label,playLabel,pauseLabel,className=""}:Props) {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible,setVisible] = useState(false);
  const [requested,setRequested] = useState(false);
  const [enabled,setEnabled] = useState(false);
  const [ready,setReady] = useState(false);
  const [playing,setPlaying] = useState(false);
  const [failed,setFailed] = useState(false);
  useEffect(()=>{
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
    const update=()=>setEnabled(!preference.matches && !connection?.saveData);
    update(); preference.addEventListener("change",update);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:"80px"});
    if(container.current)observer.observe(container.current);
    return ()=>{observer.disconnect();preference.removeEventListener("change",update);};
  },[]);
  const load = requested || (enabled && visible);
  useEffect(()=>{
    const element=video.current;
    if(!element)return;
    const sync=()=>{
      if(load && enabled && visible && !document.hidden)void element.play().catch(()=>setPlaying(false));
      else element.pause();
    };
    sync(); document.addEventListener("visibilitychange",sync);
    return ()=>document.removeEventListener("visibilitychange",sync);
  },[enabled,visible,load,failed,requested]);
  function toggle(){
    if(playing){setRequested(true);setEnabled(false);video.current?.pause();}
    else {setFailed(false);setRequested(true);setEnabled(true);void video.current?.play().catch(()=>setPlaying(false));}
  }
  return <div ref={container} className={`${styles.player} ${className}`}>
    <img className={styles.poster} src={poster} alt={label} loading="lazy" width={720} height={960}/>
    {load && !failed && <video ref={video} className={styles.video} data-ready={ready} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label} onPlaying={()=>{setReady(true);setPlaying(true);}} onPause={()=>setPlaying(false)} onError={()=>{setFailed(true);setReady(false);setPlaying(false);}}/>}
    <button className={styles.playback} type="button" onClick={toggle} aria-label={playing?pauseLabel:playLabel} title={playing?pauseLabel:playLabel}>{playing?<Pause size={14}/>:<Play size={14}/>}</button>
  </div>;
}
