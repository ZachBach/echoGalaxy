import * as TSL from 'three/tsl'
import * as THREE from 'three'
import { PointsNodeMaterial, MeshBasicNodeMaterial } from 'three/webgpu'
import { spriteDisc } from './tsl-lib/pattern/spriteDisc.js'
import { blackbody } from './tsl-lib/ramp/blackbody.js'
// Explicit .js so this module stays node-smokeable (the G1-03 convention:
// anything a smoke script must `import` cannot use extensionless specifiers).
import { STARS, FIGURE_SEGMENTS, HR_INDEX, ZODIAC_ABBRS } from './skyCatalog.js'

// ZD — the real sky.
//
// Every other star field in this app is procedural: the galaxy and cluster
// rungs derive each star from `instanceIndex` in-shader, with no CPU buffers,
// exactly as CLAUDE.md requires. This module is the deliberate exception, and
// the reason is that these positions are MEASUREMENTS. Aldebaran is where it
// is because Hipparcos measured it, not because a hash function put it there.
// You cannot derive a catalogue in a shader. So the real sky ships as per-star
// attributes, and the procedural rule continues to hold everywhere it can.
//
// Colour comes from the vendored `blackbody` node, which takes Kelvin —
// and the catalogue's temperatures came from real B−V colour indices via
// Ballesteros' formula at generation time (scripts/fetch-sky.mjs). So the
// colour path is: measured starlight → colour index → temperature → the
// Planckian locus this codebase already verified in G2-03. Nothing about a
// star's appearance here is a choice; it is all propagation.

/**
 * Magnitude is logarithmic and inverted — lower is brighter, and each step
 * of 1 is a factor of 10^0.4 ≈ 2.512 in flux. Across our range (Sirius at
 * −1.46 to the limit at 6.5) that is a dynamic range of about 1,500:1,
 * which no display can show and no sprite should try to.
 *
 * So flux is compressed by different powers for the two channels a viewer
 * actually reads: size grows slowly (¼ power) and intensity faster (½).
 * Bright stars end up bigger AND brighter without the brightest ones
 * swallowing the frame — and the ORDERING, which is the checkable part,
 * is exactly preserved because both are monotonic in flux.
 */
const MAG_REF = 6.5
export const SIZE_EXP = 0.25
export const INTENSITY_EXP = 0.35
export const fluxOf = (vmag) => Math.pow(10, -0.4 * (vmag - MAG_REF))
export const sizeOf = (vmag) => Math.pow(fluxOf(vmag), SIZE_EXP)
export const intensityOf = (vmag) => Math.pow(fluxOf(vmag), INTENSITY_EXP)

/**
 * Build the per-star instanced buffers. `radius` places the field on a
 * shell just inside the skybox — far enough to read as infinity, near
 * enough to stay inside the far plane.
 */
export function buildStarBuffers({ radius = 58, magLimit = MAG_REF } = {}) {
  const rows = STARS.filter((s) => s[4] <= magLimit)
  const n = rows.length
  const pos = new Float32Array(n * 3)
  const size = new Float32Array(n)
  const temp = new Float32Array(n)
  const intensity = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    const [, x, y, z, vmag, tempK] = rows[i]
    pos[i * 3] = x * radius
    pos[i * 3 + 1] = y * radius
    pos[i * 3 + 2] = z * radius
    size[i] = sizeOf(vmag)
    intensity[i] = intensityOf(vmag)
    temp[i] = tempK
  }
  return { count: n, pos, size, temp, intensity, rows }
}

/**
 * The star field — instanced sprites, procedural disc, real colours.
 *
 * Note what is deliberately ABSENT: twinkle. Every other star layer in this
 * app shimmers, and this one does not, because stars do not twinkle in
 * space. Scintillation is turbulence in Earth's atmosphere refracting the
 * beam — it is precisely the one stellar behaviour an observer out here
 * would never see. The procedural skybox behind this layer still shimmers;
 * this layer is the honest one, and the difference is worth a HUD fact.
 */
