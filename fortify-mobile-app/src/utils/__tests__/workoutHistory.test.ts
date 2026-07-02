import type { WorkoutSession } from '@/src/types/workout';
import { mergeWorkoutSessions } from '@/src/utils/workoutHistory';

function session(localId: string, startedAt: string, isSynced: boolean): WorkoutSession {
  return {
    localId,
    name: localId,
    notes: '',
    startedAt: new Date(startedAt),
    completedAt: new Date(startedAt),
    exercises: [],
    isSynced,
  };
}

describe('mergeWorkoutSessions', () => {
  it('keeps local sessions that are not present remotely', () => {
    const merged = mergeWorkoutSessions(
      [session('remote-monday', '2026-05-18T18:00:00Z', true)],
      [
        session('stale-tuesday', '2026-05-19T18:00:00Z', true),
        session('local-unsynced', '2026-05-20T18:00:00Z', false),
      ]
    );

    expect(merged.map((item) => item.localId)).toEqual([
      'local-unsynced',
      'stale-tuesday',
      'remote-monday',
    ]);
  });

  it('keeps the remote copy when remote and local share a local id', () => {
    const merged = mergeWorkoutSessions(
      [session('same-id', '2026-05-18T18:00:00Z', true)],
      [session('same-id', '2026-05-18T17:00:00Z', false)]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].startedAt.toISOString()).toBe('2026-05-18T18:00:00.000Z');
  });
});
