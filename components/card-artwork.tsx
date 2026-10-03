"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { X, Maximize2 } from "lucide-react";
import type { ReportLocale } from "@/lib/report-i18n";
import { mobileFlowCopy } from "@/lib/mobile-flow-copy";
import styles from "./card-artwork.module.css";

/** Native modal + a same-URL history entry: Back closes, Forward reopens. No personal data in history. */
export default function CardArtwork({ src, name, locale, sizes = "(max-width:650px) 80vw, 300px" }: {
  src: string; name: string; locale: ReportLocale; sizes?: string;
}) {
  const id = useId(), dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const closing = useRef(false), copy = mobileFlowCopy[locale];
  useEffect(() => {
    const sync = () => { closing.current = false; setOpen(window.history.state?.destinyCardViewer === id); };
    window.addEventListener("popstate", sync);
    sync();
    return () => window.removeEventListener("popstate", sync);
  }, [id]);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current, body = document.body, root = document.documentElement;
    const scrollY = window.scrollY, previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow, rootOverflow: root.style.overflow };
    body.style.position = "fixed"; body.style.top = `-${scrollY}px`; body.style.width = "100%";
    body.style.overflow = "hidden"; root.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      body.style.position = previous.position; body.style.top = previous.top; body.style.width = previous.width;
      body.style.overflow = previous.overflow; root.style.overflow = previous.rootOverflow;
      const returnTo = trigger.current;
      // Let the router's same-URL history restoration finish before restoring the trigger.
      requestAnimationFrame(() => {
        if (!returnTo?.isConnected || document.querySelector("dialog[open]")) return;
        window.scrollTo({ top: scrollY, behavior: "instant" });
        returnTo.focus({ preventScroll: true });
      });
    };
  }, [open]);
  function show() {
    if (open) return;
    closing.current = false;
    window.history.pushState({ ...window.history.state, destinyCardViewer: id }, "", window.location.href);
    setOpen(true);
  }
  function close() {
    if (closing.current) return;
    if (window.history.state?.destinyCardViewer === id) { closing.current = true; window.history.back(); }
    else setOpen(false);
  }
  return <>
    <button type="button" ref={trigger} onClick={show} className={styles.trigger} aria-label={`${copy.enlarge}: ${name}`} aria-haspopup="dialog" data-card-artwork>
      <Image src={src} alt={name} width={896} height={1200} sizes={sizes} />
      <span className={styles.hint}><Maximize2 size={15} aria-hidden="true" />{copy.enlarge}</span>
    </button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-note`} onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.panel}>
        <header><h2 id={`${id}-title`}>{name}</h2><button type="button" autoFocus onClick={close} aria-label={copy.close}><X size={22} aria-hidden="true" /></button></header>
        <div className={styles.body}><Image src={src} alt={name} width={896} height={1200} sizes="(max-width:650px) 90vw, 560px" /><p id={`${id}-note`}>{copy.cardNote}</p></div>
      </div>
    </dialog>
  </>;
}
