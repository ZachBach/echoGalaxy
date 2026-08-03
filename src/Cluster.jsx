import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { createClusterField, createHairField } from './clusterShader'

// <Cluster> (CB-05/06) — the sixth rung's scene: Berenice's Hair
// (Melotte 111, thirty bright foreground stars) with the Coma Cluster's
// thousand galaxies hanging ~300 Mly behind it. Two stories, one name,
// in literal depth.
//
// zSpaceTarget drives the redshift-space morph (CB-10): the uniform
// glides toward the target (~1.2 s exponential) and SNAPS when frozen —
// deterministic in any state, mid-glide included.
//
// zSpaceAt (capture only, shot 14-coma): a clock cue in seconds. When set
// it overrides zSpaceTarget — real space until the cue, then the glide
// fires on the deterministic capture clock.
export default function Cluster({ frozen = false, zSpaceTarget = 0, zSpaceAt = null }) {
  const field = useMemo(() => createClusterField(), [])
  const hair = useMemo(() => createHairField(), [])

  useEffect(
    () => () => {
      field.sprite.material.dispose()
      hair.material.dispose()
    },
    [field, hair],
  )

  useFrame(({ clock }, delta) => {
    const u = field.zSpace
    const target =
      zSpaceAt != null ? (clock.elapsedTime >= zSpaceAt ? 1 : 0) : zSpaceTarget
    if (frozen) {
      u.value = target
      return
    }
    u.value += (target - u.value) * Math.min(1, delta * 3.2)
    if (Math.abs(u.value - target) < 0.002) u.value = target
  })

  return (
    <group>
      <primitive object={field.sprite} />
      <primitive object={hair} />
    </group>
  )
}

// CB-11 — the redshift-space payload: shown while the toggle is on
// (the GH-12 panel-takeover pattern). The copy explains what the eye
// is seeing WHILE it sees it.
export const REDSHIFT_INFO = {
  id: 'redshift',
  name: 'Redshift Space',
  label: 'The Finger of God · speed masquerading as distance',
  description:
    'This is the cluster as a redshift survey plots it: distance ' +
    'measured by how fast each galaxy recedes. But cluster galaxies ' +
    'also swarm — and their swarming speed smears them along your line ' +
    'of sight, into a finger pointing at you. Orbit the cluster: the ' +
    'finger follows. Every observer in the universe sees their own.',
  facts: [
    'The stretch is not real structure — it is speed masquerading as ' +
      'distance. Astronomers must undo this artifact before their maps ' +
      'of the universe are true.',
    'The finger points at YOU because the smearing happens along each ' +
      'line of sight. Astronomers in Andromeda see their own fingers — ' +
      'pointing at them.',
    'The speeds doing the smearing are the same too-fast motions ' +
      'Zwicky measured in 1933. The finger you are looking at is drawn ' +
      'by dark matter’s gravity.',
    'Galaxies in the crowded core swarm fastest — the potential well ' +
      'is deepest there — so the finger is longest at the cluster’s ' +
      'heart. Look.',
  ],
}

// CB-07 — the sixth rung's payload. Facts source-verified 2026-08-02
// (Ridpath / Constellation Guide / EarthSky; SDU / Forbes on Zwicky).
export const CLUSTER_INFO = {
  id: 'cluster',
  name: 'The Coma Cluster',
  label: 'Coma Berenices · ~1,000 galaxies · ~300 million light-years',
  description:
    'Two stories wear one name. The bright stars in front are ' +
    'Berenice’s Hair — a queen’s vow placed in the sky. Far behind ' +
    'them hangs a swarm of a thousand galaxies, held together by more ' +
    'gravity than anything you can see could supply. Distances are ' +
    'compressed to fit one view — declared, as always.',
  facts: [
    'In 243 BC, Queen Berenice II of Egypt swore her hair to the gods ' +
      'for her husband’s safe return from war. It vanished from the ' +
      'temple overnight — and the court astronomer announced the gods ' +
      'had placed it among the stars. It is the only modern ' +
      'constellation honoring a real person.',
    'For eighteen centuries these stars were just the tuft on Leo the ' +
      'Lion’s tail. The hair became a constellation of its own only in ' +
      'the 16th century.',
    'Nearly every galaxy in the crowded core glows red: clusters strip ' +
      'their galaxies of gas, and star birth stops — red and dead. The ' +
      'blue survivors live at the edges. The color gradient you are ' +
      'looking at IS that story.',
    'In 1933, Fritz Zwicky measured how fast these galaxies swarm — ' +
      'far too fast for the visible mass to hold them together. He ' +
      'named the missing stuff dunkle Materie. Dark matter was ' +
      'discovered right here, in Berenice’s hair.',
  ],
}
