"use client";
import { useId } from "react";
import type { NatalChart } from "@/lib/celestial/astrology";
import { planetSymbols, signSymbols } from "@/lib/celestial/astrology";
import type { CelestialCopy } from "@/lib/celestial/copy";
const colors = ["#c77865", "#769981", "#8c84b6", "#659fae"];
export type ChartSelection = { kind: "planet"; body: string } | { kind: "aspect"; index: number } | null;
export function ChartWheel({
  chart,
  copy,
  selection,
  pinned,
  onSelect,
  onPreview,
}: {
  chart: NatalChart;
  copy: CelestialCopy;
  selection: ChartSelection;
  pinned: ChartSelection;
  onSelect: (selection: ChartSelection) => void;
  onPreview: (selection: ChartSelection) => void;
}) {
  const selected = selection?.kind === "planet" ? selection.body : undefined;
  const selectedAspect = selection?.kind === "aspect" ? selection.index : undefined;
  const activeBodies = selected ? [selected] : selectedAspect !== undefined ? chart.aspects[selectedAspect]?.bodies || [] : [];
  const uid = useId().replace(/:/g, ""),
    point = (longitude: number, r: number) => {
      const a = ((180 + longitude - chart.ascendant) * Math.PI) / 180;
      return [300 + r * Math.cos(a), 300 - r * Math.sin(a)].map((value) =>
        Number(value.toFixed(3)),
      );
    };
  const path = (from: number, to: number, outer: number, inner: number) => {
    const a = point(from, outer),
      b = point(to, outer),
      c = point(to, inner),
      d = point(from, inner);
    return `M${a} A${outer} ${outer} 0 0 0 ${b} L${c} A${inner} ${inner} 0 0 1 ${d} Z`;
  };
  const sorted = [...chart.placements].sort(
    (a, b) => a.longitude - b.longitude,
  );
  const radius = new Map<string, number>();
  sorted.forEach((p, i) => {
    let level = 0;
    for (let j = 1; j <= 3; j++) {
      const prev = sorted[(i - j + sorted.length) % sorted.length];
      if ((p.longitude - prev.longitude + 360) % 360 < j * 7) level++;
    }
    radius.set(p.body, 171 - level * 20);
  });
  return (
    <svg
      className="cel-wheel"
      viewBox="0 0 600 600"
      role="group"
      aria-label={copy.astrology}
      onClick={() => onSelect(null)}
      onPointerLeave={() => onPreview(null)}
      onKeyDown={(e) => { if (e.key === "Escape") { onPreview(null); onSelect(null); } }}
    >
      <defs>
        <radialGradient id={`${uid}paper`}>
          <stop stopColor="#fffefa" />
          <stop offset=".72" stopColor="#fcfbff" />
          <stop offset="1" stopColor="#f0ebfa" />
        </radialGradient>
        <linearGradient id={`${uid}gold`} x2="1" y2="1">
          <stop stopColor="#e9d6ae" />
          <stop offset=".5" stopColor="#a8814e" />
          <stop offset="1" stopColor="#e8d8b7" />
        </linearGradient>
        <filter
          id={`${uid}shadow`}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feDropShadow
            dy="2"
            stdDeviation="4"
            floodColor="#686080"
            floodOpacity=".16"
          />
        </filter>
      </defs>
      <circle cx="300" cy="300" r="284" fill={`url(#${uid}paper)`} />
      <circle
        cx="300"
        cy="300"
        r="281"
        fill="none"
        stroke={`url(#${uid}gold)`}
        strokeWidth="1.2"
      />
      <circle
        cx="300"
        cy="300"
        r="274"
        fill="none"
        stroke="#d9cabb"
        strokeWidth=".5"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <path
            d={path(i * 30, (i + 1) * 30, 254, 211)}
            fill={colors[i % 4]}
            opacity=".12"
          />
          <path
            d={path(i * 30, (i + 1) * 30, 254, 211)}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
          <text
            x={point(i * 30 + 15, 234)[0]}
            y={point(i * 30 + 15, 234)[1] + 7}
            textAnchor="middle"
            fontSize="25"
            fill={colors[i % 4]}
          >
            {signSymbols[i]}
          </text>
        </g>
      ))}
      {Array.from({ length: 360 }, (_, i) => {
        const a = point(i, 258),
          b = point(i, i % 30 === 0 ? 273 : i % 5 === 0 ? 266 : 261);
        return (
          <line
            key={i}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke={i % 30 === 0 ? "#a88f6c" : "#bfb4c8"}
            strokeWidth={i % 30 === 0 ? 1 : 0.6}
          />
        );
      })}
      <circle cx="300" cy="300" r="207" fill="none" stroke="#ded8e8" />
      <circle cx="300" cy="300" r="109" fill="none" stroke="#e9e3ee" />
      {chart.houses.map((lon, i) => {
        const a = point(lon, 111),
          b = point(lon, 204),
          t = point(lon + 15, 119);
        return (
          <g key={i}>
            <line
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke="#e3dce9"
              strokeDasharray="2 4"
            />
            <text
              x={t[0]}
              y={t[1] + 3}
              textAnchor="middle"
              fill="#91859c"
              fontSize="11"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
      {chart.aspects.map((a, i) => {
        const p = chart.placements.find((p) => p.body === a.bodies[0])!,
          q = chart.placements.find((p) => p.body === a.bodies[1])!,
          x = point(p.longitude, 104),
          y = point(q.longitude, 104),
          active =
            selectedAspect !== undefined
              ? i === selectedAspect
              : Boolean(selected && a.bodies.includes(selected)),
          color = a.type === "square" || a.type === "opposition" ? "#b96373" : a.type === "conjunction" ? "#ae8545" : "#507fa9";
        const target: ChartSelection = { kind: "aspect", index: i };
        return (
          <g key={i} className="cel-aspect-hit" role="button" tabIndex={0}
            aria-label={`${a.bodies.map(body => copy.planetNames[chart.placements.findIndex(p => p.body === body)]).join(" · ")} · ${copy.aspectNames[a.type]} · ${copy.orb} ${a.orb.toFixed(2)}°`}
            aria-pressed={pinned?.kind === "aspect" && pinned.index === i}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") onPreview(target); }}
            onPointerLeave={() => onPreview(null)}
            onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) onPreview(target); }}
            onBlur={() => onPreview(null)}
            onClick={(e) => { e.stopPropagation(); onSelect(target); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(target); } }}>
          <line x1={x[0]} y1={x[1]} x2={y[0]} y2={y[1]} stroke={color}
            strokeWidth="8" opacity={active ? .14 : 0} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          <line className="cel-aspect-line"
            x1={x[0]}
            y1={x[1]}
            x2={y[0]}
            y2={y[1]}
            stroke={color}
            opacity={active ? 1 : selection ? .2 : .68}
            strokeWidth={active ? 3.2 : 1.8}
            strokeDasharray={a.type === "sextile" ? "5 4" : undefined}
            vectorEffect="non-scaling-stroke" pointerEvents="none"
          />
          <line x1={x[0]} y1={x[1]} x2={y[0]} y2={y[1]} stroke="transparent"
            strokeWidth="18" vectorEffect="non-scaling-stroke" pointerEvents="stroke" />
          {active && <g fill={color} pointerEvents="none"><circle cx={x[0]} cy={x[1]} r="3"/><circle cx={y[0]} cy={y[1]} r="3"/></g>}
          </g>
        );
      })}
      {[
        [chart.ascendant, "ASC"],
        [chart.midheaven, "MC"],
      ].map(([lon, label]) => {
        const a = point(Number(lon), 194),
          b = point(Number(lon), 278),
          t = point(Number(lon), 294);
        return (
          <g key={label}>
            <line
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke="#9a7b51"
              strokeWidth="1.5"
            />
            <text
              x={t[0]}
              y={t[1] + 3}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#97764b"
            >
              {label}
            </text>
          </g>
        );
      })}
      {chart.placements.map((p, i) => {
        const [x, y] = point(p.longitude, radius.get(p.body) || 171),
          a = point(p.longitude, 205),
          color = colors[Math.floor(p.longitude / 30) % 4],
          active = activeBodies.includes(p.body);
        const target: ChartSelection = { kind: "planet", body: p.body };
        return (
          <g
            key={p.body}
            className="cel-planet-hit"
            role="button"
            tabIndex={0}
            aria-pressed={pinned?.kind === "planet" && pinned.body === p.body}
            aria-label={`${copy.planetNames[i]} · ${copy.signs[Math.floor(p.longitude / 30)]} · ${copy.house} ${p.house}`}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") onPreview(target); }}
            onPointerLeave={() => onPreview(null)}
            onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) onPreview(target); }}
            onBlur={() => onPreview(null)}
            onClick={(e) => { e.stopPropagation(); onSelect(target); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(target);
              }
            }}
          >
            <title>{`${copy.planetNames[i]} · ${copy.signs[Math.floor(p.longitude / 30)]} ${p.degreeInSign.toFixed(2)}°`}</title>
            {active && <line x1={point(p.longitude, 104)[0]} y1={point(p.longitude, 104)[1]} x2={x} y2={y}
              stroke={color} strokeWidth="1.5" strokeDasharray="3 4" opacity=".7" pointerEvents="none" vectorEffect="non-scaling-stroke" />}
            <line
              x1={a[0]}
              y1={a[1]}
              x2={x}
              y2={y}
              stroke={color}
              opacity=".4"
            />
            <circle cx={a[0]} cy={a[1]} r="2" fill={color} />
            <circle
              cx={x}
              cy={y}
              className="cel-planet-disc"
              r={active ? 20 : 17}
              fill={active ? color : "#fffefb"}
              stroke={active ? color : "#e7e0ea"}
              filter={`url(#${uid}shadow)`}
            />
            <text
              x={x}
              y={y + 6}
              textAnchor="middle"
              fontSize="23"
              fill={active ? "#fff" : color}
            >
              {planetSymbols[p.body]}
            </text>
            {p.retrograde && (
              <text x={x + 13} y={y + 19} fontSize="9" fill="#9b6672">
                R
              </text>
            )}
            <circle className="cel-planet-target" cx={x} cy={y} r="23" fill="transparent" />
          </g>
        );
      })}
      <circle cx="300" cy="300" r="14" fill="#fffdfa" fillOpacity=".86" pointerEvents="none" />
      <text x="300" y="307" textAnchor="middle" fontSize="23" fill="#b59765" pointerEvents="none">
        ✧
      </text>
    </svg>
  );
}
