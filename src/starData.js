/**
 * Star profiles — BACKLOG Phase STB (ST-101 → ST-200).
 *
 * Real, named stars: the Sun in detail, the nearest systems, the brightest
 * stars in Earth's sky, the navigation stars, and the extremes. Every entry
 * carries the two-rung facts ladder (factsLadder.js).
 *
 * Field conventions:
 *   spectral   Morgan–Keenan type + luminosity class
 *   distance   light-years from the Sun
 *   mag        apparent visual magnitude (range given where variable)
 *   absMag     absolute visual magnitude where quoted
 *
 * Distances are Gaia-era values where available. Several supergiant distances
 * (Deneb above all) remain genuinely uncertain and say so rather than quoting
 * false precision.
 *
 * Pure data. No rendering imports.
 */

/* ------------------------------------------------------------------ *
 * Section F — the Sun (ST-101 → ST-120)
 * ------------------------------------------------------------------ */

export const THE_SUN = {
  id: 'sol',
  name: 'The Sun',
  designation: 'Sol',
  constellation: null,
  spectral: 'G2V',
  distance: 0.0000158, // 1 AU in light-years
  mag: -26.74,
  absMag: 4.83,
  temp: 5772,
  massSolar: 1,
  radiusSolar: 1,
  description:
    'An utterly ordinary main-sequence star that happens to be ours. Middle-aged, ' +
    'middle-mass, unremarkable in every catalogue — and the only star whose ' +
    'surface we can study in detail, which makes it the calibration standard for ' +
    'every other star in this catalogue.',
  factsKids: [
    'The Sun is a star — the only one close enough to feel warm on your face.',
    'It is so big that about 1.3 million Earths would fit inside it.',
    'Sunlight takes 8 minutes and 20 seconds to reach us. If the Sun vanished, we would not know for eight minutes.',
    'The Sun is not on fire. It is squeezing hydrogen so hard that it turns into helium and releases light.',
    'Never look at the Sun directly, not even with sunglasses — and never through a telescope or binoculars.',
  ],
  factsAdvanced: [
    'G2V, effective temperature 5772 K, luminosity 3.828×10²⁶ W, radius 696,340 km, mass 1.989×10³⁰ kg — the IAU nominal values against which other stars are quoted.',
    'It holds 99.86% of the Solar System\'s mass. Jupiter is most of the remainder; every rocky planet together is a rounding error.',
    'It fuses ~600 million tonnes of hydrogen per second, converting about 4.3 million tonnes of that mass directly into energy.',
    'Core conditions: ~15.7 million K and ~150 g/cm³ — over ten times the density of lead, yet still a plasma, because it is far too hot to be anything else.',
    'It rotates differentially: ~25 days at the equator against ~34 near the poles. That shear winds the magnetic field and drives the 11-year sunspot cycle (22-year magnetic Hale cycle).',
    'Age about 4.6 billion years, roughly halfway through core hydrogen. It will leave the main sequence in ~5 billion years, pass through a red giant phase, and end as a ~0.54 M☉ white dwarf.',
    'It is more luminous than roughly 85% of stars in the Galaxy — the "average star" framing is a statement about mass, not about brightness.',
  ],
  layers: [
    { id: 'core', name: 'Core', extent: '0 – 0.25 R☉', note: '15.7 million K. All fusion happens here; the rest of the star is plumbing.' },
    { id: 'radiative', name: 'Radiative zone', extent: '0.25 – 0.71 R☉', note: 'Energy crawls outward as photons random-walking over tens of thousands of years.' },
    { id: 'tachocline', name: 'Tachocline', extent: '~0.71 R☉', note: 'The shear layer where the magnetic dynamo is thought to be seated.' },
    { id: 'convective', name: 'Convective zone', extent: '0.71 – 1.0 R☉', note: 'Opaque plasma physically boils, carrying heat to the surface.' },
    { id: 'photosphere', name: 'Photosphere', extent: '~500 km thick', note: 'The visible disc — where the Sun becomes transparent. 5772 K.' },
    { id: 'chromosphere', name: 'Chromosphere', extent: '~2,000 km', note: 'Reddish layer visible at eclipse; temperature begins climbing again.' },
    { id: 'corona', name: 'Corona', extent: 'millions of km', note: '1–3 million K, and nobody has fully explained why.' },
  ],
}

/* ------------------------------------------------------------------ *
 * Section G — the nearest stellar systems (ST-121 → ST-140)
 * ------------------------------------------------------------------ */

