import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#141416",
          900: "#1B1B1E",
          800: "#232327",
          700: "#2A2A2F",
          600: "#3A3A40",
          500: "#4C4C54",
        },
        bone: {
          100: "#F2F0EA",
          300: "#C9C7C0",
          500: "#8B8B92",
        },
        amber: {
          400: "#FFC857",
          500: "#F5A623",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        keycap: "0 6px 0 0 rgba(0,0,0,0.45), 0 10px 18px rgba(0,0,0,0.35)",
        keycapPressed: "0 2px 0 0 rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.3)",
        glow: "0 0 0 3px rgba(255,200,87,0.35), 0 6px 0 0 rgba(0,0,0,0.45), 0 10px 24px rgba(255,200,87,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
