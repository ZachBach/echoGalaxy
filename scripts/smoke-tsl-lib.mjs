// smoke-tsl-lib — vendor gate, runtime half: import the full library via
// gallery.js and run every gallery entry against the real three/tsl
// namespace on a real node material. Catches what static checks can't —
// calls into removed/renamed TSL members, signature changes that throw at
// graph-build time. Shader compilation itself is exercised in the browser
// lab scene (?lab=1, TODOS G0-31..38).
const TSL = await import('three/tsl');
const { MeshStandardNodeMaterial, REVISION } = await import('three/webgpu');
const { GALLERY } = await import('../src/tsl-lib/gallery.js');

let failed = 0;
for (const entry of GALLERY) {
  try {
    const mat = new MeshStandardNodeMaterial();
    entry.apply(TSL, mat, { clock: TSL.time });
  } catch (err) {
    failed++;
    console.error(`  ✗ ${entry.id}: ${err.message}`);
  }
}
if (failed) {
  console.error(`smoke-tsl-lib: ${failed}/${GALLERY.length} gallery entries failed on r${REVISION}`);
  process.exit(1);
}
console.log(`smoke-tsl-lib ok — ${GALLERY.length} gallery entries build against three/tsl r${REVISION}`);
