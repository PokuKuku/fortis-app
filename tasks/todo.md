# Testing Setup Plan

## Overview

Set up Jest + React Native Testing Library for the Expo/React Native app.

---

## Todo Items

- [x] Install testing dependencies (jest-expo, @testing-library/react-native, etc.)
- [x] Create Jest configuration (jest.config.js)
- [x] Create setup file for test environment (jest.setup.js)
- [x] Add npm test scripts to package.json
- [x] Create example test to verify setup works
- [x] Update CLAUDE.md with testing commands

---

## Review

### Summary of Changes

**Files Created:**
- `fortis-mobile-app/jest.config.js` - Jest configuration using jest-expo/ios preset
- `fortis-mobile-app/jest.setup.pre.js` - Pre-setup file to mock Expo winter runtime
- `fortis-mobile-app/jest.setup.js` - Main setup file with common mocks (AsyncStorage, expo-haptics, expo-router, react-native-reanimated, react-native-gesture-handler)
- `fortis-mobile-app/components/__tests__/GlassButton.test.tsx` - Example test for GlassButton component

**Files Modified:**
- `fortis-mobile-app/package.json` - Added test scripts (test, test:watch, test:coverage)
- `CLAUDE.md` - Added testing commands section

**Dependencies Installed:**
- jest-expo
- @testing-library/react-native
- @testing-library/jest-native (deprecated but installed for compatibility)
- jest
- @types/jest
- react-test-renderer

### Key Technical Notes

1. **Expo SDK 54 Compatibility:** Required a workaround for the Expo winter runtime by mocking `global.__ExpoImportMetaRegistry` in `jest.setup.pre.js`

2. **Path Alias:** The `@/` path alias is configured in Jest to match the TypeScript config

3. **Test Location:** Tests should be placed in `__tests__` directories adjacent to the code they test, or use `.test.tsx` suffix

### Commands

```bash
npm test               # Run all tests
npm test:watch         # Run tests in watch mode
npm test:coverage      # Run tests with coverage report
npm test -- GlassButton  # Run specific test file
```
