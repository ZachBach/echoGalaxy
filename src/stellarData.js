/**
 * Stellar foundations — BACKLOG Phase STA (ST-001 → ST-100).
 *
 * The concept layer beneath every star in the catalogue: what a star is, how
 * one forms, what holds it up, how we measure it, how it is classified, and
 * how it dies. Each entry carries the two-rung facts ladder (see
 * factsLadder.js) — `factsKids` and `factsAdvanced` are the same physics at
 * two depths, never two different claims.
 *
 * Pure data. No rendering imports.
 *
 * Numbers follow IAU nominal solar values where one exists
 * (L☉ = 3.828e26 W, R☉ = 6.957e8 m, T_eff☉ = 5772 K) and are rounded only
 * where the rounding is honest at the stated precision.
 */

/* ------------------------------------------------------------------ *
 * Section A — how stars are born (ST-001 → ST-020)
 * ------------------------------------------------------------------ */

export const STELLAR_FORMATION = [
  {
    id: 'what-is-a-star',
    name: 'What a Star Is',
    label: 'Definition · self-gravitating fusion sphere',
    description:
      'A star is a ball of plasma massive enough that its own gravity crushes ' +
      'its core hot and dense enough to fuse hydrogen into helium. That single ' +
      'condition — self-sustaining fusion — separates a star from a planet, a ' +
      'brown dwarf, or a glowing cloud of gas.',
    factsKids: [
      'A star is a giant ball of hot gas that makes its own light. Planets do not make light — they only reflect it.',
      'Stars look tiny because they are unbelievably far away. Our Sun is a star, and it is close enough to feel on your skin.',
      'Every star you can see at night is a sun. Many of them have planets of their own.',
    ],
    factsAdvanced: [
      'The lower mass limit for hydrogen fusion is about 0.08 M☉ (~80 Jupiter masses). Below it, an object is a brown dwarf — it may fuse deuterium above ~13 Jupiter masses, but never plain hydrogen.',
      'Stars are plasma, not gas: at these temperatures electrons are stripped from nuclei, which is what makes stellar material respond to magnetic fields.',
      'Fusion is the definition, not brightness. A white dwarf shines brilliantly and fuses nothing — it is the exposed ash of a star, cooling on a timescale longer than the present age of the universe.',
    ],
  },
  {
    id: 'molecular-clouds',
    name: 'Giant Molecular Clouds',
    label: 'Stellar nursery · cold H₂ and dust',
    description:
      'Stars form inside the coldest, densest structures in a galaxy: clouds of ' +
      'molecular hydrogen laced with dust, tens of parsecs across and hundreds ' +
      'of thousands of solar masses heavy. They are dark because the dust blocks ' +
      'starlight behind them — a molecular cloud is easiest to find as a hole in ' +
      'the sky.',
    factsKids: [
      'Stars are born inside enormous cold clouds of gas and dust — like cosmic thunderclouds, but light-years wide.',
      'These clouds look like dark patches in the night sky, because the dust inside blocks the light of stars behind them.',
      'The Pillars of Creation are giant fingers of one of these clouds, being carved away by nearby baby stars.',
    ],
    factsAdvanced: [
      'Giant molecular clouds run 10–100 pc across and 10⁴–10⁶ M☉, at temperatures of only 10–20 K — cold enough that hydrogen pairs up into H₂.',
      'H₂ is nearly invisible: it has no permanent dipole moment, so it barely radiates at these temperatures. Clouds are mapped by proxy, usually the CO J=1→0 line at 2.6 mm.',
      'Star formation is inefficient. Only a few percent of a cloud\'s mass becomes stars before radiation, winds, and supernovae from the first generation disperse the rest.',
    ],
  },
  {
    id: 'gravitational-collapse',
    name: 'Gravitational Collapse',
    label: 'Jeans instability · the trigger',
    description:
      'A cloud collapses when gravity beats the pressure holding it up. Left ' +
      'alone, most clouds sit near the balance point — so collapse usually needs ' +
      'a shove: a passing spiral arm, a nearby supernova blast wave, or a ' +
      'collision between clouds.',
    factsKids: [
      'Gravity is always pulling the cloud inward. Gas pressure is always pushing outward. A star begins when gravity finally wins.',
      'Often something has to give the cloud a push — like a shock wave from an exploding star nearby.',
      'As the cloud falls inward it gets hotter, the same way a bicycle pump gets warm when you squeeze air into a tyre.',
    ],
    factsAdvanced: [
      'The Jeans criterion sets the threshold: a region collapses when its mass exceeds M_J ∝ T^{3/2} ρ^{-1/2}. Cold and dense both favour collapse, which is why 10 K clouds are the nurseries.',
      'Collapse is hierarchical. As density rises, the Jeans mass falls, so a collapsing region fragments into smaller ones — which is why stars form in clusters rather than one at a time.',
      'Free-fall time is t_ff ∝ ρ^{-1/2}, of order a few hundred thousand to a million years for typical cloud-core densities.',
    ],
  },
  {
    id: 'protostar',
    name: 'The Protostar Stage',
    label: 'Pre-main-sequence · gravity-powered',
    description:
      'Before fusion starts, a forming star shines anyway — on gravity alone. ' +
      'Infalling material converts potential energy into heat, and the protostar ' +
      'glows in the infrared inside its dusty cocoon while the core climbs toward ' +
      'ignition temperature.',
    factsKids: [
      'A baby star glows before it can make its own fuel — the heat comes from falling gas, not from fusion yet.',
      'Baby stars are wrapped in thick dust, so we usually see them with infrared telescopes that can see heat through the dust.',
      'It takes the Sun about 50 million years to grow up — a long time for us, but a blink for a star that then shines for 10 billion.',
    ],
    factsAdvanced: [
      'Pre-main-sequence luminosity is Kelvin–Helmholtz contraction, not fusion: the star radiates roughly half the released gravitational energy and stores the rest as internal heat, per the virial theorem.',
      'Low-mass protostars descend nearly vertical Hayashi tracks (fully convective, near-constant T_eff); higher-mass ones cross horizontal Henyey tracks at near-constant luminosity once a radiative core forms.',
      'Deuterium ignites first, around 10⁶ K — well below the ~10⁷ K needed for the proton–proton chain. Deuterium burning briefly stalls contraction and helps set the birthline where protostars first become optically visible.',
    ],
  },
  {
    id: 'accretion-disks',
    name: 'Accretion Disks & Jets',
    label: 'Angular momentum · the flattening',
    description:
      'Collapsing clouds always rotate a little, and rotation cannot be thrown ' +
      'away — so infalling material flattens into a disk. That disk feeds the ' +
      'star, launches bipolar jets along the rotation axis, and is where planets ' +
      'are built from the leftovers.',
    factsKids: [
      'Spinning gas flattens into a disk, the same way pizza dough spreads into a circle when you spin it.',
      'Planets are built from the leftovers in that disk — which is why the planets in our Solar System all orbit in nearly the same flat plane.',
      'Baby stars shoot enormous jets of gas out of their top and bottom, like a cosmic sprinkler.',
    ],
    factsAdvanced: [
      'The angular momentum problem is central: a cloud core rotating imperceptibly slowly still carries far too much angular momentum to collapse directly onto a star. Disks, jets, and magnetic braking are how it is shed.',
      'Herbig–Haro objects are the shocked knots where those bipolar jets slam into surrounding cloud material at hundreds of km/s.',
      'Disk lifetimes are short — of order a few million years — which sets a hard deadline for giant-planet cores to form and capture their gas envelopes.',
    ],
  },
  {
    id: 'ignition',
    name: 'Ignition',
    label: 'Zero-age main sequence · fusion begins',
    description:
      'When the core reaches roughly 10 million kelvin, hydrogen fusion switches ' +
      'on and the energy released finally pushes back hard enough to halt the ' +
      'collapse. The star settles onto the main sequence and stops shrinking. ' +
      'That balance point is where it will spend about 90% of its life.',
    factsKids: [
      'When the middle of the star gets to about 10 million degrees, fusion switches on and the star stops shrinking.',
      'From then on the star is in a tug-of-war it can hold for billions of years: gravity pulling in, energy pushing out.',
      'Our Sun switched on about 4.6 billion years ago and is only halfway through its fuel.',
    ],
    factsAdvanced: [
      'The zero-age main sequence (ZAMS) is the locus where nuclear energy generation first fully balances surface losses and contraction stops.',
      'Objects between ~13 and ~80 Jupiter masses ignite deuterium (and lithium, above ~65 M_Jup) but never sustain hydrogen fusion. They cool forever — brown dwarfs have no main sequence.',
      'The transition is self-regulating: fusion rate scales steeply with temperature, so any overshoot expands the core, cools it, and throttles the reaction back.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section B — what holds a star up (ST-010 → ST-019)
 * ------------------------------------------------------------------ */

export const STELLAR_STRUCTURE = [
  {
    id: 'hydrostatic-equilibrium',
    name: 'Hydrostatic Equilibrium',
    label: 'The standoff · gravity vs pressure',
    description:
      'A star is a sphere in permanent standoff. At every depth, the outward ' +
      'pressure of hot plasma exactly supports the weight of everything above it. ' +
      'Break the balance either way and the star responds within minutes — which ' +
      'is why stars are so extraordinarily stable over billions of years.',
    factsKids: [
      'A star is a balancing act: gravity squeezing in, hot gas pushing out. They are perfectly matched.',
      'If the pushing stopped, the Sun would collapse in less than an hour.',
      'This balance is why the Sun has shone at almost exactly the same brightness for your whole life, and your grandparents\' whole lives.',
    ],
    factsAdvanced: [
      'Formally dP/dr = −ρ(r) g(r): the pressure gradient at every radius supports the local weight. Solve it with an energy-transport equation and an equation of state and you have a stellar model.',
      'The dynamical (free-fall) timescale for the Sun is about 30 minutes. Any imbalance is corrected on that timescale, which is why observed stars sit so precisely on the equilibrium solution.',
      'The thermostat is nuclear: the pp-chain rate scales as roughly T⁴ near solar core conditions, so a small core expansion sharply cuts energy output and restores balance.',
    ],
  },
  {
    id: 'hydrogen-fusion',
    name: 'Hydrogen Fusion',
    label: 'pp-chain · CNO cycle',
    description:
      'Four hydrogen nuclei become one helium nucleus, and the helium weighs ' +
      'about 0.7% less than the hydrogen did. That missing mass leaves as energy. ' +
      'Low-mass stars do it through the proton–proton chain; stars heavier than ' +
      'about 1.3 solar masses switch to the far more temperature-sensitive ' +
      'CNO cycle.',
    factsKids: [
      'Stars run on hydrogen, the simplest and most common stuff in the universe.',
      'Four hydrogen bits get squeezed into one helium bit, and the leftover turns into light and heat.',
      'The Sun turns about 600 million tonnes of hydrogen into helium every single second — and it has enough left for another 5 billion years.',
    ],
    factsAdvanced: [
      'Fusing 4 ¹H → ⁴He releases 26.73 MeV, about 0.7% of the rest mass. The Sun converts roughly 4.3 million tonnes of mass into energy per second.',
      'The pp-chain\'s first step, p + p → d + e⁺ + νₑ, requires a weak-interaction beta decay during the collision. It is so improbable that a given proton in the solar core waits billions of years — the bottleneck that makes stars long-lived at all.',
      'The CNO cycle uses carbon, nitrogen, and oxygen as catalysts and scales as roughly T¹⁵–T²⁰. That extreme sensitivity concentrates energy generation in a tiny central volume and drives convective cores in massive stars.',
      'Classical physics forbids this entirely: at 15.7 million K, protons lack the energy to cross the Coulomb barrier. Fusion proceeds only by quantum tunnelling.',
    ],
  },
  {
    id: 'energy-transport',
    name: 'Radiation & Convection Zones',
    label: 'Energy transport · the long climb out',
    description:
      'Energy made in the core has to reach the surface. Where the gas is ' +
      'transparent enough it travels as radiation, photons scattering endlessly ' +
      'from particle to particle. Where the gas becomes opaque, radiation stalls ' +
      'and the plasma physically boils instead — convection, the same as a pot ' +
      'on a stove.',
    factsKids: [
      'Light made in the middle of the Sun takes tens of thousands of years to bounce its way out to the surface.',
      'Near the surface the Sun actually boils, like soup — hot plasma rises, cools, and sinks again.',
      'You can see the boiling: the Sun\'s surface is covered in granules, each one a rising bubble of plasma roughly the size of a country.',
    ],
    factsAdvanced: [
      'The Sun\'s radiative zone runs from the core to about 0.71 R☉; the convective envelope carries energy the rest of the way. In M dwarfs the star is fully convective; in massive stars the arrangement inverts — convective core, radiative envelope.',
      'A photon\'s escape is a random walk with a mean free path of order a centimetre. Estimates of the escape time range from ~10⁴ to ~10⁵ years depending on the model — either way, sunlight is ancient energy in new photons.',
      'Neutrinos, by contrast, leave the core in about two seconds and cross to Earth in eight minutes. They are the only direct real-time probe of the solar core, and measuring them exposed the solar neutrino problem — resolved in 2001–02 by neutrino flavour oscillation, not by any error in stellar models.',
      'The tachocline, the shear layer between the rigidly rotating radiative interior and the differentially rotating convective envelope, is where the solar magnetic dynamo is thought to be seated.',
    ],
  },
  {
    id: 'stellar-atmosphere',
    name: 'The Stellar Atmosphere',
    label: 'Photosphere · chromosphere · corona',
    description:
      'A star has no surface — only a depth where it becomes transparent. That ' +
      'is the photosphere, the visible disc. Above it lie the thin chromosphere ' +
      'and the enormous, tenuous corona, which is hundreds of times hotter than ' +
      'the surface beneath it for reasons still not fully settled.',
    factsKids: [
      'The Sun has no solid surface to stand on. What looks like a surface is just where it stops being see-through.',
      'The Sun\'s outer atmosphere — the corona — is far hotter than its surface. Scientists still argue about why.',
      'You can see the corona during a total solar eclipse: a pearly crown around the black disc of the Moon.',
    ],
    factsAdvanced: [
      'The photosphere is only a few hundred kilometres deep on a 696,000 km radius — a skin thinner in proportion than an apple\'s. Its effective temperature is 5772 K by IAU nominal definition.',
      'The corona reaches 1–3 million K above a 5772 K photosphere. Coronal heating remains an open problem; the leading candidates are nanoflare reconnection and Alfvén-wave dissipation, and Parker Solar Probe was built to fly through the region and discriminate between them.',
      'Limb darkening is a direct probe of the temperature gradient: at the limb your line of sight exits at shallower depth, sampling cooler, dimmer layers. Any physically honest star render reproduces it.',
    ],
  },
  {
    id: 'magnetic-fields',
    name: 'Stellar Magnetism',
    label: 'Dynamo · spots · flares',
    description:
      'Rotating convective plasma generates magnetic field. Where field bundles ' +
      'pierce the surface they choke off convection and leave cooler, darker ' +
      'patches — starspots. When twisted field lines snap and reconnect, they ' +
      'release the stored energy as flares and mass ejections.',
    factsKids: [
      'Sunspots are dark because they are cooler than the rest of the surface — but they would still be blindingly bright on their own.',
      'The Sun has a magnetic field, like a giant version of a fridge magnet, and it gets tangled up as the Sun spins.',
      'When the tangles snap, the Sun throws out huge bursts of energy. Those bursts cause the Northern Lights on Earth.',
    ],
    factsAdvanced: [
      'Sunspots run about 3,000–4,500 K against a 5,772 K photosphere. They are dark only by contrast — a sunspot removed to empty space would outshine a full moon.',
      'The sunspot cycle is ~11 years, but the full magnetic Hale cycle is ~22: polarity reverses each sunspot cycle and returns only after two.',
      'Coronal mass ejections carry ~10¹²–10¹³ kg of plasma at up to ~3,000 km/s. The 1859 Carrington Event set telegraph systems on fire; the same event today is a first-order infrastructure risk.',
      'Magnetic braking bleeds angular momentum through the stellar wind, so stars spin down predictably as they age — the basis of gyrochronology, one of the few practical ways to date a field star.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section C — measuring stars (ST-021 → ST-040)
 * ------------------------------------------------------------------ */

export const STELLAR_MEASUREMENT = [
  {
    id: 'magnitude',
    name: 'The Magnitude Scale',
    label: 'Brightness · backwards, and logarithmic',
    description:
      'Astronomy still ranks brightness on a scheme inherited from Hipparchus in ' +
      'the second century BCE: brightest stars "first magnitude", faintest ' +
      '"sixth". It runs backwards — smaller means brighter — and it is ' +
      'logarithmic, because human vision is.',
    factsKids: [
      'Brighter stars have smaller numbers. The brightest star in the night sky, Sirius, has a negative number.',
      'The system is over 2,000 years old — we still use the Greek astronomer Hipparchus\' rankings.',
      'Your eyes can see down to about magnitude 6 from a dark place, but barely magnitude 3 from a bright city.',
    ],
    factsAdvanced: [
      'Five magnitudes were fixed as exactly a factor of 100 in flux, so one magnitude is 100^(1/5) ≈ 2.512×.',
      'Apparent magnitude (m) is how bright a star looks; absolute magnitude (M) is how bright it would look at exactly 10 parsecs. The distance modulus m − M = 5 log₁₀(d/10 pc) connects them.',
      'The Sun: m = −26.74, M = +4.83. Move the Sun to 10 pc and it becomes an unremarkable naked-eye star, invisible from most cities.',
      'Bolometric magnitude integrates all wavelengths. It matters enormously for the extremes — an O star radiates mostly in the ultraviolet and an M dwarf mostly in the infrared, so visual magnitude badly understates both.',
    ],
  },
  {
    id: 'parallax',
    name: 'Parallax & the Parsec',
    label: 'Distance · the only direct rung',
    description:
      'Hold a finger up and blink each eye in turn: it shifts against the ' +
      'background. Earth\'s orbit gives astronomy a baseline 2 AU wide, and the ' +
      'tiny annual wobble of a nearby star against distant ones gives its ' +
      'distance by geometry alone — no assumptions about the star required.',
    factsKids: [
      'Hold your thumb out and close one eye, then the other. Your thumb jumps. Astronomers use the same trick with stars.',
      'Instead of two eyes, they use Earth on opposite sides of its orbit, six months apart.',
      'Even the nearest star wobbles by less than the width of a human hair seen from two kilometres away.',
    ],
    factsAdvanced: [
      'A parsec is the distance at which one AU subtends one arcsecond — 3.26 light-years. d(pc) = 1 / p(arcsec).',
      'Friedrich Bessel measured the first stellar parallax in 1838 (61 Cygni, ~0.31″). Not one star is close enough to show a full arcsecond: even Proxima Centauri manages only 0.77″.',
      'Gaia measured parallaxes and motions for about 1.8 billion sources at microarcsecond precision, extending direct geometric distances across a large fraction of the Galaxy and re-calibrating every rung of the distance ladder above it.',
      'Parallax is the only rung of the ladder that is pure geometry. Everything beyond it — spectroscopic parallax, Cepheids, Type Ia supernovae — is calibrated against it, so a systematic error here propagates to the Hubble constant.',
    ],
  },
  {
    id: 'standard-candles',
    name: 'Standard Candles',
    label: 'Cepheids · the period–luminosity law',
    description:
      'Some stars announce their own true brightness. Cepheid variables pulse ' +
      'with a period set by their luminosity — time the pulse and you know how ' +
      'bright the star really is, and comparing that to how bright it looks gives ' +
      'the distance. This is how the size of the universe was first measured.',
    factsKids: [
      'Some stars blink in and out slowly, like a lighthouse. The slower they blink, the brighter they truly are.',
      'That means you can work out how far away they are — the same way a car headlight looks dim when it is far away.',
      'This trick proved that other galaxies exist, and that they are unimaginably far outside our own.',
    ],
    factsAdvanced: [
      'Henrietta Swan Leavitt found the period–luminosity relation in 1912 from Cepheids in the Small Magellanic Cloud — all at effectively the same distance, so apparent brightness ranked true brightness directly.',
      'Edwin Hubble used a Cepheid in M31 in 1923–24 to prove the "spiral nebulae" lie far outside the Milky Way, settling the Great Debate and enlarging the known universe by orders of magnitude overnight.',
      'The pulsation mechanism is the κ-mechanism: a helium ionisation layer becomes more opaque when compressed, traps radiation, expands, ionises further, becomes transparent, and releases — a genuine heat engine.',
      'Type Ia supernovae extend the ladder much further, standardised through the Phillips relation between peak luminosity and decline rate.',
    ],
  },
  {
    id: 'color-temperature',
    name: 'Colour & Temperature',
    label: 'Blackbody · the Planckian locus',
    description:
      'A star\'s colour is a thermometer. Hot things glow blue-white, cooler ' +
      'things red — the same progression as heated iron. This is why star colour ' +
      'is never a stylistic choice in this app: the shader maps temperature to ' +
      'chromaticity along the real Planckian locus.',
    factsKids: [
      'Star colours are real, and they tell you the temperature. Blue-white stars are the hottest; red stars are the coolest.',
      'It is backwards from taps at home — on a star, red is the cool one and blue is the scorching one.',
      'Look at Orion on a winter night: Betelgeuse in the shoulder is orange-red, Rigel in the foot is blue-white. You can see the difference with your own eyes.',
    ],
    factsAdvanced: [
      'Wien\'s displacement law puts the peak at λ_max ≈ 2.898×10⁶ nm·K / T. The Sun at 5772 K peaks around 500 nm, in the green — yet it looks white, because the eye integrates the whole curve.',
      'Stefan–Boltzmann gives L = 4πR²σT⁴. The fourth power is why a modest temperature difference produces an enormous luminosity difference, and why radius must be inferred jointly with temperature.',
      'Photometric colour indices (B−V, and Gaia\'s BP−RP) are the practical proxy for temperature, after correcting for interstellar reddening — dust scatters blue light preferentially and makes distant stars look artificially cool.',
      'This app\'s blackbody node is anchored to Mitchell Charity\'s published 10° CMF colour table and interpolated on the mired axis (10⁶/T), where perceptual shift is closest to linear.',
    ],
  },
  {
    id: 'mass-radius',
    name: 'Mass, Radius & Luminosity',
    label: 'The mass–luminosity relation',
    description:
      'Mass is a star\'s destiny. It sets the luminosity, the temperature, the ' +
      'colour, the lifetime, and the manner of death. And luminosity climbs far ' +
      'faster than mass — which is the cruel arithmetic behind why the biggest ' +
      'stars die youngest.',
    factsKids: [
      'How heavy a star is decides everything else about it — how bright it is, what colour, and how long it lives.',
      'Big stars burn their fuel wildly fast. The heaviest ones live only a few million years.',
      'Small red stars are misers. They will still be shining trillions of years from now, long after the Sun is gone.',
    ],
    factsAdvanced: [
      'For main-sequence stars L ∝ M^3.5 approximately. Fuel scales as M but consumption as M^3.5, so lifetime scales as roughly M^−2.5.',
      'A 10 M☉ star has ten times the fuel and burns it about 3,000 times faster: tens of millions of years, against the Sun\'s ~10 billion.',
      'Eclipsing binaries are the gold standard for stellar mass — combining radial velocities with eclipse geometry yields both masses and both radii without modelling assumptions.',
      'The observed main sequence spans roughly 0.08 to ~150+ M☉. The upper end is set by the Eddington limit, where radiation pressure begins to unbind the star\'s own outer layers.',
    ],
  },
  {
    id: 'metallicity',
    name: 'Metallicity',
    label: 'Composition · everything past helium',
    description:
      'Astronomers call every element heavier than helium a "metal", carbon and ' +
      'oxygen included. A star\'s metal content is a birth certificate: the ' +
      'universe began with essentially none, so metal-poor stars are old, and ' +
      'metal-rich ones formed from gas already enriched by earlier generations.',
    factsKids: [
      'The very first stars were made of only hydrogen and helium. Everything else had to be built inside stars.',
      'The calcium in your bones and the iron in your blood were made inside stars that died before the Sun was born.',
      'Older stars have fewer heavy ingredients, because there had been fewer stars before them to make any.',
    ],
    factsAdvanced: [
      'Metallicity is quoted as [Fe/H] = log₁₀(N_Fe/N_H)_star − log₁₀(N_Fe/N_H)_Sun. The Sun is 0 by construction; [Fe/H] = −1 means one-tenth solar iron.',
      'Population I stars (metal-rich, thin disk) are young; Population II (metal-poor, halo and globular clusters) are old. Population III — the hypothesised zero-metallicity first stars — has never been observed.',
      'Metallicity governs opacity, which feeds back into structure, mass loss, and evolutionary tracks. Low-metallicity massive stars keep more mass and die differently.',
      'Giant-planet occurrence correlates strongly with host-star metallicity, which is direct observational support for core-accretion planet formation.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section D — spectral classification (ST-041 → ST-060)
 * ------------------------------------------------------------------ */

export const SPECTRAL_CLASSES = [
  {
    id: 'class-o',
    name: 'Class O',
    label: 'Blue · ≳33,000 K · rarest and fiercest',
    temp: [33000, 55000],
    colorHint: 0x9bb0ff,
    description:
      'The hottest, most massive, most luminous main-sequence stars — and the ' +
      'rarest by an enormous margin. They ionise entire nebulae around them, ' +
      'blow their own mass away in fierce winds, and die young and violently.',
    factsKids: [
      'Class O stars are the hottest stars of all — blue-white and blindingly bright.',
      'They are extremely rare. Out of every few million stars, only about one is an O star.',
      'They live fast: only a few million years, then they explode.',
    ],
    factsAdvanced: [
      'Effective temperatures above ~33,000 K, masses of 16–150+ M☉, luminosities up to ~10⁶ L☉. Spectra show ionised helium (He II) — the defining signature, requiring the most extreme temperatures.',
      'They comprise roughly 0.00003% of main-sequence stars — about one in three million — yet dominate the ultraviolet output and mechanical feedback of a whole star-forming region.',
      'Radiation-driven winds strip 10⁻⁷–10⁻⁵ M☉ per year, so an O star can shed a substantial fraction of its birth mass before it dies.',
    ],
  },
  {
    id: 'class-b',
    name: 'Class B',
    label: 'Blue-white · 10,000–33,000 K',
    temp: [10000, 33000],
    colorHint: 0xaabfff,
    description:
      'Hot, luminous blue-white stars — the ones that dominate the bright ' +
      'patterns of the night sky. Rigel, Spica, and most of Orion\'s belt are ' +
      'class B. Neutral helium lines are their signature.',
    factsKids: [
      'Class B stars are blue-white and very bright. Many of the famous stars in Orion are class B.',
      'They are much rarer than red stars, but you see lots of them at night because they shine so brightly from far away.',
      'They live for tens or hundreds of millions of years — short, for a star.',
    ],
    factsAdvanced: [
      'Neutral helium (He I) peaks at B2; hydrogen Balmer lines strengthen toward the cool end. Masses run 2.1–16 M☉.',
      'Class B is roughly 0.13% of main-sequence stars, yet heavily over-represented among naked-eye stars — a pure selection effect, since luminous stars are visible from much greater distances (Malmquist bias).',
      'Be stars are a common subtype: rapid rotation throws off a decretion disk, adding hydrogen emission lines to the spectrum.',
    ],
  },
  {
    id: 'class-a',
    name: 'Class A',
    label: 'White · 7,300–10,000 K · hydrogen lines strongest',
    temp: [7300, 10000],
    colorHint: 0xcad7ff,
    description:
      'White stars with the strongest hydrogen absorption lines of any class — ' +
      'which is exactly why the alphabet is out of order. Sirius, Vega, Altair, ' +
      'and Deneb are all class A.',
    factsKids: [
      'Class A stars are brilliant white. Sirius, the brightest star in our night sky, is one of them.',
      'The letters O B A F G K M look jumbled because they were first sorted a different way, then re-sorted by temperature and never renamed.',
      'Vega, a class A star, was used for over a century as the standard for "how bright is bright".',
    ],
    factsAdvanced: [
      'Balmer lines peak here — not because A stars have the most hydrogen, but because ~9,500 K is the optimum for populating the n=2 level from which Balmer absorption occurs. Hotter, and hydrogen ionises; cooler, and too few atoms are excited.',
      'That misreading is the origin of the alphabet: Draper\'s original scheme ranked A–Q by hydrogen line strength. Annie Jump Cannon reordered the surviving classes into the temperature sequence O B A F G K M and classified several hundred thousand stars for the Henry Draper Catalogue.',
      'Cecilia Payne-Gaposchkin\'s 1925 doctoral thesis showed the pattern reflects ionisation physics, not composition — establishing that stars are overwhelmingly hydrogen. It was called "the most brilliant PhD thesis ever written in astronomy".',
    ],
  },
  {
    id: 'class-f',
    name: 'Class F',
    label: 'Yellow-white · 6,000–7,300 K',
    temp: [6000, 7300],
    colorHint: 0xf8f7ff,
    description:
      'Slightly hotter and more massive than the Sun, yellow-white, with metal ' +
      'absorption lines strengthening as hydrogen fades. Procyon and Polaris are ' +
      'class F.',
    factsKids: [
      'Class F stars are a little hotter and whiter than our Sun.',
      'Polaris, the North Star, is a class F star.',
      'They live for a few billion years — long, but not as long as the Sun will.',
    ],
    factsAdvanced: [
      'Masses 1.04–1.4 M☉, lifetimes of a few billion years. Ionised calcium (Ca II H and K) becomes prominent as the Balmer lines weaken.',
      'The Kraft break falls near F5: hotter stars lack thick convective envelopes and stay rapid rotators, while cooler ones spin down through magnetic braking.',
      'F stars sit at the boundary of the classical instability strip — Polaris itself is a Cepheid, though with an unusually small amplitude that has changed measurably within the last century.',
    ],
  },
  {
    id: 'class-g',
    name: 'Class G',
    label: 'Yellow · 5,300–6,000 K · the Sun\'s class',
    temp: [5300, 6000],
    colorHint: 0xfff4ea,
    description:
      'The Sun\'s class: yellow stars with strong ionised-calcium lines and rich ' +
      'metal spectra. Long-lived enough for complex chemistry to have time, ' +
      'which is why they attract so much attention in the search for life.',
    factsKids: [
      'Our Sun is a class G star — a perfectly ordinary yellow star, one of billions.',
      'The Sun actually looks white from space. It appears yellow from the ground because our air scatters away the blue light.',
      'Class G stars live around 10 billion years, which is plenty of time for planets and life to develop.',
    ],
    factsAdvanced: [
      'Masses 0.8–1.04 M☉, main-sequence lifetimes ~10 billion years, about 7.5% of main-sequence stars. The Sun is G2V.',
      'The "yellow dwarf" label is doubly misleading: G stars are white to the eye above the atmosphere, and the Sun is more luminous than about 85% of stars in the Galaxy — hardly a dwarf by any ordinary sense.',
      'Alpha Centauri A is the nearest G star (G2V, essentially a solar twin at 4.37 ly) and remains the best-observed analogue for what the Sun looks like from outside.',
    ],
  },
  {
    id: 'class-k',
    name: 'Class K',
    label: 'Orange · 3,900–5,300 K',
    temp: [3900, 5300],
    colorHint: 0xffd2a1,
    description:
      'Orange stars, cooler and smaller than the Sun, with strong metal lines and ' +
      'the first molecular bands appearing at the cool end. Increasingly argued ' +
      'to be the best places to look for life.',
    factsKids: [
      'Class K stars are orange and a bit smaller and cooler than the Sun.',
      'Alpha Centauri B — one of our nearest neighbours — is a class K star.',
      'They live much longer than the Sun: 20 to 70 billion years, longer than the universe has existed so far.',
    ],
    factsAdvanced: [
      'Masses 0.45–0.8 M☉, lifetimes of 20–70 billion years — longer than the current age of the universe, so no K dwarf has ever left the main sequence.',
      '"Goldilocks stars": more numerous and far longer-lived than G stars, but without the flare violence and tidal-locking problems that complicate habitability around M dwarfs.',
      'Molecular bands — TiO, CN, CH — begin appearing at late K and take over completely in class M.',
    ],
  },
  {
    id: 'class-m',
    name: 'Class M',
    label: 'Red · 2,300–3,900 K · the silent majority',
    temp: [2300, 3900],
    colorHint: 0xffcc6f,
    description:
      'Red dwarfs: the most common stars in the universe by a wide margin, and ' +
      'not one of them is visible to the naked eye. Dim, cool, fully convective, ' +
      'and effectively immortal on any timescale that matters.',
    factsKids: [
      'Red dwarfs are the most common stars in the whole universe — about three out of every four stars.',
      'But you cannot see a single one without a telescope. They are far too dim.',
      'They live for trillions of years. Not one red dwarf that has ever formed has had time to die.',
    ],
    factsAdvanced: [
      'About 76% of main-sequence stars, masses 0.08–0.45 M☉, luminosities as low as 10⁻⁴ L☉. Proxima Centauri, Barnard\'s Star, and Wolf 359 are all M dwarfs — the three nearest stellar systems after the Sun.',
      'Below ~0.35 M☉ they are fully convective, mixing hydrogen from the whole star into the core. Lifetimes reach into the trillions of years — longer than the universe has existed by orders of magnitude.',
      'TiO molecular bands dominate the optical spectrum. Flare activity is severe: a modest M dwarf flare can briefly multiply the star\'s ultraviolet output, which is the central objection to habitability around them.',
      'Their spectral sequence continues past M into L, T, and Y — brown dwarfs, added in the 1990s and 2000s as infrared surveys found objects colder than any classical class.',
    ],
  },
]

export const LUMINOSITY_CLASSES = [
  { id: '0', roman: '0 / Ia+', name: 'Hypergiant', note: 'Extreme luminosity and mass loss; a handful known.' },
  { id: 'Ia', roman: 'Ia', name: 'Luminous supergiant', note: 'Deneb, Rigel.' },
  { id: 'Iab', roman: 'Iab', name: 'Intermediate supergiant', note: 'Betelgeuse, Antares.' },
  { id: 'Ib', roman: 'Ib', name: 'Less luminous supergiant', note: 'Polaris.' },
  { id: 'II', roman: 'II', name: 'Bright giant', note: 'Between giants and supergiants.' },
  { id: 'III', roman: 'III', name: 'Giant', note: 'Arcturus, Aldebaran, Pollux.' },
  { id: 'IV', roman: 'IV', name: 'Subgiant', note: 'Leaving the main sequence; Procyon A.' },
  { id: 'V', roman: 'V', name: 'Main sequence (dwarf)', note: 'The Sun, Sirius A, Vega.' },
  { id: 'VI', roman: 'VI / sd', name: 'Subdwarf', note: 'Metal-poor, underluminous halo stars.' },
  { id: 'VII', roman: 'VII / D', name: 'White dwarf', note: 'Sirius B. Stellar ash, no fusion.' },
]

/* ------------------------------------------------------------------ *
 * Section E — the H-R diagram (ST-061 → ST-080)
 * ------------------------------------------------------------------ */

export const HR_DIAGRAM = {
  id: 'hr-diagram',
  name: 'The Hertzsprung–Russell Diagram',
  label: 'Luminosity vs temperature · the master chart',
  description:
    'Plot every star by temperature along the bottom and luminosity up the ' +
    'side, and they refuse to scatter randomly. They fall into a diagonal band ' +
    'and a few distinct clumps. That structure is stellar evolution made ' +
    'visible — the single most useful diagram in astronomy.',
  factsKids: [
    'If you make a chart of stars by how hot and how bright they are, they line up in a pattern instead of scattering everywhere.',
    'Most stars sit along one long diagonal stripe called the main sequence. Our Sun is on it.',
    'The chart is drawn backwards on purpose — hot stars go on the left — because that is how the first astronomers drew it and nobody wanted to change it.',
  ],
  factsAdvanced: [
    'Ejnar Hertzsprung (1911) and Henry Norris Russell (1913) arrived at it independently; Russell\'s published plot gave it the axes still used today, with temperature increasing leftward.',
    'About 90% of stars lie on the main sequence — not because it is a preferred place, but because core hydrogen burning is the longest phase of any star\'s life. The diagram is a census weighted by duration.',
    'Fitting a cluster\'s main-sequence turnoff dates the cluster: the turnoff mass is precisely the mass whose main-sequence lifetime equals the cluster age. This is how globular clusters were shown to be ~12–13 billion years old.',
    'Position is not a fate a star is stuck with. It tracks left and up the pre-main-sequence, sits on the main sequence, then swings right and up onto the giant branch as the core exhausts hydrogen.',
  ],
  regions: [
    { id: 'main-sequence', name: 'Main sequence', note: 'Core hydrogen burning. ~90% of stars, running hot-and-luminous to cool-and-faint.' },
    { id: 'subgiants', name: 'Subgiant branch', note: 'Core hydrogen exhausted; shell burning begins and the envelope starts expanding.' },
    { id: 'red-giants', name: 'Red giant branch', note: 'Cool, enormous, luminous. Aldebaran and Arcturus live here.' },
    { id: 'horizontal', name: 'Horizontal branch', note: 'Core helium burning after the helium flash, at roughly constant luminosity.' },
    { id: 'agb', name: 'Asymptotic giant branch', note: 'Double shell burning; heavy mass loss builds a planetary nebula.' },
    { id: 'supergiants', name: 'Supergiants', note: 'Across the top. Betelgeuse, Rigel, Deneb — rare, brief, doomed.' },
    { id: 'instability-strip', name: 'Instability strip', note: 'A near-vertical band where stars pulsate: Cepheids and RR Lyrae.' },
    { id: 'white-dwarfs', name: 'White dwarfs', note: 'Lower left: hot but tiny, so very faint. The exposed cores of dead stars.' },
  ],
}

/* ------------------------------------------------------------------ *
 * Section F — lives and deaths (ST-081 → ST-100)
 * ------------------------------------------------------------------ */

export const STELLAR_EVOLUTION = [
  {
    id: 'main-sequence-life',
    name: 'Life on the Main Sequence',
    label: 'Core hydrogen burning · the long middle',
    description:
      'The main sequence is not a place stars travel along — it is the long, ' +
      'stable phase of core hydrogen burning, and a star barely moves during it. ' +
      'Where it sits on the band was decided at birth, by mass alone.',
    factsKids: [
      'A star spends most of its life quietly turning hydrogen into helium. For the Sun, that is about 10 billion years.',
      'The Sun is roughly halfway through. It is 4.6 billion years old and has about 5 billion left.',
      'Heavier stars do not live longer despite having more fuel — they live far shorter, because they burn it so recklessly.',
    ],
    factsAdvanced: [
      'A star spends about 90% of its nuclear-burning life here. Mass sets everything: luminosity, temperature, lifetime, and death.',
      'Stars do brighten slowly during this phase. The young Sun was roughly 70% as luminous as today — the faint young Sun paradox, since Earth nevertheless had liquid water.',
      'Main-sequence lifetime scales as roughly M^−2.5: a 0.2 M☉ red dwarf lasts trillions of years, the Sun ~10 billion, a 20 M☉ O star under 10 million.',
    ],
  },
  {
    id: 'red-giant',
    name: 'The Red Giant Phase',
    label: 'Shell burning · the great expansion',
    description:
      'When core hydrogen runs out, the core contracts and heats while a shell ' +
      'around it ignites. The extra energy inflates the envelope enormously and ' +
      'the surface cools as it expands — the star becomes vast, red, and ' +
      'luminous, all at once.',
    factsKids: [
      'When a star runs out of fuel in its middle, it swells up into a giant and turns red.',
      'When the Sun does this, it will swallow Mercury and Venus, and scorch the Earth.',
      'Do not worry — that is about 5 billion years away.',
    ],
    factsAdvanced: [
      'The core contracts and the envelope expands — counterintuitive, but a direct consequence of the shell-burning structure. The Sun will reach on the order of 200 R☉.',
      'In stars below ~2 M☉ the inert helium core becomes electron-degenerate, so the eventual helium ignition is explosive: the helium flash releases enormous power for seconds, entirely absorbed by the envelope and invisible from outside.',
      'Convection reaches deep during dredge-up episodes, hauling fusion products to the surface — which is why giants show altered carbon, nitrogen, and s-process abundances.',
      'Aldebaran and Arcturus are nearby red giants; Arcturus is a fair preview of the Sun\'s future.',
    ],
  },
  {
    id: 'white-dwarf',
    name: 'White Dwarfs',
    label: 'Degenerate ash · the common ending',
    description:
      'A star below about 8 solar masses ends by shrugging off its envelope as a ' +
      'planetary nebula and leaving the bare core behind: an Earth-sized ball of ' +
      'carbon and oxygen held up not by heat, but by quantum mechanics. This is ' +
      'how the Sun will end, and about 97% of all stars.',
    factsKids: [
      'Most stars end as a white dwarf: a hot, dead core about the size of Earth but as heavy as the Sun.',
      'A single teaspoon of white dwarf material would weigh about as much as an elephant.',
      'They do not shine by fusion any more — they are just slowly cooling down, like an ember pulled from a fire.',
    ],
    factsAdvanced: [
      'Support comes from electron degeneracy pressure, a consequence of the Pauli exclusion principle, not thermal pressure. It does not care about temperature — a white dwarf cools without shrinking.',
      'The Chandrasekhar limit is about 1.4 M☉. Above it, degeneracy pressure fails and the core collapses; a white dwarf pushed over the limit by accretion detonates as a Type Ia supernova.',
      'Roughly 97% of stars in the Milky Way, the Sun included, will end this way. The Sun will leave behind about 0.54 M☉.',
      'Cooling takes longer than the present age of the universe, so no black dwarf exists yet. Sirius B is the best-studied example — one solar mass in a body slightly smaller than Earth.',
    ],
  },
  {
    id: 'supernova',
    name: 'Core-Collapse Supernova',
    label: 'M ≳ 8 M☉ · the violent ending',
    description:
      'Massive stars fuse ever-heavier elements in nested shells until the core ' +
      'is iron — and iron fusion consumes energy instead of releasing it. Support ' +
      'vanishes in an instant, the core collapses in under a second, and the ' +
      'rebound tears the star apart.',
    factsKids: [
      'Really big stars do not fade away — they explode.',
      'For a few weeks, one exploding star can outshine an entire galaxy of billions of stars.',
      'The explosion scatters the elements the star made. The iron in your blood was once inside one of these.',
    ],
    factsAdvanced: [
      'Silicon burning builds an iron core in about a day. Iron has the highest binding energy per nucleon, so fusing it absorbs energy — the core loses support and collapses in well under a second, reaching a substantial fraction of light speed.',
      '99% of the energy leaves as neutrinos. SN 1987A in the Large Magellanic Cloud was detected in neutrinos hours before the light arrived — the first direct confirmation of the mechanism.',
      'The remnant is a neutron star, or a black hole above roughly 2–3 M☉ (the Tolman–Oppenheimer–Volkoff limit). The Crab Nebula\'s pulsar spins about 30 times a second.',
      'The Crab supernova of 1054 CE was recorded by Chinese and Japanese astronomers as a "guest star" visible in daylight for 23 days — this app renders its wreckage on the Nebula rung.',
    ],
  },
  {
    id: 'nucleosynthesis',
    name: 'Where the Elements Came From',
    label: 'Nucleosynthesis · the origin of everything',
    description:
      'The Big Bang made hydrogen, helium, and a trace of lithium. Every other ' +
      'element in your body was manufactured inside a star, or in the violence of ' +
      'its death, and scattered into the gas that later formed the Sun.',
    factsKids: [
      'The universe started with only the two lightest ingredients. Everything else was made later, inside stars.',
      'The carbon in your body, the oxygen you breathe, and the iron in your blood were all made inside stars that died long ago.',
      'Gold and platinum are made when two dead stars crash into each other.',
    ],
    factsAdvanced: [
      'Big Bang nucleosynthesis produced ¹H, ⁴He, and traces of ²H, ³He, and ⁷Li in the first few minutes — and essentially nothing heavier.',
      'The triple-alpha process builds carbon in giants; alpha capture takes it up to iron. Elements past iron cannot come from ordinary fusion, since it stops paying energetically.',
      'Roughly half of the elements heavier than iron form by slow neutron capture (s-process) in AGB stars, the rest by rapid capture (r-process) — and GW170817, a neutron-star merger observed in 2017 in both gravitational waves and light, confirmed such mergers as a major r-process site.',
      'Carbon and heavier elements are about 2% of the Sun\'s mass. All of it is recycled stellar material — the Sun is at least a second-generation star.',
    ],
  },
]

/** Every Phase STA concept entry, in teaching order. */
export const STELLAR_FOUNDATIONS = [
  ...STELLAR_FORMATION,
  ...STELLAR_STRUCTURE,
  ...STELLAR_MEASUREMENT,
  ...SPECTRAL_CLASSES,
  HR_DIAGRAM,
  ...STELLAR_EVOLUTION,
]
