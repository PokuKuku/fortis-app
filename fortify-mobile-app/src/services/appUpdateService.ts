import * as Application from 'expo-application';
import Constants from 'expo-constants';

const APP_STORE_LOOKUP_URL = 'https://itunes.apple.com/lookup';
const FALLBACK_IOS_BUNDLE_ID = 'com.fortisfitness.app';

type AppStoreLookupResult = {
  version?: unknown;
  trackViewUrl?: unknown;
  trackId?: unknown;
};

type AppStoreLookupResponse = {
  resultCount?: unknown;
  results?: unknown;
};

export type AppUpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
};

const getCurrentAppVersion = () => (
  Application.nativeApplicationVersion
  ?? Constants.expoConfig?.version
  ?? null
);

const normalizeVersionParts = (version: string): number[] => {
  const [numericVersion] = version.trim().split('-');
  return numericVersion
    .split('.')
    .map((part) => {
      const match = part.match(/^\d+/);
      return match ? Number(match[0]) : 0;
    });
};

export function isVersionOlder(currentVersion: string, latestVersion: string): boolean {
  const currentParts = normalizeVersionParts(currentVersion);
  const latestParts = normalizeVersionParts(latestVersion);
  const length = Math.max(currentParts.length, latestParts.length);

  for (let index = 0; index < length; index += 1) {
    const current = currentParts[index] ?? 0;
    const latest = latestParts[index] ?? 0;
    if (current < latest) return true;
    if (current > latest) return false;
  }

  return false;
}

function parseLookupResult(response: AppStoreLookupResponse): { version: string; storeUrl: string } | null {
  if (!Array.isArray(response.results) || response.results.length === 0) {
    return null;
  }

  const result = response.results[0] as AppStoreLookupResult;
  if (typeof result.version !== 'string') {
    return null;
  }

  if (typeof result.trackViewUrl === 'string') {
    return { version: result.version, storeUrl: result.trackViewUrl };
  }

  if (typeof result.trackId === 'number') {
    return { version: result.version, storeUrl: `https://apps.apple.com/app/id${result.trackId}` };
  }

  return null;
}

export async function getIosAppUpdateInfo(): Promise<AppUpdateInfo | null> {
  const currentVersion = getCurrentAppVersion();
  if (!currentVersion) return null;

  const bundleId = Application.applicationId ?? FALLBACK_IOS_BUNDLE_ID;
  const response = await fetch(`${APP_STORE_LOOKUP_URL}?bundleId=${encodeURIComponent(bundleId)}&country=us`);
  if (!response.ok) return null;

  const lookupResponse = await response.json() as AppStoreLookupResponse;
  const lookupResult = parseLookupResult(lookupResponse);
  if (!lookupResult || !isVersionOlder(currentVersion, lookupResult.version)) {
    return null;
  }

  return {
    currentVersion,
    latestVersion: lookupResult.version,
    storeUrl: lookupResult.storeUrl,
  };
}

