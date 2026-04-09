import React from 'react';
import { render } from '@testing-library/react-native';
import { MixpanelAuthSync } from '@/src/components/analytics/MixpanelAuthSync';
import { useAuth } from '@/src/contexts/AuthContext';
import { identifyMixpanelUser, resetMixpanelUser } from '@/src/lib/mixpanel';

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/lib/mixpanel', () => ({
  identifyMixpanelUser: jest.fn(() => Promise.resolve()),
  resetMixpanelUser: jest.fn(() => Promise.resolve()),
}));

describe('MixpanelAuthSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('identifies the authenticated user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
      profile: {
        email: 'test@example.com',
        full_name: 'Test User',
        preferred_units: 'imperial',
        onboarding_completed: true,
        theme_mode: 'dark',
        accent_color: 'midnight',
      },
    });

    render(<MixpanelAuthSync />);

    expect(identifyMixpanelUser).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
      })
    );
  });

  it('resets Mixpanel when the authenticated user signs out', () => {
    const useAuthMock = useAuth as jest.Mock;
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
    });

    const { rerender } = render(<MixpanelAuthSync />);

    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      profile: null,
    });
    rerender(<MixpanelAuthSync />);

    expect(resetMixpanelUser).toHaveBeenCalledTimes(1);
  });
});
