// smoke-tsl-lib — vendor gate, runtime half: import the full library via
// gallery.js + materialsGallery.js and run every entry against the real
// three/tsl namespace on a real node material. Catches what static checks
// can't — calls into removed/renamed TSL members, signature changes that
// throw at graph-build time. Shader compilation itself is exercised in the
// browser lab scene (?lab=1, TODOS G0-31..38).
//
// Both rosters are walked, for the same reason: upstream bench-verifies on
// r178 and this repo runs a newer three. The nodes were always covered here.
// The materials were not — they are reached upstream through a build-time
// list in tools/build-lab.mjs, which nothing can iterate at runtime — so a
// TSL member that moved between revisions would have surfaced first as a
// black sphere in the app instead of as a failure in this gate.
const TSL = await import('three/tsl');
const { MeshStandardNodeMaterial, REVISION } = await import('three/webgpu');
const { GALLERY } = await import('../src/tsl-lib/gallery.js');
const { MATERIALS_GALLERY } = await import('../src/tsl-lib/materialsGallery.js');

const ROSTERS = [['node', GALLERY], ['material', MATERIALS_GALLERY]];

let failed = 0;
let total = 0;
const counts = [];
for (const [label, roster] of ROSTERS) {
  for (const entry of roster) {
    total++;
    try {
      const mat = new MeshStandardNodeMaterial();
      entry.apply(TSL, mat, { clock: TSL.time });
    } catch (err) {
      failed++;
      console.error(`  ✗ ${label} ${entry.id}: ${err.message}`);
    }
  }
  counts.push(`${roster.length} ${label}`);
}
if (failed) {
  console.error(`smoke-tsl-lib: ${failed}/${total} entries failed on r${REVISION}`);
  process.exit(1);
}
console.log(
  `smoke-tsl-lib ok — ${counts.join(' + ')} entries ` +
  `(${total} total) build against three/tsl r${REVISION}`,
);
