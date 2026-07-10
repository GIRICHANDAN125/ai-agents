"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SceneCanvas } from "./SceneCanvas";
import { ParticleField } from "./ParticleField";
import { useScrollStore } from "@/lib/scrollStore";

const BOOT_LINES = [
  "INITIALIZING NEXUS KERNEL",
  "LOADING AGENT REGISTRY :: 10 AGENTS FOUND",
  "ESTABLISHING GEMINI REASONING LINK",
  "CALIBRATING RISK, SENTIMENT & FORECAST MODELS",
  "MOUNTING COMPANY MEMORY LAYER",
  "SYSTEM READY",
];

export function BootSequenceScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);
  const [visibleLines, setVisibleLines] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => (v < BOOT_LINES.length ? v + 1 : v));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-void">
      <div className="nexus-canvas-layer">
        <SceneCanvas cameraPosition={[0, 0, 6]}>
          <ParticleField
            count={4000}
            radius={4}
            scrollProgress={progress}
            shape="sphere"
            accentColor="#4f8cff"
          />
        </SceneCanvas>
      </div>
      <div className="nexus-canvas-layer scanline" />
      <div className="nexus-content-layer items-center text-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hud-label mb-6"
        >
          NEXUS OS · BOOT SEQUENCE
        </motion.p>
        <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight text-balance">
          You are not opening a website.
          <br />
          <span className="text-nexus-accent">You are booting an intelligence.</span>
        </h1>
        <div className="mt-10 font-mono text-sm text-left mx-auto max-w-md space-y-1">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-nexus-muted"
            >
              <span className="text-nexus-signal">✓</span> {line}
              {i === visibleLines - 1 && visibleLines < BOOT_LINES.length && (
                <span className="animate-pulseGlow">▌</span>
              )}
            </motion.div>
          ))}
        </div>
        <p className="hud-label mt-12 animate-pulseGlow">scroll to descend ↓</p>
      </div>
    </section>
  );
}
