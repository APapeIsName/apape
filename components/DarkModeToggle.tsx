"use client";

import { useTheme } from "./ThemeProvider";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 flex items-center justify-center border-2 border-nord-light-secondary dark:border-nord-dark-secondary hover:border-nord-light-accent dark:hover:border-nord-dark-accent transition-colors"
    >
      {theme === "dark" ? (
        <span className="material-symbols-outlined text-lg">light_mode</span>
      ) : (
        <span className="material-symbols-outlined text-lg">dark_mode</span>
      )}
    </button>
  );
}
