export const voidParticleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uWarp;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  attribute float aRandom;
  attribute float aColorMix;
  varying float vColorMix;
  varying float vAlpha;
  varying float vWarp;
  varying vec2 vUv;

  float easeInQuart(float x) { return x * x * x * x; }

  void main() {
    vec4 instanceOrigin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec3 origin = instanceOrigin.xyz;

    float orbit = uTime * (0.025 + aRandom * 0.018);
    float c = cos(orbit);
    float s = sin(orbit);
    origin.xy = mat2(c, -s, s, c) * origin.xy;

    vec2 mousePosition = uMouse * vec2(3.7, 2.2);
    vec2 delta = origin.xy - mousePosition;
    float distanceToMouse = max(length(delta), 0.001);
    float repel = smoothstep(1.15, 0.0, distanceToMouse) * (1.0 - uWarp);
    origin.xy += normalize(delta) * repel * (0.18 + aRandom * 0.34);

    float warpPulse = sin(min(uWarp, 1.0) * 3.14159265);
    origin.z += easeInQuart(warpPulse) * (4.0 + aRandom * 14.0);
    origin.xy *= 1.0 + warpPulse * (0.08 + aRandom * 0.22);

    vec4 mvPosition = modelViewMatrix * vec4(origin, 1.0);
    vec4 clipPosition = projectionMatrix * mvPosition;
    vec2 ndc = clipPosition.xy / max(clipPosition.w, 0.0001);
    vec2 pointerDelta = ndc - uMouse;
    float pointerDistance = max(length(pointerDelta), 0.0001);
    float screenRepel = pow(1.0 - smoothstep(0.0, 0.24, pointerDistance), 2.0);
    ndc += normalize(pointerDelta) * screenRepel * 0.055 * (1.0 - uWarp);
    clipPosition.xy = ndc * clipPosition.w;

    float perspective = clamp(5.4 / max(0.4, -mvPosition.z), 0.35, 4.2);
    float twinkle = 0.68 + 0.32 * sin(uTime * (0.8 + aRandom * 2.4) + aRandom * 40.0);
    float widthPx = (0.75 + aRandom * 2.0) * perspective * twinkle * uPixelRatio;
    vec2 radial = length(ndc) > 0.0001 ? normalize(ndc) : vec2(0.0, 1.0);
    vec2 tangent = normalize(mix(vec2(0.0, 1.0), radial, warpPulse));
    vec2 normal = vec2(-tangent.y, tangent.x);
    float lengthPx = mix(widthPx, widthPx * (8.0 + aRandom * 26.0), warpPulse);
    vec2 corner = (uv - 0.5) * 2.0;
    vec2 pixelOffset = normal * corner.x * widthPx + tangent * corner.y * lengthPx;
    clipPosition.xy += pixelOffset * (2.0 / uResolution) * clipPosition.w;

    gl_Position = clipPosition;
    vColorMix = aColorMix;
    vAlpha = twinkle * (1.0 - smoothstep(0.5, 0.98, uWarp));
    vWarp = warpPulse;
    vUv = uv;
  }
`;

export const voidParticleFragment = /* glsl */ `
  uniform vec3 uBlue;
  uniform vec3 uGold;
  uniform vec3 uEmber;
  varying float vColorMix;
  varying float vAlpha;
  varying float vWarp;
  varying vec2 vUv;

  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float halfBody = mix(0.0, 0.72, vWarp);
    float capsule = length(vec2(q.x, max(abs(q.y) - halfBody, 0.0)));
    float softDisc = 1.0 - smoothstep(0.26, 0.56, capsule);
    float tail = mix(1.0, smoothstep(-1.0, 0.78, q.y), vWarp * 0.7);
    vec3 coldToGold = mix(uBlue, uGold, smoothstep(0.12, 0.78, vColorMix));
    vec3 color = mix(coldToGold, uEmber, smoothstep(0.82, 1.0, vColorMix));
    float energy = 2.2 + vWarp * 6.8;
    gl_FragColor = vec4(color * energy, softDisc * tail * vAlpha);
    if (gl_FragColor.a < 0.004) discard;
  }
`;

export const flowParticleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uPixelRatio;
  attribute vec3 aNext;
  attribute float aSeed;
  attribute float aEnergy;
  varying float vEnergy;
  varying float vAlpha;

  void main() {
    float progress = fract(uTime * (0.055 + aEnergy * 0.09) + aSeed);
    float eased = progress * progress * (3.0 - 2.0 * progress);
    vec3 current = mix(position, aNext, eased);
    current.x += sin(uTime * 0.7 + aSeed * 31.0) * 0.018 * aEnergy;
    current.y += cos(uTime * 0.6 + aSeed * 19.0) * 0.024 * aEnergy;
    vec4 mvPosition = modelViewMatrix * vec4(current, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (1.3 + aEnergy * 3.4) * uPixelRatio * clamp(7.0 / -mvPosition.z, 0.65, 2.6);
    vEnergy = aEnergy;
    vAlpha = sin(progress * 3.14159265) * uReveal;
  }
`;

export const flowParticleFragment = /* glsl */ `
  uniform vec3 uBlue;
  uniform vec3 uGold;
  uniform vec3 uEmber;
  varying float vEnergy;
  varying float vAlpha;

  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.05, distanceToCenter) * vAlpha;
    vec3 color = mix(uBlue, uGold, smoothstep(0.25, 0.75, vEnergy));
    color = mix(color, uEmber, smoothstep(0.86, 1.0, vEnergy));
    gl_FragColor = vec4(color, alpha);
  }
`;
