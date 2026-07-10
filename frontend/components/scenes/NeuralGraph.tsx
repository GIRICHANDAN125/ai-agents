"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NeuralGraphProps {
  scrollProgress: number;
  nodeLabels: string[];
}

/**
 * Renders the ten NEXUS agents as glowing nodes connected by pulsing edges —
 * a literal, readable diagram of the multi-agent system rather than an
 * abstract decorative shape. Node positions are laid out on a sphere so the
 * graph reads clearly from any camera angle as the scene rotates.
 */
export function NeuralGraph({ scrollProgress, nodeLabels }: NeuralGraphProps) {
  const groupRef = useRef<THREE.Group>(null);

  const nodePositions = useMemo(() => {
    const n = nodeLabels.length;
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 3.4;
      positions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return positions;
  }, [nodeLabels.length]);

  const edges = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    // Connect every node to its two nearest neighbours plus one long-range
    // "synthesis" link to the last node (Decision/CEO), mirroring how the
    // real LangGraph workflow fans in toward a final synthesis stage.
    for (let i = 0; i < nodePositions.length; i++) {
      const next = (i + 1) % nodePositions.length;
      lines.push([nodePositions[i], nodePositions[next]]);
      lines.push([nodePositions[i], nodePositions[nodePositions.length - 1]]);
    }
    return lines;
  }, [nodePositions]);

  const edgeLines = useMemo(() => {
    return edges.map(([a, b]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
      const material = new THREE.LineBasicMaterial({ color: "#2c3a63", transparent: true, opacity: 0.35 });
      return new THREE.Line(geometry, material);
    });
  }, [edges]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08 + scrollProgress * 2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {edgeLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      {nodePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <icosahedronGeometry args={[0.14, 1]} />
          <meshStandardMaterial
            color={i === nodePositions.length - 1 ? "#33ffc7" : "#4f8cff"}
            emissive={i === nodePositions.length - 1 ? "#33ffc7" : "#4f8cff"}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
