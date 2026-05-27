import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { shouldBypassProGateForTourState } from '@/src/contexts/InAppTourContext';

describe('shouldBypassProGateForTourState', () => {
  it('bypasses voice exercise add during the workout builder voice-add tour steps', () => {
    expect(shouldBypassProGateForTourState({
      activeStepId: 'open_add_with_voice',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
    })).toBe(true);
    expect(shouldBypassProGateForTourState({
      activeStepId: 'add_with_voice',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
    })).toBe(true);
  });

  it('bypasses voice set logging during the active workout voice-log tour steps', () => {
    expect(shouldBypassProGateForTourState({
      activeStepId: 'open_voice_log',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.voiceSetLog,
    })).toBe(true);
    expect(shouldBypassProGateForTourState({
      activeStepId: 'confirm_voice_log',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.voiceSetLog,
    })).toBe(true);
  });

  it('bypasses AI chat only on AI chat tour steps', () => {
    expect(shouldBypassProGateForTourState({
      activeStepId: 'ai_chat_overview',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.aiChat,
    })).toBe(true);
    expect(shouldBypassProGateForTourState({
      activeStepId: 'insights_overview',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.aiChat,
    })).toBe(false);
  });

  it('does not bypass unrelated gates or inactive tours', () => {
    expect(shouldBypassProGateForTourState({
      activeStepId: 'open_add_with_voice',
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.programLimit,
    })).toBe(false);
    expect(shouldBypassProGateForTourState({
      activeStepId: 'open_add_with_voice',
      isTourActive: false,
      placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
    })).toBe(false);
    expect(shouldBypassProGateForTourState({
      activeStepId: null,
      isTourActive: true,
      placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
    })).toBe(false);
  });
});
