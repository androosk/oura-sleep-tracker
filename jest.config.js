// Fixed timezone so date/time formatting tests are deterministic on any machine.
process.env.TZ = 'America/Chicago';

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  clearMocks: true,
  transformIgnorePatterns: [
    // jest-expo's default list, plus @noble (ships untranspiled ESM).
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@noble))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
