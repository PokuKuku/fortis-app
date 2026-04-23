import { useCallback, useEffect, useRef } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ARE_COMPLETED_BY_TYPE,
  STOREKIT_VERSION,
  type LogHandler,
  type PurchasesConfiguration,
} from 'react-native-purchases';
import { useSuperwallEvents } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';

const LAST_SYNCED_USER_KEY = 'fortis_revenuecat_last_synced_user_id_v1';
const IOS_REVENUECAT_PUBLIC_SDK_KEY = 'appl_xUfcAjGXbhIduaxJcQhipSkOksi';
const isRevenueCatAnalyticsEnabled =
  !__DEV__ && process.env.EXPO_PUBLIC_APP_ENV?.trim() === 'production';

let configurePromise: Promise<boolean> | null = null;
let hasInstalledRevenueCatLogHandler = false;

const expectedAnalyticsOnlySyncMessages = ['receipt is not valid', 'invalid receipt'];

function getRevenueCatApiKey() {
  if (Platform.OS === 'ios') {
    return (
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim() ||
      IOS_REVENUECAT_PUBLIC_SDK_KEY
    );
  }

  if (Platform.OS === 'android') {
    return (
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim() ||
      ''
    );
  }

  return IOS_REVENUECAT_PUBLIC_SDK_KEY;
}

function buildRevenueCatConfiguration(apiKey: string): PurchasesConfiguration {
  return {
    apiKey,
    purchasesAreCompletedBy: {
      type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP,
      storeKitVersion: STOREKIT_VERSION.DEFAULT,
    },
  };
}

function isExpectedAnalyticsOnlySyncMessage(message: string) {
  const normalizedMessage = message.toLowerCase();
  return expectedAnalyticsOnlySyncMessages.some((expectedMessage) =>
    normalizedMessage.includes(expectedMessage),
  );
}

function installRevenueCatLogHandler() {
  if (hasInstalledRevenueCatLogHandler) {
    return;
  }

  const logHandler: LogHandler = (logLevel, message) => {
    if (!__DEV__) {
      return;
    }

    const formattedMessage = `[RevenueCat] ${message}`;

    switch (logLevel) {
      case LOG_LEVEL.DEBUG:
      case LOG_LEVEL.VERBOSE:
        console.debug(formattedMessage);
        return;
      case LOG_LEVEL.INFO:
        console.info(formattedMessage);
        return;
      case LOG_LEVEL.WARN:
        console.warn(formattedMessage);
        return;
      case LOG_LEVEL.ERROR:
        // We use RevenueCat for analytics while Superwall owns purchases. Local StoreKit
        // test receipts can be rejected by RevenueCat, but that should not red-screen dev.
        console.warn(
          isExpectedAnalyticsOnlySyncMessage(message)
            ? `${formattedMessage} This is expected when syncing local StoreKit test receipts.`
            : formattedMessage,
        );
        return;
      default:
        console.log(formattedMessage);
    }
  };

  Purchases.setLogHandler(logHandler);
  hasInstalledRevenueCatLogHandler = true;
}

async function configureRevenueCat() {
  if (!isRevenueCatAnalyticsEnabled) {
    return false;
  }

  if (configurePromise) {
    return configurePromise;
  }

  configurePromise = (async () => {
    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      if (__DEV__) {
        console.warn('[RevenueCat] Missing platform API key; analytics sync disabled.');
      }
      return false;
    }

    try {
      if (!NativeModules.RNPurchases) {
        if (__DEV__) {
          console.warn(
            '[RevenueCat] Native module unavailable; rebuild the iOS/Android dev client to enable analytics sync.',
          );
        }
        return false;
      }

      installRevenueCatLogHandler();

      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
        Purchases.configure(buildRevenueCatConfiguration(apiKey));
      }
      return true;
    } catch (error) {
      configurePromise = null;
      if (__DEV__) {
        console.warn('[RevenueCat] Failed to configure analytics sync:', error);
      }
      return false;
    }
  })();

  return configurePromise;
}

