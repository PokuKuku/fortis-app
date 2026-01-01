// Jest setup file for React Native Testing Library
// Matchers are now built into @testing-library/react-native v12.4+

// Mock Expo winter runtime (fixes import meta registry error)
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Mock react-native-worklets (avoid native init during tests)
jest.mock('react-native-worklets', () => {
  const RuntimeKind = { ReactNative: 0 };
  const NOOP = () => {};
  const NOOP_FACTORY = () => NOOP;
  const ID = (value) => value;
  const IMMEDIATE_CALLBACK_INVOCATION = (callback) => callback();
  const mockedRequestAnimationFrame = (callback) =>
    setTimeout(() => callback(Date.now()), 0);

  globalThis._WORKLET = false;
  globalThis.__RUNTIME_KIND = RuntimeKind.ReactNative;
  globalThis._log = console.log;
  globalThis._getAnimationTimestamp = () => performance.now();
  globalThis.requestAnimationFrame = mockedRequestAnimationFrame;

  const queueMicrotaskSafe = globalThis.queueMicrotask
    ? globalThis.queueMicrotask
    : (cb) => setTimeout(cb, 0);

  const WorkletAPI = {
    isShareableRef: () => true,
    makeShareable: ID,
    makeShareableCloneOnUIRecursive: ID,
    makeShareableCloneRecursive: ID,
    shareableMappingCache: new Map(),
    getStaticFeatureFlag: () => false,
    setDynamicFeatureFlag: NOOP,
    isSynchronizable: () => false,
    getRuntimeKind: () => RuntimeKind.ReactNative,
    RuntimeKind,
    createWorkletRuntime: NOOP_FACTORY,
    runOnRuntime: ID,
    scheduleOnRuntime: IMMEDIATE_CALLBACK_INVOCATION,
    createSerializable: ID,
    isSerializableRef: ID,
    serializableMappingCache: new Map(),
    createSynchronizable: ID,
    callMicrotasks: NOOP,
    executeOnUIRuntimeSync: ID,
    runOnJS: (fun) => (...args) =>
      queueMicrotaskSafe(() => (args.length ? fun(...args) : fun())),
    runOnUI: (worklet) => (...args) =>
      mockedRequestAnimationFrame(() => worklet(...args)),
    runOnUIAsync: (worklet) => (...args) =>
      new Promise((resolve) => {
        mockedRequestAnimationFrame(() => resolve(worklet(...args)));
      }),
    runOnUISync: IMMEDIATE_CALLBACK_INVOCATION,
    scheduleOnRN: (fun, ...args) => WorkletAPI.runOnJS(fun)(...args),
    scheduleOnUI: (worklet, ...args) => WorkletAPI.runOnUI(worklet)(...args),
    unstable_eventLoopTask: NOOP_FACTORY,
    isWorkletFunction: () => false,
    WorkletsModule: {},
  };

  return { __esModule: true, ...WorkletAPI };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
    GestureHandlerRootView: View,
  };
});

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
