import * as TSL from 'three/tsl'
import { CRAB_BOUNDS, crabFieldVec4 } from './crabField.js'
import { bakeAtlas, buildMarchMaterial } from './volumeAtlas.js'

// The Crab Nebula volume (SN-04) — the volumeAtlas machinery's second
// consumer, and the reason it exists as a module. Shading law: Hα
// red-orange filaments (the shredded star) over the blue-white
// synchrotron ghost, brightest at the pulsar's heart. HDR per the
// black-hole rule: filaments ≤ 1.3, heart-glow ≤ 1.5.

const ATLAS = { sw: 144, sh: 112, nz: 40, cols: 8, rows: 5 }

export function bakeCrabAtlas(renderer) {
  return bakeAtlas(renderer, {
    atlas: ATLAS,
    bounds: CRAB_BOUNDS,
    field: crabFieldVec4(TSL),
  })
}

export function buildCrabMaterial({ steps = 20, texture } = {}) {
  return buildMarchMaterial({
    atlas: ATLAS,
    bounds: CRAB_BOUNDS,
    texture,
    steps,
    shade: (smp, pos, dt) => {
      const filament = smp.r
      const glow = smp.g
      const re = smp.b
      // filaments: Hα wreckage, slightly hotter toward the shell's sunlit
      // interior edge (re falloff keeps the rim from ringing)
      const fil = TSL.vec3(1.0, 0.35, 0.22).mul(filament.mul(1.3))
      // synchrotron: the ghost-light, brightest at the heart
      const ghost = TSL.vec3(0.55, 0.75, 1.0).mul(
        glow.mul(1.5).mul(TSL.smoothstep(1.05, 0.35, re)),
      )
      const src = fil.add(ghost)
      // filaments occlude like torn cloth; the ghost is translucent
      const a = filament.mul(2.6).add(glow.mul(0.55)).mul(dt).min(0.6)
      return { src, a }
    },
  })
}