export const NEAREST_STARS = [
  {
    id: 'proxima-centauri',
    name: 'Proxima Centauri',
    designation: 'α Centauri C',
    constellation: 'Centaurus',
    spectral: 'M5.5Ve',
    distance: 4.2465,
    mag: 11.13,
    description:
      'The closest star to the Sun, and far too faint to see without a telescope ' +
      'despite that. A small, cool, violently active red dwarf gravitationally ' +
      'bound to the bright Alpha Centauri pair on a slow, wide orbit.',
    factsKids: [
      'Proxima is our nearest neighbour star — and you still cannot see it without a telescope, because it is so dim.',
      'Even at the speed of light, a message would take 4 years and 3 months to reach it.',
      'It has a planet roughly the size of Earth, in the zone where liquid water could exist.',
    ],
    factsAdvanced: [
      'Discovered in 1915 by Robert Innes. At 4.2465 ly it is the nearest known star, and it holds that title for roughly the next 25,000 years.',
      'About 12% of a solar mass and ~0.0017 L☉ — it radiates mostly in the infrared. Its main-sequence lifetime runs to several trillion years.',
      'Proxima b (2016) is a ~1.07 Earth-mass planet in the habitable zone at 0.05 AU, with an 11.2-day year. Proxima d followed in 2022.',
      'A flare star: a 2019 superflare brightened it roughly 14,000× in the ultraviolet within seconds. Whether any atmosphere could survive that bombardment is the central question for its planets.',
    ],
  },
  {
    id: 'alpha-centauri-a',
    name: 'Alpha Centauri A',
    designation: 'Rigil Kentaurus · α Cen A',
    constellation: 'Centaurus',
    spectral: 'G2V',
    distance: 4.3441,
    mag: -0.01,
    description:
      'A near-twin of the Sun — same spectral class, slightly larger and brighter — ' +
      'and the nearest solar analogue in existence. With its companion B it forms ' +
      'the third-brightest point of light in the night sky.',
    factsKids: [
      'Alpha Centauri A is almost a copy of our own Sun, and it is the closest one like it.',
      'From Earth it looks like a single bright star, but a telescope splits it into two.',
      'It is only visible from the southern half of the world — you cannot see it from most of Europe or North America.',
    ],
    factsAdvanced: [
      'G2V, 1.1 M☉, 1.5 L☉ — the closest thing to a solar twin within reach, and the benchmark for what the Sun looks like from outside.',
      'It orbits α Cen B every ~79 years at a separation swinging between 11 and 36 AU, comparable to Saturn-to-Neptune distances.',
      'The pair plus Proxima appears to the eye as one star of magnitude −0.27, the third brightest in the night sky after Sirius and Canopus.',
      'Proper name Rigil Kentaurus, from Arabic Rijl Qanṭūris — "the foot of the Centaur", which is exactly where it sits in the figure.',
    ],
  },
  {
    id: 'alpha-centauri-b',
    name: 'Alpha Centauri B',
    designation: 'Toliman · α Cen B',
    constellation: 'Centaurus',
    spectral: 'K1V',
    distance: 4.3441,
    mag: 1.33,
    description:
      'The cooler orange companion of the Alpha Centauri pair — smaller, dimmer, ' +
      'and considerably longer-lived than the Sun. A textbook K dwarf at the ' +
      'closest range available.',
    factsKids: [
      'Alpha Centauri B is an orange star, a little smaller and cooler than the Sun.',
      'It circles its bright twin once every 79 years — about one human lifetime.',
      'From a planet there, our own Sun would look like a fairly bright star in the constellation Cassiopeia.',
    ],
    factsAdvanced: [
      'K1V, 0.9 M☉, ~0.5 L☉. As a K dwarf its main-sequence lifetime is several tens of billions of years — it will still be burning hydrogen long after the Sun is a white dwarf.',
      'A 2012 planet claim (α Cen Bb) was withdrawn in 2015 as an artefact of the radial-velocity analysis — a useful reminder of how hard small-planet detection is even next door.',
      'The binary\'s stability means circumstellar planets can persist out to roughly 2–3 AU around either star despite the companion.',
    ],
  },
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    designation: 'V2500 Ophiuchi',
    constellation: 'Ophiuchus',
    spectral: 'M4V',
    distance: 5.963,
    mag: 9.51,
    description:
      'The fastest-moving star in the sky, and the nearest single star after the ' +
      'Alpha Centauri system. An ancient, metal-poor red dwarf sprinting across ' +
      'the constellation Ophiuchus fast enough to notice within a human lifetime.',
    factsKids: [
      'This star moves across the sky faster than any other — it shifts by about the width of the Moon every 180 years.',
      'It is one of the oldest stars near us, maybe twice the age of the Sun.',
      'It is racing toward us and will be our closest neighbour in about 10,000 years.',
    ],
    factsAdvanced: [
      'Proper motion of 10.3 arcseconds per year, the highest known — E. E. Barnard measured it in 1916, which is why it carries his name.',
      'Age estimates run 7–12 billion years. Its low metallicity and large space velocity mark it as an old-disk or halo star just passing through.',
      'It was the subject of one of astronomy\'s most instructive false alarms: Peter van de Kamp claimed planetary companions from astrometry across the 1960s–70s, later traced to a telescope maintenance artefact.',
      'A sub-Earth-mass planet was confirmed in 2024 by radial velocity, decades after the original claims collapsed.',
    ],
  },
  {
    id: 'wolf-359',
    name: 'Wolf 359',
    designation: 'CN Leonis',
    constellation: 'Leo',
    spectral: 'M6V',
    distance: 7.86,
    mag: 13.54,
    description:
      'One of the faintest and lowest-mass stars known, barely above the ' +
      'hydrogen-burning limit. Despite being the fifth-nearest stellar system, it ' +
      'is roughly 100,000 times too dim to see with the naked eye.',
    factsKids: [
      'Wolf 359 is one of the smallest, dimmest stars we know — barely big enough to count as a star at all.',
      'It is very close to us, but so faint you need a good telescope to find it.',
      'It flares up suddenly and brightly, then settles back down.',
    ],
    factsAdvanced: [
      'About 0.09 M☉ — only slightly above the ~0.08 M☉ hydrogen-burning limit — and roughly 0.0011 L☉.',
      'A UV Ceti-type flare star: magnetic flares can raise its brightness sharply on timescales of minutes.',
      'Young for a red dwarf (under a billion years) and fully convective, so it will burn essentially all its hydrogen over a lifetime measured in trillions of years.',
    ],
  },
  {
    id: 'sirius-b',
    name: 'Sirius B',
    designation: 'The Pup',
    constellation: 'Canis Major',
    spectral: 'DA2',
    distance: 8.6,
    mag: 8.44,
    description:
      'The nearest and best-studied white dwarf: a solar mass of degenerate ' +
      'matter packed into a body slightly smaller than Earth, orbiting the ' +
      'brightest star in our sky. Its existence was deduced from Sirius\' wobble ' +
      'eighteen years before anyone saw it.',
    factsKids: [
      'Sirius B is a dead star — the leftover core of a star that ran out of fuel.',
      'It is about the size of the Earth, but weighs as much as the whole Sun.',
      'One teaspoon of it would weigh about as much as an elephant.',
    ],
    factsAdvanced: [
      'About 1.02 M☉ within a radius of ~5,850 km — smaller than Earth. Mean density on the order of a tonne per cubic centimetre.',
      'Bessel inferred it in 1844 from Sirius A\'s proper-motion wobble; Alvan Graham Clark first saw it in 1862 while testing a new refractor.',
      'It was the first object shown to be degenerate matter, and its gravitational redshift was an early confirmation of general relativity.',
      'It was once the more massive of the pair — roughly 5 M☉ — and evolved first. Sirius A is the younger-looking star only because it started lighter.',
    ],
  },
  {
    id: 'epsilon-eridani',
    name: 'Epsilon Eridani',
    designation: 'Ran · ε Eridani',
    constellation: 'Eridanus',
    spectral: 'K2V',
    distance: 10.475,
    mag: 3.73,
    description:
      'A young orange dwarf with a debris disk — the nearest star with a ' +
      'confirmed planet visible to the naked eye. A plausible picture of what the ' +
      'Solar System looked like while it was still assembling.',
    factsKids: [
      'This star is much younger than the Sun — a toddler by star standards.',
      'It is surrounded by rings of dust and rubble, like a solar system still being built.',
      'You can see it without a telescope, which is rare for a star known to have a planet.',
    ],
    factsAdvanced: [
      'Under a billion years old, still magnetically active, with a debris disk structured much like a young Kuiper Belt.',
      'Epsilon Eridani b is a Jupiter-mass planet on a roughly 7-year orbit — one of the earliest and most stubbornly debated radial-velocity detections, contested for years because stellar activity mimics the signal.',
      'Proper name Ran, after the Norse sea goddess, assigned by the IAU in 2015 — the constellation Eridanus is a river.',
    ],
  },
  {
    id: 'tau-ceti',
    name: 'Tau Ceti',
    designation: 'τ Ceti',
    constellation: 'Cetus',
    spectral: 'G8V',
    distance: 11.912,
    mag: 3.5,
    description:
      'The nearest single Sun-like star, quiet and old — and for exactly that ' +
      'reason a fixture of both SETI history and science fiction. Its debris disk ' +
      'is uncomfortably thick.',
    factsKids: [
      'Tau Ceti is the closest star that is really similar to our Sun and lives alone, without a partner star.',
      'It was one of the first stars humans ever pointed a radio telescope at, listening for a message. We heard nothing.',
      'It has far more comets and asteroids than our Solar System, so its planets are probably hit much more often.',
    ],
    factsAdvanced: [
      'G8V, ~0.78 M☉, metal-poor at roughly a third of solar iron, and old — somewhere around 9 billion years.',
      'Frank Drake\'s Project Ozma targeted it and Epsilon Eridani in 1960, the first modern SETI search.',
      'Its debris disk carries perhaps ten times the Solar System\'s complement of small bodies, implying a heavy and sustained impact environment on any planet.',
      'Several planet candidates have been proposed from radial velocity; separating genuine signals from stellar activity remains difficult and the roster has changed repeatedly.',
    ],
  },
  {
    id: 'teegardens-star',
    name: "Teegarden's Star",
    designation: 'SO J025300.5+165258',
    constellation: 'Aries',
    spectral: 'M7V',
    distance: 12.5,
    mag: 15.13,
    description:
      'An extremely dim, extremely old red dwarf that went unnoticed until 2003 ' +
      'despite lying among our nearest neighbours — and which hosts two of the ' +
      'most Earth-like planets known by mass.',
    factsKids: [
      'This star is so faint that nobody spotted it until 2003, even though it is one of our closest neighbours.',
      'It has two planets that are very close in size to Earth.',
      'It is about 8 billion years old — much older than our Sun.',
    ],
    factsAdvanced: [
      'About 0.09 M☉ and 0.0007 L☉, discovered in 2003 in archival asteroid-survey data rather than by a dedicated star survey — an object lesson in how incomplete the nearby-star census was.',
      'Teegarden b and c (2019) have minimum masses near 1.05 and 1.11 Earth masses, giving them among the highest Earth Similarity Index values known.',
      'Unusually quiet for an M dwarf, which materially improves the odds that its planets have retained atmospheres.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section H — the brightest stars in Earth's sky (ST-141 → ST-160)
 * ------------------------------------------------------------------ */

export const BRIGHTEST_STARS = [
  {
    id: 'sirius',
    name: 'Sirius',
    designation: 'α Canis Majoris · the Dog Star',
    constellation: 'Canis Major',
    spectral: 'A1V',
    distance: 8.6,
    mag: -1.46,
    absMag: 1.42,
    rank: 1,
    description:
      'The brightest star in the night sky — bright partly because it is genuinely ' +
      'luminous, but mostly because it is close. Its heliacal rising once ' +
      'announced the flooding of the Nile.',
    factsKids: [
      'Sirius is the brightest star in the whole night sky.',
      'It twinkles in flashes of colour when it is low down — that is our own air bending its light, not the star changing.',
      'The ancient Egyptians used it as a calendar: when Sirius first reappeared before dawn, the Nile was about to flood.',
    ],
    factsAdvanced: [
      'A1V, 25 L☉ — genuinely luminous, but its dominance is proximity: at 8.6 ly it is the seventh-nearest stellar system.',
      'Its heliacal rising marked the Egyptian new year and the annual Nile inundation, making it arguably the most economically consequential star in human history.',
      'The white dwarf companion Sirius B orbits every 50.1 years. The pair\'s separation on the sky swings between about 3 and 11 arcseconds.',
      'Several classical sources describe Sirius as red, which conflicts with an A-type star — no stellar-evolution mechanism allows the change on that timescale, and atmospheric reddening near the horizon is the usual explanation.',
    ],
  },
  {
    id: 'canopus',
    name: 'Canopus',
    designation: 'α Carinae',
    constellation: 'Carina',
    spectral: 'A9II',
    distance: 310,
    mag: -0.74,
    rank: 2,
    description:
      'The second-brightest star in the night sky, and unlike Sirius it earns the ' +
      'place honestly: a luminous bright giant some 36 times further away. ' +
      'Spacecraft have navigated by it for sixty years.',
    factsKids: [
      'Canopus is the second-brightest star at night, but it is 36 times further away than the brightest one.',
      'Spacecraft use it to work out which way they are pointing — there are "Canopus star trackers" on real missions.',
      'You can only see it from the southern parts of the world.',
    ],
    factsAdvanced: [
      'About 10,700 L☉ at ~310 ly. If it sat where Sirius does, it would cast shadows and shine at roughly magnitude −9.',
      'Its brightness, isolation, and southern position make it an ideal attitude reference, and Canopus star trackers have flown since Mariner 4.',
      'Spectral classification has moved around (F0Ib and A9II both appear in the literature) because its temperature sits awkwardly near a class boundary — a good illustration that MK types are bins, not measurements.',
    ],
  },
  {
    id: 'arcturus',
    name: 'Arcturus',
    designation: 'α Boötis',
    constellation: 'Boötes',
    spectral: 'K1.5III',
    distance: 36.7,
    mag: -0.05,
    rank: 4,
    description:
      'The brightest star in the northern celestial hemisphere: an orange giant ' +
      'that has already left the main sequence. It is a halo interloper, moving ' +
      'perpendicular to the galactic plane with a swarm of companions.',
    factsKids: [
      'Arcturus is the brightest star in the northern half of the sky.',
      'It is an old star that has swelled up into a giant — about 25 times wider than the Sun.',
      'Follow the curve of the Big Dipper\'s handle and it points straight at it. "Arc to Arcturus."',
    ],
    factsAdvanced: [
      'K1.5III, ~25 R☉ and 170 L☉ — a preview of the Sun\'s red giant future, at only 36.7 ly.',
      'It belongs to the Arcturus stream, a group of old, metal-poor stars on similar orbits moving sharply relative to the galactic disk — likely debris from a small galaxy the Milky Way absorbed.',
      'Its light was used to open the 1933 Chicago World\'s Fair: photocells caught it and threw the switch, chosen because the star was then wrongly believed to be 40 light-years away, matching the interval since the 1893 fair.',
    ],
  },
  {
    id: 'vega',
    name: 'Vega',
    designation: 'α Lyrae',
    constellation: 'Lyra',
    spectral: 'A0V',
    distance: 25.04,
    mag: 0.03,
    rank: 5,
    description:
      'For most of the last century, the star that defined "magnitude zero" and ' +
      'anchored photometric calibration. A rapid rotator seen nearly pole-on, ' +
      'with a debris disk that launched the entire field.',
    factsKids: [
      'Vega was the standard other stars were measured against — the zero point of brightness.',
      'It spins so fast that it is squashed into an egg shape, not a ball.',
      'It was the North Star about 14,000 years ago, and it will be again in about 12,000 years.',
    ],
    factsAdvanced: [
      'A0V at 25 ly, historically the zero point of the UBV photometric system, so its colour indices are ~0 essentially by definition.',
      'It rotates near 12% of breakup velocity with a ~12.5-hour period, giving several thousand kelvin of pole-to-equator temperature difference (gravity darkening). We see it nearly pole-on, which long disguised this.',
      'IRAS found its infrared excess in 1983 — the first debris disk ever detected, and the origin of the term "Vega-like" star.',
      'Precession makes it the pole star around 13,700 CE; it last held the role near 12,000 BCE.',
      'It was the first star ever photographed, at Harvard in 1850, and among the first to have its spectrum recorded.',
    ],
  },
  {
    id: 'capella',
    name: 'Capella',
    designation: 'α Aurigae',
    constellation: 'Auriga',
    spectral: 'G8III + G1III',
    distance: 42.9,
    mag: 0.08,
    rank: 6,
    description:
      'Looks like one golden star; is actually four. Two yellow giants orbit each ' +
      'other closely, with a distant pair of red dwarfs bound to them — the ' +
      'brightest star of its kind in the sky.',
    factsKids: [
      'Capella looks like a single star, but it is really four stars together.',
      'The two big ones are yellow giants circling each other every 104 days.',
      'It is the closest bright star to the north pole of the sky, so from northern countries it almost never sets.',
    ],
    factsAdvanced: [
      'Capella Aa and Ab are G-type giants of ~2.5 and ~2.6 M☉ orbiting in 104 days; Capella H and L are distant M dwarfs bound to the pair.',
      'Both giants began as A-type main-sequence stars and are now crossing the Hertzsprung gap — the rapid, rarely caught transit between main sequence and giant branch.',
      'It was among the first stars resolved by optical interferometry (1919), which is how the tight pair was separated at all.',
    ],
  },
  {
    id: 'rigel',
    name: 'Rigel',
    designation: 'β Orionis',
    constellation: 'Orion',
    spectral: 'B8Ia',
    distance: 860,
    mag: 0.13,
    rank: 7,
    description:
      'A blue supergiant of extraordinary power — roughly 120,000 times the Sun\'s ' +
      'luminosity — and usually the brightest star in Orion despite carrying the ' +
      'Beta designation.',
    factsKids: [
      'Rigel is the bright blue-white star at Orion\'s foot.',
      'It gives out about 120,000 times more light than our Sun.',
      'Compare it to orange Betelgeuse at Orion\'s shoulder — one blue, one red. That colour difference is a temperature difference you can see with your eyes.',
    ],
    factsAdvanced: [
      'B8Ia, ~21 M☉ and roughly 120,000 L☉ at ~860 ly. It is a Beta despite outshining Alpha Orionis (Betelgeuse) because Betelgeuse is variable and may have been brighter when Bayer assigned letters.',
      'A slow irregular variable driven by non-radial pulsation, swinging roughly 0.03–0.3 magnitudes.',
      'Massive enough for core collapse; it will end as a supernova, most likely leaving a neutron star.',
      'The name is from Arabic rijl — "foot" — the same root that gives Rigil Kentaurus its name.',
    ],
  },
  {
    id: 'procyon',
    name: 'Procyon',
    designation: 'α Canis Minoris',
    constellation: 'Canis Minor',
    spectral: 'F5IV-V',
    distance: 11.46,
    mag: 0.34,
    rank: 8,
    description:
      'A close, bright subgiant just beginning to exhaust its core hydrogen — and, ' +
      'like Sirius, accompanied by a white dwarf. Its name means "before the dog", ' +
      'because it rises ahead of Sirius.',
    factsKids: [
      'Procyon\'s name means "before the dog" — it rises just before the Dog Star, Sirius.',
      'With Sirius and Betelgeuse it makes the Winter Triangle, easy to spot on cold clear nights.',
      'It also has a dead-star companion, like Sirius does.',
    ],
    factsAdvanced: [
      'F5IV-V at 11.46 ly — the transitional classification is real, catching it as it begins to leave the main sequence.',
      'Procyon B is a white dwarf of ~0.6 M☉ on a 40.8-year orbit, predicted from astrometry by Bessel in 1844 and first observed in 1896.',
      'Its solar-like oscillations have been measured, making it an important asteroseismology target for testing stellar interior models.',
    ],
  },
  {
    id: 'achernar',
    name: 'Achernar',
    designation: 'α Eridani',
    constellation: 'Eridanus',
    spectral: 'B6Vep',
    distance: 139,
    mag: 0.46,
    rank: 9,
    description:
      'The flattest star known: it spins so fast that its equatorial diameter is ' +
      'more than half again its polar diameter. A textbook Be star, marking the ' +
      'southern end of the celestial river.',
    factsKids: [
      'Achernar spins so fast that it is squashed almost flat — much wider across its middle than top to bottom.',
      'It is the least round star we know of.',
      'Its name means "the end of the river", because it sits at the tail of the constellation Eridanus.',
    ],
    factsAdvanced: [
      'Rotating near its breakup velocity, its equatorial radius exceeds its polar radius by more than 50% — the most oblate star measured.',
      'A Be star: centrifugal force plus radiation pressure throw material into a circumstellar decretion disk, producing hydrogen emission lines that come and go.',
      'Gravity darkening makes the poles thousands of kelvin hotter than the equator, so its measured properties depend heavily on viewing angle.',
    ],
  },
  // ST-151. Sources: SIMBAD (bet Cen — B1III, parallax 8.32 ± 0.50 mas → ~392 ly,
  // V 0.58) and the tabulated brightest-star ranking (rank 11, combined V 0.61,
  // 390 ly), fetched 2026-08-11. Both agree; 390 ly is the rounded consensus.
  {
    id: 'hadar',
    name: 'Hadar',
    designation: 'β Centauri',
    constellation: 'Centaurus',
    spectral: 'B1III',
    distance: 390,
    mag: 0.61,
    rank: 11,
    description:
      'The fainter of the two Pointers — the bright pair that leads the eye to the ' +
      'Southern Cross. A hot blue giant lying some ninety times further away than ' +
      'the neighbour it appears to travel beside.',
    factsKids: [
      'Hadar is one of the two bright "Pointer" stars that show the way to the Southern Cross.',
      'Its partner in the sky, Alpha Centauri, is our closest neighbour star. Hadar is about ninety times further away — they only look like a pair from here.',
      'It is a hot blue giant, far larger and hotter than the Sun.',
    ],
    factsAdvanced: [
      'B1III at roughly 390 ly, apparent magnitude 0.61 — the eleventh brightest star in Earth’s sky.',
      'With Alpha Centauri it forms the Pointers to Crux, and that pairing is pure line of sight: Alpha Centauri is 4.34 ly away, Hadar about ninety times more distant. It is the clearest naked-eye demonstration that a constellation is a projection, not a structure.',
      'A hot, massive B-type giant — massive enough to end in core collapse rather than as a white dwarf.',
    ],
  },
  {
    id: 'altair',
    name: 'Altair',
    designation: 'α Aquilae',
    constellation: 'Aquila',
    spectral: 'A7V',
    distance: 16.73,
    mag: 0.76,
    rank: 12,
    description:
      'One of the nearest bright stars, spinning fast enough to be visibly ' +
      'flattened — and the first main-sequence star other than the Sun to be ' +
      'imaged as a resolved disc rather than a point.',
    factsKids: [
      'Altair spins once every nine hours. Our Sun takes about 25 days.',
      'That fast spin squashes it into an egg shape, and telescopes have actually photographed the squashed shape.',
      'It forms the Summer Triangle with Vega and Deneb.',
    ],
    factsAdvanced: [
      'A7V at 16.73 ly with a rotation period near 9 hours, giving it an equatorial radius about 20% larger than its polar radius.',
      'Interferometric imaging in 2007 produced a resolved surface map showing the oblateness and gravity darkening directly — a first for a normal main-sequence star.',
      'In Chinese and Japanese tradition it is the Cowherd, separated from Vega the Weaver Girl by the Milky Way, reunited one night a year — the Qixi and Tanabata festivals.',
    ],
  },
  // ST-153. Sources: SIMBAD (alf Cru — B0.5IV+B1V, parallax 10.13 ± 0.50 mas →
  // ~322 ly) and the tabulated brightest-star ranking (rank 13, combined V 0.76
  // from components 1.33 + 1.73, 320 ly), fetched 2026-08-11.
  {
    id: 'acrux',
    name: 'Acrux',
    designation: 'α Crucis',
    constellation: 'Crux',
    spectral: 'B0.5IV + B1V',
    distance: 320,
    mag: 0.76,
    rank: 13,
    description:
      'The brightest star of the Southern Cross, and the southernmost first-magnitude ' +
      'star in the sky — a close pair of hot blue stars that a small telescope splits ' +
      'cleanly in two.',
    factsKids: [
      'Acrux is the brightest star in the Southern Cross.',
      'It looks like one star, but even a small telescope shows two.',
      'It sits so far south that most of the northern half of the world never sees it at all.',
    ],
    factsAdvanced: [
      'B0.5IV + B1V at roughly 320 ly. The two components shine at magnitude 1.33 and 1.73; their combined light reaches 0.76, ranking thirteenth in the sky.',
      'The southernmost first-magnitude star, near −63° declination. A star at that declination never rises for observers north of about 27°N — which is why the Cross is unknown to most of Europe and North America but flies on southern flags.',
      'Both components are hot, massive B-type stars, each destined for core collapse rather than a white-dwarf ending.',
    ],
  },
  {
    id: 'aldebaran',
    name: 'Aldebaran',
    designation: 'α Tauri',
    constellation: 'Taurus',
    spectral: 'K5III',
    distance: 65.3,
    mag: 0.86,
    rank: 14,
    description:
      'The orange eye of Taurus, glaring out of the Hyades cluster — though it is ' +
      'not a member at all, merely a foreground star that happens to line up. ' +
      'Pioneer 10 is headed roughly its way.',
    factsKids: [
      'Aldebaran is the bright orange eye of Taurus the Bull.',
      'It looks like part of the V-shaped Hyades star cluster, but it is not — it is much closer, and just happens to sit in front.',
      'The Pioneer 10 spacecraft is drifting toward it. It will take about two million years to arrive.',
    ],
    factsAdvanced: [
      'K5III, ~44 R☉ and 65.3 ly — less than half the Hyades\' distance, so its apparent cluster membership is pure line-of-sight coincidence.',
      'Its name is from Arabic al-dabarān, "the follower", because it follows the Pleiades across the sky.',
      'It lies close enough to the ecliptic to be occulted by the Moon, and those occultations have been used to measure its angular diameter precisely.',
    ],
  },
  {
    id: 'antares',
    name: 'Antares',
    designation: 'α Scorpii',
    constellation: 'Scorpius',
    spectral: 'M1.5Iab',
    distance: 550,
    // `mag` is the representative value that makes the ranking sortable; the
    // variation lives in magRange. 0.6 is the BRIGHT EXTREME of the range, not a
    // typical brightness, and quoting it here contradicted BRIGHTNESS_RANKING.
    // SIMBAD gives V 0.91, the ranking table 0.96 — both inside the variation.
    mag: 0.96,
    magRange: [0.6, 1.6],
    rank: 15,
    description:
      'A red supergiant so large that placed at the Sun it would swallow the orbit ' +
      'of Mars. Its name means "rival of Ares" — it matches Mars for colour, and ' +
      'the two are regularly mistaken for each other.',
    factsKids: [
      'Antares is a giant red star at the heart of Scorpius.',
      'Its name means "rival of Mars", because it is the same reddish colour as the planet.',
      'If you put Antares where our Sun is, it would swallow Mercury, Venus, Earth, and Mars.',
    ],
    factsAdvanced: [
      'M1.5Iab, roughly 680 R☉ at ~550 ly. Placed at the Sun, its surface would reach past the orbit of Mars.',
      'A slow irregular variable ranging about magnitude 0.6–1.6 over years, with substantial ongoing mass loss feeding a surrounding nebula.',
      'It has a hot B-type companion, normally lost in the glare but visible during lunar occultations.',
      'It will end as a core-collapse supernova, plausibly within the next million years.',
    ],
  },
  {
    id: 'spica',
    name: 'Spica',
    designation: 'α Virginis',
    constellation: 'Virgo',
    spectral: 'B1III-IV + B2V',
    distance: 250,
    mag: 0.97,
    rank: 16,
    description:
      'A pair of hot blue stars orbiting so closely that mutual gravity pulls them ' +
      'into eggs, and the brightness varies as they turn. Hipparchus used it to ' +
      'discover the precession of the equinoxes.',
    factsKids: [
      'Spica is really two blue stars whirling around each other every four days.',
      'They are so close that gravity stretches them into egg shapes.',
      'Follow the curve of the Big Dipper\'s handle past Arcturus and you reach Spica. "Arc to Arcturus, spike to Spica."',
    ],
    factsAdvanced: [
      'A spectroscopic binary with a 4.01-day period, close enough to be a rotating ellipsoidal variable — the changing projected area produces the light variation, with no eclipse required.',
      'Comparing his measurement of Spica\'s position against earlier Babylonian records led Hipparchus to discover precession around 127 BCE.',
      'The primary is a Beta Cephei variable, pulsating on a period of a few hours, and massive enough to end as a supernova.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section I — navigation stars (ST-161 → ST-180)
 * ------------------------------------------------------------------ */

export const NAVIGATION_STARS = [
  {
    id: 'polaris',
    name: 'Polaris',
    designation: 'α Ursae Minoris · the North Star',
    constellation: 'Ursa Minor',
    spectral: 'F7Ib',
    distance: 445,
    mag: 1.98,
    description:
      'The North Star — not because it is bright, but because it sits almost ' +
      'exactly above Earth\'s north pole. It barely moves while the entire sky ' +
      'wheels around it, and its height above the horizon is your latitude.',
    factsKids: [
      'Polaris sits almost exactly above the North Pole, so it stays still while every other star circles around it.',
      'It is not the brightest star in the sky — that is a very common mistake. It is not even in the top forty.',
      'If you can see Polaris, you know which way north is. Sailors relied on that for thousands of years.',
      'How high it sits above the horizon tells you how far north you are.',
    ],
    factsAdvanced: [
      'Currently about 0.66° from the north celestial pole, closing to roughly 0.45° near 2100 CE before precession carries it away again.',
      'Its altitude above the horizon equals the observer\'s latitude — the single most useful fact in pre-instrumental celestial navigation.',
      'A triple system whose primary is a Cepheid variable, though with an unusually small amplitude that measurably weakened during the 20th century before partially recovering.',
      'At F7Ib it is a supergiant roughly 1,300 times solar luminosity — it appears modest only because of its ~445 ly distance.',
    ],
  },
  {
    id: 'thuban',
    name: 'Thuban',
    designation: 'α Draconis',
    constellation: 'Draco',
    spectral: 'A0III',
    distance: 270,
    mag: 3.65,
    description:
      'The pole star of the pyramid builders. Around 2700 BCE, Thuban sat closer ' +
      'to the celestial pole than Polaris does now — and Egyptian architecture ' +
      'appears to have been aligned using it.',
    factsKids: [
      'Thuban was the North Star when the Egyptian pyramids were built.',
      'Earth wobbles like a spinning top, so the North Star changes over thousands of years.',
      'A shaft in the Great Pyramid points at where Thuban used to sit in the sky.',
    ],
    factsAdvanced: [
      'It was within ~0.1° of the north celestial pole around 2787 BCE — closer than Polaris ever gets in the present cycle.',
      'The descending passage of the Great Pyramid of Khufu is aligned near its position at the time, and is one of the stronger archaeoastronomical arguments for deliberate stellar alignment.',
      'Precession runs on a ~25,772-year cycle, so the pole traces a circle through Thuban, Polaris, Vega, and back.',
    ],
  },
  {
    id: 'deneb',
    name: 'Deneb',
    designation: 'α Cygni',
    constellation: 'Cygnus',
    spectral: 'A2Ia',
    distance: 2600,
    distanceUncertain: true,
    mag: 1.25,
    description:
      'One of the most luminous stars visible to the naked eye — and one of the ' +
      'most distant. Its distance remains genuinely uncertain, which makes its ' +
      'true luminosity uncertain along with it.',
    factsKids: [
      'Deneb is one of the furthest stars you can see without a telescope.',
      'It looks about as bright as many nearby stars, but it is thousands of times further away — which means it is staggeringly powerful.',
      'It marks the tail of Cygnus the Swan, and is one corner of the Summer Triangle.',
    ],
    factsAdvanced: [
      'Distance estimates have ranged from ~1,400 to ~2,600 ly, and luminosity estimates scale with the square — somewhere around 100,000–200,000 L☉.',
      'The uncertainty is instructive: parallax for a star this distant is at the edge of measurability, and supergiant photospheres are extended enough to complicate the astrometric reference point.',
      'Prototype of the Alpha Cygni variables — non-radially pulsating supergiants with irregular small-amplitude variation.',
      'It has already left the main sequence, having begun as a ~19 M☉ O-type star, and will end in core collapse.',
    ],
  },
  {
    id: 'regulus',
    name: 'Regulus',
    designation: 'α Leonis',
    constellation: 'Leo',
    spectral: 'B8IVn',
    distance: 79.3,
    mag: 1.4,
    description:
      'The "little king" at the heart of Leo, lying almost exactly on the ecliptic ' +
      '— so the Moon and planets regularly pass across it. It spins near the point ' +
      'where it would tear itself apart.',
    factsKids: [
      'Regulus sits right on the path the Sun, Moon, and planets follow across the sky, so they often pass close to it.',
      'It spins so fast that if it turned much faster it would fly apart.',
      'Its name means "little king".',
    ],
    factsAdvanced: [
      'Rotating at roughly 96% of its breakup velocity with a ~16-hour period, leaving it strongly oblate and gravity-darkened.',
      'Within about 0.5° of the ecliptic — the brightest star that close — so lunar occultations and planetary conjunctions are frequent.',
      'It has a white dwarf companion on a 40-day orbit, inferred from spectroscopy. That companion once transferred mass onto Regulus, which is the likely origin of its extreme spin.',
    ],
  },
  {
    id: 'fomalhaut',
    name: 'Fomalhaut',
    designation: 'α Piscis Austrini',
    constellation: 'Piscis Austrinus',
    spectral: 'A3V',
    distance: 25.1,
    mag: 1.16,
    description:
      'The "loneliest star" of northern autumn evenings, isolated in a dim region ' +
      'of sky — and ringed by one of the sharpest debris disks ever imaged.',
    factsKids: [
      'Fomalhaut sits alone in an empty patch of sky, with no bright stars near it.',
      'It is surrounded by a huge ring of dust and rubble, photographed by Hubble.',
      'Its name comes from Arabic and means "mouth of the whale" — or of the southern fish.',
    ],
    factsAdvanced: [
      'A3V at 25.1 ly with an eccentric, sharply bounded debris ring around 140 AU — the sharp inner edge argues for shepherding by unseen planets.',
      'Fomalhaut b was announced in 2008 as the first exoplanet directly imaged in visible light, then reinterpreted around 2020 as an expanding debris cloud from a planetesimal collision, having faded and spread.',
      'It forms a wide common-proper-motion system with TW Piscis Austrini and LP 876-10 — a triple spanning nearly a light-year.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section J — giants, supergiants, and the extremes (ST-181 → ST-200)
 * ------------------------------------------------------------------ */

export const STELLAR_EXTREMES = [
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    designation: 'α Orionis',
    constellation: 'Orion',
    spectral: 'M1-2Ia-ab',
    distance: 548,
    distanceUncertain: true,
    mag: 0.5,
    magRange: [0.0, 1.6],
    description:
      'The red supergiant on Orion\'s shoulder, and the most famous star on ' +
      'anyone\'s supernova watchlist. In 2019–20 it dimmed so dramatically that ' +
      'the world briefly wondered whether it was about to go.',
    factsKids: [
      'Betelgeuse is a red giant so big that if you put it where the Sun is, it would swallow Earth completely.',
      'In 2019 it suddenly went dim, and people wondered if it was about to explode. It was actually a huge cloud of dust it had coughed out.',
      'One day it will explode — bright enough to see in daylight. It might happen tonight, or in a hundred thousand years.',
    ],
    factsAdvanced: [
      'Roughly 700–900 R☉. Placed at the Sun it would engulf Mercury, Venus, Earth, and likely Mars.',
      'The Great Dimming of 2019–20 took it to magnitude ~1.6, its faintest on record. The cause was resolved as a dust cloud condensing from a surface mass ejection, combined with a cool photospheric patch — not an imminent collapse.',
      'It will explode as a Type II supernova within about 100,000 years — instantaneous by stellar standards, but a long wait on ours. At its distance it would reach roughly magnitude −11: readable-by-at-night bright, and harmless.',
      'It was the first star other than the Sun to have its angular diameter measured (Michelson and Pease, 1920) and among the first imaged with surface detail.',
      'Distance remains awkward: its extended, convecting photosphere degrades parallax, and published values scatter across several hundred light-years.',
    ],
  },

  // ORION'S BELT — Alnitak, Alnilam, Mintaka, west to east as they are
  // lettered but listed here left to right as a northern observer sees them.
  // Orion already promised them: constellationData lists "Orion's Belt" under
  // notable and its advanced facts call them Orion OB1 members, with no
  // profiles behind the claim.
  //
  // Sources: SIMBAD TAP (basic + allfluxes + mesPlx + mesDistance), fetched
  // 2026-08-14. V and spectral types are SIMBAD's for the queried identifier.
  //
  // DISTANCE IS DELIBERATELY THE SAME 1,200 ly ON ALL THREE, and that is a
  // judgement, not a copy-paste. Individual parallaxes to these stars are bad
  // and disagree with each other — two reductions of the SAME Hipparcos data
  // give del Ori 4.71 ± 0.58 mas (692 ly, 2007A&A...474..653V) against
  // 3.56 ± 0.83 (916 ly, 1997A&A...323L..49P); eps Ori 1.65 ± 0.45 (1,977 ly)
  // against 2.43 ± 0.91 (1,342 ly); zet Ori 4.43 ± 0.64 (736 ly) against
  // 3.99 ± 0.79 (817 ly), plus a ground-based 23.9 ± 15.0 mas (136 ly,
  // 1995GCTP..C......0V) that is simply noise. Gaia does not rescue this —
  // all three saturate it. Taking each parallax at face value would scatter
  // the Belt from 692 to 1,977 ly and quietly contradict this repo's own
  // claim that they are a physical association rather than a chance
  // alignment. The association distance is the better-determined quantity,
  // and it is corroborated independently: interstellar Ca II H&K absorption
  // toward eps Ori gives 366 ± 70 pc = 1,194 ± 228 ly
  // (2009A&A...507..833M), which is Orion OB1b. So: one distance, flagged
  // uncertain, with the spread explained in factsAdvanced rather than hidden
  // behind three false precisions.
  {
    id: 'alnitak',
    name: 'Alnitak',
    designation: 'ζ Orionis',
    constellation: 'Orion',
    spectral: 'O9.7Ib + B0III',
    distance: 1200,
    distanceUncertain: true,
    mag: 1.77,
    description:
      'The easternmost star of Orion\'s Belt, and the brightest O-type star in ' +
      'the night sky — the hottest and rarest spectral class there is. Its ' +
      'ultraviolet output is what makes the Horsehead visible at all.',
    factsKids: [
      'Alnitak is the left-hand star of Orion\'s Belt as you look at it from the northern half of the world.',
      'It looks like one star but it is at least three, orbiting each other.',
      'It is the brightest example in the whole sky of the hottest kind of star, class O — stars so rare that only a tiny fraction of one percent of stars are one.',
      'The famous Horsehead Nebula sits right next to it. Alnitak is the lamp; the horse\'s head is the shadow.',
    ],
    factsAdvanced: [
      'A multiple system: an O9.7 Ib supergiant with a B0 III companion, roughly 33 M☉ for the primary. At V 1.77 it is the brightest O-class star in the sky.',
      'Its ultraviolet flux ionises IC 434, the emission ridge behind the Horsehead (Barnard 33) — the nebula is a dark dust column seen in silhouette, so it exists visually only because Alnitak lights the screen behind it. The Flame Nebula, NGC 2024, is also excited by it.',
      'The name is from Arabic an-niṭāq, "the girdle".',
      'Massive enough to end in core collapse, as all three Belt stars will.',
    ],
  },
  {
    id: 'alnilam',
    name: 'Alnilam',
    designation: 'ε Orionis',
    constellation: 'Orion',
    spectral: 'B0Ia',
    distance: 1200,
    distanceUncertain: true,
    mag: 1.69,
    description:
      'The middle star of the Belt, and the only one of the three that is a ' +
      'single star rather than a knot of several. A blue supergiant among the ' +
      'most luminous stars the naked eye can reach.',
    factsKids: [
      'Alnilam is the middle star of Orion\'s Belt, and the brightest of the three.',
      'Its name means "string of pearls" — which is what the Belt looks like.',
      'It is one of the brightest stars you can see without a telescope, giving out hundreds of thousands of times more light than the Sun.',
      'Unlike the stars either side of it, Alnilam really is just one star.',
    ],
    factsAdvanced: [
      'B0 Ia, a blue supergiant of several hundred thousand L☉ — one of the most intrinsically luminous stars visible to the unaided eye.',
      'Single, where Alnitak and Mintaka are both multiples. That makes it the cleanest of the three to model, and it is a standard reference for the B0 supergiant class.',
      'It is losing mass rapidly through a strong radiatively driven wind, and is the most evolved of the Belt trio.',
      'Its distance is the best-constrained of the three by a method other than parallax: interstellar Ca II H&K absorption gives 366 ± 70 pc, about 1,194 ± 228 ly (Megier et al. 2009), consistent with Orion OB1b.',
    ],
  },
  {
    id: 'mintaka',
    name: 'Mintaka',
    designation: 'δ Orionis',
    constellation: 'Orion',
    spectral: 'O9.5II + B1V + B0IV',
    distance: 1200,
    distanceUncertain: true,
    mag: 2.41,
    description:
      'The westernmost Belt star, and the one that sits almost exactly on the ' +
      'celestial equator — so it rises due east and sets due west for everyone ' +
      'on Earth. Faintest of the three, and the most crowded.',
    factsKids: [
      'Mintaka is the right-hand star of Orion\'s Belt from the northern half of the world.',
      'It sits almost exactly above Earth\'s equator, so it rises due east and sets due west no matter where you are standing.',
      'That also means it is the one Belt star that can be seen from both the North and South Poles.',
      'Its name simply means "the belt".',
    ],
    factsAdvanced: [
      'Declination roughly −0°18′, less than a third of a degree off the celestial equator. An object there rises due east and sets due west from every latitude, and is theoretically visible from both poles.',
      'A multiple system: the close pair δ Ori Aa1 (O9.5 II) and Aa2 (B1 V) eclipse each other on a 5.7-day orbit, with further components Ab and B. The eclipses are shallow.',
      'Faintest of the Belt at V 2.41, which is why the three do not look evenly matched even though the line looks straight.',
      'Its parallax is the least consistent of the three: the 1997 and 2007 reductions of the same Hipparcos data differ by a third, which is why the association distance is used here instead.',
    ],
  },
  {
    id: 'mu-cephei',
    name: 'Mu Cephei',
    designation: "Herschel's Garnet Star",
    constellation: 'Cepheus',
    spectral: 'M2Ia',
    distance: 3000,
    distanceUncertain: true,
    mag: 4.08,
    magRange: [3.4, 5.1],
    description:
      'One of the reddest and largest stars visible without a telescope. William ' +
      'Herschel described it as "a very fine deep garnet colour", and the name ' +
      'stuck.',
    factsKids: [
      'This is one of the reddest stars you can see without a telescope — a deep ruby colour.',
      'It is over a thousand times wider than the Sun.',
      'The astronomer William Herschel named it the Garnet Star because of its colour.',
    ],
    factsAdvanced: [
      'A red supergiant of roughly 1,000 R☉ and on the order of 300,000 L☉, though both figures carry large distance-driven uncertainty.',
      'Its extreme red colour comes from a low effective temperature (~3,700 K) plus heavy circumstellar dust reddening from its own mass loss.',
      'A semiregular variable cycling over roughly 2–3 years, with longer secondary periods layered on top.',
    ],
  },
  {
    id: 'vy-canis-majoris',
    name: 'VY Canis Majoris',
    designation: 'VY CMa',
    constellation: 'Canis Major',
    spectral: 'M3-M4.5e',
    distance: 3900,
    mag: 7.95,
    description:
      'A red hypergiant among the largest stars known — around 1,400 solar radii, ' +
      'shedding mass so violently that it has wrapped itself in an opaque nebula ' +
      'of its own making.',
    factsKids: [
      'VY Canis Majoris is one of the biggest stars we know. Light takes about six hours to travel around it once — around the Sun it takes fifteen seconds.',
      'It is throwing off so much gas that it has buried itself in its own cloud.',
      'A jet plane flying around it non-stop would take over a thousand years.',
    ],
    factsAdvanced: [
      'Roughly 1,400 R☉. Placed at the Sun, its surface would reach out between the orbits of Jupiter and Saturn.',
      'Losing on the order of 10⁻⁴ M☉ per year — extreme even among hypergiants — producing arcs and knots of ejecta that record centuries of irregular outbursts.',
      'Despite the size it is only ~17 M☉ and dropping, an object lesson that stellar radius and stellar mass are nearly independent for evolved stars.',
      'It is expected to end as a core-collapse supernova, possibly collapsing directly to a black hole.',
    ],
  },
  {
    id: 'uy-scuti',
    name: 'UY Scuti',
    designation: 'BD-12 5055',
    constellation: 'Scutum',
    spectral: 'M4Ia',
    distance: 5100,
    distanceUncertain: true,
    mag: 9.0,
    description:
      'For years the reigning "largest known star" in popular accounts — a title ' +
      'that has since been substantially walked back as its distance was revised. ' +
      'A good case study in how a headline number can outlive its evidence.',
    factsKids: [
      'UY Scuti was once called the biggest star ever found.',
      'Then astronomers measured its distance better and realised it is probably smaller than they thought.',
      'That is science working properly: new measurements, new answer.',
    ],
    factsAdvanced: [
      'The widely repeated ~1,700 R☉ figure came from a distance estimate that Gaia data revised. Later analyses put it substantially lower — plausibly closer to ~750 R☉.',
      'Radius determinations for red supergiants are fundamentally awkward: the photosphere is not sharply defined, opacity varies with wavelength, and the star pulsates.',
      'Take any "largest star" ranking as provisional. The list reshuffles with each distance catalogue.',
    ],
  },
  {
    id: 'eta-carinae',
    name: 'Eta Carinae',
    designation: 'η Carinae',
    constellation: 'Carina',
    spectral: 'LBV + O',
    distance: 7500,
    mag: 4.5,
    magRange: [-1.0, 7.9],
    description:
      'A monstrously massive binary that in the 1840s erupted to become the ' +
      'second-brightest star in the sky, ejected more than ten solar masses, and ' +
      'somehow survived. The debris is still expanding as the Homunculus Nebula.',
    factsKids: [
      'In the 1840s this star suddenly flared up to become the second-brightest star in the whole sky, then faded away again.',
      'It threw off a huge amount of gas, which is still flying outward as two giant bubbles.',
      'It is one of the most massive stars known, and it is expected to explode.',
    ],
    factsAdvanced: [
      'The Great Eruption of 1837–1856 peaked near magnitude −1 and ejected upward of 10 M☉, releasing energy comparable to a supernova without destroying the star — a "supernova impostor".',
      'The primary is a luminous blue variable of perhaps ~100 M☉ with a hot companion on a 5.54-year eccentric orbit; their colliding winds produce hard X-ray emission that varies on that cycle.',
      'The bipolar Homunculus Nebula is the eruption\'s debris, still expanding at hundreds of km/s and now about half a light-year across.',
      'It sits close to the Eddington limit, where radiation pressure nearly overwhelms gravity — which is why such stars are violently unstable.',
    ],
  },
  {
    id: 'r136a1',
    name: 'R136a1',
    designation: 'RMC 136a1',
    constellation: 'Dorado',
    spectral: 'WN5h',
    distance: 163000,
    mag: 12.23,
    description:
      'The most massive star known, in the Tarantula Nebula of the Large ' +
      'Magellanic Cloud. It sits well above what was long thought to be the ' +
      'theoretical mass ceiling for a single star.',
    factsKids: [
      'R136a1 is the heaviest star we know — around 200 times heavier than the Sun.',
      'It shines millions of times brighter than the Sun.',
      'It is not even in our galaxy. It lives in a smaller galaxy nearby.',
    ],
    factsAdvanced: [
      'Roughly 200 M☉ and several million L☉. A 2022 analysis using sharper imaging revised the mass downward from earlier ~315 M☉ estimates — earlier figures were inflated by unresolved neighbours in the crowded core.',
      'A Wolf–Rayet star: so luminous that radiation pressure has stripped its outer hydrogen, exposing fusion products directly in the wind.',
      'Its existence forced revision of the assumed ~150 M☉ upper mass limit for star formation.',
      'It lies in R136, the compact core of the Tarantula Nebula (30 Doradus) in the LMC — the most vigorous star-forming region in the Local Group.',
    ],
  },
  {
    id: 'p-cygni',
    name: 'P Cygni',
    designation: '34 Cygni',
    constellation: 'Cygnus',
    spectral: 'B2Ia',
    distance: 5300,
    mag: 4.8,
    description:
      'A luminous blue variable that appeared from nowhere in 1600, brightened to ' +
      'third magnitude, and gave its name to a spectral signature now used to ' +
      'detect outflowing gas anywhere in the universe.',
    factsKids: [
      'In the year 1600 this star suddenly appeared in the sky where nothing had been visible before.',
      'It brightened, faded, brightened again, and finally settled down.',
      'The way its light is shaped tells astronomers that gas is streaming off it toward us.',
    ],
    factsAdvanced: [
      'The P Cygni profile — blueshifted absorption alongside an emission peak — is the definitive spectroscopic signature of an expanding envelope, and is now applied from stellar winds to quasar outflows.',
      'Willem Blaeu recorded its 1600 appearance at third magnitude; it has since settled near magnitude 4.8 after further outbursts in the 17th century.',
      'A luminous blue variable of ~600,000 L☉, in the same unstable regime as Eta Carinae and a plausible supernova progenitor.',
    ],
  },
]

/** Every Phase STB star profile, flattened. */
export const STAR_PROFILES = [
  THE_SUN,
  ...NEAREST_STARS,
  ...BRIGHTEST_STARS,
  ...NAVIGATION_STARS,
  ...STELLAR_EXTREMES,
]

/** Apparent-magnitude ranking of the brightest stars in Earth's sky (ST-156). */
export const BRIGHTNESS_RANKING = [
  { rank: 1, name: 'Sirius', mag: -1.46, constellation: 'Canis Major' },
  { rank: 2, name: 'Canopus', mag: -0.74, constellation: 'Carina' },
  { rank: 3, name: 'Alpha Centauri', mag: -0.27, constellation: 'Centaurus', note: 'Combined light of A and B.' },
  { rank: 4, name: 'Arcturus', mag: -0.05, constellation: 'Boötes' },
  { rank: 5, name: 'Vega', mag: 0.03, constellation: 'Lyra' },
  { rank: 6, name: 'Capella', mag: 0.08, constellation: 'Auriga' },
  { rank: 7, name: 'Rigel', mag: 0.13, constellation: 'Orion' },
  { rank: 8, name: 'Procyon', mag: 0.34, constellation: 'Canis Minor' },
  { rank: 9, name: 'Achernar', mag: 0.46, constellation: 'Eridanus' },
  { rank: 10, name: 'Betelgeuse', mag: 0.5, constellation: 'Orion', note: 'Variable; rank shifts between roughly 7th and 20th.' },
  { rank: 11, name: 'Hadar', mag: 0.61, constellation: 'Centaurus' },
  { rank: 12, name: 'Altair', mag: 0.76, constellation: 'Aquila' },
  { rank: 13, name: 'Acrux', mag: 0.76, constellation: 'Crux', note: 'Combined light of a close pair.' },
  { rank: 14, name: 'Aldebaran', mag: 0.86, constellation: 'Taurus' },
  { rank: 15, name: 'Antares', mag: 0.96, constellation: 'Scorpius', note: 'Variable.' },
  { rank: 16, name: 'Spica', mag: 0.97, constellation: 'Virgo' },
  { rank: 17, name: 'Pollux', mag: 1.14, constellation: 'Gemini' },
  { rank: 18, name: 'Fomalhaut', mag: 1.16, constellation: 'Piscis Austrinus' },
  { rank: 19, name: 'Deneb', mag: 1.25, constellation: 'Cygnus' },
  { rank: 20, name: 'Mimosa', mag: 1.25, constellation: 'Crux' },
]

/** Nearest stellar systems by distance in light-years (ST-137). */
export const NEAREST_RANKING = [
  { rank: 1, name: 'Proxima Centauri', distance: 4.2465, spectral: 'M5.5Ve' },
  { rank: 2, name: 'Alpha Centauri A', distance: 4.3441, spectral: 'G2V' },
  { rank: 3, name: 'Alpha Centauri B', distance: 4.3441, spectral: 'K1V' },
  { rank: 4, name: "Barnard's Star", distance: 5.963, spectral: 'M4V' },
  { rank: 5, name: 'Wolf 359', distance: 7.86, spectral: 'M6V' },
  { rank: 6, name: 'Lalande 21185', distance: 8.31, spectral: 'M2V' },
  { rank: 7, name: 'Sirius A', distance: 8.6, spectral: 'A1V' },
  { rank: 8, name: 'Sirius B', distance: 8.6, spectral: 'DA2' },
  { rank: 9, name: 'Luyten 726-8 A/B', distance: 8.73, spectral: 'M5.5V / M6V' },
  { rank: 10, name: 'Ross 154', distance: 9.7, spectral: 'M3.5V' },
  { rank: 11, name: 'Ross 248', distance: 10.3, spectral: 'M5V' },
  { rank: 12, name: 'Epsilon Eridani', distance: 10.475, spectral: 'K2V' },
  { rank: 13, name: 'Lacaille 9352', distance: 10.72, spectral: 'M0.5V' },
  { rank: 14, name: 'Ross 128', distance: 11.007, spectral: 'M4V' },
  { rank: 15, name: 'Tau Ceti', distance: 11.912, spectral: 'G8V' },
  { rank: 16, name: "Luyten's Star", distance: 12.36, spectral: 'M3.5V' },
  { rank: 17, name: "Teegarden's Star", distance: 12.5, spectral: 'M7V' },
]
