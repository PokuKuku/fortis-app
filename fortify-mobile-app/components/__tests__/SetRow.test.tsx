import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { SetRow } from '@/src/components/workout/SetRow';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-heroicons/outline', () => ({
  CheckIcon: 'CheckIcon',
  TrashIcon: 'TrashIcon',
}));

describe('SetRow', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
  });

  const renderWithTheme = (ui: React.ReactElement) => render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );

  it('defaults missing weight to zero when completing a set in an active session', () => {
    const activeSession: WorkoutSession = {
      localId: 'session-1',
      name: 'Upper 1',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-1',
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: null,
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: 0,
            },
          ],
          notes: '',
          orderIndex: 0,
        },
      ],
      isSynced: false,
    };

    useWorkoutStore.setState({
      activeSession,
      isWorkoutActive: true,
    });

    const { getByLabelText } = renderWithTheme(
      <SetRow
        exerciseLocalId="exercise-1"
        setLocalId="set-1"
        setIndex={0}
      />
    );

    fireEvent.press(getByLabelText('Set 1 completed'));

    const updatedSet = useWorkoutStore.getState().activeSession?.exercises[0].sets[0];
    expect(updatedSet?.weight).toBe(0);
    expect(updatedSet?.reps).toBe(8);
    expect(updatedSet?.isCompleted).toBe(true);
  });

  it('defaults missing weight to zero when completing a set in the editor session', () => {
    const editorSession: WorkoutSession = {
      localId: 'session-2',
      name: 'Template',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-2',
          exerciseId: 'ex-2',
          exerciseName: 'Squat',
          sets: [
            {
              localId: 'set-2',
              setNumber: 1,
              setType: 'normal',
              weight: null,
              reps: 6,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: 0,
            },
          ],
          notes: '',
          orderIndex: 0,
        },
      ],
      isSynced: false,
    };

    useWorkoutStore.setState({
      editorSession,
      editorMode: 'log',
    });

    const { getByLabelText } = renderWithTheme(
      <SetRow
        exerciseLocalId="exercise-2"
        setLocalId="set-2"
        setIndex={0}
        useEditor
        showCheckboxes
      />
    );

    fireEvent.press(getByLabelText('Set 1 completed'));

    const updatedSet = useWorkoutStore.getState().editorSession?.exercises[0].sets[0];
    expect(updatedSet?.weight).toBe(0);
    expect(updatedSet?.reps).toBe(6);
    expect(updatedSet?.isCompleted).toBe(true);
  });

  it('autofills and completes the first set from baseline performance', () => {
    const activeSession: WorkoutSession = {
      localId: 'session-3',
      name: 'Upper 1',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [
        {
          localId: 'exercise-3',
          exerciseId: 'ex-3',
          exerciseName: 'Incline Press',
          sets: [
            {
              localId: 'set-3',
              setNumber: 1,
              setType: 'normal',
              weight: null,
              weightUnit: 'lbs',
              reps: null,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: 0,
            },
          ],
          baselinePerformance: {
            sets: [
              {
                weight: 95,
                weightUnit: 'lbs',
                reps: 10,
                setType: 'normal',
              },
            ],
          },
          notes: '',
          orderIndex: 0,
        },
      ],
      isSynced: false,
    };

    useWorkoutStore.setState({
      activeSession,
      isWorkoutActive: true,
      weightUnits: { 'ex-3': 'lbs' },
    });

    const { getByLabelText } = renderWithTheme(
      <SetRow
        exerciseLocalId="exercise-3"
        setLocalId="set-3"
        setIndex={0}
        baselinePerformance={activeSession.exercises[0].baselinePerformance}
      />
    );

    fireEvent.press(getByLabelText('Set 1 completed'));

    const updatedSet = useWorkoutStore.getState().activeSession?.exercises[0].sets[0];
    expect(updatedSet?.weight).toBe(95);
    expect(updatedSet?.reps).toBe(10);
    expect(updatedSet?.isCompleted).toBe(true);
    expect(useWorkoutStore.getState().validationErrorsBySet).toEqual({});
  });
});
