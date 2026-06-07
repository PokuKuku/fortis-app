const mockRequestPermission = jest.fn();
const mockLaunchLibrary = jest.fn();
const mockManipulate = jest.fn();
const mockThumbnail = jest.fn();
const mockRequireOptionalNativeModule = jest.fn(() => ({}));

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'media-id') }));
jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: (...args: unknown[]) => mockRequireOptionalNativeModule(...args),
}));
jest.mock('expo-file-system/legacy', () => ({
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) => mockRequestPermission(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchLibrary(...args),
}));
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: (...args: unknown[]) => mockManipulate(...args),
}));
jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: (...args: unknown[]) => mockThumbnail(...args),
}));

import {
  MAX_AI_VIDEO_DURATION_MS,
  flattenAIMediaImages,
  pickAIMediaFromLibrary,
} from '@/src/services/aiMediaService';

describe('aiMediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPermission.mockResolvedValue({ status: 'granted' });
    mockRequireOptionalNativeModule.mockReturnValue({});
    mockManipulate.mockImplementation(async (uri: string) => ({ uri, base64: `base64-${uri}` }));
  });

  it('prepares up to four selected photos', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: Array.from({ length: 4 }, (_, index) => ({
        uri: `photo-${index}`,
        type: 'image',
      })),
    });

    const result = await pickAIMediaFromLibrary();

    expect(result).toHaveLength(4);
    expect(flattenAIMediaImages(result)).toHaveLength(4);
  });

  it('rejects a video over 30 seconds', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'long-video', type: 'video', duration: MAX_AI_VIDEO_DURATION_MS + 1 }],
    });

    await expect(pickAIMediaFromLibrary()).rejects.toThrow('30 seconds or shorter');
  });

  it('samples four ordered frames from a video', async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'video', type: 'video', duration: 8_000 }],
    });
    mockThumbnail.mockImplementation(async (_uri: string, options: { time: number }) => ({
      uri: `frame-${options.time}`,
    }));

    const result = await pickAIMediaFromLibrary();

    expect(mockThumbnail.mock.calls.map((call) => call[1].time)).toEqual([1000, 3000, 5000, 7000]);
    expect(result[0].images.map((image) => image.base64)).toEqual([
      'base64-frame-1000',
      'base64-frame-3000',
      'base64-frame-5000',
      'base64-frame-7000',
    ]);
  });

  it('shows a rebuild error instead of crashing when a native media module is missing', async () => {
    mockRequireOptionalNativeModule.mockReturnValue(null);
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo', type: 'image' }],
    });

    await expect(pickAIMediaFromLibrary()).rejects.toThrow('updated app build');
  });
});
