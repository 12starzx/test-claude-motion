/**
 * Shaders GLSL du fond « flowing mesh gradient ».
 *
 * Rendu 100 % déterministe : le temps est piloté par la frame Remotion
 * (uTime = frame / fps), le bruit est procédural (aucune texture, aucun
 * Math.random). Les couleurs arrivent en sRGB et sont mélangées telles quelles,
 * comme dans un outil de design.
 */

export const meshGradientVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // Plan plein écran : on ignore volontairement la caméra.
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const meshGradientFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uIntensity;   // 0 = noir, 1 = allumé (cold open)
uniform float uBloom;       // intensité du halo (culmine à la révélation)
uniform float uDrift;       // décalage vertical lent (parallaxe entre scènes)
uniform float uFocusDarken; // protection de la zone de lecture
uniform vec3 uBase;         // #080A12
uniform vec3 uDeep;         // #0B2A9E
uniform vec3 uPrimary;      // #2E6BFF
uniform vec3 uGlow;         // #4D83FF

varying vec2 vUv;

/* ---------- Bruit procédural (valeur 2D + fbm) ---------- */

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = rotation * p * 2.03 + 17.0;
    amplitude *= 0.5;
  }
  return value;
}

/* ---------- Pôles de couleur en orbite lente ---------- */

float pole(vec2 p, vec2 center, float spread) {
  vec2 d = p - center;
  return exp(-dot(d, d) * spread);
}

void main() {
  // Repère normalisé sur le petit côté : même composition en 16:9 et en 9:16.
  float aspect = uResolution.x / uResolution.y;
  vec2 halfSize = vec2(aspect, 1.0) * 0.5 / min(aspect, 1.0);
  vec2 centered = (vUv - 0.5) * 2.0 * halfSize;
  vec2 p = centered + vec2(0.0, uDrift);

  float t = uTime;

  // Domain warping : le champ se replie sur lui-même et « coule ».
  vec2 q = vec2(
    fbm(p * 1.5 + vec2(0.0, t * 0.045)),
    fbm(p * 1.5 + vec2(5.2, -t * 0.038))
  );
  vec2 r = vec2(
    fbm(p * 1.25 + 1.7 * q + vec2(1.7, 9.2) + t * 0.032),
    fbm(p * 1.25 + 1.7 * q + vec2(8.3, 2.8) - t * 0.027)
  );
  float field = fbm(p * 1.1 + 1.5 * r);

  // Trois pôles (bleu profond, bleu primaire, halo) qui dérivent.
  // Positions relatives au cadre (-1 à 1), identiques dans les deux formats.
  vec2 c1 = halfSize * vec2(-0.62,  0.60) + vec2(0.16 * sin(t * 0.19), 0.08 * cos(t * 0.23));
  vec2 c2 = halfSize * vec2( 0.58, -0.52) + vec2(0.14 * cos(t * 0.17), 0.09 * sin(t * 0.21));
  vec2 c3 = halfSize * vec2( 0.10,  0.84) + vec2(0.22 * sin(t * 0.13 + 1.3), 0.06 * cos(t * 0.29));
  vec2 c4 = halfSize * vec2(-0.30, -0.88) + vec2(0.18 * cos(t * 0.11 + 2.1), 0.07 * sin(t * 0.25));

  vec2 warped = p + (r - 0.5) * 0.45;
  float w1 = pole(warped, c1, 3.4);
  float w2 = pole(warped, c2, 3.8);
  float w3 = pole(warped, c3, 5.2);
  float w4 = pole(warped, c4, 4.4);

  // Nappes de bleu profond, aux bords organiques sculptés par le champ.
  float mass = (w1 + w4 * 0.85 + w3 * 0.6) * (0.3 + 1.0 * field);
  float deepAmount = smoothstep(0.1, 0.8, mass);
  vec3 color = mix(uBase, uDeep, deepAmount * 0.82);

  // Cœurs plus resserrés en bleu primaire.
  float core = smoothstep(0.28, 0.95, (w2 * 1.15 + w1 * 0.3) * (0.25 + field));
  color = mix(color, uPrimary, core * 0.5);

  // Filaments lumineux le long des plis du champ.
  float filaments = smoothstep(0.58, 0.92, field + 0.22 * length(r - q));
  color += uGlow * filaments * (0.07 + 0.16 * uBloom) * (w1 + w2 + w3 + 0.25);

  // Halo central (bloom) : discret au repos, intense à la révélation.
  float halo = pole(p, vec2(0.0, 0.02), 1.6);
  color += uGlow * halo * 0.22 * uBloom * (0.6 + 0.4 * field);

  // Lisibilité : la zone de lecture centrale reste sombre.
  float focusMask = exp(-dot(centered, centered) * 2.4);
  color *= 1.0 - uFocusDarken * focusMask * (1.0 - 0.35 * uBloom);

  // Plafond de luminance : jamais de zone trop claire sous le texte.
  color = min(color, vec3(0.30, 0.42, 0.78));

  // Allumage depuis le noir.
  color = mix(uBase * 0.55, color, uIntensity);

  // Dithering anti-banding (déterministe).
  color += (hash(gl_FragCoord.xy + fract(t * 7.0) * 91.7) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;
