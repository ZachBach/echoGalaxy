// sync-tsl-lib — vendor the Aurelius TSL library into echoGalaxy.
// One-way: ../tsl-lib/src → src/tsl-lib. Edits happen upstream (where the
// bench gate lives); this repo only consumes. Run after any upstream change:
//   node scripts/sync-tsl-lib.mjs
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(dirname(ROOT), 'tsl-lib', 'src');
const DEST = join(ROOT, 'src', 'tsl-lib');

if (!existsSync(SRC)) {
  console.error('upstream not found: ' + SRC);
  process.exit(1);
}
rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });
writeFileSync(join(DEST, 'VENDORED.md'),
  '# VENDORED COPY — do not edit\n\nSynced from ../tsl-lib/src on ' +
  new Date().toISOString().slice(0, 10) +
  ' by scripts/sync-tsl-lib.mjs.\nEdit upstream (bench-gated), then re-sync.\n');
console.log('tsl-lib vendored → src/tsl-lib');
