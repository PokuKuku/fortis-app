import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PostTourDataCoordinator } from '@/src/components/app/PostTourDataCoordinator';

const mockHydrateDeferredUserData = jest.fn(() => Promise.resolve());
const mockSyncPendingUserData = jest.fn(() => Promise.resolve());
let mockHasTourFinished = false;
let mockIsDeferredHydrationComplete = false;

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: () => ({ hasTourFinished: mockHasTourFinished }),
}));

jest.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({
    hydrateDeferredUserData: mockHydrateDeferredUserData,
    isAuthenticated: true,
    isDeferredHydrationComplete: mockIsDeferredHydrationComplete,
    profileResolved: true,
    syncPendingUserData: mockSyncPendingUserData,
    user: { id: 'user-1' },
  }),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

describe('PostTourDataCoordinator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasTourFinished = false;
    mockIsDeferredHydrationComplete = false;
  });

  it('does not hydrate app data while the tour is unfinished', () => {
    render(<PostTourDataCoordinator />);

    expect(mockHydrateDeferredUserData).not.toHaveBeenCalled();
  });

  it('hydrates app data after the tour finishes', async () => {
    mockHasTourFinished = true;
    render(<PostTourDataCoordinator />);

    await waitFor(() => {
      expect(mockHydrateDeferredUserData).toHaveBeenCalledTimes(1);
    });
  });

  it('does not hydrate again after deferred data is ready', () => {
    mockHasTourFinished = true;
    mockIsDeferredHydrationComplete = true;
    render(<PostTourDataCoordinator />);

    expect(mockHydrateDeferredUserData).not.toHaveBeenCalled();
  });
});
