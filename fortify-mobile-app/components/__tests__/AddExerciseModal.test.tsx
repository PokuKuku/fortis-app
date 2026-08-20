import { act, fireEvent, render } from '@testing-library/react-native';

import { AddExerciseModal } from '@/src/components/workout/modals/AddExerciseModal';

jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn(),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: { ios: {}, android: {} },
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
  InterruptionModeAndroid: { DuckOthers: 1 },
  InterruptionModeIOS: { DoNotMix: 1, MixWithOthers: 2 },
}));

jest.mock('expo-file-system/legacy', () => ({
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: jest.fn(),
}));

jest.mock('@/src/services/microphonePermissionService', () => ({
  ensureMicrophonePermission: jest.fn(),
  openMicrophoneSettings: jest.fn(),
}));

jest.mock('@/src/services/exerciseVoiceService', () => ({
  createExerciseVoiceFileName: jest.fn(),
  interpretExerciseVoiceAdd: jest.fn(),
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    colors: {
      accent: '#00ff00',
      accentBorder: '#00aa00',
      accentForegroundOnFill: '#000000',
      accentOverlay: 'rgba(0, 255, 0, 0.1)',
      accentOverlayMedium: 'rgba(0, 255, 0, 0.2)',
      background: '#000000',
      textPrimary: '#ffffff',
      textSecondary: '#aaaaaa',
    },
  }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: { background: '#000000', textPrimary: '#ffffff' },
}));

jest.mock('@/src/store/workoutStore', () => ({
  useWorkoutStore: (selector: (state: unknown) => unknown) => selector({
    activeSession: { exercises: [] },
    addExercises: jest.fn(),
    replaceExercise: jest.fn(),
  }),
}));

jest.mock('@/src/hooks/useExercises', () => ({
  useExercises: () => ({ exercises: [], loading: false }),
}));

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/components/GlassButton', () => {
  const { View } = require('react-native');
  return {
    GlassButton: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('@/src/components/ui/TabPageSkeleton', () => ({
  SectionSkeleton: () => null,
}));

jest.mock('@/src/utils/exerciseImageCache', () => ({
  getCachedExerciseImageSource: () => null,
  prefetchExerciseImagesFromExercises: jest.fn(),
}));

describe('AddExerciseModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('preserves search while suspended for exercise details and clears it after closing', () => {
    const props = {
      visible: true,
      suspended: false,
      replaceMode: true,
      onClose: jest.fn(),
    };
    const screen = render(<AddExerciseModal {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText('Search exercises...'), 'bench');
    expect(screen.getByPlaceholderText('Search exercises...').props.value).toBe('bench');

    screen.rerender(<AddExerciseModal {...props} suspended />);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    screen.rerender(<AddExerciseModal {...props} />);

    expect(screen.getByPlaceholderText('Search exercises...').props.value).toBe('bench');

    screen.rerender(<AddExerciseModal {...props} visible={false} />);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    screen.rerender(<AddExerciseModal {...props} />);

    expect(screen.getByPlaceholderText('Search exercises...').props.value).toBe('');
  });
});
