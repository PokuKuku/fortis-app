import { useEffect, useState } from 'react';
import { DeviceEventEmitter, InteractionManager } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useProgramsStore } from '@/src/store/programsStore';
import {
  ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
} from '@/src/utils/onboardingProgram';
import { ensureOnboardingProgramGenerated } from '@/src/services/onboardingProgramGenerationService';

export function OnboardingProgramCoordinator() {
  const {
    isAuthenticated,
    isDeferredHydrationComplete,
    profile,
    profileResolved,
  } = useAuth();
  const { hasTourFinished, isTourActive } = useInAppTour();
  const programs = useProgramsStore((s) => s.programs);
  const [specRevision, setSpecRevision] = useState(0);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
      () => setSpecRevision((revision) => revision + 1)
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (
      !hasTourFinished
      || isTourActive
      || !isAuthenticated
      || !isDeferredHydrationComplete
      || !profileResolved
      || !profile?.onboarding_completed
    ) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      void ensureOnboardingProgramGenerated();
    });
    return () => task.cancel();
  }, [
    hasTourFinished,
    isAuthenticated,
    isDeferredHydrationComplete,
    isTourActive,
    profile?.onboarding_completed,
    profileResolved,
    programs.length,
    specRevision,
  ]);

  return null;
}
