import { elementColors } from "@/lib/totem/model";
import {
  buildTotemVisualGrammar,
  type GuardianPlacement,
} from "@/lib/totem/visual-grammar";
import type { ElementName } from "@/lib/core/mappings";
import type { TotemLayer, TotemModel } from "@/lib/totem/types";
import styles from "./totem.module.css";

const CENTER = 500;

type OrnamentProps = {
  model: TotemModel;
  layer: TotemLayer;
  selectedId: string | null;
  highlightedIds: Set<string>;
  idPrefix: string;
};

const elementNames: ElementName[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

function polar(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER + Math.sin(radians) * radius,
  };
}

function ornamentalPetal(element: ElementName) {
  const paths: Record<ElementName, string> = {
    Wood: "M 0 -36 C 18 -31 23 -15 10 -2 C 26 4 28 22 12 31 C 5 35 1 39 0 44 C -1 39 -5 35 -12 31 C -28 22 -26 4 -10 -2 C -23 -15 -18 -31 0 -36 Z M 0 -23 L 0 29",
    Fire: "M 0 -38 C 8 -20 25 -10 19 10 C 15 25 5 36 0 43 C -4 27 -17 22 -19 7 C -21 -8 -8 -18 0 -38 Z M 0 -13 C 9 -2 8 12 0 22 C -8 12 -9 -2 0 -13 Z",
    Earth: "M 0 -34 L 27 -18 L 33 10 L 16 34 L -16 34 L -33 10 L -27 -18 Z M 0 -20 L 18 -9 L 19 11 L 0 23 L -19 11 L -18 -9 Z",
    Metal: "M 0 -36 L 24 -21 L 16 -2 L 34 15 L 15 34 L 0 18 L -15 34 L -34 15 L -16 -2 L -24 -21 Z M 0 -19 L 13 -9 L 0 7 L -13 -9 Z",
    Water: "M -32 2 C -21 -24 6 -27 18 -10 C 29 6 16 18 3 13 C -10 8 -7 -5 3 -5 C 15 -5 20 10 11 24 C 2 39 -21 39 -32 22 C -38 13 -37 7 -32 2 Z",
  };
  return paths[element];
}

function GuardianGlyph({
  guardian,
  idPrefix,
  nearBloomId,
  opacity,
}: {
  guardian: GuardianPlacement;
  idPrefix: string;
  nearBloomId: string;
  opacity: number;
}) {
  const radius = 43 * guardian.scale;
  const jewelId = `${idPrefix}-jewel-${guardian.element}`;
  const sideGuardian = guardian.pillar === "month" || guardian.pillar === "day";
  const cartouchePath = `M 0 ${-radius - 10} C ${-radius - 14} ${-radius * 0.62}, ${-radius - 14} ${radius * 0.62}, 0 ${radius + 10} C ${radius + 14} ${radius * 0.62}, ${radius + 14} ${-radius * 0.62}, 0 ${-radius - 10} Z`;
  return (
    <g
      className={styles.guardianGlyph}
      data-pillar={guardian.pillar}
      data-branch={guardian.branch}
      opacity={opacity}
      filter={`url(#${nearBloomId})`}
      transform={`translate(${guardian.point.x} ${guardian.point.y})`}
    >
      {sideGuardian ? (
        <>
          <path
            d={cartouchePath}
            fill={elementColors[guardian.element]}
            fillOpacity="0.07"
            stroke={elementColors[guardian.element]}
            strokeOpacity="0.2"
            strokeWidth="10"
          />
          <path
            d={cartouchePath}
            fill={`url(#${jewelId})`}
            fillOpacity="0.76"
            stroke="#f5dfac"
            strokeOpacity="0.76"
            strokeWidth="1.4"
          />
          <path
            d={`M 0 ${-radius - 10} C ${-radius - 14} ${-radius * 0.62}, ${-radius - 14} ${radius * 0.62}, 0 ${radius + 10}`}
            fill="none"
            stroke={elementColors[guardian.element]}
            strokeOpacity="0.78"
            strokeWidth="2.2"
            strokeDasharray="2 7"
            pathLength="100"
          />
        </>
      ) : (
        <>
          <circle
            r={radius + 8}
            fill={elementColors[guardian.element]}
            fillOpacity="0.075"
            stroke={elementColors[guardian.element]}
            strokeOpacity="0.17"
            strokeWidth="12"
          />
          <circle
            r={radius}
            fill={`url(#${jewelId})`}
            fillOpacity="0.82"
            stroke="#f5dfac"
            strokeOpacity="0.74"
            strokeWidth="1.4"
          />
          <circle
            r={radius - 7}
            fill="none"
            stroke={elementColors[guardian.element]}
            strokeOpacity="0.72"
            strokeWidth="2.2"
            strokeDasharray="2 7"
            pathLength="100"
          />
        </>
      )}
      <g transform={`scale(${guardian.scale})`}>
        <path
          d={guardian.motifPath}
          fill="none"
          stroke={elementColors[guardian.element]}
          strokeOpacity="0.9"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={guardian.motifPath}
          fill="none"
          stroke="#effcff"
          strokeOpacity="0.88"
          strokeWidth="1.05"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <circle cy={-radius + 7} r="2.4" fill="#fff4d6" />
    </g>
  );
}

