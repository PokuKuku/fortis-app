import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useProgramsStore } from '@/src/store/programsStore';
import {
  ONBOARDING_PROGRAM_SPEC_UPDATED_EVENT,
} from '@/src/utils/onboardingProgram';
import { ensureOnboardingProgramGenerated } from '@/src/services/onboardingProgramGenerationService';

export function OnboardingProgramCoordinator() {
  const { isAuthenticated, profile, profileResolved } = useAuth();
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
    if (!isAuthenticated || !profileResolved || !profile?.onboarding_completed) return;

    const run = async () => {
      await ensureOnboardingProgramGenerated();
    };

    void run();
  }, [
    isAuthenticated,
    profile?.onboarding_completed,
    profileResolved,
    programs.length,
    specRevision,
  ]);

  return null;
}
