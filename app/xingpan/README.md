# DestinyPixel Xingpan

`/xingpan` is a single-canvas, three-phase WebGL experience. The Canvas and
post-processing pipeline stay mounted while the camera moves through `void →
warp → core`, avoiding context recreation between scenes.

## Module map

```text
app/xingpan/
├── page.tsx                          server route
├── layout.tsx                        route metadata + viewport
├── ClientEntry.tsx                   client-only WebGL boundary
├── types.ts                          serializable visual data contract
├── data/destiny-profile.ts           JSON → deterministic visual profile
├── shaders/particle-shaders.ts       void + timeline GLSL
├── components/
│   ├── XingpanExperience.tsx         state machine and pointer field
│   ├── DestinyCanvas.tsx             camera director and single Canvas
│   ├── three/
│   │   ├── VoidParticleField.tsx     instanced particles + warp filaments
│   │   ├── DestinyCore.tsx           curve, nodes and celestial rings
│   │   └── PostEffects.tsx           bloom, vignette and chromatic split
│   └── ui/
│       ├── BirthConsole.tsx
│       ├── DestinyHud.tsx
│       └── SystemChrome.tsx
└── xingpan.css                       route-scoped visual system
```

## Data integration

Three components consume the serializable `DestinyProfile` contract:

- `VoidParticleField` reads `palette` and the profile ID seed.
- `DestinyCore` maps `cycles[].intensity` and `cycles[].valence` to the life
  curve, nodes and particle energy.
- `CelestialRings` maps `elements`, `zodiac` and `jiazi` to ring color and
  marker distribution.

Replace `createDestinyProfile()` with the production Bazi / natal-chart mapper,
or pass an already-normalized `DestinyProfile`. Keep raw calculation logic out
of the render components so GPU buffers remain deterministic and reusable.
