# VENDORED COPY — do not edit

Synced from ../tsl-lib/src (upstream commit 51f6f2c) on 2026-07-30 by scripts/sync-tsl-lib.mjs.
Edit upstream (bench-gated), then re-sync.

## Vendor gate

Every sync must pass, in order:

1. `node scripts/check-tsl-lib.mjs` — self-containment + TSL surface vs installed three
2. `node scripts/smoke-tsl-lib.mjs` — every gallery entry builds on a node material
3. `npm run build` — the app bundles

`npm run sync:tsl` runs the whole chain.
