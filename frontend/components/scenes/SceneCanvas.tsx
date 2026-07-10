"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import React from "react";

interface SceneCanvasProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
}

/**
 * Shared R3F canvas shell for every scene in the NEXUS journey. Centralizes
 * camera setup and a consistent postprocessing stack (bloom + vignette +
 * subtle chromatic aberration) so every scene shares the same cinematic
 * "AI operating system" look without duplicating boilerplate.
 */
export function SceneCanvas({ children, cameraPosition = [0, 0, 8], fov = 55 }: SceneCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: cameraPosition, fov }}
    >
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#05070d", 6, 16]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#4f8cff" />
      <pointLight position={[-5, -3, -5]} intensity={0.8} color="#8a5cff" />
      {children}
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
