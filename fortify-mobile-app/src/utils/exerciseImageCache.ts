import { Image, type ImageSourcePropType } from 'react-native';
import type { Exercise } from '@/src/types/exercise';
import { getExerciseImageUrl } from '@/src/services/exerciseService';
import { getExerciseGifAsset } from '@/src/utils/exerciseGifAssets';

const prefetchedExerciseImageUrls = new Set<string>();
const inflightExerciseImageUrls = new Set<string>();
const MAX_GIF_PREFETCH_PER_CALL = 2;
const EXERCISE_GIF_SCHEME = 'exercise-gif://';
const localGifSourceCache = new Map<string, ImageSourcePropType | null>();

function getLocalExerciseGifId(imagePath: string | null | undefined): string | null {
  if (!imagePath?.startsWith(EXERCISE_GIF_SCHEME)) return null;
  const exerciseDbId = imagePath.slice(EXERCISE_GIF_SCHEME.length).trim();
  return exerciseDbId.length > 0 ? exerciseDbId : null;
}

function isGifUrl(url: string): boolean {
  return /\.gif($|\?)/i.test(url);
}

function normalizeImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (getLocalExerciseGifId(imagePath)) return null;
  const url = getExerciseImageUrl(imagePath).trim();
  return url.length > 0 ? url : null;
}

export function isExerciseGifImagePath(imagePath: string | null | undefined): boolean {
  if (getLocalExerciseGifId(imagePath)) return true;
  const uri = normalizeImageUrl(imagePath);
  return !!uri && isGifUrl(uri);
}

export function getCachedExerciseImageSource(
  imagePath: string | null | undefined
): ImageSourcePropType | null {
  const localGifId = getLocalExerciseGifId(imagePath);
  if (localGifId) {
    if (localGifSourceCache.has(localGifId)) {
      return localGifSourceCache.get(localGifId) ?? null;
    }

    const source = getExerciseGifAsset(localGifId);
    localGifSourceCache.set(localGifId, source);
    return source;
  }

  const uri = normalizeImageUrl(imagePath);
  if (!uri) return null;
  return { uri, cache: 'force-cache' };
}

export function prefetchExerciseImageUrls(
  imagePaths: Array<string | null | undefined>,
  maxCount = 24,
  maxGifCount = MAX_GIF_PREFETCH_PER_CALL,
): void {
  const candidates: string[] = [];
  let gifCount = 0;

  for (const path of imagePaths) {
    const url = normalizeImageUrl(path);
    if (!url) continue;
    if (prefetchedExerciseImageUrls.has(url)) continue;
    if (inflightExerciseImageUrls.has(url)) continue;
    if (isGifUrl(url)) {
      if (gifCount >= maxGifCount) continue;
      gifCount += 1;
    }
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

export function prefetchVisibleWorkoutExerciseImages(
  exercises: Array<Pick<Exercise, 'images'>>,
  maxCount = 24
): void {
  if (exercises.length === 0 || maxCount <= 0) return;

  const imagePaths = exercises
    .slice(0, maxCount)
    .map((exercise) => exercise.images?.[0]);

  prefetchExerciseImageUrls(imagePaths, maxCount, maxCount);
}
