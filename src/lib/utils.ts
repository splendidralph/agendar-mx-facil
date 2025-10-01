import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes time string from "HH:MM:SS" or "HH:MM" to "HH:MM" format.
 * This is crucial for syncing database values with time select components.
 */
export const normalizeTimeFormat = (time: string | null | undefined): string | null => {
  if (!time) return null;
  // Use substring to ensure only HH:MM is kept, regardless of :SS presence
  return time.substring(0, 5);
}
