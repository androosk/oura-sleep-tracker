import * as fs from 'fs';
import * as path from 'path';

/**
 * US-011: no hardcoded colors in components — every color flows from
 * src/theme/tokens.ts. This guard passes on the empty scaffold and must
 * keep passing as screens are implemented.
 */

const SRC = path.join(__dirname, '..');
const ALLOWED = [path.join('theme', 'tokens.ts')];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('theme discipline (US-011)', () => {
  it('keeps hex colors out of everything except theme/tokens.ts', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => !ALLOWED.some((allowed) => file.endsWith(allowed)))
      .filter((file) => /#[0-9a-fA-F]{3,8}\b/.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
