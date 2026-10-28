"use client";

import { useSyncExternalStore } from "react";

let cached: Date | null = null;
const subscribe = () => () => {};

/** Today's date. null while the server renders, the real date once in the browser. */
export function useToday(): Date | null {
  return useSyncExternalStore(
    subscribe,
    () => (cached ??= new Date()),
    () => null,
  );
}
