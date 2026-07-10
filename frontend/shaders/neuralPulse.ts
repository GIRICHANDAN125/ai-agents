// Shader for the "Neural Network" and "Data Highways" scenes: pulses of light
// travel along connection lines to visualize agent-to-agent data flow.

export const neuralPulseVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const neuralPulseFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uDensity;
  varying vec2 vUv;

  void main() {
    float travel = fract(vUv.x * uDensity - uTime * uSpeed);
    float pulse = smoothstep(0.0, 0.08, travel) * smoothstep(0.16, 0.08, travel);
    float baseLine = 0.12;
    float intensity = baseLine + pulse * 1.4;
    gl_FragColor = vec4(uColor * intensity, intensity);
  }
`;
