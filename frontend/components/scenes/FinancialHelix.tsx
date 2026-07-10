"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FinancialHelixProps {
  scrollProgress: number;
  candleCount?: number;
}

/**
 * A double-helix of candlestick bars spiraling through space — the
 * "Financial Cosmos": each bar's height is procedurally varied like a real
 * price series, and the two strands slowly counter-rotate to suggest bull
 * and bear forces orbiting each other.
 */
export function FinancialHelix({ scrollProgress, candleCount = 90 }: FinancialHelixProps) {
  const strandA = useRef<THREE.Group>(null);
  const strandB = useRef<THREE.Group>(null);

  const candles = useMemo(() => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    return Array.from({ length: candleCount }, (_, i) => ({
      angle: (i / candleCount) * Math.PI * 6,
      y: (i / candleCount) * 10 - 5,
      height: 0.25 + rand() * 1.1,
      bullish: rand() > 0.45,
    }));
  }, [candleCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (strandA.current) strandA.current.rotation.y = t * 0.15 + scrollProgress * 1.5;
    if (strandB.current) strandB.current.rotation.y = -t * 0.15 - scrollProgress * 1.5;
  });

  const renderStrand = (radiusOffset: number) => (
    <>
      {candles.map((c, i) => {
        const radius = 2.6 + radiusOffset;
        const x = Math.cos(c.angle) * radius;
        const z = Math.sin(c.angle) * radius;
        return (
          <mesh key={i} position={[x, c.y, z]}>
            <boxGeometry args={[0.08, c.height, 0.08]} />
            <meshStandardMaterial
              color={c.bullish ? "#33ffc7" : "#ff5c72"}
              emissive={c.bullish ? "#33ffc7" : "#ff5c72"}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </>
  );

  return (
    <>
      <group ref={strandA}>{renderStrand(0)}</group>
      <group ref={strandB}>{renderStrand(0.6)}</group>
    </>
  );
}
