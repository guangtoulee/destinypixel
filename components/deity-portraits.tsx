import Image from "next/image";
import "./shrine-art.css";

const portraits = {
  guanyin: "/shrine/guanyin-20260917.webp",
  wuye: "/shrine/wuye-20260917.webp",
  "wen-caishen": "/shrine/wen-caishen-20260917.webp",
  "wu-caishen": "/shrine/wu-caishen-20260917.webp",
  mazu: "/shrine/mazu-20260917.webp",
} as const;

type DeityPortraitProps = { deityKey: string; active?: boolean; ritual?: boolean };

export function DeityPortrait({ deityKey, active = false, ritual = false }: DeityPortraitProps) {
  const key = (Object.hasOwn(portraits, deityKey) ? deityKey : "guanyin") as keyof typeof portraits;
  return (
    <div className={`deity-portrait deity-portrait--art deity-portrait--${key}${ritual ? " deity-portrait--ritual" : ""}`} data-active={active || ritual} aria-hidden="true">
      <Image key={key} src={portraits[key]} width={960} height={1280} alt="" sizes={ritual ? "(max-width:480px) 65vw, 300px" : "(max-width:760px) 82vw, 420px"} loading={ritual ? "eager" : "lazy"} className="deity-portrait__art" />
      <div className="deity-portrait__incense"><i /><i /><span /></div>
    </div>
  );
}
