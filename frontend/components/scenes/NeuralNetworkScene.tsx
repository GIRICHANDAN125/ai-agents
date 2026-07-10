"use client";

import { SceneCanvas } from "./SceneCanvas";
import { NeuralGraph } from "./NeuralGraph";
import { useScrollStore } from "@/lib/scrollStore";

const AGENTS = [
  "Research",
  "News",
  "Financial",
  "Macro",
  "Risk",
  "Sentiment",
  "Forecast",
  "Memory",
  "Decision",
  "CEO",
];

export function NeuralNetworkScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-void">
      <div className="nexus-canvas-layer">
        <SceneCanvas cameraPosition={[0, 0, 9]}>
          <NeuralGraph scrollProgress={progress} nodeLabels={AGENTS} />
        </SceneCanvas>
      </div>
      <div className="nexus-content-layer px-6 md:px-24 items-end text-right">
        <p data-nexus-reveal className="hud-label mb-4">
          DIMENSION 03 · THE NEURAL NETWORK
        </p>
        <h2 data-nexus-reveal className="font-display text-4xl md:text-6xl font-light max-w-2xl text-balance">
          Ten independent agents.
          <br />
          <span className="text-nexus-signal">One converging mind.</span>
        </h2>
        <p data-nexus-reveal className="mt-6 max-w-xl text-nexus-muted text-lg">
          Research, News, Financial, Macro, Risk, Sentiment, and Forecast agents work
          in parallel. Memory recalls what NEXUS has learned before. Decision and CEO
          agents synthesize it all into one call.
        </p>
      </div>
    </section>
  );
}
