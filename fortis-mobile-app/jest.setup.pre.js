// Pre-setup file that runs before test framework
// Used to mock Expo internals before they're loaded

// Disable Expo winter runtime
global.__ExpoImportMetaRegistry = {
  get: () => undefined,
  set: () => {},
};

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
    identify: jest.fn(),
    reset: jest.fn(),
    flush: jest.fn(),
    getDistinctId: jest.fn().mockResolvedValue(null),
    getDeviceId: jest.fn().mockResolvedValue(null),
    people: {
      set: jest.fn(),
    },
  })),
}));
