"use client";

import { forwardRef, useId, type CSSProperties, type KeyboardEvent } from "react";
import type { ReportLocale } from "@/lib/report-i18n";
import { getPartAriaLabel, resonanceNames } from "@/lib/totem/copy";
import type { TotemLayer, TotemModel, TotemPart } from "@/lib/totem/types";
import {
  buildFunctionPortPath,
  buildResonanceRosettePath,
  buildTotemVisualGrammar,
} from "@/lib/totem/visual-grammar";
import styles from "./totem.module.css";
import TotemOrnaments, { TotemOrnamentDefs } from "./totem-ornaments";

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

function VisualGeometry({ part, idPrefix }: { part: TotemPart; idPrefix: string }) {
  const lineCommon = {
    stroke: part.color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const hotStroke = part.kind === "boundary" ? "#ffe8ad" : "#effcff";
  const hotOpacity =
    part.kind === "practice-line" || part.kind === "element-flow"
      ? 0.42
      : part.kind === "core" || part.kind === "pillar-stem" || part.kind === "pillar-branch"
        ? 0.64
        : 0.58;
  const jewelFill = part.element
    ? `url(#${idPrefix}-jewel-${part.element})`
    : part.color;

  if (part.geometry.kind === "path") {
    return (
      <>
        <path
          {...lineCommon}
          data-material-layer="aura"
          d={part.geometry.d}
          fill="none"
          strokeWidth={part.geometry.strokeWidth * 3.8}
          strokeOpacity="0.17"
          strokeDasharray={part.geometry.dash}
          pathLength={100}
        />
        <path
          {...lineCommon}
          data-material-layer="body"
          d={part.geometry.d}
          fill="none"
          strokeWidth={part.geometry.strokeWidth * 1.36}
          strokeOpacity="0.88"
          strokeDasharray={part.geometry.dash}
          pathLength={100}
        />
        <path
          {...lineCommon}
          data-material-layer="hot"
          d={part.geometry.d}
          fill="none"
          stroke={hotStroke}
          strokeWidth={Math.max(0.7, part.geometry.strokeWidth * 0.28)}
          strokeOpacity={hotOpacity}
          strokeDasharray={part.geometry.dash}
          pathLength={100}
        />
      </>
    );
  }

  if (part.geometry.kind === "branch") {
    return (
      <>
        <path
          {...lineCommon}
          data-material-layer="aura"
          d={part.geometry.d}
          fill="none"
          strokeWidth={part.geometry.strokeWidth * 3.2}
          strokeOpacity="0.16"
          pathLength={100}
        />
        <path
          {...lineCommon}
          data-material-layer="body"
          d={part.geometry.d}
          fill="none"
          strokeWidth={part.geometry.strokeWidth * 1.3}
          strokeOpacity="0.84"
          pathLength={100}
        />
        <circle
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r + 3}
          fill={part.color}
          fillOpacity="0.12"
          stroke={part.color}
          strokeOpacity="0.28"
          strokeWidth={part.geometry.strokeWidth * 3}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          data-material-layer="body"
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r}
          fill={jewelFill}
          fillOpacity="0.9"
          stroke={part.color}
          strokeWidth={part.geometry.strokeWidth * 1.2}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={part.geometry.cx - part.geometry.r * 0.22}
          cy={part.geometry.cy - part.geometry.r * 0.28}
          r={Math.max(1.2, part.geometry.r * 0.18)}
          fill="#ffffff"
          fillOpacity="0.86"
        />
      </>
    );
  }

  if (part.geometry.kind === "circle") {
    if (part.geometry.r > 42) {
      return (
        <>
          <circle
            data-material-layer="body"
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r={part.geometry.r}
            fill="none"
            stroke={part.color}
            strokeOpacity="0.13"
            strokeWidth={part.geometry.strokeWidth * 5}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            data-material-layer="body"
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r={part.geometry.r}
            fill="none"
            stroke={part.color}
            strokeOpacity="0.68"
            strokeWidth={part.geometry.strokeWidth * 1.35}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r={part.geometry.r - 5}
            fill="none"
            stroke="#effcff"
            strokeOpacity="0.38"
            strokeWidth="0.7"
            strokeDasharray="3 10"
            pathLength="100"
            vectorEffect="non-scaling-stroke"
          />
        </>
      );
    }

    if (part.kind === "pillar-branch" && part.id.endsWith(":branch")) {
      return (
        <>
          <circle
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r={part.geometry.r + 3}
            fill="none"
            stroke={part.color}
            strokeOpacity="0.54"
            strokeWidth={part.geometry.strokeWidth * 1.25}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r={Math.max(3.2, part.geometry.r * 0.22)}
            fill={jewelFill}
            fillOpacity="0.96"
            stroke="#ffffff"
            strokeOpacity="0.72"
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
          />
        </>
      );
    }

    if (part.kind === "function-port" && part.functionModule) {
      const path = buildFunctionPortPath(
        part.functionModule,
        part.geometry.cx,
        part.geometry.cy,
        part.geometry.r,
      );
      return (
        <>
          <path
            d={path}
            pathLength={100}
            fill={part.color}
            fillOpacity="0.08"
            stroke={part.color}
            strokeOpacity="0.2"
            strokeWidth={part.geometry.strokeWidth * 4}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            data-material-layer="body"
            d={path}
            pathLength={100}
            fill={jewelFill}
            fillOpacity="0.46"
            stroke={part.color}
            strokeOpacity="0.94"
            strokeWidth={part.geometry.strokeWidth * 1.25}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path}
            pathLength={100}
            fill="none"
            stroke="#f4ffff"
            strokeOpacity="0.72"
            strokeWidth="0.72"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      );
    }

    if (part.kind === "resonance-port") {
      const path = buildResonanceRosettePath(
        part.geometry.cx,
        part.geometry.cy,
        part.geometry.r,
        6 + (Math.round(part.intensity) % 3) * 2,
      );
      return (
        <>
          <path
            d={path}
            pathLength={100}
            fill={part.color}
            fillOpacity="0.11"
            stroke={part.color}
            strokeOpacity="0.2"
            strokeWidth={part.geometry.strokeWidth * 3.2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            data-material-layer="body"
            d={path}
            pathLength={100}
            fill={jewelFill}
            fillOpacity="0.66"
            stroke={part.color}
            strokeOpacity="0.94"
            strokeWidth={part.geometry.strokeWidth * 1.15}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r="2.8"
            fill="#ffffff"
            fillOpacity="0.92"
          />
        </>
      );
    }

    return (
      <>
        <circle
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r + 4}
          fill={part.color}
          fillOpacity="0.1"
          stroke={part.color}
          strokeOpacity="0.24"
          strokeWidth={part.geometry.strokeWidth * 3.4}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          data-material-layer="body"
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={part.geometry.r}
          fill={jewelFill}
          fillOpacity={part.kind === "pillar-branch" ? 0.62 : 0.88}
          stroke={part.color}
          strokeWidth={part.geometry.strokeWidth * 1.25}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={part.geometry.cx}
          cy={part.geometry.cy}
          r={Math.max(2, part.geometry.r * 0.35)}
          fill="#f6ffff"
          fillOpacity="0.34"
        />
        <path
          d={`M ${part.geometry.cx - part.geometry.r * 0.75} ${part.geometry.cy} L ${part.geometry.cx + part.geometry.r * 0.75} ${part.geometry.cy} M ${part.geometry.cx} ${part.geometry.cy - part.geometry.r * 0.75} L ${part.geometry.cx} ${part.geometry.cy + part.geometry.r * 0.75}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="0.65"
          vectorEffect="non-scaling-stroke"
        />
      </>
    );
  }

  return (
    <>
      <polygon
        points={part.geometry.points}
        fill={part.color}
        fillOpacity="0.035"
        stroke={part.color}
        strokeOpacity="0.2"
        strokeWidth={part.geometry.strokeWidth * 5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        data-material-layer="body"
        points={part.geometry.points}
        fill="none"
        stroke={part.color}
        strokeOpacity="0.78"
        strokeWidth={part.geometry.strokeWidth * 1.25}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        points={part.geometry.points}
        fill="none"
        stroke="#ffe7a9"
        strokeOpacity="0.58"
        strokeWidth="0.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
}

function branchGuardianHitRadius(part: TotemPart) {
  if (part.pillar === "year") return 59;
  if (part.pillar === "month") return 57;
  if (part.pillar === "day") return 61;
  return 51;
}

function HitGeometry({
  part,
  framePath,
  drivePaths,
}: {
  part: TotemPart;
  framePath?: string;
  drivePaths?: string[];
}) {
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
        <>
          <circle
            {...common}
            cx={part.geometry.cx}
            cy={part.geometry.cy}
            r={part.geometry.r}
            pointerEvents="stroke"
          />
          {drivePaths?.map((path) => (
            <path key={path} {...common} d={path} pointerEvents="stroke" />
          ))}
        </>
      );
    }
    return (
      <circle
        className={styles.hitShape}
        cx={part.geometry.cx}
        cy={part.geometry.cy}
        r={
          part.kind === "pillar-branch" && part.id.endsWith(":branch")
            ? Math.max(part.geometry.r, branchGuardianHitRadius(part))
            : part.geometry.r
        }
        fill="transparent"
        stroke="transparent"
        strokeWidth={44}
        vectorEffect="non-scaling-stroke"
        pointerEvents="all"
      />
    );
  }
  return (
    <>
      <polygon {...common} points={part.geometry.points} pointerEvents="stroke" />
      {framePath && <path {...common} d={framePath} pointerEvents="stroke" />}
      {part.kind === "boundary" && (
        <circle
          {...common}
          cx="500"
          cy="500"
          r="366"
          strokeWidth="34"
          pointerEvents="stroke"
        />
      )}
    </>
  );
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
  const vignetteId = `${rawId}-vignette`;
  const starPatternId = `${rawId}-stars`;
  const visibleParts = model.parts.filter((part) => isPartVisible(part, layer));
  const visualGrammar = buildTotemVisualGrammar(model);
  const strongestPracticeIds = new Set(
    visibleParts
      .filter((part) => part.kind === "practice-line")
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3)
      .map((part) => part.id),
  );
  // SVG uses paint order for pointer hit-testing. Draw broad rings and route
  // lines first, then compact nodes and the day-master core, so a 44px touch
  // target that crosses the centre cannot steal a tap meant for the core.
  const interactiveParts = visibleParts
    .filter(
      (part) =>
        !(
          layer === "overview" &&
          part.kind === "practice-line" &&
          !strongestPracticeIds.has(part.id)
        ),
    )
    .sort((a, b) => hitPaintOrder(a) - hitPaintOrder(b) || a.order - b.order);
  const dayGuardianPart = visualGrammar.dayGuardian
    ? model.parts.find((part) => part.id === visualGrammar.dayGuardian?.partId)
    : undefined;
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
      <title id={titleId}>{`DestinyPixel Birth Totem ${model.fingerprint}`}</title>
      <desc id={descriptionId}>
        Deterministic interactive geometry generated from the Four Pillars. It is a symbolic reflection tool, not a scientific ability test.
      </desc>
      <defs>
        <radialGradient id={backgroundId} cx="50%" cy="46%" r="62%">
          <stop offset="0" stopColor="#153449" />
          <stop offset="0.32" stopColor="#0a1e2d" />
          <stop offset="0.68" stopColor="#06111d" />
          <stop offset="1" stopColor="#02060d" />
        </radialGradient>
        <radialGradient id={vignetteId} cx="50%" cy="46%" r="60%">
          <stop offset="0" stopColor="#9eeaff" stopOpacity="0.08" />
          <stop offset="0.5" stopColor="#0d3148" stopOpacity="0.03" />
          <stop offset="1" stopColor="#00030a" stopOpacity="0.76" />
        </radialGradient>
        <pattern id={starPatternId} width="86" height="86" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="17" r="1.1" fill="#c6f5ff" fillOpacity="0.22" />
          <circle cx="57" cy="31" r="0.7" fill="#fff0bf" fillOpacity="0.2" />
          <circle cx="34" cy="72" r="0.8" fill="#7ce7ff" fillOpacity="0.16" />
        </pattern>
        <filter
          id={glowId}
          x="-55%"
          y="-55%"
          width="210%"
          height="210%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="near" />
          <feMerge>
            <feMergeNode in="near" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <TotemOrnamentDefs idPrefix={rawId} />
      </defs>

      <rect width="1000" height="1000" rx="72" fill={`url(#${backgroundId})`} />
      <rect width="1000" height="1000" rx="72" fill={`url(#${starPatternId})`} opacity="0.55" />
      <rect width="1000" height="1000" rx="72" fill={`url(#${vignetteId})`} />
      <circle cx="500" cy="500" r="454" fill="none" stroke="#d9b56d" strokeOpacity="0.2" strokeWidth="1.4" />
      <circle cx="500" cy="500" r="438" fill="none" stroke="#95eaff" strokeOpacity="0.08" strokeWidth="8" />
      <circle cx="500" cy="500" r="378" fill="none" stroke="#7597aa" strokeOpacity="0.13" strokeDasharray="2 10" pathLength="100" />
      <g
        data-geometry-root="true"
        transform={`translate(500 500) scale(${zoom}) translate(-500 -500)`}
        style={{ transformOrigin: "500px 500px" }}
      >
        <TotemOrnaments
          model={model}
          layer={layer}
          selectedId={selectedId}
          highlightedIds={highlightedIds}
          idPrefix={rawId}
        />
        <g aria-hidden="true" pointerEvents="none">
          {visibleParts.map((part) => {
            const highlighted = highlightedIds.has(part.id);
            const dimmed = Boolean(selectedId) && !highlighted;
            const overviewMultiplier =
              layer === "overview" && highlighted
                ? 1
                : layer === "overview" &&
              part.kind === "practice-line" &&
              !strongestPracticeIds.has(part.id) &&
                  !highlighted
                ? 0.015
                : layer === "overview" && part.kind === "practice-line"
                  ? 0.13
                  : layer === "overview" && part.kind === "element-flow"
                    ? 0.15
                    : layer === "overview" && part.kind === "hidden-stem"
                      ? 0.46
                      : layer === "overview" && part.kind === "function-port"
                        ? 0.68
                    : 1;
            const partStyle = {
              "--part-order": part.order,
              opacity: dimmed ? 0.08 : part.opacity * overviewMultiplier,
            } as CSSProperties;

            return (
              <g
                key={part.id}
                className={styles.visualPart}
                data-kind={part.kind}
                data-state={part.state}
                data-base-opacity={part.opacity}
                data-export-opacity={part.opacity * overviewMultiplier}
                data-selected={highlighted || undefined}
                style={partStyle}
                filter={part.id === selectedId || part.kind === "core" ? `url(#${glowId})` : undefined}
              >
                <VisualGeometry part={part} idPrefix={rawId} />
              </g>
            );
          })}
        </g>

        <g data-ui-only="true" className={styles.hitLayer}>
          {visualGrammar.dayGuardian && dayGuardianPart && (
            <g
              className={styles.hitPart}
              role="button"
              tabIndex={0}
              focusable="true"
              aria-label={getPartAriaLabel(dayGuardianPart, locale)}
              aria-controls="totem-inspector"
              aria-expanded={selectedId === dayGuardianPart.id}
              data-part-id={dayGuardianPart.id}
              data-ornament-hit="central-guardian"
              onClick={(event) => onSelect(dayGuardianPart, event.currentTarget)}
              onKeyDown={(event) => handleKeyDown(event, dayGuardianPart)}
            >
              <title>{getPartAriaLabel(dayGuardianPart, locale)}</title>
              <circle
                className={styles.hitShape}
                cx="500"
                cy="500"
                r="108"
                fill="transparent"
                stroke="transparent"
                pointerEvents="all"
              />
              <path
                className={styles.hitShape}
                d={visualGrammar.dayGuardian.motifPath}
                transform="translate(500 500) scale(2.48)"
                fill="none"
                stroke="transparent"
                strokeWidth="18"
                vectorEffect="non-scaling-stroke"
                pointerEvents="stroke"
              />
            </g>
          )}
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
              <HitGeometry
                part={part}
                framePath={part.kind === "boundary" ? visualGrammar.framePath : undefined}
                drivePaths={
                  part.id === "pillar:month:drive-ring"
                    ? [visualGrammar.haloPath, ...visualGrammar.knotPaths]
                    : undefined
                }
              />
            </g>
          ))}
        </g>
        {(layer === "overview" || layer === "resonance") && (
          <g data-ui-only="true" aria-hidden="true" pointerEvents="none">
            {model.resonances.map((resonance) => {
              const part = model.parts.find((candidate) => candidate.id === `resonance:${resonance.key}`);
              if (!part || part.geometry.kind !== "circle") return null;
              const isLeft = part.geometry.cx < 500;
              const isVerticalEdge = mobileLabels && Math.abs(part.geometry.cy - 500) > 250;
              const anchor = mobileLabels
                ? isVerticalEdge
                  ? isLeft
                    ? "end"
                    : "start"
                  : isLeft
                  ? "start"
                  : "end"
                : isLeft
                  ? "end"
                  : "start";
              const x =
                part.geometry.cx +
                (mobileLabels
                  ? isVerticalEdge
                    ? isLeft
                      ? -30
                      : 30
                    : isLeft
                      ? 25
                      : -25
                  : isLeft
                    ? -25
                    : 25);
              const y =
                part.geometry.cy +
                (isVerticalEdge ? (part.geometry.cy < 500 ? -10 : 18) : 4);
              return (
                <text
                  key={resonance.key}
                  className={styles.resonanceLabel}
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  fill="#b8c8d3"
                  fillOpacity={selectedId && !highlightedIds.has(part.id) ? 0.18 : 0.78}
                  fontSize={mobileLabels ? 24 : 16}
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
