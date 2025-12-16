/**
 * Exercise data source configuration.
 *
 * To switch from local JSON to an API:
 * 1. Change `source` to 'api'
 * 2. Set `apiBaseUrl` to your API endpoint
 * 3. Implement fetchApiExercises() in exerciseService.ts
 */
export const EXERCISE_CONFIG = {
  /**
   * Data source type: 'local' uses bundled JSON, 'api' fetches from remote
   */
  source: 'local' as 'local' | 'api',

  /**
   * API base URL for remote exercise database (used when source is 'api')
   */
  apiBaseUrl: '',

  /**
   * Base URL for exercise images
   */
  imageBaseUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/',
};
