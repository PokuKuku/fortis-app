// Pre-setup file that runs before test framework
// Used to mock Expo internals before they're loaded

// Disable Expo winter runtime
global.__ExpoImportMetaRegistry = {
  get: () => undefined,
  set: () => {},
};

// React Native renderer expects DOM-like window event APIs in some runtimes.
// Node 25 can expose a partial window object without dispatchEvent.
const testWindow = global.window ?? global;
if (typeof testWindow.dispatchEvent !== 'function') {
  testWindow.dispatchEvent = () => true;
}
if (typeof testWindow.addEventListener !== 'function') {
  testWindow.addEventListener = () => {};
}
if (typeof testWindow.removeEventListener !== 'function') {
  testWindow.removeEventListener = () => {};
}
global.window = testWindow;

// Mock structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      abortSignal: jest.fn().mockReturnThis(),
    })),
  },
  isSupabaseConfigured: () => false,
}));

jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    track: jest.fn(),
    identify: jest.fn().mockResolvedValue(undefined),
    clearSuperProperties: jest.fn(),
    registerSuperProperties: jest.fn(),
    reset: jest.fn(),
    getPeople: jest.fn(() => ({
      set: jest.fn(),
    })),
  })),
}));

jest.mock('@mixpanel/react-native-session-replay', () => ({
  MPSessionReplay: {
    initialize: jest.fn().mockResolvedValue(undefined),
    identify: jest.fn().mockResolvedValue(undefined),
    startRecording: jest.fn().mockResolvedValue(undefined),
    stopRecording: jest.fn().mockResolvedValue(undefined),
    isRecording: jest.fn().mockResolvedValue(false),
    getReplayId: jest.fn().mockResolvedValue(null),
    flush: jest.fn().mockResolvedValue(undefined),
  },
  MPSessionReplayConfig: jest.fn().mockImplementation((config = {}) => ({
    ...config,
    toJSON: jest.fn(() => JSON.stringify(config)),
  })),
  MPSessionReplayMask: {
    Text: 'text',
    Web: 'web',
    Map: 'map',
    Image: 'image',
  },
  MPSessionReplayRemoteSettingsMode: {
    Disabled: 'disabled',
    Strict: 'strict',
    Fallback: 'fallback',
  },
  MPSessionReplayView: 'MPSessionReplayView',
}));
