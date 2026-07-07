export class NotImplementedError extends Error {
  constructor(unit: string) {
    super(`${unit} is not implemented yet — its behavior is specified by the contract tests.`);
    this.name = 'NotImplementedError';
  }
}
