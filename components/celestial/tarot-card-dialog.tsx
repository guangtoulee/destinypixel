"use client";
import { useEffect, useId, useRef } from "react";
import { ArrowDown, X } from "lucide-react";
import type { CardInfo } from "@/lib/celestial/tarot-meanings";
import type { CelestialCopy } from "@/lib/celestial/copy";

export function TarotCardDialog({ card, reversed, position, copy: c, onClose, onDetailed }: {
  card: CardInfo | null;
  reversed: boolean;
  position: string;
  copy: CelestialCopy;
  onClose: () => void;
  onDetailed?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null), title = useId(), description = useId();
  const open = Boolean(card);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open) ref.current?.close();
  }, [open]);
  return <dialog ref={ref} className="tarot-card-dialog" aria-labelledby={title} aria-describedby={description} onCancel={onClose} onClose={onClose}>
    <button className="tarot-dialog-close" type="button" aria-label={c.closeCard} onClick={onClose} autoFocus><X size={20}/></button>
    {card && <>
      <div className="tarot-dialog-head">
        <img src={card.image} alt={card.name} width={560} height={960} style={{transform: reversed ? "rotate(180deg)" : undefined}}/>
        <div><p className="cel-kicker">{position}</p><h2 id={title}>{card.name}</h2><span className="tarot-orientation">{reversed ? c.reversed : c.upright}</span></div>
      </div>
      <div className="tarot-dialog-meaning"><h3>{c.cardMeaning}</h3><p id={description}>{reversed ? card.reversed : card.upright}</p></div>
      {onDetailed && <button type="button" className="cel-button tarot-dialog-detail" onClick={() => {onClose(); requestAnimationFrame(onDetailed);}}>{c.detailCta}<ArrowDown size={17}/></button>}
    </>}
  </dialog>;
}
