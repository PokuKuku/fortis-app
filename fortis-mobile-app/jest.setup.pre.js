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
