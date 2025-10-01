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

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * Example: "09:00" -> "9:00 AM", "17:30" -> "5:30 PM"
 */
export const formatTimeTo12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}
