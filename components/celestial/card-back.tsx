import { useId } from "react";
export function CardBack({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 180 310" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}bg`} x2="1" y2="1">
          <stop stopColor="#ebe4f2" />
          <stop offset=".5" stopColor="#d8c9e5" />
          <stop offset="1" stopColor="#eee5ef" />
        </linearGradient>
        <linearGradient id={`${id}ink`} x2="1" y2="1">
          <stop stopColor="#aa8050" />
          <stop offset=".45" stopColor="#e8cca0" />
          <stop offset="1" stopColor="#9c704a" />
        </linearGradient>
        <pattern
          id={`${id}dots`}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="8" cy="8" r=".8" fill="#90729e" opacity=".17" />
        </pattern>
      </defs>
      <rect width="180" height="310" rx="12" fill={`url(#${id}bg)`} />
      <rect width="180" height="310" rx="12" fill={`url(#${id}dots)`} />
      <g fill="none" stroke={`url(#${id}ink)`}>
        <rect x="8" y="8" width="164" height="294" rx="8" strokeWidth="1.2" />
        <rect x="13" y="13" width="154" height="284" rx="5" strokeWidth=".5" />
        <path
          d="M90 29C126 58 155 91 153 155C155 220 126 252 90 282C53 252 25 220 27 155C25 91 53 58 90 29Z"
          strokeWidth="1.3"
        />
        <path
          d="M90 43C118 69 142 98 140 155C142 211 118 240 90 267C62 240 38 211 40 155C38 98 62 69 90 43Z"
          strokeWidth=".6"
        />
        <circle cx="90" cy="155" r="48" />
        <circle cx="90" cy="155" r="42" strokeDasharray="1 4" />
        <path d="M90 89L125 155L90 221L55 155Z" />
        <path d="M90 108L105 155L90 202L75 155Z" />
        <path d="M43 155H137M90 62V248" strokeWidth=".5" />
        {[0, 1].map((i) => (
          <g key={i} transform={i ? "rotate(180 90 155)" : undefined}>
            <path d="M20 67Q47 66 58 31M25 59Q28 38 39 31M30 56Q49 56 52 41M160 67Q133 66 122 31M155 59Q152 38 141 31M150 56Q131 56 128 41" />
            <path
              d="M82 74Q90 67 98 74Q90 98 82 74Z"
              fill="#bca181"
              fillOpacity=".3"
            />
            <circle cx="90" cy="24" r="2" fill="#b69b78" />
          </g>
        ))}
      </g>
      <circle cx="90" cy="155" r="15" fill="#f9f3e9" stroke="#bb9a70" />
      <path
        d="M90 136L94 151L108 155L94 159L90 174L86 159L72 155L86 151Z"
        fill="#b49161"
      />
      {[
        [33, 98],
        [147, 98],
        [33, 212],
        [147, 212],
        [90, 53],
        [90, 257],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 4}l1 3 3 1-3 1-1 3-1-3-3-1 3-1z`}
          fill="#ab8e72"
        />
      ))}
    </svg>
  );
}
