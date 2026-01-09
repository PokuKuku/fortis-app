import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { NumberPadModal } from '@/src/components/workout/NumberPadModal';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-heroicons/outline', () => ({
  BackspaceIcon: 'BackspaceIcon',
  ChevronDoubleDownIcon: 'ChevronDoubleDownIcon',
  MinusIcon: 'MinusIcon',
  PlusIcon: 'PlusIcon',
  XMarkIcon: 'XMarkIcon',
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: 'StainlessSteelPattern',
}));

jest.mock('@/src/components/workout/RPESelectorOverlay', () => ({
  RPESelectorOverlay: () => null,
}));

jest.mock('@/src/components/workout/RPEHelpModal', () => ({
  RPEHelpModal: () => null,
}));

describe('NumberPadModal', () => {
  afterEach(() => {
    useWorkoutStore.getState().resetStore();
  });

  const renderWithTheme = (ui: React.ReactElement) => render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );

  it('replaces a prefilled value on the first keypress in an active session', () => {
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
              weight: 135,
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
    useWorkoutStore.getState().openNumberPad('exercise-1', 'set-1', 'weight');

    const { getByText } = renderWithTheme(
      <NumberPadModal
        visible
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        inputType="weight"
      />
    );

    fireEvent.press(getByText('2'));

    const pendingValue = useWorkoutStore.getState().activeNumberPad?.pendingValue;
    expect(pendingValue).toBe('2');
  });

  it('replaces a prefilled value on the first keypress in the editor session', () => {
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
              weight: 185,
              reps: 10,
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
    useWorkoutStore.getState().openEditorNumberPad('exercise-2', 'set-2', 'reps');

    const { getByText } = renderWithTheme(
      <NumberPadModal
        visible
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        inputType="reps"
        useEditor
      />
    );

    fireEvent.press(getByText('3'));

    const pendingValue = useWorkoutStore.getState().activeNumberPad?.pendingValue;
    expect(pendingValue).toBe('3');
  });
});
