import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { requireOptionalNativeModule } from 'expo-modules-core';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { AIImage, AIImageMimeType, AIPendingMedia } from '@/src/types/ai';

export const MAX_AI_PHOTOS = 4;
export const MAX_AI_VIDEO_DURATION_MS = 30_000;
const VIDEO_FRAME_COUNT = 4;
const IMAGE_MAX_WIDTH = 1280;
const MISSING_MEDIA_MODULE_MESSAGE =
  'Media attachments need an updated app build. Rebuild the app and try again.';

type ImageManipulatorModule = typeof import('expo-image-manipulator');
type VideoThumbnailsModule = typeof import('expo-video-thumbnails');

const getImageManipulator = (): ImageManipulatorModule => {
  if (!requireOptionalNativeModule('ExpoImageManipulator')) {
    throw new Error(MISSING_MEDIA_MODULE_MESSAGE);
  }
  return require('expo-image-manipulator') as ImageManipulatorModule;
};

const getVideoThumbnails = (): VideoThumbnailsModule => {
  if (!requireOptionalNativeModule('ExpoVideoThumbnails')) {
    throw new Error(MISSING_MEDIA_MODULE_MESSAGE);
  }
  return require('expo-video-thumbnails') as VideoThumbnailsModule;
};

const readPreparedImage = async (uri: string): Promise<AIImage> => {
  const ImageManipulator = getImageManipulator();
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_MAX_WIDTH } }],
    {
      compress: 0.72,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  const base64 = result.base64
    ?? await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 });
  return { base64, mimeType: 'image/jpeg' };
};

const prepareVideoFrames = async (asset: ImagePickerAsset): Promise<AIImage[]> => {
  const duration = asset.duration ?? 0;
  if (duration <= 0 || duration > MAX_AI_VIDEO_DURATION_MS) {
    throw new Error('Choose a video that is 30 seconds or shorter.');
  }

  const times = Array.from({ length: VIDEO_FRAME_COUNT }, (_, index) => (
    Math.round(duration * ((index + 0.5) / VIDEO_FRAME_COUNT))
  ));
  return Promise.all(times.map(async (time) => {
    const VideoThumbnails = getVideoThumbnails();
    const frame = await VideoThumbnails.getThumbnailAsync(asset.uri, { time, quality: 0.72 });
    return readPreparedImage(frame.uri);
  }));
};

export async function pickAIMediaFromLibrary(): Promise<AIPendingMedia[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted && permission.status !== 'granted') {
    throw new Error('Photo library permission is required to attach media.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    allowsMultipleSelection: true,
    selectionLimit: MAX_AI_PHOTOS,
    orderedSelection: true,
    quality: 0.8,
  });
  if (result.canceled || result.assets.length === 0) return [];

  const videos = result.assets.filter((asset) => asset.type === 'video');
  if (videos.length > 0 && result.assets.length > 1) {
    throw new Error('Choose either up to four photos or one video.');
  }
  if (videos.length > 1 || result.assets.length > MAX_AI_PHOTOS) {
    throw new Error('Choose up to four photos or one video.');
  }

  return Promise.all(result.assets.map(async (asset) => {
    const kind = asset.type === 'video' ? 'video' as const : 'image' as const;
    return {
      id: Crypto.randomUUID(),
      uri: asset.uri,
      kind,
      label: asset.fileName ?? undefined,
      images: kind === 'video'
        ? await prepareVideoFrames(asset)
        : [await readPreparedImage(asset.uri)],
    };
  }));
}

export const flattenAIMediaImages = (media: AIPendingMedia[]): AIImage[] =>
  media.flatMap((item) => item.images).slice(0, MAX_AI_PHOTOS);

export const isSupportedAIImageMimeType = (value: string | undefined): value is AIImageMimeType =>
  value === 'image/jpeg' || value === 'image/png' || value === 'image/gif' || value === 'image/webp';
