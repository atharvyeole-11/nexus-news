"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or system preference (only on client)
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("nexus-theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      return storedTheme || systemTheme;
    }
    return "dark"; // Default to dark on server
  });

  const applyTheme = (newTheme) => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-theme", newTheme);
    }
  };

  useEffect(() => {
    // Apply theme on mount (client only)
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus-theme", newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
