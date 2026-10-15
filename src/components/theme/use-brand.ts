"use client";

import { useEffect } from "react";

export function useBrandColor(color: string, active = true) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--brand");
    root.style.setProperty("--brand", color);
    return () => {
      if (previous) root.style.setProperty("--brand", previous);
      else root.style.removeProperty("--brand");
    };
  }, [active, color]);
}
