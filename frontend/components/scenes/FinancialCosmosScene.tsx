"use client";

import { SceneCanvas } from "./SceneCanvas";
import { FinancialHelix } from "./FinancialHelix";
import { ParticleField } from "./ParticleField";
import { useScrollStore } from "@/lib/scrollStore";

export function FinancialCosmosScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-void">
      <div className="nexus-canvas-layer">
        <SceneCanvas cameraPosition={[0, 0, 10]}>
          <ParticleField count={2500} radius={9} scrollProgress={progress} shape="sphere" pointSize={18} />
          <FinancialHelix scrollProgress={progress} />
        </SceneCanvas>
      </div>
      <div className="nexus-content-layer px-6 md:px-24 items-center text-center">
        <p data-nexus-reveal className="hud-label mb-4">
          DIMENSION 05 · THE FINANCIAL COSMOS
        </p>
        <h2 data-nexus-reveal className="font-display text-4xl md:text-6xl font-light max-w-3xl mx-auto text-balance">
          Bull and bear forces spiral around every ticker.
        </h2>
        <p data-nexus-reveal className="mt-6 max-w-xl mx-auto text-nexus-muted text-lg">
          The Financial Agent reads revenue trends and margin structure while
          the Sentiment Agent reads what the crowd believes — two strands of
          the same double helix.
        </p>
      </div>
    </section>
  );
}
