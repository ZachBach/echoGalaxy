// sync-tsl-lib — vendor the Aurelius TSL library into echoGalaxy.
// One-way: ../tsl-lib/src → src/tsl-lib. Edits happen upstream (where the
// bench gate lives); this repo only consumes. Run after any upstream change:
//   node scripts/sync-tsl-lib.mjs
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const UPSTREAM = join(dirname(ROOT), 'tsl-lib');
const SRC = join(UPSTREAM, 'src');
const DEST = join(ROOT, 'src', 'tsl-lib');

if (!existsSync(SRC)) {
  console.error('upstream not found: ' + SRC);
  process.exit(1);
}

let hash = 'unknown';
try {
  hash = execSync('git rev-parse --short HEAD', { cwd: UPSTREAM }).toString().trim();
} catch {}

rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });
writeFileSync(join(DEST, 'VENDORED.md'),
  '# VENDORED COPY — do not edit\n\n' +
  'Synced from ../tsl-lib/src (upstream commit ' + hash + ') on ' +
  new Date().toISOString().slice(0, 10) +
  ' by scripts/sync-tsl-lib.mjs.\nEdit upstream (bench-gated), then re-sync.\n\n' +
  '## Vendor gate\n\n' +
  'Every sync must pass, in order:\n\n' +
  '1. `node scripts/check-tsl-lib.mjs` — self-containment + TSL surface vs installed three\n' +
  '2. `node scripts/smoke-tsl-lib.mjs` — every gallery entry builds on a node material\n' +
  '3. `npm run build` — the app bundles\n\n' +
  '`npm run sync:tsl` runs the whole chain.\n');
console.log('tsl-lib vendored → src/tsl-lib (upstream ' + hash + ')');
