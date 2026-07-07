// Fixed timezone so date/time formatting tests are deterministic on any machine.
process.env.TZ = 'America/Chicago';

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  clearMocks: true,
};
