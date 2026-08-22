"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

export function PostFx() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={1.45} luminanceThreshold={0.16} luminanceSmoothing={0.82} mipmapBlur />
      <Vignette darkness={0.72} offset={0.18} />
    </EffectComposer>
  );
}
