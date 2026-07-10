"use client";

import Link from "next/link";
import { SceneCanvas } from "./SceneCanvas";
import { ParticleField } from "./ParticleField";
import { useScrollStore } from "@/lib/scrollStore";
import { useAuth } from "@/context/AuthContext";

export function CommandCenterScene({ index }: { index: number }) {
  const progress = useScrollStore((s) => s.progress[index]);
  const { user } = useAuth();

  return (
    <section data-nexus-scene className="nexus-scene bg-nexus-void">
      <div className="nexus-canvas-layer">
        <SceneCanvas cameraPosition={[0, 0, 6]}>
          <ParticleField count={5000} radius={5} scrollProgress={progress} accentColor="#33ffc7" />
        </SceneCanvas>
      </div>
      <div className="nexus-content-layer items-center text-center px-6">
        <p data-nexus-reveal className="hud-label mb-4">
          DIMENSION 07 · THE COMMAND CENTER
        </p>
        <h2 data-nexus-reveal className="font-display text-4xl md:text-6xl font-light max-w-3xl mx-auto text-balance">
          Enter the operating system.
        </h2>
        <p data-nexus-reveal className="mt-6 max-w-xl mx-auto text-nexus-muted text-lg">
          Run a live ticker through all ten agents, watch the Live Agent Monitor,
          read the board debate, and export a full intelligence report.
        </p>
        <div data-nexus-reveal className="mt-10 flex gap-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-8 py-3 bg-nexus-accent text-nexus-void font-mono text-sm uppercase tracking-widest rounded-sm hover:bg-nexus-signal transition-colors"
          >
            {user ? "Open Command Center" : "Sign In To Continue"}
          </Link>
        </div>
      </div>
    </section>
  );
}
