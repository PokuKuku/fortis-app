import { getDefaultPrograms, getDefaultTemplates } from '@/src/data/defaultPrograms';

describe('defaultPrograms (Get Started)', () => {
  it('includes Get Started as a default template', () => {
    const templates = getDefaultTemplates();
    const getStarted = templates.find((template) => template.id === 'default-template-get-started');
    expect(getStarted).toBeDefined();
    expect(getStarted?.name).toBe('Get Started');
    expect(getStarted?.isTemplate).toBe(true);
    expect(getStarted?.workouts[0]?.exercises.length).toBeGreaterThan(0);
  });

  it('does not add Get Started to the default Upper/Lower program', () => {
    const programs = getDefaultPrograms();
    const upperLower = programs.find((program) => program.id === 'default-program-upper-lower');
    expect(upperLower).toBeDefined();
    expect(upperLower?.workouts.length).toBe(2);
  });
});

