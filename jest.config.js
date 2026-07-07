// Fixed timezone so date/time formatting tests are deterministic on any machine.
process.env.TZ = 'America/Chicago';

module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  clearMocks: true,
};
