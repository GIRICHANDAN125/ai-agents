import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          void: "#05070d",
          abyss: "#0b0f1a",
          panel: "#111726",
          accent: "#4f8cff",
          accent2: "#8a5cff",
          signal: "#33ffc7",
          warn: "#ff5c72",
          text: "#e6ecff",
          muted: "#7c8aad",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "nexus-radial":
          "radial-gradient(ellipse at 50% 0%, rgba(79,140,255,0.18), transparent 60%)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        scan: "scan 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
