"use client";

import { ScrollController } from "@/components/ScrollController";
import { BootSequenceScene } from "@/components/scenes/BootSequenceScene";
import { ParticleUniverseScene } from "@/components/scenes/ParticleUniverseScene";
import { NeuralNetworkScene } from "@/components/scenes/NeuralNetworkScene";
import { DataHighwaysScene } from "@/components/scenes/DataHighwaysScene";
import { FinancialCosmosScene } from "@/components/scenes/FinancialCosmosScene";
import { DebateRoomScene } from "@/components/scenes/DebateRoomScene";
import { CommandCenterScene } from "@/components/scenes/CommandCenterScene";

export default function HomePage() {
  return (
    <main>
      <ScrollController />
      <BootSequenceScene index={0} />
      <ParticleUniverseScene index={1} />
      <NeuralNetworkScene index={2} />
      <DataHighwaysScene index={3} />
      <FinancialCosmosScene index={4} />
      <DebateRoomScene index={5} />
      <CommandCenterScene index={6} />
    </main>
  );
}
