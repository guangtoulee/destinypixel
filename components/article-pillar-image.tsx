"use client";

import Image from "next/image";
import { Expand, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { JournalLocale } from "@/lib/journal-locales";
import styles from "./article-pillar-image.module.css";

const copy = {
  en: { expand: "Enlarge card", close: "Close enlarged card" },
  zh: { expand: "点击放大卡图", close: "关闭放大卡图" },
  "zh-TW": { expand: "點擊放大卡圖", close: "關閉放大卡圖" },
  ru: { expand: "Увеличить карточку", close: "Закрыть карточку" },
};

export default function ArticlePillarImage({ src, alt, locale }: {
  src: string;
  alt: string;
  locale: JournalLocale;
}) {
  const text = copy[locale];
  const titleId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropPointer = useRef(false);
  const restoreScroll = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => () => { restoreScroll.current?.(); }, []);

  function finishClose() {
    // Ignore a queued close event if the user has already reopened the dialog.
    if (dialog.current?.open) return;
    restoreScroll.current?.();
    restoreScroll.current = null;
    setIsOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function close() {
    dialog.current?.close();
    finishClose();
  }

  function open() {
    if (!dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    if (!restoreScroll.current) {
      restoreScroll.current = () => {
        document.body.style.overflow = bodyOverflow;
        document.documentElement.style.overflow = rootOverflow;
      };
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    setIsOpen(true);
  }

  return <>
    <button ref={trigger} type="button" className={styles.trigger} onClick={open}
      aria-haspopup="dialog" aria-label={`${text.expand} · ${alt}`} data-pillar-image-trigger>
      <Image src={src} alt={alt} width={768} height={1024} priority sizes="(max-width:650px) 70vw, 290px" />
      <span className={styles.hint}><Expand size={14} aria-hidden="true" />{text.expand}</span>
    </button>
    {/* Native modal supplies focus containment and an inert background. */}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-modal="true"
      onClose={finishClose}
      onCancel={event => { event.preventDefault(); close(); }}
      onPointerDown={event => { backdropPointer.current = event.target === event.currentTarget; }}
      onPointerCancel={() => { backdropPointer.current = false; }}
      onClick={event => {
        if (backdropPointer.current && event.target === event.currentTarget) close();
        backdropPointer.current = false;
      }}>
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <p id={titleId}>{alt}</p>
          <button type="button" className={styles.close} autoFocus onClick={close} aria-label={text.close}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.stage}>
          {isOpen && <Image className={styles.fullImage} src={src} alt={alt} width={1200} height={1600} unoptimized loading="eager" />}
        </div>
      </div>
    </dialog>
  </>;
}
