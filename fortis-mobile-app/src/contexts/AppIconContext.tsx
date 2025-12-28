import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AlternateAppIcons from 'expo-alternate-app-icons';
import { APP_ICON_KEY } from '@/src/constants/storageKeys';

// Available app icon variants (must match keys in app.json plugins config)
export type AppIconVariant = 'Default' | 'Light' | 'Dark';

// Icon metadata for UI display
export interface AppIconInfo {
  name: AppIconVariant;
  displayName: string;
  preview: any; // require() image
}

// Available icons with their display info
export const APP_ICONS: AppIconInfo[] = [
  {
    name: 'Default',
    displayName: 'Default',
    preview: require('../../assets/icon.png'),
  },
  {
    name: 'Dark',
    displayName: 'Dark',
    preview: require('../../assets/icon.png'),
  },
  {
    name: 'Light',
    displayName: 'Light',
    preview: require('../../assets/icon-light.png'),
  },
];

export interface AppIconContextValue {
  /** Currently active app icon */
  currentIcon: AppIconVariant;
  /** Whether icon is still loading from storage */
  isLoading: boolean;
  /** Change the app icon */
  setAppIcon: (icon: AppIconVariant) => Promise<void>;
  /** Check if alternate icons are supported */
  isSupported: boolean;
}

const AppIconContext = createContext<AppIconContextValue | null>(null);

/**
 * Hook to access app icon context
 */
export function useAppIcon() {
  const context = useContext(AppIconContext);
  if (!context) {
    throw new Error('useAppIcon must be used within an AppIconProvider');
  }
  return context;
}

interface AppIconProviderProps {
  children: React.ReactNode;
}

/**
 * App icon provider component
 */
export function AppIconProvider({ children }: AppIconProviderProps) {
  const [currentIcon, setCurrentIcon] = useState<AppIconVariant>('Default');
  const [isLoading, setIsLoading] = useState(true);

  // Alternate icons only supported on iOS
  const isSupported = Platform.OS === 'ios';

  // Load persisted icon on mount
  useEffect(() => {
    const loadAppIcon = async () => {
      try {
        const stored = await AsyncStorage.getItem(APP_ICON_KEY);
        if (stored && (stored === 'Default' || stored === 'Light' || stored === 'Dark')) {
          setCurrentIcon(stored as AppIconVariant);
        }
      } catch (error) {
        console.warn('Failed to load app icon preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppIcon();
  }, []);

  // Change app icon and persist
  const setAppIcon = useCallback(async (newIcon: AppIconVariant) => {
    if (!isSupported) {
      console.warn('Alternate app icons not supported on this platform');
      return;
    }

    try {
      // Set the native app icon
      if (newIcon === 'Default') {
        await AlternateAppIcons.resetAppIcon();
      } else {
        await AlternateAppIcons.setAlternateAppIcon(newIcon);
      }

      // Update state
      setCurrentIcon(newIcon);

      // Persist preference
      await AsyncStorage.setItem(APP_ICON_KEY, newIcon);
    } catch (error) {
      console.error('Failed to change app icon:', error);
      throw error;
    }
  }, [isSupported]);

  const value: AppIconContextValue = {
    currentIcon,
    isLoading,
    setAppIcon,
    isSupported,
  };

  return (
    <AppIconContext.Provider value={value}>
      {children}
    </AppIconContext.Provider>
  );
}
