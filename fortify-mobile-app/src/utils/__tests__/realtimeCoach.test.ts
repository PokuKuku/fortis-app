import {
  coerceRealtimeCoachPreferences,
  getIntensityLabel,
  normalizeRealtimeCoachPhase,
  shouldGenerateWorkoutFromVoice,
} from '@/src/utils/realtimeCoach';

describe('realtimeCoach utils', () => {
  it('detects workout generation voice prompts', () => {
    expect(shouldGenerateWorkoutFromVoice('Build me a push workout for today')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('I want an upper body routine')).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('How should I warm up?')).toBe(false);
  });

  it('normalizes preferences and clamps intensity', () => {
    expect(coerceRealtimeCoachPreferences({
      personality: 'drill_sergeant',
      voice: 'cedar',
      intensity: 2,
    })).toEqual({
      personality: 'drill_sergeant',
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
});
