import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function OnboardingProgramNameScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/metrics-intro');
  }, [router]);

  return null;
}
