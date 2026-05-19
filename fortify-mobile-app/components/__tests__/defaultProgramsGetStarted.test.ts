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

  it('does not seed a default Upper/Lower program', () => {
    const programs = getDefaultPrograms();
    expect(programs).toEqual([]);
  });
});
