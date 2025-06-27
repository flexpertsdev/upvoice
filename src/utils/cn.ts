import { clsx, type ClassValue } from 'clsx';

/**
 * Combines class names using clsx
 * Useful for conditional classes and merging Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}