import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { NumberPadModal } from '@/src/components/workout/NumberPadModal';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutSession } from '@/src/types/workout';

const mockAdvanceStep = jest.fn();
const mockTourState = {
  isTourActive: false,
  activeStepId: null as string | null,
};

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

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: () => ({
    ...mockTourState,
    advanceStep: mockAdvanceStep,
  }),
}));

jest.mock('@/src/components/tour/TourAnchor', () => ({
  TourAnchor: ({ children }: { children: React.ReactNode }) => children,
}));

describe('NumberPadModal', () => {
  beforeEach(() => {
    mockTourState.isTourActive = false;
    mockTourState.activeStepId = null;
    mockAdvanceStep.mockReset();
  });

  afterEach(() => {
    useWorkoutStore.getState().resetStore();
  });

  const renderWithTheme = (ui: React.ReactElement) => render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}
    >
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </SafeAreaProvider>
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

  it('waits for the keypad exit animation before advancing the tour', () => {
    jest.useFakeTimers();
    mockTourState.isTourActive = true;
    mockTourState.activeStepId = 'fill_reps_column';
    const onClose = jest.fn();
    const activeSession: WorkoutSession = {
      localId: 'session-tour',
      name: 'Tour workout',
      notes: '',
      startedAt: new Date('2025-01-01T00:00:00.000Z'),
      completedAt: null,
      exercises: [{
        localId: 'exercise-tour',
        exerciseId: 'ex-tour',
        exerciseName: 'Row',
        sets: [
          { localId: 'set-1', setNumber: 1, setType: 'normal', weight: 225, reps: 8, rpe: null, restSeconds: null, notes: '', isCompleted: false, orderIndex: 0 },
          { localId: 'set-2', setNumber: 2, setType: 'normal', weight: 225, reps: null, rpe: null, restSeconds: null, notes: '', isCompleted: false, orderIndex: 1 },
        ],
        notes: '',
        orderIndex: 0,
      }],
      isSynced: false,
    };

    useWorkoutStore.setState({ activeSession, isWorkoutActive: true });
    useWorkoutStore.getState().openNumberPad('exercise-tour', 'set-1', 'reps');

    const { getByTestId } = renderWithTheme(
      <NumberPadModal
        visible
        onClose={onClose}
        onConfirm={jest.fn()}
        inputType="reps"
      />
    );

    fireEvent.press(getByTestId('number-pad-fill-down'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockAdvanceStep).not.toHaveBeenCalled();
    jest.advanceTimersByTime(399);
    expect(mockAdvanceStep).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(mockAdvanceStep).toHaveBeenCalledTimes(1);
    expect(useWorkoutStore.getState().activeSession?.exercises[0].sets[1].reps).toBe(8);
    jest.useRealTimers();
  });
});
