import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import * as TSL from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { GALLERY } from './tsl-lib/gallery'
import { MATERIALS_GALLERY } from './tsl-lib/materialsGallery'
import { createRenderer, backendName } from './renderer'

// Version-portability smoke (?lab=1, dev only): cycle every tsl-lib entry on
// a sphere — the curated node visualizers AND the full material roster, all
// verified upstream on r178, here compiled and rendered by this repo's three
// (r184) on both backends. Sphere, not quad, per the upstream parity guidance
// for the fresnel family: curvature-dependent nodes need a silhouette, and
// several materials drive their colour from fresnel for the same reason.
//
// MeshBasicNodeMaterial is deliberate, and it carries the materials too: all
// forty-three drive `mat.colorNode` alone — no roughness, metalness or
// emissive slot among them — so they are self-lit by construction. An unlit
// material shows exactly what the node graph emits, with no scene lighting in
// the way to mask a difference between the two backends.
const ROSTERS = [
  { key: 'all', label: 'All', entries: [...GALLERY, ...MATERIALS_GALLERY] },
  { key: 'nodes', label: 'Nodes', entries: GALLERY },
  { key: 'materials', label: 'Materials', entries: MATERIALS_GALLERY },
]

function LabSphere({ entry }) {
  const mat = useMemo(() => {
    const m = new MeshBasicNodeMaterial()
    entry.apply(TSL, m, { clock: TSL.time })
    return m
  }, [entry])
  useEffect(() => () => mat.dispose(), [mat])
  return (
    <mesh material={mat}>
      <sphereGeometry args={[1.7, 96, 96]} />
    </mesh>
  )
}

export default function Lab() {
  const [rosterKey, setRosterKey] = useState('all')
  const [i, setI] = useState(0)
  const [gl, setGl] = useState(null)

  const roster = ROSTERS.find((r) => r.key === rosterKey) ?? ROSTERS[0]
  const entries = roster.entries
  // Clamp rather than reset: switching rosters mid-walk should not silently
  // jump to the front when the current index is still in range.
  const idx = Math.min(i, entries.length - 1)
  const entry = entries[idx]

  useEffect(() => {
    const go = (d) => setI((v) => (Math.min(v, entries.length - 1) + d + entries.length) % entries.length)
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entries.length])

  const step = (d) => setI((v) => (Math.min(v, entries.length - 1) + d + entries.length) % entries.length)

  return (
    <div className="app">
      <Canvas
        gl={createRenderer}
        onCreated={(state) => {
          setGl(state.gl)
          window.__r3f = state
        }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#05060d']} />
        <LabSphere entry={entry} />
        <OrbitControls enablePan={false} minDistance={2.5} maxDistance={10} />
      </Canvas>

      {!gl && <div className="boot">initializing renderer…</div>}
      {gl && <div className="backend-badge">{backendName(gl)}</div>}

      <div className="hud">
        <div className="kicker">tsl-lib lab · version-portability smoke · r184</div>
        <h1>{entry.name}</h1>
        <div className="cls">
          {entry.family} · {entry.id} · {idx + 1} / {entries.length}
        </div>
        <div className="nav">
          {ROSTERS.map((r) => (
            <button
              key={r.key}
              onClick={() => { setRosterKey(r.key); setI(0) }}
              aria-pressed={r.key === rosterKey}
              style={r.key === rosterKey ? { outline: '1px solid currentColor' } : undefined}
            >
              {r.label} ({r.entries.length})
            </button>
          ))}
        </div>
        <div className="nav">
          <button onClick={() => step(-1)}>‹ Prev</button>
          <span>← / → keys</span>
          <button onClick={() => step(1)}>Next ›</button>
        </div>
        <div className="hint">drag to orbit · scroll to zoom</div>
      </div>
    </div>
  )
}
