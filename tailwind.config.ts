import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4efe4",
        ink: "#1c1712",
        wine: "#8f1d2c",
        "wine-dark": "#6c1521",
        gold: "#c4a36a",
        sage: "#3f5e54",
        mist: "#e7e0d2",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 40px -24px rgba(28, 23, 18, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
