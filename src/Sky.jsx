import { useEffect, useMemo } from 'react'
import { buildStarField, buildFigures, buildEcliptic } from './skyMaterial'

// <Sky> (ZD) — the real sky, from the real catalogue.
//
// Mounts three layers, all on shells just inside the procedural skybox so
// they read as infinitely far away:
//
//   stars     25,199 entries to V ≤ 7.5, at true ecliptic positions and
//             coloured by real temperature through the vendored blackbody
//             node. The Bright Star Catalogue supplies everything to the
//             naked-eye limit of 6.5; the faint band from 6.5 to 7.5 comes
//             from Hipparcos, which is what took this from 8,355.
//   figures   the constellation stick figures. Defaults to the zodiac,
//             because those are the thirteen the ecliptic actually crosses.
//   ecliptic  the Sun's annual path. In this scene it is the circle y = 0,
//             which is also the plane every planet orbits in — the two are
//             the same plane, and that identity is the lesson.
//
// Nothing here animates, so `frozen` costs nothing to honour: the sky is
// static by construction, which also means it can never break the frozen-
// frame determinism the parity harness depends on.
export default function Sky({
  radius = 58,
  magLimit = 6.5,
  gain = 0.4,
  figures = 'all',
  showStars = true,
  showFigures = true,
  showEcliptic = false,
  // Tuned for thirteen figures; all 88 at that strength turn the sky into a
  // diagram that competes with the planets for the eye. Softened so the
  // figures read as something you notice second, after the subject — the
  // stars carry the richness now, and there are three times as many of them.
  figureOpacity = 0.22,
}) {
  const field = useMemo(
    () => (showStars ? buildStarField({ radius, magLimit, gain }) : null),
    [showStars, radius, magLimit, gain],
  )
  useEffect(() => () => field?.dispose(), [field])

  const figs = useMemo(
    () =>
      showFigures
        ? buildFigures({
            radius: radius - 0.5,
            which: figures,
            opacity: figureOpacity,
          })
        : null,
    [showFigures, figures, radius, figureOpacity],
  )
  useEffect(() => () => figs?.dispose(), [figs])

  const ecl = useMemo(
    () => (showEcliptic ? buildEcliptic({ radius: radius - 1 }) : null),
    [showEcliptic, radius],
  )
  useEffect(() => () => ecl?.dispose(), [ecl])

  return (
    <group>
      {field && <primitive object={field.sprite} />}
      {figs && <primitive object={figs.lines} />}
      {ecl && <primitive object={ecl.lines} />}
    </group>
  )
}

// The educational payload. Facts carry the two-rung ladder (factsLadder.js)
// like the rest of the astronomy content.
export const SKY_INFO = {
  id: 'real-sky',
  name: 'The Real Sky',
  label: 'Bright Star Catalogue · the zodiac',
  description:
    'Every star here is a real one, at its real position, in its real colour. ' +
    'The figures are the thirteen constellations the Sun actually passes ' +
    'through — the zodiac — and they ring this scene because they ring the ' +
    'plane the planets orbit in. Those are the same plane.',
  factsKids: [
    'These are real stars in their real places. If you went outside tonight, you would see this same pattern.',
    'Star colours are temperatures. Red stars are the coolest, blue-white ones the hottest — the opposite of hot and cold taps.',
    'Stars do not twinkle in space. Twinkling is our air wobbling the light on its way down, so out here they burn perfectly steady.',
    'The zodiac constellations make a ring because the planets all travel through the same flat band of sky.',
    'There are thirteen constellations on that ring, not twelve. Ophiuchus is on it too — it just never got a horoscope.',
  ],
  factsAdvanced: [
    'Positions come from the Yale Bright Star Catalogue (Hoffleit+ 1991), complete to visual magnitude 6.5 — the naked-eye limit.',
    'Colour is not chosen. Each star’s B−V colour index converts to an effective temperature by Ballesteros’ formula, and that temperature drives the same Planckian-locus ramp the galaxy rung uses.',
    'Magnitude is logarithmic and inverted: each step of 1 is a factor of about 2.512 in flux, so Sirius at −1.46 is roughly 1,500 times brighter than the faintest star drawn here.',
    'The catalogue was converted from equatorial to ecliptic coordinates, so the ecliptic lies at y = 0 — the same plane as the orbital rails. The zodiac hugging that plane is a measured result, not a layout choice: zodiac figure stars sit at a median 6.1° from it, against 39.6° for every other constellation.',
    'Precession has moved the signs off the constellations by roughly one full sign in 2,000 years. The Sun is not in the constellation your birth sign names.',
  ],
}
