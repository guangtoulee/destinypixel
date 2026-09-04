"use client";

import { forwardRef, useId, type CSSProperties, type KeyboardEvent } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import { getPartAriaLabel, resonanceNames } from "@/lib/totem/copy";
import type { TotemLayer, TotemModel, TotemPart } from "@/lib/totem/types";
import styles from "./totem.module.css";

type TotemSvgProps = {
  model: TotemModel;
  locale: ReportLocale;
  layer: TotemLayer;
  selectedId: string | null;
  highlightedIds: Set<string>;
  revealComplete: boolean;
  zoom: number;
  mobileLabels?: boolean;
  onSelect: (part: TotemPart, trigger: SVGGElement) => void;
};

function hitPaintOrder(part: TotemPart) {
  if (part.geometry.kind === "circle" && part.geometry.r > 42) return 1;

  const order: Record<TotemPart["kind"], number> = {
    boundary: 0,
    "practice-line": 2,
    "element-flow": 3,
    "pillar-stem": 4,
    "hidden-stem": 5,
    "pillar-branch": 6,
    "function-port": 7,
    "resonance-port": 8,
    core: 9,
  };

  return order[part.kind];
}

function VisualGeometry({ part }: { part: TotemPart }) {
  const common = {
    fill: "none",
    stroke: part.color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  if (part.geometry.kind === "path") {
    return (
      <path
        {...common}
        d={part.geometry.d}
        strokeWidth={part.geometry.strokeWidth}
        strokeDasharray={part.geometry.dash}
        pathLength={1}
      />
    );
  }

  if (part.geometry.kind === "branch") {
    return (
      <>
        <path
          {...common}
          d={part.geometry.d}
          strokeWidth={part.geometry.strokeWidth}
          pathLength={1}
        />
        <circle
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r}
          fill="#07111f"
          stroke={part.color}
          strokeWidth={part.geometry.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </>
    );
  }

  if (part.geometry.kind === "circle") {
    return (
      <circle
        {...common}
        cx={part.geometry.cx}
        cy={part.geometry.cy}
        r={part.geometry.r}
        strokeWidth={part.geometry.strokeWidth}
      />
    );
  }

  return (
    <polygon
      {...common}
      points={part.geometry.points}
      strokeWidth={part.geometry.strokeWidth}
    />
  );
}

function HitGeometry({ part }: { part: TotemPart }) {
  const common = {
    className: styles.hitShape,
    fill: "none",
    stroke: "transparent",
    strokeWidth: 44,
    vectorEffect: "non-scaling-stroke" as const,
  };

  if (part.geometry.kind === "path") {
    return <path {...common} d={part.geometry.d} pointerEvents="stroke" />;
  }
  if (part.geometry.kind === "branch") {
    return (
      <>
        <path {...common} d={part.geometry.d} pointerEvents="stroke" />
        <circle
          className={styles.hitShape}
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r}
          fill="transparent"
          stroke="transparent"
          strokeWidth={44}
          vectorEffect="non-scaling-stroke"
          pointerEvents="all"
        />
      </>
    );
  }
  if (part.geometry.kind === "circle") {
    if (part.geometry.r > 42) {
      return (
        <circle
          {...common}
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r}
          pointerEvents="stroke"
        />
      );
    }
    return (
      <circle
        className={styles.hitShape}
        cx={part.geometry.cx}
        cy={part.geometry.cy}
        r={part.geometry.r}
        fill="transparent"
        stroke="transparent"
        strokeWidth={44}
        vectorEffect="non-scaling-stroke"
        pointerEvents="all"
      />
    );
  }
  return <polygon {...common} points={part.geometry.points} pointerEvents="stroke" />;
}

function isPartVisible(part: TotemPart, layer: TotemLayer) {
  return layer === "overview" || part.layers.includes(layer);
}

