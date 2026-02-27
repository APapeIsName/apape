import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nord Polar Night
        "nord-0": "#2E3440",
        "nord-1": "#3B4252",
        "nord-2": "#434C5E",
        "nord-3": "#4C566A",
        // Nord Snow Storm
        "nord-4": "#D8DEE9",
        "nord-5": "#E5E9F0",
        "nord-6": "#ECEFF4",
        // Nord Frost
        "nord-frost-1": "#8FBCBB",
        "nord-frost-2": "#88C0D0",
        "nord-frost-3": "#81A1C1",
        "nord-frost-4": "#5E81AC",
        // Semantic aliases
        "nord-light-bg": "#ECEFF4",
        "nord-light-text": "#2E3440",
        "nord-light-accent": "#5E81AC",
        "nord-light-secondary": "#4C566A",
        "nord-dark-bg": "#2E3440",
        "nord-dark-text": "#D8DEE9",
        "nord-dark-accent": "#88C0D0",
        "nord-dark-secondary": "#96A1B1",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "0px",
      },
    },
  },
  plugins: [],
};
export default config;
