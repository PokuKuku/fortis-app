const mockFetch = jest.fn();

jest.mock('expo-application', () => ({
  applicationId: 'com.fortisfitness.app',
  nativeApplicationVersion: '1.2.3',
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.2.3',
    },
  },
}));

global.fetch = mockFetch as unknown as typeof fetch;

import { getIosAppUpdateInfo, isVersionOlder } from '@/src/services/appUpdateService';

describe('isVersionOlder', () => {
  it('detects older semantic versions', () => {
    expect(isVersionOlder('1.2.3', '1.2.4')).toBe(true);
    expect(isVersionOlder('1.2.3', '1.3.0')).toBe(true);
    expect(isVersionOlder('1.9.9', '2.0.0')).toBe(true);
  });

  it('does not mark equal or newer versions as old', () => {
    expect(isVersionOlder('1.2.4', '1.2.4')).toBe(false);
    expect(isVersionOlder('1.2.5', '1.2.4')).toBe(false);
    expect(isVersionOlder('2.0.0', '1.9.9')).toBe(false);
  });
});

describe('getIosAppUpdateInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns update info when the App Store version is newer', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        resultCount: 1,
        results: [
          {
            version: '1.2.4',
            trackViewUrl: 'https://apps.apple.com/us/app/fortify/id123456789',
          },
        ],
      }),
    });

    await expect(getIosAppUpdateInfo()).resolves.toEqual({
      currentVersion: '1.2.3',
      latestVersion: '1.2.4',
      storeUrl: 'https://apps.apple.com/us/app/fortify/id123456789',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://itunes.apple.com/lookup?bundleId=com.fortisfitness.app&country=us'
    );
  });

  it('returns null when the installed version is current', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        resultCount: 1,
        results: [
          {
            version: '1.2.3',
            trackViewUrl: 'https://apps.apple.com/us/app/fortify/id123456789',
          },
        ],
      }),
    });

    await expect(getIosAppUpdateInfo()).resolves.toBeNull();
  });
});

