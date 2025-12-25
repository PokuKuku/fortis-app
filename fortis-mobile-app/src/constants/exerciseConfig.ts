/**
 * Exercise API configuration.
 *
 * To switch APIs, change `activeApi` to 'rapidapi' and ensure
 * EXPO_PUBLIC_EXERCISEDB_API_KEY is set in .env.local
 */

type ApiProvider = 'opensource' | 'rapidapi';

// ============================================
// SWITCH API HERE
// ============================================
const activeApi = 'opensource' as ApiProvider;

// Open source ExerciseDB v1 (free, includes GIFs)
const OPENSOURCE_CONFIG = {
  apiBaseUrl: 'https://exercisedb-api.vercel.app/api/v1',
  pageSize: 250,
  hasDirectGifUrl: true,
};

// RapidAPI ExerciseDB (paid tiers have higher resolution GIFs)
const RAPIDAPI_CONFIG = {
  apiBaseUrl: 'https://exercisedb.p.rapidapi.com',
  apiHost: 'exercisedb.p.rapidapi.com',
  pageSize: 10, // Free tier limit
  imageResolution: 360, // 180, 360, 720, or 1080
  hasDirectGifUrl: false,
};

export const EXERCISE_CONFIG = {
  activeApi,
  ...(activeApi === 'opensource' ? OPENSOURCE_CONFIG : RAPIDAPI_CONFIG),

  /**
   * Cache duration in milliseconds (30 days)
   */
  cacheDurationMs: 30 * 24 * 60 * 60 * 1000,
};

// Type exports for use in other files
export type { ApiProvider };
