/**
 * Secure UUID Generation Utility
 *
 * Uses expo-crypto for cryptographically secure UUID generation.
 * All local ID generation should use this utility instead of Math.random().
 */
import * as Crypto from 'expo-crypto';

/**
 * Generate a cryptographically secure UUID v4.
 *
 * Uses the platform's secure random source (e.g., /dev/urandom on iOS/Android).
 * Should be used for all local IDs that may be synced to the server or
 * used in contexts where predictability could be a security concern.
 */
export function generateSecureUUID(): string {
  return Crypto.randomUUID();
}

/**
 * @deprecated Use generateSecureUUID instead
 * Legacy alias for backward compatibility during migration
 */
export const generateId = generateSecureUUID;
