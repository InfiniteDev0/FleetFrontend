"use client";
import { useLayoutEffect, useState } from "react";

import { ReactNode } from "react";

export function ThemeClientWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return children;
}
