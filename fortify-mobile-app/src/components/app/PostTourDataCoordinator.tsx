import { useEffect } from 'react';
import { AppState, InteractionManager } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

export function PostTourDataCoordinator() {
  const { hasTourFinished, isTourActive } = useInAppTour();
  const {
    hydrateDeferredUserData,
    isAuthenticated,
    isDeferredHydrationComplete,
    profileResolved,
    syncPendingUserData,
    user,
  } = useAuth();

  useEffect(() => {
    if (
      !hasTourFinished
      || isTourActive
      || !isAuthenticated
      || !profileResolved
      || isDeferredHydrationComplete
    ) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      void hydrateDeferredUserData();
    });
    return () => task.cancel();
  }, [
    hasTourFinished,
    hydrateDeferredUserData,
    isAuthenticated,
    isDeferredHydrationComplete,
    isTourActive,
    profileResolved,
  ]);

  useEffect(() => {
    if (isTourActive || !hasTourFinished || !isDeferredHydrationComplete || !user) return;

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPendingUserData();
      }
    });
    const networkUnsubscribe = NetInfo.addEventListener((state) => {
      if (
        state.isConnected
        && state.isInternetReachable
        && AppState.currentState === 'active'
      ) {
        void syncPendingUserData();
      }
    });
    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        void syncPendingUserData();
      }
    }, 30_000);

    return () => {
      appStateSubscription.remove();
      networkUnsubscribe();
      clearInterval(intervalId);
    };
  }, [hasTourFinished, isDeferredHydrationComplete, isTourActive, syncPendingUserData, user]);

  return null;
}
