"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DataHighwayProps {
  scrollProgress: number;
  laneCount?: number;
}

/**
 * A perspective grid of light-lanes rushing toward the viewer, representing
 * the flow of market data streaming into the agents. Built from raw line
 * geometry (no textures) so it stays crisp and GPU-cheap at any resolution.
 */
export function DataHighway({ scrollProgress, laneCount = 14 }: DataHighwayProps) {
  const groupRef = useRef<THREE.Group>(null);

  const lanes = useMemo(() => {
    const items: { x: number; offset: number }[] = [];
    for (let i = 0; i < laneCount; i++) {
      items.push({
        x: (i - laneCount / 2) * 0.9,
        offset: Math.random() * 10,
      });
    }
    return items;
  }, [laneCount]);

  const laneObjects = useMemo(() => {
    return lanes.map((lane) => {
      const points = [new THREE.Vector3(lane.x, 0, -10), new THREE.Vector3(lane.x, 0, 10)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: lanes.indexOf(lane) % 3 === 0 ? "#33ffc7" : "#2f4a8a",
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(geometry, material);
      return { line, offset: lane.offset };
    });
  }, [lanes]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      child.position.z = ((child.position.z + delta * (6 + scrollProgress * 14)) % 20) - 10;
    });
    groupRef.current.position.y = -1.5 + scrollProgress * 0.5;
  });

  return (
    <group ref={groupRef} rotation={[0.35, 0, 0]}>
      {laneObjects.map((item, i) => (
        <primitive key={i} object={item.line} position={[0, 0, item.offset]} />
      ))}
    </group>
  );
}
