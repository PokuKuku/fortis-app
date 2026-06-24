import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTourNarration } from '@/src/hooks/useTourNarration';

const mockCreateAsync = jest.fn();
const mockSetAudioModeAsync = jest.fn(() => Promise.resolve());
const mockStopAsync = jest.fn(() => Promise.resolve());
const mockUnloadAsync = jest.fn(() => Promise.resolve());

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
    Sound: {
      createAsync: (...args: unknown[]) => mockCreateAsync(...args),
    },
  },
}));

const source = { uri: 'ai-chat-overview.m4a' };

describe('useTourNarration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateAsync.mockResolvedValue({
      sound: {
        stopAsync: mockStopAsync,
        unloadAsync: mockUnloadAsync,
      },
    });
  });

  it('autoplays once when enabled and replays on request', async () => {
    let enabled = false;
    const hook = renderHook(() => useTourNarration({ enabled, source }));

    enabled = true;
    hook.rerender(undefined);
    await waitFor(() => expect(mockCreateAsync).toHaveBeenCalledTimes(1));

    await act(async () => {
      expect(await hook.result.current.replay()).toBe(true);
    });

    expect(mockCreateAsync).toHaveBeenCalledTimes(2);
    expect(mockStopAsync).toHaveBeenCalledTimes(1);
    expect(mockUnloadAsync).toHaveBeenCalledTimes(1);
  });

  it('stops and unloads narration when disabled or unmounted', async () => {
    let enabled = true;
    const hook = renderHook(() => useTourNarration({ enabled, source }));

    await waitFor(() => expect(mockCreateAsync).toHaveBeenCalledTimes(1));
    enabled = false;
    hook.rerender(undefined);
    await waitFor(() => expect(mockUnloadAsync).toHaveBeenCalledTimes(1));

    enabled = true;
    hook.rerender(undefined);
    await waitFor(() => expect(mockCreateAsync).toHaveBeenCalledTimes(2));
    hook.unmount();
    await waitFor(() => expect(mockUnloadAsync).toHaveBeenCalledTimes(2));
  });

  it('keeps replay available when playback creation fails', async () => {
    mockCreateAsync.mockRejectedValueOnce(new Error('Playback failed'));
    const hook = renderHook(() => useTourNarration({ enabled: true, source }));

    await waitFor(() => expect(mockCreateAsync).toHaveBeenCalledTimes(1));
    expect(hook.result.current.isPlaying).toBe(false);

    await act(async () => {
      expect(await hook.result.current.replay()).toBe(true);
    });

    expect(mockCreateAsync).toHaveBeenCalledTimes(2);
  });

  it('does not autoplay when autoplay is disabled', async () => {
    const hook = renderHook(() => useTourNarration({ enabled: true, source, autoPlay: false }));

    expect(mockCreateAsync).not.toHaveBeenCalled();

    await act(async () => {
      expect(await hook.result.current.replay()).toBe(true);
    });

    expect(mockCreateAsync).toHaveBeenCalledTimes(1);
    expect(hook.result.current.hasPlayed).toBe(true);
  });

  it('configures speaker playback before playing the demo', async () => {
    const hook = renderHook(() => useTourNarration({ enabled: true, source, autoPlay: false }));

    await act(async () => {
      await hook.result.current.replay();
    });

    expect(mockSetAudioModeAsync).toHaveBeenCalledWith(expect.objectContaining({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    }));
  });
});
