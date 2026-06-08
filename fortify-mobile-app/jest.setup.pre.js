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

jest.mock('posthog-react-native', () => {
  const client = {
    capture: jest.fn(),
    screen: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  };

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => client),
    PostHogProvider: ({ children }) => children,
    usePostHog: jest.fn(() => client),
  };
});
