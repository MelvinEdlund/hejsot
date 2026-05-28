"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/theme";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Reads the theme the no-FOUC inline script already applied to <html>,
 * then keeps React state in sync and persists changes. Dark is the
 * default; light is opt-in (class "light" on <html>).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.classList.contains("light") ? "light" : "dark";
    setThemeState(current);
  }, []);

  const apply = useCallback((next: Theme) => {
    const root = document.documentElement;
    // Briefly enable color transitions so the flip feels smooth, not jarring.
    root.classList.add("theme-transition");
    root.classList.toggle("light", next === "light");
    window.setTimeout(() => root.classList.remove("theme-transition"), 550);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode / blocked storage — ignore */
    }
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    apply(theme === "dark" ? "light" : "dark");
  }, [theme, apply]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: apply }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
