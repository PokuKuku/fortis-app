/**
 * Utility functions for generating unique names for workouts and programs.
 */

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates a unique name by appending a number suffix if duplicates exist.
 *
 * @param baseName - The desired name (e.g., "KB Pull")
 * @param existingNames - Array of names that already exist in the same category
 * @returns A unique name (e.g., "KB Pull 2" if "KB Pull" exists)
 *
 * Examples:
 * - generateUniqueName("KB Pull", []) => "KB Pull"
 * - generateUniqueName("KB Pull", ["KB Pull"]) => "KB Pull 2"
 * - generateUniqueName("KB Pull", ["KB Pull", "KB Pull 2"]) => "KB Pull 3"
 * - generateUniqueName("KB Pull 2", ["KB Pull", "KB Pull 2"]) => "KB Pull 3"
 */
export function generateUniqueName(
  baseName: string,
  existingNames: string[]
): string {
  const trimmedName = baseName.trim();

  // Handle empty name edge case
  if (!trimmedName) {
    return 'Untitled';
  }

  // Normalize existing names for case-insensitive comparison
  const normalizedExisting = existingNames.map((n) => n.toLowerCase());

  // If no duplicates, return as-is
  if (!normalizedExisting.includes(trimmedName.toLowerCase())) {
    return trimmedName;
  }

  // Strip existing numeric suffix to get the root name
  // Matches "Name 2", "Name 23", etc. at the end
  const suffixMatch = trimmedName.match(/^(.+?)\s+(\d+)$/);
  const rootName = suffixMatch ? suffixMatch[1] : trimmedName;

  // Build regex to find all names matching this root or "root N"
  const regex = new RegExp(
    `^${escapeRegex(rootName)}(?:\\s+(\\d+))?$`,
    'i' // Case-insensitive
  );

  // Find the highest number suffix
  let maxNumber = 1; // Start at 1 since root exists
  for (const name of existingNames) {
    const match = name.match(regex);
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 1;
      maxNumber = Math.max(maxNumber, num);
    }
  }

  return `${rootName} ${maxNumber + 1}`;
}
