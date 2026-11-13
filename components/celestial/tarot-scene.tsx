"use client";

import { useEffect, useRef } from "react";

const MOTES = Array.from({ length: 16 }, (_, i) => ({
  left: `${6 + ((i * 6.1) % 88).toFixed(1)}%`,
  top: `${22 + ((i * 17) % 62)}%`,
  delay: `-${(i * 1.45).toFixed(2)}s`,
  size: i % 3 === 0 ? "4px" : "2.8px",
}));

/** Decorative layers never intercept the card table's pointer or keyboard input. */
export function TarotScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reduceQuery.matches || !finePointer.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let active = false;

    const step = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.085;
      currentY += dy * 0.085;
      el.style.setProperty("--px", currentX.toFixed(4));
      el.style.setProperty("--py", currentY.toFixed(4));

      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        rafId = requestAnimationFrame(step);
      } else {
        active = false;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reduceQuery.matches) return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      targetX = Math.max(-1, Math.min(1, (e.clientX / w - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, (e.clientY / h - 0.5) * 2));
      if (!active) {
        active = true;
        rafId = requestAnimationFrame(step);
      }
    };

    const onMotionChange = () => {
      if (reduceQuery.matches) {
        cancelAnimationFrame(rafId);
        active = false;
        el.style.setProperty("--px", "0");
        el.style.setProperty("--py", "0");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    reduceQuery.addEventListener("change", onMotionChange);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={sceneRef} className="tarot-scene" aria-hidden="true">
      <div className="tarot-scene-parallax-far">
        <div className="tarot-scene-landscape" />
      </div>

      <div className="tarot-scene-constellation">
        <svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMin slice">
          <defs>
            <radialGradient id="tarotMoonGlow" cx="50%" cy="22%" r="42%">
              <stop offset="0%" stopColor="#f8e3c4" stopOpacity="0.24" />
              <stop offset="48%" stopColor="#d5b8e8" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#1b152a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="tarotStarArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f2d2ab" stopOpacity="0" />
              <stop offset="30%" stopColor="#f2d2ab" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#dfc5eb" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f2d2ab" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1440" height="720" fill="url(#tarotMoonGlow)" />
          <ellipse
            cx="720"
            cy="520"
            rx="620"
            ry="380"
            fill="none"
            stroke="url(#tarotStarArc)"
            strokeWidth="0.8"
            strokeDasharray="3 8"
          />
          <ellipse
            cx="720"
            cy="560"
            rx="460"
            ry="280"
            fill="none"
            stroke="url(#tarotStarArc)"
            strokeWidth="0.6"
          />
          <g stroke="#f4d8b4" strokeOpacity="0.26" strokeWidth="0.7" fill="none">
            <polyline points="235,148 292,118 356,136 412,98" />
            <polyline points="1032,110 1094,142 1158,122 1218,162" />
          </g>
          <g fill="#fae5c7">
            <circle cx="235" cy="148" r="1.8" opacity="0.7" />
            <circle cx="292" cy="118" r="2.3" opacity="0.85" />
            <circle cx="356" cy="136" r="1.6" opacity="0.65" />
            <circle cx="412" cy="98" r="2.1" opacity="0.8" />
            <circle cx="1032" cy="110" r="2.1" opacity="0.8" />
            <circle cx="1094" cy="142" r="1.7" opacity="0.65" />
            <circle cx="1158" cy="122" r="2.4" opacity="0.85" />
            <circle cx="1218" cy="162" r="1.6" opacity="0.6" />
            <circle cx="720" cy="88" r="2.5" opacity="0.75" />
          </g>
        </svg>
      </div>

      <div className="tarot-scene-moonlight" />

      <div className="tarot-scene-parallax-mid">
        <div className="tarot-scene-haze tarot-scene-haze-far" />
        <div className="tarot-scene-haze tarot-scene-haze-near" />
      </div>

      <div className="tarot-scene-parallax-near">
        {(["left", "right"] as const).map((side) => (
          <div key={side} className={`tarot-scene-bough tarot-scene-bough-${side}`} />
        ))}
      </div>

      <div className="tarot-scene-motes">
        {MOTES.map((m, i) => (
          <i
            key={i}
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              animationDelay: m.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
