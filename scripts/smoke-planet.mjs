// smoke-planet — build every planet recipe's node graph against the real
// three/tsl namespace, the way smoke-tsl-lib does for the vendored gallery.
// There is no test framework here (see CLAUDE.md); this is the "node-smoked"
// convention applied to the body pipeline.
//
// It catches what `vite build` cannot: vite only transpiles, while TSL graphs
// are assembled by *running* the recipe, so a bad signature or a missing TSL
// member throws here and nowhere else short of a browser.
//
// Run: node scripts/smoke-planet.mjs
const TSL = await import('three/tsl');
const { MeshBasicNodeMaterial, REVISION } = await import('three/webgpu');
const { buildPlanetMaterial, buildAtmosphereMaterial } = await import('../src/planetMaterial.js');
const {
  PLANET_RECIPES, ATMOSPHERES, TERMINATORS, TERMINATOR_FOR,
} = await import('../src/planetRecipes.js');

let failed = 0;
const fail = (what, err) => { failed++; console.error(`  ✗ ${what}: ${err.message}`); };

// 1 — every recipe, upright and tilted, animated and frozen. Uranus' 97.8°
// and Venus' 177.4° are the extremes the tilt path has to survive.
for (const [type, recipe] of Object.entries(PLANET_RECIPES)) {
  for (const obliquity of [0, 0.409, 1.706, 3.096]) {
    for (const frozen of [false, true]) {
      try {
        buildPlanetMaterial({ recipe, obliquity, frozen });
      } catch (err) {
        fail(`${type} obliquity=${obliquity} frozen=${frozen}`, err);
      }
    }
  }
}

// 2 — the ring shadow, on both geometries that switch it on: RingedWorld's
// shared tilted group (ring plane = y=0) and System's separately tilted ring
// group (normal leans out of the globe's frame).
const T = 0.52;
for (const [label, ringNormal] of [
  ['RingedWorld', [0, 1, 0]],
  ['System/Saturn', [0, Math.cos(T), Math.sin(T)]],
  ['edge-on sun (divide-by-zero guard)', [1, 0, 0]],
]) {
  try {
    buildPlanetMaterial({
      recipe: PLANET_RECIPES.ringed,
      cfg: { ringNormal },
      obliquity: T,
    });
  } catch (err) {
    fail(`ringShadow ${label}`, err);
  }
}

// 3 — atmosphere shells, and the terminator presets they pair with.
for (const [type, opts] of Object.entries(ATMOSPHERES)) {
  try {
    buildAtmosphereMaterial(opts);
  } catch (err) {
    fail(`atmosphere ${type}`, err);
  }
}

// 4 — every recipe must resolve a terminator preset, or it silently falls back
// to the library default and the airless/thick-atmosphere distinction is lost.
for (const [type, recipe] of Object.entries(PLANET_RECIPES)) {
  if (!TERMINATOR_FOR.get(recipe)) fail(`terminator preset for ${type}`, new Error('missing'));
}
for (const type of Object.keys(TERMINATORS)) {
  if (!(type in PLANET_RECIPES)) fail(`TERMINATORS.${type}`, new Error('no such recipe'));
}

// 5 — the graphs must actually attach to a material, not just build.
try {
  const m = new MeshBasicNodeMaterial();
  m.colorNode = buildPlanetMaterial({ recipe: PLANET_RECIPES.ocean }).colorNode;
  if (!m.colorNode) throw new Error('colorNode is null');
} catch (err) {
  fail('colorNode attach', err);
}

const total = Object.keys(PLANET_RECIPES).length;
if (failed) {
  console.error(`smoke-planet: ${failed} failure(s) on r${REVISION}`);
  process.exit(1);
}
console.log(`smoke-planet ok — ${total} recipes × 4 obliquities × 2 clocks, `
  + `3 ring-shadow geometries, ${Object.keys(ATMOSPHERES).length} atmospheres, `
  + `against three/tsl r${REVISION}`);
