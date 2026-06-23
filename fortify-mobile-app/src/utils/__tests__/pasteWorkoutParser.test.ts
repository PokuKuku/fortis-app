import { parsePastedWorkout } from '@/src/utils/pasteWorkoutParser';

describe('parsePastedWorkout', () => {
  it('parses inline sets, rep ranges, and starting weight', () => {
    const result = parsePastedWorkout('Day 1 (Push 1)\nPec Deck: 2 sets x 10-12 reps: 90lbs');
    expect(result.workoutName).toBe('Day 1 (Push 1)');
    expect(result.entries).toEqual([expect.objectContaining({
      sourceName: 'Pec Deck', sets: 2, reps: '10-12', startingWeight: 90, weightUnit: 'lbs',
    })]);
  });

  it.each([
    ['90 lb', 90, 'lbs'],
    ['90 lbs', 90, 'lbs'],
    ['90 pound', 90, 'lbs'],
    ['90 pounds', 90, 'lbs'],
    ['40 kg', 40, 'kg'],
    ['40 kgs', 40, 'kg'],
    ['40 kilogram', 40, 'kg'],
    ['40 kilograms', 40, 'kg'],
  ] as const)('normalizes %s to the correct weight unit', (sourceWeight, startingWeight, weightUnit) => {
    const result = parsePastedWorkout(`Bench Press: 3 sets x 8-12 reps: ${sourceWeight}`);

    expect(result.entries[0]).toEqual(expect.objectContaining({ startingWeight, weightUnit }));
  });

  it('parses a numbered exercise followed by its prescription on the next line', () => {
    const result = parsePastedWorkout('1. Pull-ups or Lat Pulldown\n3 sets of 6–12 reps');
    expect(result.entries).toEqual([expect.objectContaining({
      sourceName: 'Pull-ups or Lat Pulldown', sets: 3, reps: '6-12',
    })]);
  });

  it('detects a push workout title', () => {
    const result = parsePastedWorkout('Push workout\n\nIncline Cable Flies: 4 sets x 12-15 reps: 22lbs');
    expect(result.workoutName).toBe('Push workout');
  });

  it('detects an arbitrary first-line workout title without keyword hardcoding', () => {
    const result = parsePastedWorkout('Upper body day 1 workout\n\nIncline Cable Flies: 4 sets x 12-15 reps');
    expect(result.workoutName).toBe('Upper body day 1 workout');
  });

  it('parses the in-app tour workout-note example', () => {
    const result = parsePastedWorkout(`Upper Body Demo
Barbell Bench Press: 3 sets x 8-12 reps
Cable Pulldown: 3 sets x 10-12 reps
Dumbbell Seated Shoulder Press: 3 sets x 10-12 reps`);

    expect(result.workoutName).toBe('Upper Body Demo');
    expect(result.entries).toEqual([
      expect.objectContaining({ sourceName: 'Barbell Bench Press', sets: 3, reps: '8-12' }),
      expect.objectContaining({ sourceName: 'Cable Pulldown', sets: 3, reps: '10-12' }),
      expect.objectContaining({ sourceName: 'Dumbbell Seated Shoulder Press', sets: 3, reps: '10-12' }),
    ]);
  });

  it('does not treat a numbered exercise as a workout title', () => {
    const result = parsePastedWorkout('1. Pull-ups\n3 sets of 6-12 reps');
    expect(result.workoutName).toBeNull();
  });

  it('leaves the workout name blank for a numbered workout list with no title', () => {
    const result = parsePastedWorkout(`1. Pull-ups or Lat Pulldown
3 sets of 6–12 reps
Focus on pulling your elbows down, not just moving the weight.

2. Incline Dumbbell Press
3 sets of 8–12 reps
Great for upper chest and front delts.

3. Romanian Deadlift
3 sets of 8–10 reps`);

    expect(result.workoutName).toBeNull();
    expect(result.entries).toHaveLength(3);
  });

  it.each(['3x8-12', '3 × 8–12', '3 sets of 8 to 12 reps'])('parses %s', (prescription) => {
    const result = parsePastedWorkout(`Bench Press: ${prescription}`);
    expect(result.entries[0]).toEqual(expect.objectContaining({ sets: 3, reps: '8-12' }));
  });

  it('turns a plain exercise list into default workout entries', () => {
    const result = parsePastedWorkout('Barbell Bench Press\nCable Pulldown\nDumbbell Seated Shoulder Press');

    expect(result.workoutName).toBeNull();
    expect(result.entries).toEqual([
      expect.objectContaining({ sourceName: 'Barbell Bench Press', sets: 3, reps: '8-12' }),
      expect.objectContaining({ sourceName: 'Cable Pulldown', sets: 3, reps: '8-12' }),
      expect.objectContaining({ sourceName: 'Dumbbell Seated Shoulder Press', sets: 3, reps: '8-12' }),
    ]);
  });

  it('keeps a blank-line-separated title for a plain exercise list', () => {
    const result = parsePastedWorkout('Upper Body\n\nBarbell Bench Press\nCable Pulldown');

    expect(result.workoutName).toBe('Upper Body');
    expect(result.entries.map((entry) => entry.sourceName)).toEqual([
      'Barbell Bench Press',
      'Cable Pulldown',
    ]);
  });
});
