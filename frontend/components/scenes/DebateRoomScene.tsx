"use client";

import { SceneCanvas } from "./SceneCanvas";
import { NeuralGraph } from "./NeuralGraph";
import { useScrollStore } from "@/lib/scrollStore";

const PERSONAS = ["Growth Advocate", "Risk Skeptic", "Macro Realist"];

export function DebateRoomScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-abyss">
      <div className="nexus-canvas-layer opacity-60">
        <SceneCanvas cameraPosition={[0, 0, 7]}>
          <NeuralGraph scrollProgress={progress} nodeLabels={["A", "B", "C", "D", "E", "F"]} />
        </SceneCanvas>
      </div>
      <div className="nexus-content-layer px-6 md:px-24 items-start">
        <p data-nexus-reveal className="hud-label mb-4">
          DIMENSION 06 · THE AI BOARD ROOM
        </p>
        <h2 data-nexus-reveal className="font-display text-4xl md:text-6xl font-light max-w-2xl text-balance">
          Before NEXUS decides, it argues with itself.
        </h2>
        <div className="mt-8 grid gap-4 max-w-2xl">
          {PERSONAS.map((persona) => (
            <div
              key={persona}
              data-nexus-reveal
              className="border-l-2 border-nexus-accent/50 pl-4 py-1"
            >
              <span className="font-mono text-xs text-nexus-signal uppercase tracking-widest">
                {persona}
              </span>
              <p className="text-nexus-muted mt-1">
                {persona === "Growth Advocate" &&
                  "Argues from opportunity and upside, grounded in the Research and Forecast agents' findings."}
                {persona === "Risk Skeptic" &&
                  "Argues from downside and hidden risk, drawing on the Risk Agent's non-obvious findings."}
                {persona === "Macro Realist" &&
                  "Argues from cycle timing, weighing the Macro Agent's read on rates and sector conditions."}
              </p>
            </div>
          ))}
        </div>
        <p data-nexus-reveal className="mt-8 max-w-xl text-nexus-muted">
          The CEO Agent chairs the debate and renders a final verdict — reconciled,
          not averaged.
        </p>
      </div>
    </section>
  );
}
