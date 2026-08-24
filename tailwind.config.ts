import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#080808",
        char: "#0f0f0f",
        panel: "#141414",
        line: "#262626",
        flame: {
          DEFAULT: "#FF4D00",
          soft: "#FF7A00",
        },
        amber: "#FFB347",
        bone: "#F5F1EA",
        smoke: "#8a8a86",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "grain": "url('/assets/noise.png')",
        "flame-gradient": "linear-gradient(135deg, #FF4D00 0%, #FF7A00 55%, #FFB347 100%)",
      },
      boxShadow: {
        "flame-glow": "0 0 60px -10px rgba(255,77,0,0.45)",
      },
      letterSpacing: {
        widest2: "0.35em",
      },
    },
  },
  plugins: [],
};
export default config;
