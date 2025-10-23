import { useCallback, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "digituuls-theme";

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyThemeClass = (theme: ThemeMode) => {
  if (typeof window === "undefined") {
    return;
  }
  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useThemeMode = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const preferredTheme = getPreferredTheme();
    if (typeof window !== "undefined") {
      applyThemeClass(preferredTheme);
    }
    return preferredTheme;
  });

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (!storedTheme) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const setThemeMode = useCallback(
    (value: ThemeMode | ((previous: ThemeMode) => ThemeMode)) => {
      setTheme((prev) => {
        const nextTheme = typeof value === "function" ? value(prev) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, nextTheme);
        }
        return nextTheme;
      });
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setThemeMode((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  }, [setThemeMode]);

  return {
    theme,
    setThemeMode,
    toggleTheme,
    isDark: theme === "dark",
  };
};
