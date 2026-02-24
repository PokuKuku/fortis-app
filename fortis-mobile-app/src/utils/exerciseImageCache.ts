import { Image, type ImageSourcePropType } from 'react-native';
import type { Exercise } from '@/src/types/exercise';
import { getExerciseImageUrl } from '@/src/services/exerciseService';

const prefetchedExerciseImageUrls = new Set<string>();
const inflightExerciseImageUrls = new Set<string>();

function normalizeImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  const url = getExerciseImageUrl(imagePath).trim();
  return url.length > 0 ? url : null;
}

export function getCachedExerciseImageSource(
  imagePath: string | null | undefined
): ImageSourcePropType | null {
  const uri = normalizeImageUrl(imagePath);
  if (!uri) return null;
  return { uri, cache: 'force-cache' };
}

export function prefetchExerciseImageUrls(
  imagePaths: Array<string | null | undefined>,
  maxCount = 24
): void {
  const candidates: string[] = [];

  for (const path of imagePaths) {
    const url = normalizeImageUrl(path);
    if (!url) continue;
    if (prefetchedExerciseImageUrls.has(url)) continue;
    if (inflightExerciseImageUrls.has(url)) continue;
    candidates.push(url);
    if (candidates.length >= maxCount) break;
  }

  if (candidates.length === 0) return;

  candidates.forEach((url) => inflightExerciseImageUrls.add(url));

  void Promise.allSettled(
    candidates.map(async (url) => {
      const success = await Image.prefetch(url);
      if (success) {
        prefetchedExerciseImageUrls.add(url);
      }
    })
  ).finally(() => {
    candidates.forEach((url) => inflightExerciseImageUrls.delete(url));
  });
}

export function prefetchExerciseImagesFromExercises(
  exercises: Array<Pick<Exercise, 'images'>>,
  startIndex = 0,
  count = 24
): void {
  if (exercises.length === 0 || count <= 0) return;

  const start = Math.max(0, startIndex);
  const end = Math.min(exercises.length, start + count);
  const imagePaths: Array<string | null | undefined> = [];

  for (let index = start; index < end; index += 1) {
    imagePaths.push(exercises[index]?.images?.[0]);
  }

  prefetchExerciseImageUrls(imagePaths, count);
}

