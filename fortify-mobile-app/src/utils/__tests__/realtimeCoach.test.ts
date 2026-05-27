import {
  coerceRealtimeCoachPreferences,
  getIntensityLabel,
  isCreatorVoiceScriptsEnabled,
  normalizeRealtimeCoachPhase,
  shouldGenerateWorkoutFromVoice,
} from '@/src/utils/realtimeCoach';

describe('realtimeCoach utils', () => {
  it('detects workout generation voice prompts', () => {
    expect(shouldGenerateWorkoutFromVoice('Build me a push workout for today')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Create a chest workout')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Give me a lower body routine')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make me a back workout')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make me back workout')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make me a back work out')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Build me a five exercise leg day')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Plan shoulders with four exercises')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('I want an upper body routine')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('Can you make my back pain go away?')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('How should I warm up?')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice("I didn't ask for a workout")).toBe(false);
    expect(shouldGenerateWorkoutFromVoice("I'll build you a chest workout")).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('Add dips', true)).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make it five exercises', true)).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make it five exercises')).toBe(false);
  });

  it('normalizes preferences and clamps intensity', () => {
    expect(coerceRealtimeCoachPreferences({
      personality: 'roast',
      voice: 'cedar',
      intensity: 2,
    })).toEqual({
      personality: 'roast',
      voice: 'cedar',
      intensity: 1,
    });

    expect(coerceRealtimeCoachPreferences({
      personality: 'invalid' as never,
      voice: 'invalid' as never,
      intensity: -1,
    })).toEqual({
      personality: 'direct',
      voice: 'marin',
      intensity: 0,
    });
  });

  it('normalizes phases and labels intensity', () => {
    expect(normalizeRealtimeCoachPhase('coach_speaking')).toBe('coach_speaking');
    expect(normalizeRealtimeCoachPhase('unknown')).toBe('idle');
    expect(getIntensityLabel(0.1)).toBe('Calm');
    expect(getIntensityLabel(0.5)).toBe('Sharp');
    expect(getIntensityLabel(0.9)).toBe('Hard');
  });

  it('gates creator voice scripts by public flag and email allowlist', () => {
    const originalEnabled = process.env.EXPO_PUBLIC_ENABLE_CREATOR_VOICE_SCRIPTS;
    const originalEmails = process.env.EXPO_PUBLIC_CREATOR_VOICE_SCRIPT_EMAILS;

    process.env.EXPO_PUBLIC_ENABLE_CREATOR_VOICE_SCRIPTS = 'true';
    process.env.EXPO_PUBLIC_CREATOR_VOICE_SCRIPT_EMAILS = 'creator@example.com, other@example.com';

    expect(isCreatorVoiceScriptsEnabled('Creator@Example.com')).toBe(true);
    expect(isCreatorVoiceScriptsEnabled('user@example.com')).toBe(false);

    process.env.EXPO_PUBLIC_ENABLE_CREATOR_VOICE_SCRIPTS = 'false';
    expect(isCreatorVoiceScriptsEnabled('creator@example.com')).toBe(false);

    if (originalEnabled === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_CREATOR_VOICE_SCRIPTS;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_CREATOR_VOICE_SCRIPTS = originalEnabled;
    }

    if (originalEmails === undefined) {
      delete process.env.EXPO_PUBLIC_CREATOR_VOICE_SCRIPT_EMAILS;
    } else {
      process.env.EXPO_PUBLIC_CREATOR_VOICE_SCRIPT_EMAILS = originalEmails;
    }
  });
});
