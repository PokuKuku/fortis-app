import { fireEvent, render } from '@testing-library/react-native';
import { WorkoutScheduleEditorModal } from '@/src/components/workout/WorkoutScheduleEditorModal';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/components/ui/BaseModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BaseModal: ({ visible, children }: { visible: boolean; children: React.ReactNode }) => (
      visible ? <View>{children}</View> : null
    ),
    useModalStyles: () => ({
      actions: {},
      cancelButton: {},
      buttonPressed: {},
      cancelButtonText: {},
      successButton: {},
      successButtonText: {},
    }),
  };
});

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      accent: '#111827',
      accentForegroundOnFill: '#ffffff',
      textPrimary: '#111111',
      textSecondary: '#444444',
    },
  }),
}));

describe('WorkoutScheduleEditorModal', () => {
  it('keeps the submitted selection while an async save is in progress', () => {
    const props = {
      visible: true,
      initialDays: [1],
      isSaving: false,
      onClose: jest.fn(),
      onSave: jest.fn(),
    };
    const { getByLabelText, rerender } = render(<WorkoutScheduleEditorModal {...props} />);

    fireEvent.press(getByLabelText('Tue workout day'));
    expect(getByLabelText('Tue workout day').props.accessibilityState.selected).toBe(true);

    rerender(
      <WorkoutScheduleEditorModal
        {...props}
        initialDays={[1, 4]}
        isSaving
      />
    );

    expect(getByLabelText('Tue workout day').props.accessibilityState.selected).toBe(true);
    expect(getByLabelText('Thu workout day').props.accessibilityState.selected).toBe(false);
  });

  it('loads the latest schedule each time the modal opens', () => {
    const props = {
      initialDays: [1],
      isSaving: false,
      onClose: jest.fn(),
      onSave: jest.fn(),
    };
    const { getByLabelText, rerender } = render(
      <WorkoutScheduleEditorModal {...props} visible />
    );

    rerender(<WorkoutScheduleEditorModal {...props} visible={false} />);
    rerender(<WorkoutScheduleEditorModal {...props} initialDays={[4]} visible />);

    expect(getByLabelText('Mon workout day').props.accessibilityState.selected).toBe(false);
    expect(getByLabelText('Thu workout day').props.accessibilityState.selected).toBe(true);
  });
});
