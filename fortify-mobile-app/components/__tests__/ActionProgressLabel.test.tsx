import { render } from '@testing-library/react-native';
import { ActionProgressLabel } from '@/src/components/ui/ActionProgressLabel';

describe('ActionProgressLabel', () => {
  it('announces the action while showing a stable progress verb', () => {
    const { getByText, getByLabelText } = render(
      <ActionProgressLabel label="Creating…" color="#123456" />
    );

    expect(getByText('Creating…')).toBeTruthy();
    expect(getByLabelText('Creating…')).toBeTruthy();
  });

  it('supports compact visual copy with a descriptive accessibility label', () => {
    const { getByText, getByLabelText } = render(
      <ActionProgressLabel
        label="•••"
        accessibilityLabel="Saving name"
        color="#123456"
      />
    );

    expect(getByText('•••')).toBeTruthy();
    expect(getByLabelText('Saving name')).toBeTruthy();
  });
});
