import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes where necessary.
 *
 * @param {...ClassValue[]} inputs - An array of class values to be combined.
 * @returns {string} A single string containing the combined class names.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
