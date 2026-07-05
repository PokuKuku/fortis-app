import { normalizeAIWorkoutTemplateMetadata } from '@/src/utils/aiWorkoutTemplateMetadata';

describe('normalizeAIWorkoutTemplateMetadata', () => {
  it('renames a stale chest title when the template metadata is for back', () => {
    const template = normalizeAIWorkoutTemplateMetadata({
      name: 'Chest Strength Workout (1)',
      description: 'A comprehensive workout focusing on back strength.',
      focus: 'Back',
      estimatedDurationMinutes: 50,
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Lat Pulldown',
          sets: 4,
          reps: '6-10',
          restSeconds: 90,
        },
      ],
    });

    expect(template.name).toBe('Back Strength Workout');
    expect(template.focus).toBe('Back');
  });

  it('normalizes underscored muscle labels in text fields', () => {
    const template = normalizeAIWorkoutTemplateMetadata({
      name: 'Back Workout',
      description: 'Focused on lats and upper_back.',
      focus: 'Upper_back',
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Cable Row',
          sets: 3,
          reps: '8-12',
        },
      ],
    });

    expect(template.description).toBe('Focused on lats and upper back.');
    expect(template.focus).toBe('upper back');
  });
});
