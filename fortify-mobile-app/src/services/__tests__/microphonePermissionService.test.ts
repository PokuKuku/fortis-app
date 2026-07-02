const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();

jest.mock('expo-av', () => ({
  Audio: {
    getPermissionsAsync: () => mockGetPermissionsAsync(),
    requestPermissionsAsync: () => mockRequestPermissionsAsync(),
  },
}));

describe('microphonePermissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('requests microphone permission when the OS can still ask again', async () => {
    mockGetPermissionsAsync.mockResolvedValue({
      granted: false,
      status: 'denied',
      canAskAgain: true,
    });
    mockRequestPermissionsAsync.mockResolvedValue({
      granted: true,
      status: 'granted',
      canAskAgain: true,
    });

    const { ensureMicrophonePermission } = require('@/src/services/microphonePermissionService');
    await expect(ensureMicrophonePermission()).resolves.toEqual({
      granted: true,
      status: 'granted',
      canAskAgain: true,
    });

    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('does not request microphone permission when the OS cannot ask again', async () => {
    const deniedPermission = {
      granted: false,
      status: 'denied',
      canAskAgain: false,
    };
    mockGetPermissionsAsync.mockResolvedValue(deniedPermission);

    const { ensureMicrophonePermission } = require('@/src/services/microphonePermissionService');
    await expect(ensureMicrophonePermission()).resolves.toEqual(deniedPermission);

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });
});
