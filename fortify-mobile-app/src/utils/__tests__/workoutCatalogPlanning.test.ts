import {
  normalizeWorkoutMuscle,
  selectBalancedWorkoutCatalog,
} from '@/src/utils/workoutCatalogPlanning';

const candidates = (muscle: string, count: number) => (
  Array.from({ length: count }, (_, index) => ({
    id: `${muscle}-${index}`,
    primaryMuscles: [muscle],
  }))
);

describe('workout catalog planning', () => {
  it('normalizes planner labels to the exercise catalog taxonomy', () => {
    expect(normalizeWorkoutMuscle('Chest')).toBe('pectorals');
    expect(normalizeWorkoutMuscle('Shoulders')).toBe('delts');
    expect(normalizeWorkoutMuscle('front_delts')).toBe('delts');
    expect(normalizeWorkoutMuscle('side_delts')).toBe('delts');
    expect(normalizeWorkoutMuscle('rear_delts')).toBe('delts');
    expect(normalizeWorkoutMuscle('Middle Back')).toBe('upper back');
    expect(normalizeWorkoutMuscle('Lower Back')).toBe('spine');
    expect(normalizeWorkoutMuscle('Quadriceps')).toBe('quads');
  });

  it('keeps representative choices for every broad workout target', () => {
    const ranked = [
      ...candidates('triceps', 30),
      ...candidates('pectorals', 8),
      ...candidates('side_delts', 8),
    ];

    const selected = selectBalancedWorkoutCatalog(
      ranked,
      ['pectorals', 'delts', 'triceps'],
      20,
      4
    );
    const represented = new Set(
      selected.flatMap((candidate) => candidate.primaryMuscles.map(normalizeWorkoutMuscle))
    );

    expect(represented).toEqual(new Set(['pectorals', 'delts', 'triceps']));
    expect(selected).toHaveLength(20);
  });

  it('deduplicates aliases instead of treating them as separate targets', () => {
    const selected = selectBalancedWorkoutCatalog(
      [...candidates('quads', 5), ...candidates('hamstrings', 5)],
      ['quadriceps', 'quads', 'hamstrings'],
      6,
      2
    );

    expect(selected.filter((candidate) => candidate.primaryMuscles[0] === 'quads')).toHaveLength(4);
    expect(selected.filter((candidate) => candidate.primaryMuscles[0] === 'hamstrings')).toHaveLength(2);
  });

  it('preserves every target when a broad workout must fit in a compact catalog', () => {
    const targets = [
      'pectorals', 'lats', 'upper back', 'traps', 'delts', 'quads', 'hamstrings',
      'glutes', 'calves', 'biceps', 'triceps', 'forearms', 'abs',
    ];
    const ranked = targets.flatMap((target) => candidates(target, 10));

    const selected = selectBalancedWorkoutCatalog(ranked, targets, 80);
    const represented = new Set(
      selected.flatMap((candidate) => candidate.primaryMuscles.map(normalizeWorkoutMuscle))
    );

    expect(selected).toHaveLength(80);
    expect(represented).toEqual(new Set(targets));
  });
});
