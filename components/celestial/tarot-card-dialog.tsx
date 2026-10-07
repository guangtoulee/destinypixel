"use client";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { ArrowDown, X } from "lucide-react";
import { artworkEditionsForCard } from "@/lib/celestial/tarot-decks";
import type { ReportLocale } from "@/lib/report-i18n";
import type { CardInfo } from "@/lib/celestial/tarot-meanings";
import type { CelestialCopy } from "@/lib/celestial/copy";

export function TarotCardDialog({ card, reversed, position, locale, copy: c, onClose, onDetailed }: {
  card: CardInfo | null;
  locale: ReportLocale;
  reversed: boolean;
  position: string;
  copy: CelestialCopy;
  onClose: () => void;
  onDetailed?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null), title = useId(), description = useId();
  const [art, setArt] = useState(false);
  const [artworkId, setArtworkId] = useState<string | null>(null);
  const versions = card ? artworkEditionsForCard(card.id) : [];
  const viewedEdition = versions.find(edition => edition.id === artworkId) || versions.find(edition => card && edition.faces[card.id] === card.image) || versions[0];
  const viewedImage = card && (viewedEdition?.faces[card.id] || card.image);
  const afterClose = useRef<(() => void) | null>(null);
  const open = Boolean(card);
  const closed = useEffectEvent(() => {
    setArt(false);
    setArtworkId(null);
    onClose();
    const action = afterClose.current;
    afterClose.current = null;
    if (action) requestAnimationFrame(action);
  });
  useEffect(() => {
    if (!open) return;
    const marker = `tarot-card-${Date.now()}`;
    window.history.pushState({...window.history.state, tarotCard: marker}, "");
    const back = () => { if (window.history.state?.tarotCard !== marker) closed(); };
    window.addEventListener("popstate", back);
    return () => {
      window.removeEventListener("popstate", back);
      if (window.history.state?.tarotCard === marker) window.history.back();
    };
  }, [open]);
  function close() {
    if (window.history.state?.tarotCard) window.history.back();
    else { setArt(false); onClose(); }
  }
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open) ref.current?.close();
  }, [open]);
  return <dialog ref={ref} className="tarot-card-dialog" aria-labelledby={title} aria-describedby={description} onCancel={e => { e.preventDefault(); close(); }}>
    <button className="tarot-dialog-close" type="button" aria-label={c.closeCard} onClick={close} autoFocus><X size={20}/></button>
    {card && <>
      <div className="tarot-dialog-head">
        <img src={viewedImage || card.image} alt={card.name} width={560} height={960} style={{transform: reversed ? "rotate(180deg)" : undefined}}/>
        <div><p className="cel-kicker">{position}</p><h2 id={title}>{card.name}</h2><span className="tarot-orientation">{reversed ? c.reversed : c.upright}</span></div>
      </div>
      <div className="tarot-dialog-tabs" role="group" aria-label={c.viewCard}>
        <button type="button" aria-pressed={!art} onClick={() => setArt(false)}>{c.cardMeaning}</button>
        <button type="button" aria-pressed={art} onClick={() => setArt(true)}>{c.cardArt}</button>
      </div>
      {viewedEdition && <details className="tarot-art-versions" key={card.id}>
        <summary><strong>{c.artVersions}</strong><span>{viewedEdition.name[locale]}</span></summary>
        <p>{c.artVersionHint}</p>
        {versions.length === 1 ? <p className="tarot-only-edition">{c.onlyArtVersion}</p> :
          <div className="tarot-art-version-options" role="group" aria-label={c.viewVersion}>
            {versions.map(edition => <button key={edition.id} type="button" aria-pressed={viewedEdition.id === edition.id}
              onClick={() => {setArtworkId(edition.id); setArt(true);}}>{edition.name[locale]}</button>)}
          </div>}
        <p><span>{viewedEdition.credits}</span><br/><a href={viewedEdition.attribution} target="_blank" rel="noreferrer">{c.artVersionSource} ↗</a></p>
      </details>}
      {art && <img className="tarot-dialog-art" src={viewedImage || card.image} alt={card.name} width={560} height={960} style={{transform: reversed ? "rotate(180deg)" : undefined}}/>}
      <div hidden={art} className="tarot-dialog-meaning"><h3>{c.cardMeaning}</h3><p id={description}>{reversed ? card.reversed : card.upright}</p></div>
      {onDetailed && <button type="button" className="cel-button tarot-dialog-detail" onClick={() => {afterClose.current = onDetailed; close();}}>{c.detailCta}<ArrowDown size={17}/></button>}
    </>}
  </dialog>;
}
