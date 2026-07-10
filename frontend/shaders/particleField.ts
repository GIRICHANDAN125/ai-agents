// Instanced particle field shaders used across the NEXUS scene universe.
// Positions are animated on the GPU (vertex shader) so tens of thousands of
// particles can breathe, drift, and react to scroll progress without ever
// touching the CPU per-frame.

export const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uPointSize;
  uniform vec3 uAccentColor;
  uniform vec3 uBaseColor;

  attribute float aRandom;
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Gentle organic drift so the field feels alive at rest.
    float driftX = sin(uTime * 0.15 + aRandom * 6.2831) * 0.6;
    float driftY = cos(uTime * 0.12 + aRandom * 4.71) * 0.6;
    float driftZ = sin(uTime * 0.1 + aRandom * 3.14) * 0.4;
    pos += vec3(driftX, driftY, driftZ) * aRandom;

    // Scroll progress pulls particles inward, simulating travel through the
    // "dimension" as the user scrolls from one scene to the next.
    pos *= mix(1.0, 0.35, uScrollProgress);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthScale = 300.0 / -mvPosition.z;
    gl_PointSize = uPointSize * aSize * depthScale;

    vColor = mix(uBaseColor, uAccentColor, aRandom);
    vAlpha = smoothstep(0.0, 1.0, aRandom) * 0.9 + 0.1;
  }
`;

export const particleFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    float glow = smoothstep(0.5, 0.0, dist);
    if (glow < 0.02) discard;
    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`;
