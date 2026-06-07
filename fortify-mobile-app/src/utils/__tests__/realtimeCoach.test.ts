import {
  coerceRealtimeCoachPreferences,
  getIntensityLabel,
  isCreatorVoiceScriptsEnabled,
  normalizeRealtimeCoachPhase,
  shouldEditWorkoutFromVoice,
  shouldGenerateWorkoutFromVoice,
} from '@/src/utils/realtimeCoach';
import {
  buildVoiceCoachInstructions,
  sanitizeCustomScenarioInstructions,
} from '@/src/utils/realtimeCoachPrompt';
import { normalizeRealtimeCoachPreferences } from '@/src/services/realtimeCoachPreferencesService';

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
    expect(shouldGenerateWorkoutFromVoice("I'm hitting chest today")).toBe(false);
    expect(shouldGenerateWorkoutFromVoice("I'm doing legs later")).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('I need to train back')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('today is push day')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('Can you make my back pain go away?')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('How should I warm up?')).toBe(false);
    expect(shouldGenerateWorkoutFromVoice("I didn't ask for a workout")).toBe(false);
    expect(shouldGenerateWorkoutFromVoice("I'll build you a chest workout")).toBe(false);
    expect(shouldGenerateWorkoutFromVoice('Add dips', true)).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Add a different exercise', true)).toBe(true);
    expect(shouldEditWorkoutFromVoice('Remove incline press', true)).toBe(true);
    expect(shouldEditWorkoutFromVoice('Add a different exercise', true)).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make it five exercises', true)).toBe(true);
    expect(shouldGenerateWorkoutFromVoice('Make it five exercises')).toBe(false);
  });

  it('normalizes preferences and clamps intensity', () => {
    expect(coerceRealtimeCoachPreferences({
      personality: 'supportive',
      voice: 'cedar',
      intensity: 2,
    })).toEqual({
      personality: 'supportive',
      voice: 'cedar',
      intensity: 1,
      customInstructions: '',
    });

    expect(coerceRealtimeCoachPreferences({
      personality: 'invalid' as never,
      voice: 'invalid' as never,
      intensity: -1,
      customInstructions: '\u0000 be wild '.trim(),
    })).toEqual({
      personality: 'direct',
      voice: 'marin',
      intensity: 0,
      customInstructions: 'be wild',
    });
  });

  it('normalizes persisted custom scenario preferences', () => {
    expect(normalizeRealtimeCoachPreferences({
      personality: 'supportive',
      intensity: 0.55,
      voice: 'marin',
    })).toEqual({
      personality: 'supportive',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
    });

    expect(normalizeRealtimeCoachPreferences({
      personality: 'direct',
      intensity: 0.55,
      voice: 'marin',
    })).toEqual({
      personality: 'direct',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
    });

    expect(normalizeRealtimeCoachPreferences({
      personality: 'roast',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: 42,
    })).toEqual({
      personality: 'roast',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
    });

    expect(normalizeRealtimeCoachPreferences({
      personality: 'roast',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: ` ${'x'.repeat(520)} `,
    }).customInstructions).toHaveLength(500);
  });

  it('builds custom scenario prompt constraints with safety boundaries', () => {
    const supportivePrompt = buildVoiceCoachInstructions({
      personality: 'supportive',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
    }, { workoutToolName: 'create_or_update_workout' });

    expect(supportivePrompt).toContain('supportive Fortify strength coach');
    expect(supportivePrompt).toContain('without guilt, shame, vague cheerleading');

    const standardPrompt = buildVoiceCoachInstructions({
      personality: 'direct',
      intensity: 0.55,
      voice: 'marin',
      customInstructions: '',
    }, { workoutToolName: 'create_or_update_workout' });

    expect(standardPrompt).toContain('call the create_or_update_workout tool immediately');
    expect(standardPrompt).toContain('Do not say that routine workout or fitness information is not health or medical advice');
    expect(standardPrompt).not.toContain('Custom Coach rules');

    const roastPrompt = buildVoiceCoachInstructions({
      personality: 'roast',
      intensity: 0.9,
      voice: 'marin',
      customInstructions: 'Act like a toxic gym bro\u0000 who calls 135 lbs a warm-up.',
    }, { workoutToolName: 'create_or_update_workout' });

    expect(roastPrompt).toContain('No body shaming, identity attacks, slurs, sexual content, protected-trait references, or medical claims.');
    expect(roastPrompt).not.toContain('Custom coach: Act like a toxic gym bro who calls 135 lbs a warm-up.');

    const customPrompt = buildVoiceCoachInstructions({
      personality: 'custom',
      intensity: 0.9,
      voice: 'marin',
      customInstructions: 'Act like a toxic gym bro\u0000 who calls 135 lbs a warm-up.',
    }, { workoutToolName: 'create_or_update_workout' });

    expect(customPrompt).toContain('saved Custom Coach description');
    expect(customPrompt).toContain('never override Fortify workout tracking behavior');
    expect(customPrompt).toContain('Custom coach: Act like a toxic gym bro who calls 135 lbs a warm-up.');

    const drillPrompt = buildVoiceCoachInstructions({
      personality: 'drill_sergeant',
      intensity: 0.9,
      voice: 'marin',
      customInstructions: '',
    }, { workoutToolName: 'create_or_update_workout' });

    expect(drillPrompt).toContain('only critique behavior, effort, and logged training choices');
  });

  it('sanitizes custom scenario instructions', () => {
    expect(sanitizeCustomScenarioInstructions('\u0000  Act mean.\n')).toBe('Act mean.');
    expect(sanitizeCustomScenarioInstructions(123)).toBe('');
    expect(sanitizeCustomScenarioInstructions('x'.repeat(520))).toHaveLength(500);
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