const TotemSvg = forwardRef<SVGSVGElement, TotemSvgProps>(function TotemSvg(
  {
    model,
    locale,
    layer,
    selectedId,
    highlightedIds,
    revealComplete,
    zoom,
    mobileLabels = false,
    onSelect,
  },
  ref,
) {
  const rawId = useId().replace(/:/g, "");
  const titleId = `${rawId}-title`;
  const descriptionId = `${rawId}-description`;
  const glowId = `${rawId}-glow`;
  const backgroundId = `${rawId}-background`;
  const visibleParts = model.parts.filter((part) => isPartVisible(part, layer));
  // SVG uses paint order for pointer hit-testing. Draw broad rings and route
  // lines first, then compact nodes and the day-master core, so a 44px touch
  // target that crosses the centre cannot steal a tap meant for the core.
  const interactiveParts = [...visibleParts].sort(
    (a, b) => hitPaintOrder(a) - hitPaintOrder(b) || a.order - b.order,
  );
  const language = locale === "ru" ? "ru" : locale === "en" ? "en" : "zh";

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, part: TotemPart) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(part, event.currentTarget);
  }

  return (
    <svg
      ref={ref}
      className={styles.totemSvg}
      viewBox="0 0 1000 1000"
      role="group"
      aria-labelledby={`${titleId} ${descriptionId}`}
      data-reveal={revealComplete ? "complete" : "running"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>DestinyPixel Birth Totem {model.fingerprint}</title>
      <desc id={descriptionId}>
        Deterministic interactive geometry generated from the Four Pillars. It is a symbolic reflection tool, not a scientific ability test.
      </desc>
      <defs>
        <radialGradient id={backgroundId} cx="50%" cy="46%" r="62%">
          <stop offset="0" stopColor="#0d2231" />
          <stop offset="0.46" stopColor="#07131f" />
          <stop offset="1" stopColor="#02060d" />
        </radialGradient>
        <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1000" height="1000" rx="72" fill={`url(#${backgroundId})`} />
      <circle cx="500" cy="500" r="452" fill="none" stroke="#c8a76b" strokeOpacity="0.12" />
      <circle cx="500" cy="500" r="378" fill="none" stroke="#7597aa" strokeOpacity="0.08" strokeDasharray="2 17" />
      <g
        data-geometry-root="true"
        transform={`translate(500 500) scale(${zoom}) translate(-500 -500)`}
        style={{ transformOrigin: "500px 500px" }}
      >
        <g aria-hidden="true" pointerEvents="none">
          {visibleParts.map((part) => {
            const highlighted = highlightedIds.has(part.id);
            const dimmed = Boolean(selectedId) && !highlighted;
            const partStyle = {
              "--part-order": part.order,
              opacity: dimmed ? 0.13 : part.opacity,
            } as CSSProperties;

            return (
              <g
                key={part.id}
                className={styles.visualPart}
                data-kind={part.kind}
                data-state={part.state}
                data-base-opacity={part.opacity}
                data-selected={highlighted || undefined}
                style={partStyle}
                filter={part.id === selectedId || part.kind === "core" ? `url(#${glowId})` : undefined}
              >
                <VisualGeometry part={part} />
              </g>
            );
          })}
        </g>

        <g data-ui-only="true" className={styles.hitLayer}>
          {interactiveParts.map((part) => (
            <g
              key={part.id}
              className={styles.hitPart}
              role="button"
              tabIndex={0}
              focusable="true"
              aria-label={getPartAriaLabel(part, locale)}
              aria-controls="totem-inspector"
              aria-expanded={selectedId === part.id}
              data-part-id={part.id}
              onClick={(event) => onSelect(part, event.currentTarget)}
              onKeyDown={(event) => handleKeyDown(event, part)}
            >
              <title>{getPartAriaLabel(part, locale)}</title>
              <HitGeometry part={part} />
            </g>
          ))}
        </g>
        {(layer === "overview" || layer === "resonance") && (
          <g data-ui-only="true" aria-hidden="true" pointerEvents="none">
            {model.resonances.map((resonance) => {
              const part = model.parts.find((candidate) => candidate.id === `resonance:${resonance.key}`);
              if (!part || part.geometry.kind !== "circle") return null;
              const isLeft = part.geometry.cx < 500;
              const anchor = mobileLabels ? (isLeft ? "start" : "end") : isLeft ? "end" : "start";
              const x = part.geometry.cx + (mobileLabels ? (isLeft ? 28 : -28) : isLeft ? -22 : 22);
              return (
                <text
                  key={resonance.key}
                  className={styles.resonanceLabel}
                  x={x}
                  y={part.geometry.cy + 4}
                  textAnchor={anchor}
                  fill="#b8c8d3"
                  fillOpacity={selectedId && !highlightedIds.has(part.id) ? 0.18 : 0.78}
                  fontSize={mobileLabels ? 28 : 16}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  letterSpacing="0.04em"
                >
                  {resonanceNames[language][resonance.key]}
                </text>
              );
            })}
          </g>
        )}
      </g>

      <g aria-hidden="true" pointerEvents="none">
        <text
          x="52"
          y="928"
          fill="#d4b679"
          fillOpacity="0.7"
          fontSize="15"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          letterSpacing="0.14em"
        >
          DESTINYPIXEL · {model.fingerprint}
        </text>
        <text
          x="948"
          y="928"
          textAnchor="end"
          fill="#91a4b0"
          fillOpacity="0.5"
          fontSize="13"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ORIGINAL SYMBOLIC VISUALIZATION · NOT A SCIENTIFIC TEST
        </text>
      </g>
    </svg>
  );
});

export default TotemSvg;