async function syncPurchasesOnceForUser(userId: string) {
  if (!isRevenueCatAnalyticsEnabled) {
    return;
  }

  const lastSyncedUserId = await AsyncStorage.getItem(LAST_SYNCED_USER_KEY);
  if (lastSyncedUserId === userId) {
    return;
  }

  try {
    await Purchases.syncPurchasesForResult();
    await AsyncStorage.setItem(LAST_SYNCED_USER_KEY, userId);
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Failed to sync purchases for analytics:', error);
    }
  }
}

async function syncPurchasesForAnalytics(trigger: string) {
  if (!isRevenueCatAnalyticsEnabled) {
    return;
  }

  const isConfigured = await configureRevenueCat();
  if (!isConfigured) {
    return;
  }

  try {
    await Purchases.syncPurchasesForResult();
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Failed to sync purchase event for analytics:', {
        trigger,
        error,
      });
    }
  }
}

export function RevenueCatAnalyticsSync() {
  const { user, profile, isAuthResolved } = useAuth();
  const identifiedUserIdRef = useRef<string | null>(null);
  const inFlightIdentitySyncRef = useRef<Promise<void> | null>(null);

  const syncIdentity = useCallback(async () => {
    if (!isRevenueCatAnalyticsEnabled) {
      return;
    }

    if (!isAuthResolved) {
      return;
    }

    if (inFlightIdentitySyncRef.current) {
      return inFlightIdentitySyncRef.current;
    }

    const task = (async () => {
      const isConfigured = await configureRevenueCat();
      if (!isConfigured) {
        return;
      }

      try {
        const userId = user?.id ?? null;

        if (userId) {
          if (identifiedUserIdRef.current !== userId) {
            await Purchases.logIn(userId);
            identifiedUserIdRef.current = userId;
          }

          await Purchases.setAttributes({
            app_env: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
          });

          if (profile?.email) {
            await Purchases.setEmail(profile.email);
          }

          await syncPurchasesOnceForUser(userId);
          return;
        }

        if (identifiedUserIdRef.current) {
          await Purchases.logOut();
          identifiedUserIdRef.current = null;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[RevenueCat] Failed to sync analytics identity:', error);
        }
      } finally {
        inFlightIdentitySyncRef.current = null;
      }
    })();

    inFlightIdentitySyncRef.current = task;
    return task;
  }, [isAuthResolved, profile?.email, user?.id]);

  useEffect(() => {
    if (!isRevenueCatAnalyticsEnabled) {
      return;
    }
    void syncIdentity();
  }, [syncIdentity]);

  useSuperwallEvents({
    onPaywallPresent: (info: { name?: string }) => {
      if (!isRevenueCatAnalyticsEnabled) {
        return;
      }

      void (async () => {
        const isConfigured = await configureRevenueCat();
        if (!isConfigured) {
          return;
        }

        try {
          await Purchases.trackCustomPaywallImpression({
            paywallId: info.name ?? 'superwall',
          });
        } catch (error) {
          if (__DEV__) {
            console.warn('[RevenueCat] Failed to track paywall impression:', error);
          }
        }
      })();
    },
    onPurchase: () => {
      void syncPurchasesForAnalytics('superwall:onPurchase');
    },
    onPurchaseRestore: () => {
      void syncPurchasesForAnalytics('superwall:onPurchaseRestore');
    },
    onSuperwallEvent: (eventInfo: { event?: { event?: string } }) => {
      const eventType = eventInfo?.event?.event;
      if (
        eventType === 'transactionComplete' ||
        eventType === 'transactionRestore' ||
        eventType === 'subscriptionStart' ||
        eventType === 'freeTrialStart'
      ) {
        void syncPurchasesForAnalytics(`superwall:${eventType}`);
      }
    },
  });

  if (!isRevenueCatAnalyticsEnabled) {
    return null;
  }

  return null;
}
