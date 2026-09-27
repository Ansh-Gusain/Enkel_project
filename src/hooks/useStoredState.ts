// ─────────────────────────────────────────────────────────────
// useStoredState.ts
// Works like useState but automatically saves to localStorage.
// Key is namespaced under "enkel:" to avoid collisions.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";

export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`enkel:${key}`);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem(`enkel:${key}`, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
