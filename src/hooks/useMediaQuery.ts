"use client";

import { useSyncExternalStore } from "react";

/** Live CSS media query match (false during server rendering). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
