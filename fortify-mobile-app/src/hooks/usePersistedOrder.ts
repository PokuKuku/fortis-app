import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PersistedOrderHook<T> = {
  saveOrder: (items: T[]) => Promise<void>;
};

/**
 * Persists ordering of cards and hydrates on mount. New items not in storage are appended.
 */
export function usePersistedOrder<T extends { id: string | number }>(
  storageKey: string,
  items: T[],
  setItems: (items: T[]) => void
): PersistedOrderHook<T> {
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;

    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const storedIds = JSON.parse(stored) as Array<string | number>;
          const itemMap = new Map(items.map((item) => [item.id, item]));

          const ordered = storedIds
            .map((id) => itemMap.get(id))
            .filter((item): item is T => Boolean(item));
          const newItems = items.filter((item) => !storedIds.includes(item.id));
          setItems([...ordered, ...newItems]);
        }
      } catch (error) {
        console.warn(`[usePersistedOrder] Failed to hydrate ${storageKey}:`, error);
      } finally {
        hydratedRef.current = true;
      }
    };

    hydrate();
  }, [items, setItems, storageKey]);

  const saveOrder = useCallback(
    async (orderedItems: T[]) => {
      try {
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(orderedItems.map((item) => item.id))
        );
        setItems(orderedItems);
      } catch (error) {
        console.warn(`[usePersistedOrder] Failed to persist ${storageKey}:`, error);
      }
    },
    [setItems, storageKey]
  );

  return { saveOrder };
}
