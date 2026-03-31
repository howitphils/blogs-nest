export const safeRegex = (string: string): string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Converts all regex command symbols to plain strings
