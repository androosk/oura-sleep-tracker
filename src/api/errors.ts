/**
 * Typed errors for the API boundary. Components and hooks branch on these
 * with instanceof — raw fetch/Zod exceptions must never escape the client.
 */

export class OuraAuthError extends Error {
  constructor(message = 'Authentication with the Oura API failed.') {
    super(message);
    this.name = 'OuraAuthError';
  }
}

export class OuraRateLimitError extends Error {
  constructor(message = 'The Oura API rate limit was hit.') {
    super(message);
    this.name = 'OuraRateLimitError';
  }
}

export class OuraNetworkError extends Error {
  constructor(message = 'The Oura API could not be reached.') {
    super(message);
    this.name = 'OuraNetworkError';
  }
}

export class OuraParseError extends Error {
  constructor(message = 'The Oura API returned data in an unexpected shape.') {
    super(message);
    this.name = 'OuraParseError';
  }
}

export class OuraHttpError extends Error {
  constructor(
    public readonly status: number,
    message = `The Oura API returned HTTP ${status}.`,
  ) {
    super(message);
    this.name = 'OuraHttpError';
  }
}
