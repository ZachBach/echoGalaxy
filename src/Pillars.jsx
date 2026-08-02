import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as TSL from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { BOUNDS } from './pillarsField'
import {
  bakePillarsAtlas,
  buildPillarsMaterial,
  LIGHT_DIR,
} from './pillarsMaterial'

// <Pillars> — the Eagle Nebula's Pillars of Creation (PC-06): the
// atlas-baked raymarch volume plus the young cluster (NGC 6611's stand-
// ins) placed along the light direction the field is shaded by — the
// stars doing the photoevaporating are the stars you see. The volume
// mesh sits at the origin, unscaled (the PC-01 world-space contract);
// the rung frames with the camera.
//
// The atlas bakes at mount (one QuadMesh render); the march material
// mounts when it's ready — a frame of empty sky, never a broken volume.

// cluster stars: positions ≈ pillar tips + t·LIGHT_DIR, jittered; radii
// small so bloom (threshold 0.04) turns HDR points into stars
const CLUSTER = [
  { p: [-1.15, 1.95, 0.55], r: 0.045, warm: false },
  { p: [-0.55, 2.2, 0.4], r: 0.032, warm: false },
  { p: [-1.62, 1.55, 0.2], r: 0.026, warm: true },
  { p: [-0.15, 1.8, 0.7], r: 0.036, warm: false },
  { p: [-0.9, 2.45, 0.1], r: 0.022, warm: true },
  { p: [0.42, 2.0, 0.35], r: 0.028, warm: false },
  { p: [1.3, 1.65, 0.25], r: 0.024, warm: false },
]

export default function Pillars({ frozen = false, steps = 20, octaves = 3 }) {
  const gl = useThree((s) => s.gl)
  const [material, setMaterial] = useState(null)

  const starBlue = useMemo(() => {
    const m = new MeshBasicNodeMaterial()
    m.colorNode = TSL.vec3(1.5, 1.55, 1.8)
    return m
  }, [])
  const starWarm = useMemo(() => {
    const m = new MeshBasicNodeMaterial()
    m.colorNode = TSL.vec3(1.7, 1.35, 0.9)
    return m
  }, [])

  useEffect(() => {
    const rt = bakePillarsAtlas(gl, { octaves })
    const m = buildPillarsMaterial({ steps, texture: rt.texture, frozen })
    setMaterial(m)
    return () => {
      m.dispose()
      rt.dispose()
    }
  }, [gl, frozen, steps, octaves])

  useEffect(
    () => () => {
      starBlue.dispose()
      starWarm.dispose()
    },
    [starBlue, starWarm],
  )

  return (
    <group>
      {material && (
        <mesh material={material}>
          <boxGeometry args={[BOUNDS.x * 2, BOUNDS.y * 2, BOUNDS.z * 2]} />
        </mesh>
      )}
      {CLUSTER.map((s, i) => (
        <mesh key={i} position={s.p} material={s.warm ? starWarm : starBlue}>
          <sphereGeometry args={[s.r, 12, 12]} />
        </mesh>
      ))}
    </group>
  )
}

export { LIGHT_DIR }

// PC-12 — the nebula rung's educational payload. Facts verified against
// NASA/Hubble, SEDS, and the 2007-Spitzer-vs-2015-MUSE record
// (2026-08-01, sources in TODOS PC ground truth).
export const NEBULA_INFO = {
  id: 'nebula',
  name: 'Pillars of Creation',
  label: 'Eagle Nebula (M16) · stellar nursery · ~5,700 light-years away',
  description:
    'Columns of cold gas and dust, light-years tall, where stars are ' +
    'being born right now. The young cluster above them pours out ' +
    'ultraviolet light that makes the pillars glow — and is slowly ' +
    'boiling them away. Creation and destruction, one structure.',
  facts: [
    'The tallest pillar runs about 4 light-years base to tip — our ' +
      'entire solar system would be an invisible speck against it.',
    'The light you are seeing left the pillars before the pyramids ' +
      'were built. Looking far away always means looking into the past.',
    'The warm knots glowing in the fingertips are EGGs — evaporating ' +
      'gaseous globules — dense pockets where new stars are hatching.',
    'In 2007, telescope data suggested a supernova had already ' +
      'destroyed the pillars. Better observations in 2015 said no: ' +
      'still standing, eroding slowly — good for millions of years yet. ' +
      'Science checks its own dramatic claims.',
  ],
}
