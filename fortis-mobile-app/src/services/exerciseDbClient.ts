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
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
    let backoffMs = 500;

    while (hasMore) {
      const url = `${EXERCISE_CONFIG.apiBaseUrl}/exercises?offset=${offset}&limit=${limit}`;

      let response: Response | null = null;
      let attempts = 0;

      while (attempts < 5) {
        attempts += 1;
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
          });
        } catch (error) {
          throw new Error(`ExerciseDB network error: ${(error as Error).message}`);
        }

        if (response.ok) break;

        if (response.status === 429) {
          await this.sleep(backoffMs);
          backoffMs = Math.min(backoffMs * 2, 8000);
          continue;
        }

        let responseText = '';
        try {
          responseText = await response.text();
        } catch {
          responseText = '';
        }
        const suffix = responseText ? ` - ${responseText.slice(0, 200)}` : '';
        throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}${suffix}`);
      }

      if (!response || !response.ok) {
        // If we already have some data, return it instead of failing hard.
        if (allExercises.length > 0) {
          return allExercises;
        }
        throw new Error('ExerciseDB API error: 429 Too Many Requests');
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

      // Be gentle with the API to avoid rate limiting.
      await this.sleep(150);

      // Safety limit
      if (offset > 5000) {
        hasMore = false;
      }
    }

    return allExercises;
  }
}

export const exerciseDbClient = new ExerciseDbClient();
