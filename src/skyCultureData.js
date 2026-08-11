/**
 * Cultural astronomy, navigation & human sky knowledge —
 * BACKLOG Phase STD (ST-301 → ST-400).
 *
 * The human relationship layer: why people cared about the sky, and what they
 * built out of caring. Every entry carries the two-rung facts ladder
 * (factsLadder.js).
 *
 * The backlog sets a cultural review requirement that governs this file:
 *
 *   - Traditions are kept SEPARATE. There is no single "ancient astronomy"
 *     narrative here, because there was no single ancient astronomy.
 *   - Each entry declares its `evidence` class, so a reader can tell a dated
 *     cuneiform tablet from a stone alignment from a living oral tradition.
 *     These are different kinds of knowing and are not interchangeable.
 *   - Living traditions are written in the present tense. Polynesian
 *     wayfinding and Māori Matariki are practised now, not only historically.
 *   - Where an interpretation is contested, the entry says so instead of
 *     picking the tidier story.
 *
 * evidence: 'textual'        — dated written records survive
 *           'archaeological' — physical structures and alignments
 *           'oral'           — knowledge transmitted and held by a community
 *           'living'         — actively practised today
 *           'contested'      — the astronomical reading is genuinely disputed
 *
 * Pure data. No rendering imports.
 */

/* ------------------------------------------------------------------ *
 * Section P — ancient foundations (ST-301 → ST-320)
 * ------------------------------------------------------------------ */