export function buildStarField({
  radius = 58,
  magLimit = MAG_REF,
  // Chosen against the compressed range above: the faintest naked-eye star
  // lands at 0.4 and Sirius at ~5.2, which reads as a real sky under the
  // existing bloom (threshold 0.04) without the brightest few blowing to
  // white discs. Visual tuning knob; the ORDERING is not negotiable.
  gain = 0.4,
} = {}) {
  const { count, pos, size, temp, intensity } = buildStarBuffers({
    radius,
    magLimit,
  })

  const posAttr = new THREE.InstancedBufferAttribute(pos, 3)
  const sizeAttr = new THREE.InstancedBufferAttribute(size, 1)
  const tempAttr = new THREE.InstancedBufferAttribute(temp, 1)
  const intenAttr = new THREE.InstancedBufferAttribute(intensity, 1)

  const material = new PointsNodeMaterial()
  const aPos = TSL.instancedBufferAttribute(posAttr)
  const aSize = TSL.instancedBufferAttribute(sizeAttr)
  const aTemp = TSL.instancedBufferAttribute(tempAttr)
  const aInten = TSL.instancedBufferAttribute(intenAttr)

  material.positionNode = aPos
  // Real colour, real physics: Kelvin in, Planckian locus out.
  material.colorNode = blackbody(TSL, aTemp).mul(aInten).mul(gain)
  // The G2-01 procedural disc — no texture, which is what bought the
  // 30–100× cross-backend parity improvement. Reused verbatim.
  material.opacityNode = spriteDisc(TSL, TSL.uv(), { edge: 0.08, core: 0.35 })
  material.sizeNode = aSize.mul(0.055)
  material.transparent = true
  material.depthWrite = false
  material.blending = THREE.AdditiveBlending

  const sprite = new THREE.Sprite(material)
  sprite.count = count
  sprite.frustumCulled = false
  sprite.renderOrder = -9 // just inside the skybox at -10

  return {
    sprite,
    material,
    count,
    dispose: () => {
      material.dispose()
    },
  }
}

/**
 * Constellation figures as line segments.
 *
 * `which`: 'zodiac' (the 13 the ecliptic crosses) | 'all' | array of IAU
 * abbreviations. The zodiac default is not arbitrary — those are exactly
 * the figures that ring the plane the planets orbit in, so on the System
 * rung they frame the scene the way the real sky frames the real one.
 */
export function buildFigures({
  radius = 57.5,
  which = 'zodiac',
  color = 0x5b7fb4,
  opacity = 0.38,
} = {}) {
  const wanted =
    which === 'all'
      ? null
      : new Set(which === 'zodiac' ? ZODIAC_ABBRS : which)

  const segs = FIGURE_SEGMENTS.filter((s) => !wanted || wanted.has(s[0]))
  const pts = new Float32Array(segs.length * 6)
  let k = 0
  for (const [, a, b] of segs) {
    for (const hr of [a, b]) {
      const s = STARS[HR_INDEX.get(hr)]
      pts[k++] = s[1] * radius
      pts[k++] = s[2] * radius
      pts[k++] = s[3] * radius
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pts, 3))

  const material = new MeshBasicNodeMaterial()
  material.colorNode = TSL.color(color)
  material.opacityNode = TSL.float(opacity)
  material.transparent = true
  material.depthWrite = false
  material.blending = THREE.AdditiveBlending

  const lines = new THREE.LineSegments(geometry, material)
  lines.frustumCulled = false
  lines.renderOrder = -8

  return {
    lines,
    material,
    geometry,
    segmentCount: segs.length,
    dispose: () => {
      geometry.dispose()
      material.dispose()
    },
  }
}

/**
 * The ecliptic itself — the Sun's annual path, and the line that defines
 * which constellations are "the zodiac" at all. In this scene it is simply
 * the circle y = 0, because the catalogue was generated in ecliptic
 * coordinates: the planets' orbital plane and the ecliptic are the same
 * plane, which is the whole point.
 */
export function buildEcliptic({
  radius = 57,
  segments = 256,
  color = 0xc8a24a,
  opacity = 0.3,
} = {}) {
  const pts = new Float32Array(segments * 6)
  let k = 0
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * Math.PI * 2
    const t1 = ((i + 1) / segments) * Math.PI * 2
    for (const t of [t0, t1]) {
      pts[k++] = Math.cos(t) * radius
      pts[k++] = 0
      pts[k++] = Math.sin(t) * radius
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pts, 3))

  const material = new MeshBasicNodeMaterial()
  material.colorNode = TSL.color(color)
  material.opacityNode = TSL.float(opacity)
  material.transparent = true
  material.depthWrite = false
  material.blending = THREE.AdditiveBlending

  const lines = new THREE.LineSegments(geometry, material)
  lines.frustumCulled = false
  lines.renderOrder = -8
  return { lines, material, geometry, dispose: () => { geometry.dispose(); material.dispose() } }
}
