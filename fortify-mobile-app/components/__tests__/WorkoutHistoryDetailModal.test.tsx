import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { WorkoutHistoryDetailModal } from '@/src/components/workout/modals/WorkoutHistoryDetailModal';
import type { WorkoutSession } from '@/src/types/workout';

const mockCreateWorkoutTemplate = jest.fn();
const mockCanCreateWorkoutTemplate = jest.fn(() => true);
const mockRunProFeature = jest.fn();

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    error: '#dc2626',
    success: '#22c55e',
    textPrimary: '#111111',
    textSecondary: '#555555',
  },
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      accent: '#22c55e',
      error: '#dc2626',
      textPrimary: '#111111',
      textSecondary: '#555555',
    },
  }),
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: {
      preferred_units: 'imperial',
      weight_kg: null,
    },
  }),
}));

jest.mock('@/src/hooks/useExerciseLookup', () => ({
  useExerciseLookup: () => ({ exercisesById: new Map() }),
}));

jest.mock('@/src/hooks/useLatestBodyweight', () => ({
  useLatestBodyweight: () => ({ bodyweightKg: null }),
}));

jest.mock('@/src/services/exerciseService', () => ({
  getExerciseById: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@/src/store/programsStore', () => ({
  useProgramsStore: (selector: (state: unknown) => unknown) => selector({
    programs: [],
    createWorkoutTemplate: mockCreateWorkoutTemplate,
  }),
}));

jest.mock('@/src/components/superwall/useProFeatureGate', () => ({
  useProFeatureGate: () => ({
    canCreateWorkoutTemplate: mockCanCreateWorkoutTemplate,
    runProFeature: mockRunProFeature,
  }),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

const session = {
  localId: 'history-push',
  name: 'Push',
  notes: '',
  startedAt: new Date('2026-08-06T17:25:00.000Z'),
  completedAt: new Date('2026-08-06T18:00:12.000Z'),
  durationSeconds: 2112,
  exercises: [
    {
      localId: 'history-fly',
      exerciseId: 'lever-seated-fly',
      exerciseName: 'Lever Seated Fly',
      targetReps: '8',
      notes: 'Controlled tempo',
      orderIndex: 0,
      sets: [
        {
          localId: 'history-set-1',
          setNumber: 1,
          setType: 'normal',
          weight: 100,
          weightUnit: 'lbs',
          reps: 8,
          rpe: null,
          restSeconds: 90,
          notes: '',
          isCompleted: true,
          orderIndex: 0,
        },
        {
          localId: 'history-set-2',
          setNumber: 2,
          setType: 'dropset',
          weight: 80,
          weightUnit: 'lbs',
          reps: 10,
          rpe: null,
          restSeconds: 60,
          notes: '',
          isCompleted: false,
          orderIndex: 1,
        },
      ],
    },
  ],
  isSynced: true,
} as WorkoutSession;

describe('WorkoutHistoryDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateWorkoutTemplate.mockResolvedValue('new-workout-template');
    mockCanCreateWorkoutTemplate.mockReturnValue(true);
  });

  it('creates a reusable workout from completed history sets', async () => {
    const view = render(
      <WorkoutHistoryDetailModal
        visible
        onClose={jest.fn()}
        session={session}
      />
    );

    expect(view.queryByLabelText('Close modal')).toBeNull();
    expect(StyleSheet.flatten(view.getByText('Push').props.style).fontFamily)
      .toBe('BankGothicBT-Medium');

    fireEvent.press(view.getByLabelText('Add workout from history'));

    await waitFor(() => {
      expect(mockCreateWorkoutTemplate).toHaveBeenCalledWith(
        'Push',
        [{
          exerciseId: 'lever-seated-fly',
          exerciseName: 'Lever Seated Fly',
          sets: 1,
          reps: '8',
          restSeconds: 90,
          notes: 'Controlled tempo',
          setDetails: [{ weight: 100, reps: 8, setType: 'normal' }],
        }],
        { lastPerformedAt: session.completedAt }
      );
    });
    expect(view.getByText('Added to Workouts')).toBeTruthy();
  });
});
