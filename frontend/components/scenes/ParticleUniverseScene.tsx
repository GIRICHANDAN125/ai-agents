"use client";

import { SceneCanvas } from "./SceneCanvas";
import { ParticleField } from "./ParticleField";
import { useScrollStore } from "@/lib/scrollStore";

export function ParticleUniverseScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-void">
      <div className="nexus-canvas-layer">
        <SceneCanvas cameraPosition={[0, 0, 9]}>
          <ParticleField
            count={12000}
            radius={7}
            scrollProgress={progress}
            shape="sphere"
            baseColor="#151b30"
            accentColor="#8a5cff"
          />
        </SceneCanvas>
      </div>
      <div className="nexus-content-layer px-6 md:px-24 items-start">
        <p data-nexus-reveal className="hud-label mb-4">
          DIMENSION 02 · THE PARTICLE UNIVERSE
        </p>
        <h2 data-nexus-reveal className="font-display text-4xl md:text-6xl font-light max-w-2xl text-balance">
          Every particle is a fragment of market data,
          <span className="text-nexus-accent2"> waiting to be understood.</span>
        </h2>
        <p data-nexus-reveal className="mt-6 max-w-xl text-nexus-muted text-lg">
          Prices, headlines, filings, sentiment — NEXUS treats the entire investable
          universe as one living field. Nothing is analyzed in isolation.
        </p>
      </div>
    </section>
  );
}
