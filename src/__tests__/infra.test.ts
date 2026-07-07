describe('test infrastructure', () => {
  it('runs TypeScript tests with a fixed timezone', () => {
    expect(
      new Date('2026-07-03T06:41:00Z').toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    ).toBe('1:41 AM');
  });
});
