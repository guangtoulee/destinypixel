"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function PillarImageLightbox({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="pillar-card-media"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={alt}
      >
        <Image src={src} alt={alt} width={224} height={300} />
      </button>

      {isOpen ? (
        <div
          className="pillar-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setIsOpen(false)}
        >
          <button
            className="pillar-lightbox__close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <div
            className="pillar-lightbox__card"
            onClick={(event) => event.stopPropagation()}
          >
            <Image src={src} alt={alt} width={896} height={1200} priority />
            <p>{alt}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
