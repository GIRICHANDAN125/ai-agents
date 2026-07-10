"use client";

import { SceneCanvas } from "./SceneCanvas";
import { DataHighway } from "./DataHighway";
import { useScrollStore } from "@/lib/scrollStore";

export function DataHighwaysScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-void">
      <div className="nexus-canvas-layer">
        <SceneCanvas cameraPosition={[0, 1.5, 7]} fov={65}>
          <DataHighway scrollProgress={progress} />
        </SceneCanvas>
      </div>
      <div className="nexus-content-layer px-6 md:px-24 items-start justify-end pb-24">
        <p data-nexus-reveal className="hud-label mb-4">
          DIMENSION 04 · DATA HIGHWAYS
        </p>
        <h2 data-nexus-reveal className="font-display text-4xl md:text-6xl font-light max-w-2xl text-balance">
          Live feeds become lanes of light.
        </h2>
        <p data-nexus-reveal className="mt-6 max-w-xl text-nexus-muted text-lg">
          Every agent runs through the same LangGraph pipeline: research and
          macro context stream in first, risk and sentiment analyze what
          arrives, then forecast and memory carry it forward.
        </p>
      </div>
    </section>
  );
}
