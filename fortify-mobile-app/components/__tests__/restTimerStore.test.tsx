import { useWorkoutStore } from '@/src/store/workoutStore';

describe('rest timer store', () => {
  let nowSpy: jest.SpyInstance<number, []> | null = null;

  afterEach(() => {
    nowSpy?.mockRestore();
    nowSpy = null;
    useWorkoutStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('updates remaining time from endTimestamp', () => {
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(7000);
    useWorkoutStore.setState({
      restTimer: {
        isActive: true,
        remainingSeconds: 30,
        totalSeconds: 30,
        setType: 'normal',
        endTimestamp: 10000,
      },
      showRestTimerComplete: false,
    });

    useWorkoutStore.getState().tickRestTimer();

    const { restTimer } = useWorkoutStore.getState();
    expect(restTimer.remainingSeconds).toBe(3);
    expect(restTimer.isActive).toBe(true);
  });

  it('marks timer complete when endTimestamp elapses', () => {
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(12000);
    useWorkoutStore.setState({
      restTimer: {
        isActive: true,
        remainingSeconds: 30,
        totalSeconds: 30,
        setType: 'normal',
        endTimestamp: 10000,
      },
      showRestTimerComplete: false,
    });

    useWorkoutStore.getState().tickRestTimer();

    const { restTimer, showRestTimerComplete } = useWorkoutStore.getState();
    expect(restTimer.remainingSeconds).toBe(0);
    expect(restTimer.isActive).toBe(false);
    expect(restTimer.endTimestamp).toBeNull();
    expect(showRestTimerComplete).toBe(true);
  });

  it('adjusts next start duration without updating settings', () => {
    const { adjustRestTimerNextStart } = useWorkoutStore.getState();
    adjustRestTimerNextStart(10);

    const { restTimerNextStartSeconds, restTimerSettings } = useWorkoutStore.getState();
    expect(restTimerNextStartSeconds).toBe(130);
    expect(restTimerSettings.normalSeconds).toBe(120);
  });

  it('uses next-start override once and then clears it', () => {
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
    const { adjustRestTimerNextStart, startRestTimer } = useWorkoutStore.getState();
    adjustRestTimerNextStart(-20);
    startRestTimer('normal');

    const { restTimer, restTimerNextStartSeconds } = useWorkoutStore.getState();
    expect(restTimer.totalSeconds).toBe(100);
    expect(restTimer.remainingSeconds).toBe(100);
    expect(restTimer.endTimestamp).toBe(101000);
    expect(restTimerNextStartSeconds).toBeNull();
  });
});