export function TotemOrnamentDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      <linearGradient id={`${idPrefix}-gold`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6e4e25" />
        <stop offset="0.35" stopColor="#f4d995" />
        <stop offset="0.58" stopColor="#9e7035" />
        <stop offset="1" stopColor="#fff0bd" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-lens`} cx="50%" cy="44%" r="58%">
        <stop offset="0" stopColor="#dff9ff" stopOpacity="0.3" />
        <stop offset="0.22" stopColor="#4cc8ef" stopOpacity="0.14" />
        <stop offset="0.62" stopColor="#142c43" stopOpacity="0.1" />
        <stop offset="1" stopColor="#02060d" stopOpacity="0" />
      </radialGradient>
      {elementNames.map((element) => (
        <radialGradient
          key={element}
          id={`${idPrefix}-jewel-${element}`}
          cx="38%"
          cy="31%"
          r="72%"
        >
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="0.15" stopColor={elementColors[element]} stopOpacity="0.92" />
          <stop offset="0.55" stopColor={elementColors[element]} stopOpacity="0.24" />
          <stop offset="1" stopColor="#02060d" stopOpacity="0.92" />
        </radialGradient>
      ))}
      <filter
        id={`${idPrefix}-deep-bloom`}
        filterUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1000"
        height="1000"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur stdDeviation="13" />
      </filter>
      <filter
        id={`${idPrefix}-near-bloom`}
        x="-45%"
        y="-45%"
        width="190%"
        height="190%"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur stdDeviation="2.4" result="near" />
        <feMerge>
          <feMergeNode in="near" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </>
  );
}

export default function TotemOrnaments({
  model,
  layer,
  selectedId,
  highlightedIds,
  idPrefix,
}: OrnamentProps) {
  const grammar = buildTotemVisualGrammar(model);
  const structuralLayer = layer === "overview" || layer === "pillars";
  const structureOpacity = structuralLayer ? 1 : layer === "elements" ? 0.72 : 0.28;
  const selectionOpacity = selectedId ? 0.3 : 1;
  const dominantColor = elementColors[model.dominantElement];
  const goldId = `${idPrefix}-gold`;
  const dayGuardian = grammar.dayGuardian;

  return (
    <g
      className={styles.ornamentRoot}
      aria-hidden="true"
      pointerEvents="none"
      data-ornament-root="true"
    >
      <g
        className={styles.deepAura}
        opacity={selectionOpacity}
        filter={`url(#${idPrefix}-deep-bloom)`}
      >
        {grammar.auras.map((aura) => (
          <ellipse
            key={aura.element}
            cx={aura.cx}
            cy={aura.cy}
            rx={aura.rx}
            ry={aura.ry}
            transform={`rotate(${aura.rotation} ${aura.cx} ${aura.cy})`}
            fill={elementColors[aura.element]}
            fillOpacity={layer === "elements" ? aura.opacity * 1.35 : aura.opacity}
          />
        ))}
        <path
          d={grammar.framePath}
          fill="none"
          stroke={dominantColor}
          strokeOpacity="0.25"
          strokeWidth="24"
        />
        <circle cx="500" cy="500" r="108" fill={dominantColor} fillOpacity="0.13" />
      </g>

      <g opacity={structureOpacity * selectionOpacity}>
        <path
          d={grammar.framePath}
          fill={`url(#${idPrefix}-lens)`}
          fillOpacity="0.28"
          stroke={`url(#${goldId})`}
          strokeOpacity="0.42"
          strokeWidth="13"
        />
        <path
          d={grammar.framePath}
          fill="none"
          stroke="#ffe7aa"
          strokeOpacity="0.82"
          strokeWidth="1.45"
        />
        <path
          className={styles.breathingOrnament}
          d={grammar.haloPath}
          fill={dominantColor}
          fillOpacity="0.025"
          stroke={dominantColor}
          strokeOpacity="0.54"
          strokeWidth="7.5"
        />
        <path
          d={grammar.haloPath}
          fill="none"
          stroke="#f5ffff"
          strokeOpacity="0.74"
          strokeWidth="0.95"
        />
        {(layer === "overview" ? grammar.knotPaths.slice(0, 1) : grammar.knotPaths).map((path, index) => (
          <g key={path}>
            <path
              d={path}
              fill="none"
              stroke={index === 0 ? `url(#${goldId})` : dominantColor}
              strokeOpacity={index === 0 ? 0.42 : 0.38}
              strokeWidth={index === 0 ? 8 : 6}
            />
            <path
              d={path}
              fill="none"
              stroke={index === 0 ? "#fff0bd" : "#e9fbff"}
              strokeOpacity="0.58"
              strokeWidth="0.8"
              strokeDasharray={index === 0 ? "26 8" : "18 11"}
              pathLength="100"
            />
          </g>
        ))}
      </g>

      <g
        className={styles.rosetteRing}
        opacity={(layer === "functions" || layer === "resonance" ? 0.25 : 0.76) * selectionOpacity}
      >
        {Array.from({ length: grammar.rosetteCount }, (_, index) => {
          const angle = grammar.rotation + (index * 360) / grammar.rosetteCount;
          const point = polar(angle, 366);
          return (
            <g
              key={index}
              transform={`translate(${point.x} ${point.y}) rotate(${angle + 90}) scale(0.42)`}
            >
              <path
                d={ornamentalPetal(model.dominantElement)}
                fill={dominantColor}
                fillOpacity="0.1"
                stroke={`url(#${goldId})`}
                strokeOpacity="0.74"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              <circle r="3" fill="#fff3c7" fillOpacity="0.9" />
            </g>
          );
        })}
      </g>

      {dayGuardian && (
        <g
          className={styles.centralGuardian}
          opacity={
            selectedId &&
            !highlightedIds.has(dayGuardian.partId) &&
            !highlightedIds.has("core:day-master")
              ? 0.08
              : structuralLayer
                ? 0.42
                : 0.18
          }
        >
          <g transform="translate(500 500) scale(2.48)">
            <path
              d={dayGuardian.motifPath}
              fill={dominantColor}
              fillOpacity="0.035"
              stroke={elementColors[dayGuardian.element]}
              strokeOpacity="0.82"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={dayGuardian.motifPath}
              fill="none"
              stroke="#f1fdff"
              strokeOpacity="0.78"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </g>
      )}

      <g>
        {grammar.guardians.map((guardian) => (
          <GuardianGlyph
            key={guardian.partId}
            guardian={guardian}
            idPrefix={idPrefix}
            nearBloomId={`${idPrefix}-near-bloom`}
            opacity={
              selectedId && !highlightedIds.has(guardian.partId)
                ? 0.12
                : structuralLayer
                  ? 1
                  : layer === "elements"
                    ? 0.68
                    : 0.3
            }
          />
        ))}
      </g>
    </g>
  );
}