export const ANCIENT_ASTRONOMY = [
  {
    id: 'why-the-sky-mattered',
    name: 'Why Humans Watched the Sky',
    region: 'Global',
    period: 'Prehistory onward',
    evidence: 'archaeological',
    description:
      'Before writing, before agriculture, before cities, people were tracking ' +
      'the sky — because it was the only reliable clock and calendar available. ' +
      'When to plant, when to move, when the rains come, when the herds migrate: ' +
      'every one of those answers was written overhead.',
    factsKids: [
      'Long before clocks and calendars, people used the stars to know when to plant crops and when winter was coming.',
      'The sky was the first calendar, the first clock, and the first map — all at once.',
      'Almost every culture on Earth made pictures out of the stars, but they made different pictures from the same stars.',
    ],
    factsAdvanced: [
      'Astronomy is plausibly the oldest science, because the payoff was immediate and agricultural: a reliable seasonal calendar is worth a harvest.',
      'The same handful of star groups recur across unconnected cultures — the Pleiades, Orion, and the Big Dipper above all — not through contact but because they are genuinely the most conspicuous patterns available.',
      'Sky knowledge is deeply practical before it is symbolic. Navigation, timekeeping, and seasonal prediction come first; mythology grows around a working system.',
    ],
  },
  {
    id: 'stonehenge',
    name: 'Stonehenge',
    region: 'Britain',
    period: 'c. 3000–2000 BCE',
    evidence: 'archaeological',
    description:
      'The most famous astronomical alignment in the world, and one of the most ' +
      'over-interpreted. The solstice axis is solidly established; the more ' +
      'elaborate claims about eclipse prediction are not.',
    factsKids: [
      'Stonehenge is lined up with the sunrise on the longest day of the year, and the sunset on the shortest.',
      'It was built over hundreds of years, starting about 5,000 years ago.',
      'Thousands of people still gather there every midsummer to watch the sunrise.',
    ],
    factsAdvanced: [
      'The principal axis aligns to midsummer sunrise in one direction and midwinter sunset in the other. That alignment is not in serious dispute.',
      'Claims that the monument functioned as an eclipse computer — Gerald Hawkins\' 1960s "Stonehenge Decoded" and Fred Hoyle\'s elaborations — are not accepted by most archaeologists, who read the site as primarily ceremonial and funerary with a deliberate solar alignment.',
      'Midwinter may have been the more important orientation: the faunal evidence points to large midwinter gatherings rather than midsummer ones.',
    ],
  },
  {
    id: 'nabta-playa',
    name: 'Nabta Playa',
    region: 'Nubian Desert, southern Egypt',
    period: 'c. 5000–4500 BCE',
    evidence: 'contested',
    description:
      'A stone circle in the Sahara, older than Stonehenge, built by a ' +
      'cattle-herding people at a seasonal lake. Its astronomical function is ' +
      'plausible and widely discussed, but the specific alignments claimed for ' +
      'it remain genuinely disputed.',
    factsKids: [
      'This stone circle in the Egyptian desert is even older than Stonehenge.',
      'It was built by people who followed the rains with their cattle.',
      'Scientists still argue about exactly what it was lining up with.',
    ],
    factsAdvanced: [
      'The small stone circle has been argued to mark the summer solstice sunrise, which coincided with the arrival of the monsoon rains — a life-or-death event for herders in a seasonal-lake environment.',
      'Further claimed alignments to Sirius, Arcturus, and Orion\'s Belt depend on assumed construction dates and sightline choices, and are considerably weaker than the solstice case.',
      'It is included here precisely as a worked example of how to read archaeoastronomy sceptically: a genuine monument, a plausible core claim, and a superstructure of less-supported detail.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section Q — Mesopotamian, Egyptian & Greek (ST-321 → ST-340)
 * ------------------------------------------------------------------ */

export const MEDITERRANEAN_ASTRONOMY = [
  {
    id: 'babylonian',
    name: 'Babylonian Astronomy',
    region: 'Mesopotamia (modern Iraq)',
    period: 'c. 1800 BCE – 100 CE',
    evidence: 'textual',
    description:
      'The most consequential astronomical tradition in history, and the least ' +
      'credited. Babylonian scribes kept systematic, dated observational records ' +
      'for well over a thousand years and turned them into genuinely predictive ' +
      'mathematics — the foundation Greek astronomy was built on.',
    factsKids: [
      'The way we measure circles in 360 degrees, and hours in 60 minutes, comes from ancient Babylon.',
      'They wrote star records on clay tablets, and some of those tablets still exist today.',
      'They could predict eclipses without knowing what caused them, just by spotting the pattern in their records.',
    ],
    factsAdvanced: [
      'MUL.APIN, compiled around 1000 BCE, is a systematic star catalogue and astronomical compendium listing heliacal risings, constellations, and intercalation rules.',
      'The sexagesimal (base-60) system gives us the 360° circle, 60-minute hour, and 60-second minute. It survives because 60 divides cleanly by 2, 3, 4, 5, and 6.',
      'The saros cycle — 18 years, 11 days, 8 hours — let them predict eclipses from recorded periodicity alone, without any physical model of what an eclipse is. Prediction preceded explanation by centuries.',
      'The Babylonian zodiac of twelve equal 30° signs, introduced in the fifth century BCE, is the direct ancestor of both Western astronomy\'s coordinate conventions and Western astrology.',
    ],
  },
  {
    id: 'egyptian',
    name: 'Ancient Egyptian Astronomy',
    region: 'Egypt',
    period: 'c. 3000 BCE – 300 CE',
    evidence: 'textual',
    description:
      'Egyptian astronomy was calendrical and architectural: a civil calendar ' +
      'built on the star Sirius, a night-hour system built on 36 star groups, ' +
      'and monuments aligned with striking precision to the cardinal directions.',
    factsKids: [
      'The Egyptians knew the Nile was about to flood when Sirius first appeared in the dawn sky. Their whole year started from it.',
      'They divided the night into hours using 36 groups of stars — which is where our 24-hour day partly comes from.',
      'The Great Pyramid is lined up with true north almost perfectly, built thousands of years before the compass.',
    ],
    factsAdvanced: [
      'The heliacal rising of Sirius — its first pre-dawn appearance after weeks of invisibility — signalled the Nile inundation and anchored the civil year.',
      'The 365-day civil calendar drifted against the true year by a quarter day annually, so it realigned with the Sothic (Sirius) cycle only every ~1,460 years. Those realignments are now used to date Egyptian records absolutely.',
      'The decans were 36 star groups rising ten days apart. Dividing the night by decans produced twelve night hours, and the scheme fed the 24-hour day.',
      'The Great Pyramid of Khufu is aligned to true north within about 4 arcminutes — most plausibly achieved by bisecting the rising and setting points of a circumpolar star.',
    ],
  },
  {
    id: 'greek',
    name: 'Greek Astronomy',
    region: 'Greece, Alexandria, Asia Minor',
    period: 'c. 600 BCE – 200 CE',
    evidence: 'textual',
    description:
      'The Greeks took Babylonian data and asked a different question: not "what ' +
      'will happen next" but "what geometry would produce this". The answer they ' +
      'built was wrong at its centre and extraordinarily good at prediction — ' +
      'which is why it lasted fourteen centuries.',
    factsKids: [
      'The Greeks were the first to try to explain why the sky moves, not just predict it.',
      'They worked out that the Earth is round — and even measured how big it is — over 2,000 years ago.',
      'Most of our constellation names come from Greek stories, passed down through Latin.',
    ],
    factsAdvanced: [
      'Eratosthenes measured Earth\'s circumference around 240 BCE from the difference in noon shadow lengths between Syene and Alexandria, landing within a few percent of the true value.',
      'Hipparchus (c. 190–120 BCE) compiled a catalogue of ~850 stars, introduced the magnitude scale still in use, and discovered precession by comparing his own measurement of Spica against Babylonian records.',
      'Ptolemy\'s Almagest (c. 150 CE) codified 48 constellations and 1,022 stars in a geocentric model with epicycles that predicted planetary positions well enough to remain the standard until Copernicus and Kepler.',
      'Aristarchus proposed a heliocentric model in the third century BCE. It was rejected largely on empirical grounds — no stellar parallax was detectable — which was a correct observation and a wrong conclusion, since the stars are simply far further away than anyone imagined.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section R — East and South Asian traditions (ST-341 → ST-360)
 * ------------------------------------------------------------------ */

export const ASIAN_ASTRONOMY = [
  {
    id: 'chinese',
    name: 'Chinese Astronomy',
    region: 'China',
    period: 'c. 1500 BCE – present',
    evidence: 'textual',
    description:
      'The longest continuous observational record on Earth. Chinese court ' +
      'astronomers logged eclipses, comets, and "guest stars" for over three ' +
      'thousand years — records now used directly by modern astrophysicists ' +
      'because nothing else covers that span.',
    factsKids: [
      'Chinese astronomers wrote down what they saw in the sky for over 3,000 years without stopping.',
      'When a star exploded in 1054, they wrote it down. Today we can see the wreckage — the Crab Nebula — and we know exactly how old it is because of them.',
      'They divided the sky in a completely different way from the Greeks: 28 "mansions" instead of 12 zodiac signs.',
    ],
    factsAdvanced: [
      'The sky was organised into three enclosures (san yuan) around the pole and twenty-eight lunar mansions (xiu) along the ecliptic — a scheme independent of the Mediterranean tradition and structured around the Moon\'s ~27.3-day sidereal period rather than the Sun\'s year.',
      'The 1054 CE "guest star" record fixes the Crab Nebula\'s birth date exactly, which is why it is one of the best-calibrated objects in astrophysics. This app renders that remnant on its Nebula rung.',
      'Chinese records document the supernovae of 185, 386, 393, 1006, 1054, 1181, 1572, and 1604 CE, plus continuous comet observations including every appearance of Halley\'s Comet since 240 BCE.',
      'The Dunhuang star chart, c. 649–684 CE, is the oldest surviving manuscript star atlas from any civilisation, mapping over 1,300 stars on a cylindrical-style projection.',
    ],
  },
  {
    id: 'indian',
    name: 'Indian Astronomy',
    region: 'Indian subcontinent',
    period: 'c. 1500 BCE – present',
    evidence: 'textual',
    description:
      'A tradition combining a lunar-mansion sky division with sophisticated ' +
      'mathematical astronomy — and, in Aryabhata, an early and explicit ' +
      'proposal that the Earth rotates.',
    factsKids: [
      'Indian astronomers divided the sky into 27 groups called nakshatras, based on where the Moon sits each night.',
      'Over 1,500 years ago an astronomer named Aryabhata suggested the Earth spins — and that this is why the stars appear to move.',
      'India has huge stone observatories built in the 1700s that still work today.',
    ],
    factsAdvanced: [
      'The nakshatra system divides the ecliptic into 27 (sometimes 28) segments matching the Moon\'s daily motion — a lunar framework, parallel to but independent of the Chinese xiu.',
      'Aryabhata\'s Aryabhatiya (499 CE) proposed diurnal rotation of the Earth, gave a remarkably good sidereal day, and explained eclipses as shadows rather than as demons — explicitly against the prevailing mythological account.',
      'The Vedanga Jyotisha (c. 1400–1200 BCE) is among the oldest surviving astronomical texts, concerned chiefly with fixing ritual timing.',
      'The five Jantar Mantar observatories, built by Maharaja Jai Singh II in the 1720s–30s, contain the largest masonry instruments ever constructed. The Samrat Yantra sundial at Jaipur stands 27 m tall and resolves time to about two seconds.',
    ],
  },
  {
    id: 'korean-japanese',
    name: 'Korean & Japanese Sky Traditions',
    region: 'Korea and Japan',
    period: 'c. 600 CE – present',
    evidence: 'textual',
    description:
      'Both traditions drew on the Chinese framework and then developed their ' +
      'own instruments, records, and festivals — including the oldest surviving ' +
      'astronomical observatory in East Asia.',
    factsKids: [
      'Cheomseongdae in Korea is a stone tower built in the 600s for watching the sky. It is still standing.',
      'In Japan the Pleiades star cluster is called Subaru — the same name as the car company, whose logo is those stars.',
      'The Japanese festival Tanabata celebrates two stars, Vega and Altair, meeting once a year across the Milky Way.',
    ],
    factsAdvanced: [
      'Cheomseongdae, built in the Silla kingdom around 632–647 CE under Queen Seondeok, is the oldest surviving astronomical observatory in East Asia. Its 362 stones are widely read as a calendrical reference.',
      'Korean records include the Cheonsang Yeolcha Bunyajido (1395), a stone-carved star chart of ~1,467 stars based on an older Goguryeo original.',
      'Tanabata, from the Chinese Qixi legend, marks the annual meeting of Orihime (Vega) and Hikoboshi (Altair) — separated by the Milky Way and permitted one crossing a year. The same two stars form two corners of the Summer Triangle.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section S — Indigenous, Polynesian & Arabic traditions (ST-361 → ST-380)
 * ------------------------------------------------------------------ */

export const WORLD_SKY_CULTURES = [
  {
    id: 'polynesian-wayfinding',
    name: 'Polynesian Wayfinding',
    region: 'Pacific Ocean',
    period: 'c. 1000 BCE – present',
    evidence: 'living',
    description:
      'The most demanding practical astronomy ever developed: navigating ' +
      'thousands of kilometres of open Pacific to islands far below the horizon, ' +
      'with no instruments at all. It was nearly lost in the twentieth century ' +
      'and has been deliberately, successfully revived.',
    factsKids: [
      'Polynesian navigators crossed thousands of kilometres of open ocean using only the stars, waves, birds, and clouds — no compass, no maps, no instruments.',
      'They memorised where dozens of stars rise and set around the horizon, like an invisible compass in their heads.',
      'People still do this today. In 1976 a canoe called Hōkūle\'a sailed from Hawaii to Tahiti using only these methods, and it worked.',
    ],
    factsAdvanced: [
      'The star compass divides the horizon into named houses. A navigator tracks the rising and setting points of a memorised sequence of stars, swapping to the next as each climbs too high to be useful.',
      'Latitude is read from zenith stars — a star that passes directly overhead identifies a latitude. Arcturus (Hawaiian Hōkūle\'a, "star of gladness") passes near the zenith at Hawaii\'s latitude, which is why the revival canoe carries its name.',
      'Navigators also read swell patterns refracting around unseen islands, cloud formations over land, and the flight paths of nesting birds at dawn and dusk — the star compass is one instrument in a larger integrated system.',
      'The 1976 Hōkūle\'a voyage from Hawaii to Tahiti was navigated by Mau Piailug of Satawal, one of the last practitioners holding the tradition. His teaching of Nainoa Thompson and others deliberately re-seeded the knowledge, and it is now actively taught and practised.',
    ],
  },
  {
    id: 'aboriginal-australian',
    name: 'Aboriginal Australian Astronomy',
    region: 'Australia',
    period: 'Tens of thousands of years – present',
    evidence: 'oral',
    description:
      'Among the oldest continuous astronomical traditions known, held by many ' +
      'distinct nations with distinct skies. A defining feature is the use of ' +
      'dark nebulae — the shapes between the stars — as constellations in their ' +
      'own right.',
    factsKids: [
      'Aboriginal Australians have watched and recorded the sky for tens of thousands of years.',
      'Instead of joining bright stars into pictures, some traditions make pictures out of the dark patches between them — like the Emu in the Sky.',
      'There is no single "Aboriginal astronomy": hundreds of different nations have their own sky knowledge, their own names, and their own stories.',
    ],
    factsAdvanced: [
      'The Emu in the Sky is formed from dark dust lanes rather than stars: the Coalsack Nebula is the head, and the dust of the Milky Way forms the neck and body. Its seasonal orientation signals emu breeding and egg-collecting times — practical calendrical information encoded in a figure.',
      'Australia has over 250 language groups, each with distinct sky knowledge. Merging them into one narrative misrepresents all of them, which is why they are not merged here.',
      'Some oral traditions describe variable stars — including accounts consistent with the variability of Betelgeuse and Antares — and the reddening of stars near the horizon.',
      'The Wurdi Youang stone arrangement in Victoria has been argued to mark solstice and equinox sunset positions. The interpretation is taken seriously but remains under active study rather than settled.',
    ],
  },
  {
    id: 'maori',
    name: 'Māori Astronomy',
    region: 'Aotearoa / New Zealand',
    period: 'c. 1300 CE – present',
    evidence: 'living',
    description:
      'A living tradition in which the reappearance of the Pleiades marks the ' +
      'new year — now a public holiday in New Zealand, and one of the few cases ' +
      'where a nation\'s official calendar is set by a star cluster.',
    factsKids: [
      'For Māori, the new year begins when the star cluster Matariki reappears in the winter dawn sky.',
      'New Zealand made Matariki a public holiday in 2022 — a national holiday set by the stars.',
      'It is a time for remembering people who have died, celebrating the present, and planning the year ahead.',
    ],
    factsAdvanced: [
      'Matariki is the Pleiades. Its heliacal rising in midwinter (June–July in the southern hemisphere) marks the start of the Māori new year, with the exact date determined against the lunar month rather than a fixed calendar date.',
      'Different iwi observe differently: some mark Puanga (Rigel) instead, where local horizons make the Pleiades hard to see. The variation is real and recognised, not a discrepancy to be resolved.',
      'The appearance and clarity of individual stars in the cluster were traditionally read as forecasts for the coming season\'s harvest.',
      'New Zealand established the Matariki public holiday in 2022 — the first national holiday in the country recognising a specifically Māori observance.',
    ],
  },
  {
    id: 'maya',
    name: 'Maya Astronomy',
    region: 'Mesoamerica',
    period: 'c. 200 – 900 CE and beyond',
    evidence: 'textual',
    description:
      'Mathematically the most sophisticated astronomy of the pre-Columbian ' +
      'Americas, centred on Venus, and preserved in a handful of codices that ' +
      'survived deliberate destruction.',
    factsKids: [
      'The Maya tracked the planet Venus extremely carefully and could predict where it would be years in advance.',
      'They built observatories with windows lined up to watch it.',
      'Most of their books were destroyed, but a few survived — and those few contain their astronomy.',
    ],
    factsAdvanced: [
      'The Dresden Codex Venus table tracks the 584-day synodic period of Venus with a correction scheme accurate to about two hours per cycle — a level of precision that required generations of accumulated observation.',
      'El Caracol at Chichén Itzá has window sightlines aligned to Venus\' extreme northerly and southerly setting points, and to equinox sunsets.',
      'Their calendrical system interlocked a 260-day ritual count and a 365-day solar year into a 52-year Calendar Round, with the Long Count providing absolute dating over millennia.',
      'Only four Maya codices survived the Spanish conquest. The astronomical content that reaches us is a fragment of what existed.',
    ],
  },
  {
    id: 'inca',
    name: 'Inca Astronomy',
    region: 'Andes, South America',
    period: 'c. 1400 – 1533 CE',
    evidence: 'archaeological',
    description:
      'Andean sky traditions, like Aboriginal Australian ones, read the dark ' +
      'clouds of the Milky Way as figures — an independent arrival at the same ' +
      'idea on the opposite side of the world.',
    factsKids: [
      'The Inca saw animals in the dark patches of the Milky Way, not in the bright stars.',
      'They called the Milky Way a celestial river.',
      'Machu Picchu has a carved stone that catches the sunlight in a particular way at the solstices.',
    ],
    factsAdvanced: [
      'Dark-cloud constellations include Yacana (the llama), Hanp\'atu (the toad), and Mach\'acuay (the serpent) — figures defined by dust lanes silhouetted against the bright Milky Way.',
      'The Milky Way (Mayu, "river") organised the ceque system of sightlines radiating from Cusco\'s Coricancha, integrating astronomy, land tenure, and ritual calendar into one structure.',
      'The Intihuatana stone at Machu Picchu is aligned with solstice sun positions; the frequently repeated "hitching post of the sun" translation is a modern gloss rather than a documented Inca term.',
    ],
  },
  {
    id: 'arabic',
    name: 'Arabic & Islamic Astronomy',
    region: 'Middle East, North Africa, Central Asia, Iberia',
    period: 'c. 700 – 1500 CE',
    evidence: 'textual',
    description:
      'The tradition that preserved, corrected, and extended Greek astronomy ' +
      'while Europe was not doing so — and which named most of the stars you can ' +
      'see tonight.',
    factsKids: [
      'Most bright star names are Arabic: Aldebaran, Betelgeuse, Altair, Deneb, Rigel, Vega, Fomalhaut.',
      'Over a thousand years ago, an astronomer named al-Sufi wrote down a "little cloud" in the sky. It was the Andromeda Galaxy — the first record anyone made of it.',
      'The word "almanac" comes from Arabic, and so does "zenith" and "nadir".',
    ],
    factsAdvanced: [
      'Al-Sufi\'s Book of Fixed Stars (964 CE) revised Ptolemy\'s catalogue against fresh observation and contains the earliest known record of the Andromeda Galaxy and of the Large Magellanic Cloud.',
      'Al-Battani (c. 858–929) refined the length of the solar year to within a couple of minutes and improved the values for precession and axial tilt — figures Copernicus later used directly.',
      'Ulugh Beg\'s Samarkand observatory produced the Zij-i Sultani (1437), the most accurate star catalogue before the telescope, with positions from a 40 m-radius meridian arc.',
      'The Tusi couple, developed at the Maragheh observatory in the 13th century, is a geometric device for producing linear motion from circles; equivalent constructions appear in Copernicus\' work, and the question of transmission remains actively studied.',
      'Practical drivers were religious: determining the qibla direction, the lunar calendar, and precise prayer times all require real spherical astronomy.',
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Section T — celestial navigation (ST-381 → ST-400)
 * ------------------------------------------------------------------ */

export const CELESTIAL_NAVIGATION = [
  {
    id: 'finding-latitude',
    name: 'Finding Latitude',
    period: 'Antiquity – present',
    evidence: 'living',
    description:
      'The easy half of the problem, and it was solved for millennia: measure ' +
      'how high the pole star sits above the horizon, and that angle is your ' +
      'latitude. No clock, no calculation, no instruments beyond your own hand.',
    factsKids: [
      'How high the North Star sits above the horizon tells you how far north you are.',
      'At the North Pole it is straight overhead. At the equator it sits right on the horizon.',
      'You can measure it roughly with your outstretched hand: a fist held at arm\'s length covers about 10 degrees.',
    ],
    factsAdvanced: [
      'The altitude of the celestial pole equals the observer\'s latitude, exactly. Polaris sits ~0.66° off the true pole, so precise work applies a small correction from tables.',
      'Southern navigators have no bright pole star — Sigma Octantis is magnitude 5.4 — so they derive south from the long axis of the Southern Cross, extended about 4.5 times its length.',
      'Latitude can also be taken from the noon Sun altitude combined with its declination for the date, which is why the Nautical Almanac exists.',
    ],
  },
  {
    id: 'the-longitude-problem',
    name: 'The Longitude Problem',
    period: '1500s – 1770s',
    evidence: 'textual',
    description:
      'The hard half, and it killed people. Longitude is a measure of time ' +
      'difference, so finding it at sea required a clock that stayed accurate ' +
      'through storms, salt, and temperature swings for months. Nothing like ' +
      'that existed.',
    factsKids: [
      'Sailors could tell how far north they were, but not how far east or west — and ships were wrecked because of it.',
      'To find east-west position you need to know exactly what time it is back home, and clocks did not work on rolling ships.',
      'A carpenter named John Harrison spent decades building a clock that finally worked at sea.',
    ],
    factsAdvanced: [
      'Earth turns 15° of longitude per hour, so longitude reduces to comparing local noon against the time at a reference meridian. The problem is entirely one of keeping reference time.',
      'The 1707 Scilly naval disaster, which killed around 1,400 sailors, prompted the Longitude Act of 1714 and its £20,000 prize — a fortune, reflecting how badly the problem needed solving.',
      'John Harrison\'s H4 sea watch lost only about five seconds over an 81-day Atlantic crossing in 1761–62, far inside the prize requirement. Extracting the reward from the Board of Longitude took him most of the rest of his life.',
      'The competing lunar-distance method — measuring the Moon\'s angle from catalogued stars — worked but demanded lengthy calculation and clear skies. Chronometers won on practicality.',
    ],
  },
  {
    id: 'the-sextant',
    name: 'The Sextant',
    period: '1730s – present',
    evidence: 'living',
    description:
      'The instrument that made celestial navigation routine: a mirror ' +
      'arrangement that brings a star down to the horizon so both are visible at ' +
      'once, letting an accurate angle be read from a pitching deck.',
    factsKids: [
      'A sextant uses mirrors to make a star appear to sit right on the horizon, so you can measure its height accurately.',
      'It works even on a rocking ship, which is the whole point.',
      'Sailors and pilots still learn to use one, in case the satellites fail.',
    ],
    factsAdvanced: [
      'Double-reflection is the key idea: because the image moves at twice the mirror angle, an instrument spanning one sixth of a circle measures angles up to 120°, and the reading is insensitive to small ship movements.',
      'John Hadley and Thomas Godfrey independently produced reflecting octants around 1731; the sextant proper followed in 1757 for the wider arcs lunar distances required.',
      'The Nautical Almanac lists 57 selected navigational stars, plus Polaris, chosen for brightness and even distribution around the sky.',
      'Celestial navigation remains a taught competency in naval and aviation training precisely because it needs no satellite, no signal, and no electricity.',
    ],
  },
  {
    id: 'precession',
    name: 'Precession & the Changing Pole',
    period: 'Discovered c. 127 BCE',
    evidence: 'textual',
    description:
      'Earth wobbles like a spinning top, on a cycle of about 25,772 years. The ' +
      'pole star is therefore temporary — every civilisation gets a different ' +
      'one, and the zodiac has quietly slipped a whole sign since it was named.',
    factsKids: [
      'Earth wobbles slowly like a spinning top, taking about 26,000 years for one wobble.',
      'That means the North Star changes. Thuban was the North Star for the Egyptians; Vega will be one in about 12,000 years.',
      'It also means the star signs no longer match the constellations the Sun is actually in.',
    ],
    factsAdvanced: [
      'The axial precession period is about 25,772 years, driven by solar and lunar torques on Earth\'s equatorial bulge.',
      'Hipparchus discovered it around 127 BCE by comparing his measured position of Spica against Babylonian records — a result only possible because someone else had kept good data for centuries.',
      'The pole cycles through Thuban (c. 2700 BCE), Polaris (now), Alderamin (c. 7500 CE), and Vega (c. 13,700 CE).',
      'Because the zodiac signs were fixed against the constellations roughly 2,000 years ago, precession has shifted them by about one full sign — which is why the tropical zodiac used in astrology no longer corresponds to where the Sun actually is.',
    ],
  },
]

/** Every Phase STD cultural entry, flattened. */
export const SKY_CULTURES = [
  ...ANCIENT_ASTRONOMY,
  ...MEDITERRANEAN_ASTRONOMY,
  ...ASIAN_ASTRONOMY,
  ...WORLD_SKY_CULTURES,
  ...CELESTIAL_NAVIGATION,
]

/** Chronology of pole stars across the precession cycle (ST-178). */
export const POLE_STAR_CHRONOLOGY = [
  { star: 'Thuban (α Draconis)', epoch: 'c. 2700 BCE', note: 'The pole star of the Egyptian pyramid builders.' },
  { star: 'Kochab (β UMi)', epoch: 'c. 1000 BCE', note: 'Nearest bright star to the pole in the classical Greek era.' },
  { star: 'Polaris (α UMi)', epoch: 'Present', note: 'Closest approach to the pole around 2100 CE.' },
  { star: 'Errai (γ Cephei)', epoch: 'c. 3000 CE', note: 'The next reasonably bright pole star.' },
  { star: 'Alderamin (α Cephei)', epoch: 'c. 7500 CE', note: 'Precession carries the pole through Cepheus.' },
  { star: 'Vega (α Lyrae)', epoch: 'c. 13,700 CE', note: 'The brightest star ever to serve as a pole star.' },
  { star: 'Thuban again', epoch: 'c. 21,000 CE', note: 'The cycle closes after ~25,772 years.' },
]
