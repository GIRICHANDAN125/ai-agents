"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleVertexShader, particleFragmentShader } from "@/shaders/particleField";

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  scrollProgress: number;
  baseColor?: string;
  accentColor?: string;
  pointSize?: number;
  shape?: "sphere" | "disc" | "grid";
}

/**
 * A GPU-driven point cloud used as the base layer for the Boot Sequence,
 * Particle Universe, and Financial Cosmos scenes. Particle positions are
 * generated once on the CPU (cheap) and then animated entirely in the vertex
 * shader (breathing drift + scroll-driven convergence) so it stays at 60fps
 * even with tens of thousands of points.
 */
export function ParticleField({
  count = 6000,
  radius = 6,
  scrollProgress,
  baseColor = "#1c2440",
  accentColor = "#4f8cff",
  pointSize = 34,
  shape = "sphere",
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let z = 0;

      if (shape === "sphere") {
        const r = radius * Math.cbrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      } else if (shape === "disc") {
        const r = radius * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = (Math.random() - 0.5) * 0.4;
      } else {
        x = (Math.random() - 0.5) * radius * 2;
        y = (Math.random() - 0.5) * radius * 2;
        z = (Math.random() - 0.5) * radius * 2;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      randoms[i] = Math.random();
      sizes[i] = 0.4 + Math.random() * 1.2;
    }

    return { positions, randoms, sizes };
  }, [count, radius, shape]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uPointSize: { value: pointSize },
      uAccentColor: { value: new THREE.Color(accentColor) },
      uBaseColor: { value: new THREE.Color(baseColor) },
    }),
    [pointSize, accentColor, baseColor]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
