// Polyfill Buffer for react-native-svg
global.Buffer = require('buffer').Buffer;

const originalConsoleError = console.error;
console.error = (...args) => {
  const firstArg = args[0];
  const message =
    typeof firstArg === 'string'
      ? firstArg
      : firstArg?.message ?? '';
  const name = firstArg?.name ?? '';

  if (
    name === 'AuthApiError' &&
    message.includes('Invalid Refresh Token') &&
    message.includes('Refresh Token Not Found')
  ) {
    return;
  }

  originalConsoleError(...args);
};

import 'expo-router/entry';
