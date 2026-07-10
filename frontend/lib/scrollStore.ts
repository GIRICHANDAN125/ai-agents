import { create } from "zustand";

interface ScrollStoreState {
  progress: number[];
  setProgress: (index: number, value: number) => void;
}

/**
 * Holds a 0-1 scroll progress value per scene section. GSAP ScrollTrigger
 * writes into this store as the user scrolls; each Three.js scene subscribes
 * only to its own index so re-renders stay isolated per scene.
 */
export const useScrollStore = create<ScrollStoreState>((set) => ({
  progress: new Array(12).fill(0),
  setProgress: (index, value) =>
    set((state) => {
      if (state.progress[index] === value) return state;
      const next = [...state.progress];
      next[index] = value;
      return { progress: next };
    }),
}));
