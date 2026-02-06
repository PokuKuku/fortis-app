import { getDefaultPrograms, getDefaultTemplates } from '@/src/data/defaultPrograms';

describe('defaultPrograms default templates', () => {
  it('includes Upper and Lower as default templates', () => {
    const templates = getDefaultTemplates();
    const upper = templates.find((template) => template.id === 'default-template-upper');
    const lower = templates.find((template) => template.id === 'default-template-lower');
    const getStarted = templates.find((template) => template.id === 'default-template-get-started');

    expect(upper).toBeDefined();
    expect(lower).toBeDefined();
    expect(getStarted).toBeUndefined();
    expect(upper?.isTemplate).toBe(true);
    expect(lower?.isTemplate).toBe(true);
    expect(upper?.workouts[0]?.exercises.length).toBeGreaterThan(0);
    expect(lower?.workouts[0]?.exercises.length).toBeGreaterThan(0);
  });

  it('builds the default Upper/Lower program from two workouts', () => {
    const programs = getDefaultPrograms();
    const upperLower = programs.find((program) => program.id === 'default-program-upper-lower');
    expect(upperLower).toBeDefined();
    expect(upperLower?.workouts.length).toBe(2);
  });
});
