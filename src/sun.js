import { uniform } from 'three/tsl'
import { Vector3 } from 'three'

// One sun for the whole planet scene (G1-01 design): a single shared TSL
// uniform that every consumer reads — terminator (day/night), the
// atmosphere shell (day-side limb), and later the star's placement.
// Own module (not Planet.jsx) so <Star> can import it without <Planet>.
export const sunDir = uniform(new Vector3(-0.8, 0.35, 0.55).normalize())

// Mutate through this so the direction always stays unit-length —
// terminator and atmosphereShell both assume a normalized lightDir.
export function setSunDir(x, y, z) {
  sunDir.value.set(x, y, z).normalize()
}
