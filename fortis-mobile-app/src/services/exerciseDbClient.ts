import { ExerciseDbResponse } from '@/src/types/exercise';
import { EXERCISE_CONFIG } from '@/src/constants/exerciseConfig';

/**
 * API response wrapper from open source ExerciseDB v1
 */
interface OpenSourceApiResponse {
  success: boolean;
  data: ExerciseDbResponse[];
}

/**
 * Client for ExerciseDB APIs.
 * Supports both open source and RapidAPI versions.
 */
class ExerciseDbClient {
  private isRapidApi(): boolean {
    return EXERCISE_CONFIG.activeApi === 'rapidapi';
  }

  private getHeaders(): HeadersInit {
    if (!this.isRapidApi()) {
      return {};
    }

    const apiKey = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;
    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_EXERCISEDB_API_KEY is not configured');
    }

    return {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': (EXERCISE_CONFIG as any).apiHost,
    };
  }

  /**
   * Fetches all exercises with pagination.
   */
  async fetchAllExercises(): Promise<ExerciseDbResponse[]> {
    const allExercises: ExerciseDbResponse[] = [];
    let offset = 0;
    const limit = EXERCISE_CONFIG.pageSize;
    let hasMore = true;

    while (hasMore) {
      const url = `${EXERCISE_CONFIG.apiBaseUrl}/exercises?offset=${offset}&limit=${limit}`;

      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });
      } catch (error) {
        throw new Error(`ExerciseDB network error: ${(error as Error).message}`);
      }

      if (!response.ok) {
        let responseText = '';
        try {
          responseText = await response.text();
        } catch {
          responseText = '';
        }
        const suffix = responseText ? ` - ${responseText.slice(0, 200)}` : '';
        throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}${suffix}`);
      }

      let exercises: ExerciseDbResponse[];

      if (this.isRapidApi()) {
        // RapidAPI returns array directly
        exercises = await response.json();
      } else {
        // Open source returns { success, data }
        const json: OpenSourceApiResponse = await response.json();
        exercises = json.success ? json.data : [];
      }

      if (!exercises || exercises.length === 0) {
        hasMore = false;
      } else {
        allExercises.push(...exercises);
        offset += limit;

        if (exercises.length < limit) {
          hasMore = false;
        }
      }

      // Safety limit
      if (offset > 5000) {
        hasMore = false;
      }
    }

    return allExercises;
  }
}

export const exerciseDbClient = new ExerciseDbClient();
