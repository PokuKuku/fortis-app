import React from 'react';
import { render } from '@testing-library/react-native';
import {
  InlineSkeleton,
  SectionSkeleton,
  TabPageSkeleton,
} from '@/src/components/ui/TabPageSkeleton';

jest.mock('@/components/StainlessSteelPattern', () => ({
  StainlessSteelPattern: () => null,
}));

jest.mock('@/src/components/navigation/AppHeaderBrand', () => ({
  AppHeaderBrand: () => null,
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      background: '#ffffff',
      textPrimary: '#111111',
    },
  }),
}));

describe('TabPageSkeleton', () => {
  it('identifies the page that is loading while preserving its title', () => {
    const { getByLabelText, getByText, unmount } = render(
      <TabPageSkeleton title="Insights" />
    );

    expect(getByLabelText('Loading Insights')).toBeTruthy();
    expect(getByText('Insights')).toBeTruthy();

    unmount();
  });

  it('renders reusable section and inline placeholders', () => {
    const { getByTestId, unmount } = render(
      <>
        <SectionSkeleton height={120} rows={2} />
        <InlineSkeleton width={40} height={12} />
      </>
    );

    expect(getByTestId('section-skeleton')).toBeTruthy();
    unmount();
  });
});
