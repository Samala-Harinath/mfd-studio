"use client";

import { useCallback, useSyncExternalStore } from "react";

export type DashboardTheme = "light" | "dark";

const KEY = "mfd-dashboard-theme";
const EVENT = "mfd-dashboard-theme";

function read(): DashboardTheme {
  return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The office's own light or dark look. It never changes the MFD's public website. */
export function useDashboardTheme() {
  const theme = useSyncExternalStore<DashboardTheme>(subscribe, read, () => "light");
  const setTheme = useCallback((next: DashboardTheme) => {
    window.localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
