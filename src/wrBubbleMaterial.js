import * as TSL from 'three/tsl'
import { WR_BOUNDS, wrBubbleFieldVec4 } from './wrBubbleField.js'
import { bakeAtlas, buildMarchMaterial } from './volumeAtlas.js'

// The Sh 2-80 volume — volumeAtlas's third consumer, and the first that
// did not need the module changed to accept it.
//
// Shading law: the Webb reading, not the Hα one. In visible light this
// shell is the same red every emission nebula is; JWST resolved it in
// the infrared, where the knots are warm DUST and come out gold and
// rose. That is the image worth showing, and it also keeps the rung
// from putting two red nebulae side by side.
//
// The atlas is wider and deeper than the Crab's because the bounds are:
// the runaway axis lies mostly along x, and the z slices have to resolve
// knots rather than a smooth ellipsoid, so they get 48 instead of 40.
// HDR per the black-hole rule: knots ≤ 1.3, bow shock ≤ 1.6.

const ATLAS = { sw: 144, sh: 128, nz: 48, cols: 8, rows: 6 }

export function bakeWrBubbleAtlas(renderer) {
  return bakeAtlas(renderer, {
    atlas: ATLAS,
    bounds: WR_BOUNDS,
    field: wrBubbleFieldVec4(TSL),
  })
}

export function buildWrBubbleMaterial({ steps = 20, texture } = {}) {
  return buildMarchMaterial({
    atlas: ATLAS,
    bounds: WR_BOUNDS,
    texture,
    steps,
    shade: (smp, pos, dt) => {
      const knots = smp.r
      const bow = smp.g
      const r = smp.b
      // Warm dust: gold through the body of the shell, cooling toward
      // rose out in the wake where the knots thin and spread.
      const dust = TSL.mix(
        TSL.vec3(1.0, 0.62, 0.26),
        TSL.vec3(0.86, 0.36, 0.42),
        TSL.smoothstep(0.7, 1.15, r),
      ).mul(knots.mul(1.3))
      // The shocked rim is gas, not dust, and it is hotter — so it goes
      // the other way on the colour wheel and reads as a cool edge
      // standing off the leading limb. Kept well under the knots in
      // saturation and only a little over them in brightness: a
      // saturated blue this size stops reading as emission and starts
      // reading as a light source somewhere off-frame.
      const shock = TSL.vec3(0.74, 0.87, 1.0).mul(bow.mul(1.2))
      const src = dust.add(shock)
      // Dusty knots occlude hard — that is what makes them read as
      // lumps rather than haze. The shock front is thin and translucent.
      const a = knots.mul(2.9).add(bow.mul(0.5)).mul(dt).min(0.6)
      return { src, a }
    },
  })
}
