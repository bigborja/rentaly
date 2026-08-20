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
        rest: "0 1px 0 rgba(28, 23, 18, 0.06), 0 10px 24px -18px rgba(28, 23, 18, 0.38)",
        lift: "0 1px 0 rgba(196, 163, 106, 0.45), 0 24px 48px -24px rgba(28, 23, 18, 0.5)",
        float: "0 12px 32px -20px rgba(28, 23, 18, 0.42)",
        card: "0 1px 0 rgba(28, 23, 18, 0.06), 0 10px 24px -18px rgba(28, 23, 18, 0.38)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
