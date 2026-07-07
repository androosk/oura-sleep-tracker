import { NotImplementedError } from '../lib/notImplemented';

import type { DailySleepDocument, Paginated, SleepDocument } from './types';

/**
 * Boundary validation: every byte that comes from the Oura API passes
 * through these parsers (Zod) before the rest of the app sees it.
 *
 * Contract (src/__tests__/schemas.test.ts):
 * - Valid responses (including real sandbox recordings) parse and are returned typed.
 * - Unknown extra fields are tolerated and stripped, never a failure.
 * - Structurally broken input throws OuraParseError.
 */

export function parseDailySleepResponse(_json: unknown): Paginated<DailySleepDocument> {
  throw new NotImplementedError('parseDailySleepResponse');
}

export function parseSleepResponse(_json: unknown): Paginated<SleepDocument> {
  throw new NotImplementedError('parseSleepResponse');
}
