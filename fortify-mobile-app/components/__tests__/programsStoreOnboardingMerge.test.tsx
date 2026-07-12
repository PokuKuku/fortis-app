import {
  hasCompleteProgramTree,
  mergeFetchedProgramsWithLocal,
} from '@/src/store/programsStore';
import type { Program } from '@/src/types/workout';

const now = '2026-07-12T03:28:53.000Z';

const buildProgram = (id: string, exerciseCount: number): Program => ({
  id,
  name: "Kwaku's program",
  difficulty: 'intermediate',
  goal: 'strength',
  durationWeeks: 10,
  isPublic: false,
  isDefault: false,
  isAiCreated: true,
  isTemplate: false,
  aiPayloadVersion: 'onboarding-program:onboarding-program-tifo0',
  lastPerformedAt: null,
  createdBy: id.startsWith('local-') ? 'local' : 'user-id',
  createdAt: now,
  updatedAt: now,
  workouts: exerciseCount > 0
    ? [{
        id: `${id}-push`,
        name: 'Push',
        dayNumber: 1,
        exercises: Array.from({ length: exerciseCount }, (_, index) => ({
          id: `${id}-exercise-${index}`,
          exerciseId: `exercise-${index}`,
          exerciseName: `Exercise ${index}`,
          sets: 3,
          reps: '8-12',
          restSeconds: 90,
          orderIndex: index,
        })),
      }]
    : [],
});

describe('onboarding program fetch merge', () => {
  it('keeps a complete local program when the matching server tree is incomplete', () => {
    const localProgram = buildProgram('local-ai-program-1', 5);
    const incompleteServerProgram = buildProgram('server-program-1', 0);

    const merged = mergeFetchedProgramsWithLocal(
      [incompleteServerProgram],
      [localProgram]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(localProgram.id);
    expect(hasCompleteProgramTree(merged[0])).toBe(true);
  });

  it('uses the server program after its nested tree is complete', () => {
    const localProgram = buildProgram('local-ai-program-1', 5);
    const completeServerProgram = buildProgram('server-program-1', 6);

    const merged = mergeFetchedProgramsWithLocal(
      [completeServerProgram],
      [localProgram]
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe(completeServerProgram.id);
    expect(merged[0].workouts[0].exercises).toHaveLength(6);
  });
});
