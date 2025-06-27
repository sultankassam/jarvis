"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "ironman" | "tron" | "matrix";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("ironman");

  useEffect(() => {
    const saved = localStorage.getItem("jarvis-theme") as Theme;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("jarvis-theme", theme);
    document.documentElement.className = "";
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
