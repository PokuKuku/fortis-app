import React from 'react';
import { render } from '@testing-library/react-native';
import { PostHogAuthSync } from '@/src/components/analytics/PostHogAuthSync';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePostHog } from 'posthog-react-native';

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('posthog-react-native', () => ({
  usePostHog: jest.fn(),
}));

describe('PostHogAuthSync', () => {
  const identify = jest.fn();
  const reset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostHog as jest.Mock).mockReturnValue({ identify, reset });
  });

  it('identifies authenticated users with the Supabase UUID', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
      profile: {
        email: 'profile@example.com',
        full_name: 'Test User',
        preferred_units: 'imperial',
        onboarding_completed: true,
      },
    });

    render(<PostHogAuthSync />);

    expect(identify).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
        preferred_units: 'imperial',
        onboarding_completed: true,
      })
    );
  });

  it('refreshes user properties when the profile changes without changing identity', () => {
    const useAuthMock = useAuth as jest.Mock;
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
      profile: {
        full_name: 'Test User',
        preferred_units: 'imperial',
        onboarding_completed: false,
      },
    });

    const { rerender } = render(<PostHogAuthSync />);

    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
      profile: {
        full_name: 'Test User',
        preferred_units: 'metric',
        onboarding_completed: true,
      },
    });
    rerender(<PostHogAuthSync />);

    expect(identify).toHaveBeenCalledTimes(2);
    expect(identify).toHaveBeenLastCalledWith(
      'user-123',
      expect.objectContaining({
        preferred_units: 'metric',
        onboarding_completed: true,
      })
    );
  });

  it('resets PostHog when the authenticated user signs out', () => {
    const useAuthMock = useAuth as jest.Mock;
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123', email: 'test@example.com' },
      profile: null,
    });

    const { rerender } = render(<PostHogAuthSync />);

    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      profile: null,
    });
    rerender(<PostHogAuthSync />);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
