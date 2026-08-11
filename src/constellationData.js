/**
 * The 88 IAU constellations — BACKLOG Phase STC (ST-201 → ST-300).
 *
 * Complete official list, alphabetical by Latin name. Every entry carries
 * identity (name, genitive, abbreviation), astronomy (brightest star, notable
 * deep-sky objects), and the two-rung facts ladder (factsLadder.js).
 *
 * Field notes:
 *   genitive    the Latin possessive — this is what Bayer designations use.
 *               "Alpha Centauri" is literally "alpha of Centaurus".
 *   abbr        official three-letter IAU abbreviation.
 *   hemisphere  'N' | 'S' | 'both' — where the bulk of the figure lies.
 *   areaRank    1 (Hydra, largest) to 88 (Crux, smallest).
 *   origin      'ancient' = one of Ptolemy's 48 in the Almagest;
 *               'modern'  = added from the 16th century onward, mostly by
 *                           Petrus Plancius, Johannes Hevelius, and
 *                           Nicolas-Louis de Lacaille.
 *
 * Constellations are regions of sky with hard borders, not star groups. The
 * boundaries were fixed by Eugène Delporte for the IAU in 1930 and drawn along
 * lines of constant right ascension and declination for the B1875.0 epoch —
 * which is why precession has since left them visibly slanted.
 *
 * Pure data. No rendering imports.
 */

export const CONSTELLATIONS = [
  {
    id: 'andromeda', name: 'Andromeda', genitive: 'Andromedae', abbr: 'And',
    english: 'The Chained Maiden', hemisphere: 'N', areaRank: 19, origin: 'ancient',
    brightest: 'Alpheratz (α And)',
    notable: ['M31 — the Andromeda Galaxy', 'M32 and M110 — its satellites', 'NGC 7662 — the Blue Snowball Nebula'],
    factsKids: [
      'Andromeda holds the furthest thing you can see with just your eyes: the Andromeda Galaxy, 2.5 million light-years away.',
      'In the old Greek story she was chained to a rock as a sacrifice, and Perseus rescued her.',
    ],
    factsAdvanced: [
      'M31 is the nearest large spiral galaxy and is approaching the Milky Way at ~110 km/s — the two will merge in roughly 4.5 billion years.',
      'Alpheratz is shared history: it was once Delta Pegasi as well, forming the corner of the Great Square, until the 1930 boundaries assigned it definitively to Andromeda.',
    ],
  },
  {
    id: 'antlia', name: 'Antlia', genitive: 'Antliae', abbr: 'Ant',
    english: 'The Air Pump', hemisphere: 'S', areaRank: 62, origin: 'modern',
    brightest: 'α Antliae',
    notable: ['NGC 2997 — a face-on spiral', 'The Antlia Dwarf Galaxy'],
    factsKids: ['Antlia is named after an air pump — a scientific instrument, not an animal or a hero.'],
    factsAdvanced: [
      'Named by Lacaille in the 1750s during his Cape of Good Hope survey, honouring Denis Papin\'s air pump. Lacaille filled the southern sky with instruments of the Enlightenment rather than myth.',
    ],
  },
  {
    id: 'apus', name: 'Apus', genitive: 'Apodis', abbr: 'Aps',
    english: 'The Bird of Paradise', hemisphere: 'S', areaRank: 67, origin: 'modern',
    brightest: 'α Apodis',
    notable: ['NGC 6101 — a globular cluster'],
    factsKids: ['Apus means "without feet" — early European traders received bird-of-paradise skins with the feet removed, and assumed the birds had none.'],
    factsAdvanced: [
      'Introduced by Petrus Plancius in 1598 from observations by Dutch navigators Keyser and de Houtman. It lies close to the south celestial pole and is never visible from Europe.',
    ],
  },
  {
    id: 'aquarius', name: 'Aquarius', genitive: 'Aquarii', abbr: 'Aqr',
    english: 'The Water Bearer', hemisphere: 'S', areaRank: 10, origin: 'ancient',
    brightest: 'Sadalsuud (β Aqr)', zodiac: true,
    notable: ['NGC 7293 — the Helix Nebula', 'M2 — a globular cluster', 'NGC 7009 — the Saturn Nebula'],
    factsKids: [
      'Aquarius is one of the twelve zodiac constellations the Sun passes through each year.',
      'It contains the Helix Nebula, sometimes called the Eye of God — a dying star blowing off its outer layers.',
    ],
    factsAdvanced: [
      'One of the oldest recognised constellations, associated with water and rainy seasons across Babylonian, Egyptian, and Greek traditions.',
      'The Helix Nebula is among the nearest planetary nebulae at ~650 ly — a direct preview of the Sun\'s own ending.',
    ],
  },
  {
    id: 'aquila', name: 'Aquila', genitive: 'Aquilae', abbr: 'Aql',
    english: 'The Eagle', hemisphere: 'both', areaRank: 22, origin: 'ancient',
    brightest: 'Altair (α Aql)',
    notable: ['The Milky Way runs through it', 'NGC 6709 — an open cluster'],
    factsKids: [
      'Aquila the Eagle carries the bright star Altair, one corner of the Summer Triangle.',
      'The Milky Way runs right through this constellation, so it is packed with stars.',
    ],
    factsAdvanced: [
      'In Greek myth this is the eagle that carried Zeus\' thunderbolts. Altair, at 16.7 ly, is one of the nearest bright stars.',
      'Nova Aquilae 1918 briefly became the brightest nova of the 20th century, reaching magnitude −0.5.',
    ],
  },
  {
    id: 'ara', name: 'Ara', genitive: 'Arae', abbr: 'Ara',
    english: 'The Altar', hemisphere: 'S', areaRank: 63, origin: 'ancient',
    brightest: 'β Arae',
    notable: ['NGC 6397 — one of the nearest globular clusters'],
    factsKids: ['Ara is the altar where the Greek gods swore their oath before fighting the Titans.'],
    factsAdvanced: [
      'NGC 6397 lies about 7,800 ly away, one of the two nearest globular clusters, and its white dwarf cooling sequence has been used to constrain the age of the Galaxy.',
    ],
  },
  {
    id: 'aries', name: 'Aries', genitive: 'Arietis', abbr: 'Ari',
    english: 'The Ram', hemisphere: 'N', areaRank: 39, origin: 'ancient',
    brightest: 'Hamal (α Ari)', zodiac: true,
    notable: ['NGC 772 — a distorted spiral galaxy'],
    factsKids: [
      'Aries is the ram with the Golden Fleece from the Greek story of Jason and the Argonauts.',
      'It is a zodiac constellation, but it only has a few bright stars — it is fainter than most people expect.',
    ],
    factsAdvanced: [
      'The vernal equinox sat in Aries when the zodiac was codified ~2,000 years ago, which is why it is listed first. Precession has since moved that point into Pisces — the "first point of Aries" is now a name, not a location.',
    ],
  },
  {
    id: 'auriga', name: 'Auriga', genitive: 'Aurigae', abbr: 'Aur',
    english: 'The Charioteer', hemisphere: 'N', areaRank: 21, origin: 'ancient',
    brightest: 'Capella (α Aur)',
    notable: ['M36, M37, M38 — three fine open clusters', 'Epsilon Aurigae — a 27-year eclipsing binary'],
    factsKids: [
      'Auriga is a pentagon of stars with brilliant yellow Capella at one corner.',
      'It holds three beautiful star clusters that are easy to find with binoculars.',
    ],
    factsAdvanced: [
      'Epsilon Aurigae eclipses every 27 years — the longest period of any known eclipsing binary. The eclipsing body is a dusty disk around an unseen companion, and the 2009–11 eclipse was the first observed with modern instruments.',
    ],
  },
  {
    id: 'bootes', name: 'Boötes', genitive: 'Boötis', abbr: 'Boo',
    english: 'The Herdsman', hemisphere: 'N', areaRank: 13, origin: 'ancient',
    brightest: 'Arcturus (α Boo)',
    notable: ['The Boötes Void — a vast empty region of space', 'Izar — a fine double star'],
    factsKids: [
      'Boötes is kite-shaped, with brilliant orange Arcturus at the bottom point.',
      'Find it by following the curve of the Big Dipper\'s handle: "arc to Arcturus".',
    ],
    factsAdvanced: [
      'The Boötes Void is a roughly 330-million-light-year sphere containing far fewer galaxies than expected — one of the largest known voids in the cosmic web.',
      'The Quadrantid meteor shower radiates from northern Boötes, named for the defunct constellation Quadrans Muralis.',
    ],
  },
  {
    id: 'caelum', name: 'Caelum', genitive: 'Caeli', abbr: 'Cae',
    english: 'The Chisel', hemisphere: 'S', areaRank: 81, origin: 'modern',
    brightest: 'α Caeli',
    notable: ['Few bright objects — one of the emptiest constellations'],
    factsKids: ['Caelum is a sculptor\'s chisel, and it is one of the emptiest patches of sky there is.'],
    factsAdvanced: ['Another Lacaille instrument constellation. It is the eighth-smallest and contains no star brighter than magnitude 4.4.'],
  },
  {
    id: 'camelopardalis', name: 'Camelopardalis', genitive: 'Camelopardalis', abbr: 'Cam',
    english: 'The Giraffe', hemisphere: 'N', areaRank: 18, origin: 'modern',
    brightest: 'β Camelopardalis',
    notable: ['NGC 2403 — a bright spiral galaxy', 'Kemble\'s Cascade — a striking chain of stars'],
    factsKids: ['Camelopardalis is a giraffe. Its name comes from the old idea that a giraffe was a camel with a leopard\'s spots.'],
    factsAdvanced: [
      'Introduced by Petrus Plancius in 1612 to fill a large, genuinely faint gap near the north pole. Large in area, eighteenth by size, yet without a single star above magnitude 4.',
    ],
  },
  {
    id: 'cancer', name: 'Cancer', genitive: 'Cancri', abbr: 'Cnc',
    english: 'The Crab', hemisphere: 'N', areaRank: 31, origin: 'ancient',
    brightest: 'Tarf (β Cnc)', zodiac: true,
    notable: ['M44 — the Beehive Cluster (Praesepe)', 'M67 — one of the oldest known open clusters'],
    factsKids: [
      'Cancer is the faintest constellation of the zodiac — hard to see unless the sky is quite dark.',
      'It contains the Beehive Cluster, which looks like a misty patch to the eye and bursts into dozens of stars in binoculars.',
    ],
    factsAdvanced: [
      'M67 is roughly 3.5–5 billion years old, unusually ancient for an open cluster — most disperse within a few hundred million years — making it a valuable check on stellar evolution models at near-solar age and composition.',
      'The Tropic of Cancer is named for it: the Sun stood here at the June solstice ~2,000 years ago. Precession has since moved that point into Taurus.',
    ],
  },
  {
    id: 'canes-venatici', name: 'Canes Venatici', genitive: 'Canum Venaticorum', abbr: 'CVn',
    english: 'The Hunting Dogs', hemisphere: 'N', areaRank: 38, origin: 'modern',
    brightest: 'Cor Caroli (α CVn)',
    notable: ['M51 — the Whirlpool Galaxy', 'M3 — a superb globular cluster', 'M94, M63 — the Sunflower Galaxy'],
    factsKids: [
      'These are the two hunting dogs held on a leash by Boötes the Herdsman.',
      'It contains the Whirlpool Galaxy — the first galaxy anyone recognised as having a spiral shape.',
    ],
    factsAdvanced: [
      'Lord Rosse sketched M51\'s spiral structure in 1845 with the 72-inch Leviathan of Parsonstown — the first spiral ever identified, decades before anyone knew galaxies were external to the Milky Way.',
      'Cor Caroli, "Charles\' Heart", is the prototype α² Canum Venaticorum variable: a chemically peculiar star whose strong, tilted magnetic field concentrates elements into patches that rotate in and out of view.',
    ],
  },
  {
    id: 'canis-major', name: 'Canis Major', genitive: 'Canis Majoris', abbr: 'CMa',
    english: 'The Great Dog', hemisphere: 'S', areaRank: 43, origin: 'ancient',
    brightest: 'Sirius (α CMa)',
    notable: ['M41 — an open cluster', 'VY Canis Majoris — a red hypergiant', 'NGC 2359 — Thor\'s Helmet'],
    factsKids: [
      'This is Orion\'s big hunting dog, and it carries Sirius — the brightest star in the entire night sky.',
      'The "dog days" of summer are named after Sirius, the Dog Star, which rises with the Sun at that time of year.',
    ],
    factsAdvanced: [
      'Sirius at 8.6 ly dominates, but the constellation also holds VY CMa (a red hypergiant of ~1,400 R☉) and Adhara, one of the strongest extreme-ultraviolet sources in the sky.',
      'The Canis Major Overdensity, reported in 2003, may be a disrupted dwarf galaxy being absorbed by the Milky Way, though its nature remains debated.',
    ],
  },
  {
    id: 'canis-minor', name: 'Canis Minor', genitive: 'Canis Minoris', abbr: 'CMi',
    english: 'The Lesser Dog', hemisphere: 'both', areaRank: 71, origin: 'ancient',
    brightest: 'Procyon (α CMi)',
    notable: ['Essentially two bright stars and little else'],
    factsKids: ['Canis Minor is Orion\'s smaller hunting dog, and it is basically just two stars.'],
    factsAdvanced: [
      'Procyon and Gomeisa are effectively the whole constellation. Procyon forms the Winter Triangle with Sirius and Betelgeuse, and the Winter Hexagon with Rigel, Aldebaran, Capella, and Pollux.',
    ],
  },
  {
    id: 'capricornus', name: 'Capricornus', genitive: 'Capricorni', abbr: 'Cap',
    english: 'The Sea Goat', hemisphere: 'S', areaRank: 40, origin: 'ancient',
    brightest: 'Deneb Algedi (δ Cap)', zodiac: true,
    notable: ['M30 — a globular cluster'],
    factsKids: [
      'Capricornus is a strange creature: half goat, half fish.',
      'Neptune was discovered in this constellation in 1846.',
    ],
    factsAdvanced: [
      'The smallest zodiac constellation by area and one of the faintest. The Tropic of Capricorn takes its name from the Sun\'s December solstice position ~2,000 years ago; precession has since carried it into Sagittarius.',
    ],
  },
  {
    id: 'carina', name: 'Carina', genitive: 'Carinae', abbr: 'Car',
    english: 'The Keel', hemisphere: 'S', areaRank: 34, origin: 'ancient',
    brightest: 'Canopus (α Car)',
    notable: ['NGC 3372 — the Carina Nebula', 'Eta Carinae', 'NGC 2516, IC 2602 — the Southern Pleiades'],
    factsKids: [
      'Carina is the keel of the ship Argo, from the story of Jason and the Argonauts.',
      'It holds Canopus, the second-brightest star in the night sky, and a huge glowing nebula.',
    ],
    factsAdvanced: [
      'Carina, Puppis, and Vela are the three pieces of Argo Navis — the only Ptolemaic constellation the IAU broke up, because it was unwieldy at over 1,600 square degrees. The Bayer letters were not reassigned, so each fragment carries a partial alphabet.',
      'The Carina Nebula is one of the largest and brightest H II regions known, roughly four times the extent of Orion\'s and host to Eta Carinae.',
    ],
  },
  {
    id: 'cassiopeia', name: 'Cassiopeia', genitive: 'Cassiopeiae', abbr: 'Cas',
    english: 'The Queen', hemisphere: 'N', areaRank: 25, origin: 'ancient',
    brightest: 'Schedar (α Cas)',
    notable: ['Cassiopeia A — a supernova remnant', 'M52, M103 — open clusters', 'Tycho\'s Supernova (SN 1572)'],
    factsKids: [
      'Cassiopeia is the easiest constellation to recognise: five bright stars in a giant W (or M, depending on the time of night).',
      'It circles the North Star and never sets, so from northern countries you can see it any night of the year.',
      'She was a vain queen, punished by being tied to her throne and spun upside down forever.',
    ],
    factsAdvanced: [
      'Cassiopeia A is the brightest radio source in the sky beyond the Solar System — the remnant of a star that exploded around 1680, oddly unremarked at the time.',
      'Tycho Brahe\'s observation of SN 1572 here demonstrated that the "fixed" celestial sphere could change, undermining Aristotelian cosmology directly.',
    ],
  },
  {
    id: 'centaurus', name: 'Centaurus', genitive: 'Centauri', abbr: 'Cen',
    english: 'The Centaur', hemisphere: 'S', areaRank: 9, origin: 'ancient',
    brightest: 'Rigil Kentaurus (α Cen)',
    notable: ['Omega Centauri — the largest globular cluster', 'Centaurus A — a peculiar radio galaxy', 'Proxima Centauri'],
    factsKids: [
      'Centaurus contains our nearest neighbour star, Proxima Centauri.',
      'It also holds Omega Centauri, a ball of about ten million stars — the biggest star cluster in our galaxy.',
    ],
    factsAdvanced: [
      'Omega Centauri holds ~10 million stars and shows multiple stellar populations with a spread in metallicity, which is why it is widely interpreted as the stripped core of a dwarf galaxy rather than a true globular cluster.',
      'Centaurus A (NGC 5128) is the nearest radio galaxy, with a prominent dust lane from a past merger and relativistic jets driven by a supermassive black hole.',
    ],
  },
  {
    id: 'cepheus', name: 'Cepheus', genitive: 'Cephei', abbr: 'Cep',
    english: 'The King', hemisphere: 'N', areaRank: 27, origin: 'ancient',
    brightest: 'Alderamin (α Cep)',
    notable: ['Delta Cephei — prototype of the Cepheid variables', 'Mu Cephei — the Garnet Star', 'IC 1396 — the Elephant\'s Trunk Nebula'],
    factsKids: [
      'Cepheus is the king, husband of Cassiopeia — a shape like a child\'s drawing of a house.',
      'It contains the star that taught us how to measure the distance to other galaxies.',
    ],
    factsAdvanced: [
      'Delta Cephei is the prototype of the Cepheid variables. John Goodricke identified its variability in 1784; Leavitt\'s period–luminosity relation later turned the whole class into the distance ladder\'s key rung.',
      'Alderamin will be the pole star around 7500 CE as precession carries the celestial pole through Cepheus.',
    ],
  },
  {
    id: 'cetus', name: 'Cetus', genitive: 'Ceti', abbr: 'Cet',
    english: 'The Whale / Sea Monster', hemisphere: 'S', areaRank: 4, origin: 'ancient',
    brightest: 'Diphda (β Cet)',
    notable: ['Mira — the first known periodic variable star', 'M77 — a Seyfert galaxy', 'Tau Ceti'],
    factsKids: [
      'Cetus is the sea monster sent to eat Andromeda before Perseus saved her.',
      'It contains Mira, a star that slowly fades away until you cannot see it, then comes back — over about eleven months.',
    ],
    factsAdvanced: [
      'Mira (ο Ceti) varies between roughly magnitude 2 and 10 over ~332 days. David Fabricius noted it in 1596 — the first star recognised as periodically variable, another blow to celestial immutability.',
      'M77 is one of the nearest and brightest Seyfert galaxies, an active galactic nucleus close enough to study in detail.',
    ],
  },
  {
    id: 'chamaeleon', name: 'Chamaeleon', genitive: 'Chamaeleontis', abbr: 'Cha',
    english: 'The Chameleon', hemisphere: 'S', areaRank: 79, origin: 'modern',
    brightest: 'α Chamaeleontis',
    notable: ['Chamaeleon Complex — a nearby star-forming region'],
    factsKids: ['Chamaeleon is a small, faint constellation near the south pole of the sky.'],
    factsAdvanced: [
      'The Chamaeleon molecular cloud complex, at ~500 ly, is one of the nearest low-mass star-forming regions and a key laboratory for studying protoplanetary disks.',
    ],
  },
  {
    id: 'circinus', name: 'Circinus', genitive: 'Circini', abbr: 'Cir',
    english: 'The Compasses', hemisphere: 'S', areaRank: 85, origin: 'modern',
    brightest: 'α Circini',
    notable: ['The Circinus Galaxy — a nearby active galaxy'],
    factsKids: ['Circinus is a drafting compass — the tool for drawing circles, not the kind that points north.'],
    factsAdvanced: [
      'The Circinus Galaxy is one of the nearest Seyfert galaxies but was only identified in 1977, because it lies just 4° from the galactic plane and is heavily obscured by Milky Way dust.',
    ],
  },
  {
    id: 'columba', name: 'Columba', genitive: 'Columbae', abbr: 'Col',
    english: 'The Dove', hemisphere: 'S', areaRank: 54, origin: 'modern',
    brightest: 'Phact (α Col)',
    notable: ['NGC 1851 — a globular cluster'],
    factsKids: ['Columba is the dove — thought of as either Noah\'s dove or the one that guided Jason\'s ship.'],
    factsAdvanced: [
      'Introduced by Petrus Plancius around 1592. Mu Columbae is a runaway star, ejected from the Orion region at ~200 km/s, probably by a supernova in a former binary or a dynamical encounter.',
    ],
  },
  {
    id: 'coma-berenices', name: 'Coma Berenices', genitive: 'Comae Berenices', abbr: 'Com',
    english: "Berenice's Hair", hemisphere: 'N', areaRank: 42, origin: 'modern',
    brightest: 'β Comae Berenices',
    notable: ['Melotte 111 — the Coma Star Cluster', 'The Coma Cluster of galaxies', 'M64 — the Black Eye Galaxy'],
    factsKids: [
      'This constellation is a real queen\'s hair. Berenice cut it off as an offering, it vanished from the temple, and the court astronomer said the gods had placed it in the sky.',
      'On a dark night it looks like a faint sparkling mist — that is a real cluster of stars, quite close to us.',
    ],
    factsAdvanced: [
      'The only constellation named for a historical person: Berenice II of Egypt, third century BCE.',
      'The Coma Cluster is where Fritz Zwicky, in 1933, compared galaxy velocities to the cluster\'s visible mass and concluded that unseen "dunkle Materie" dominated — the first evidence for dark matter. This app renders that discovery on its own rung.',
      'Melotte 111 is a genuine nearby open cluster at ~280 ly, one of the closest to the Sun.',
    ],
  },
  {
    id: 'corona-australis', name: 'Corona Australis', genitive: 'Coronae Australis', abbr: 'CrA',
    english: 'The Southern Crown', hemisphere: 'S', areaRank: 80, origin: 'ancient',
    brightest: 'Meridiana (α CrA)',
    notable: ['NGC 6541 — a globular cluster', 'The Corona Australis molecular cloud'],
    factsKids: ['A small curve of stars forming a crown, low in the southern sky.'],
    factsAdvanced: [
      'Its molecular cloud, at ~430 ly, is among the nearest active star-forming regions and contains a well-studied population of young stellar objects.',
    ],
  },
  {
    id: 'corona-borealis', name: 'Corona Borealis', genitive: 'Coronae Borealis', abbr: 'CrB',
    english: 'The Northern Crown', hemisphere: 'N', areaRank: 73, origin: 'ancient',
    brightest: 'Alphecca (α CrB)',
    notable: ['T Coronae Borealis — a recurrent nova', 'R Coronae Borealis — a rare fading variable'],
    factsKids: [
      'A neat little semicircle of stars — one of the few constellations that genuinely looks like its name.',
      'It is the crown the god Dionysus gave to Ariadne.',
    ],
    factsAdvanced: [
      'T Coronae Borealis, the "Blaze Star", is a recurrent nova that erupted in 1866 and 1946, brightening from magnitude ~10 to ~2 within hours. It is currently under close watch for another outburst.',
      'R Coronae Borealis is the prototype of stars that do the reverse of a nova: normally bright, they abruptly fade by several magnitudes when carbon dust condenses in their atmospheres.',
    ],
  },
  {
    id: 'corvus', name: 'Corvus', genitive: 'Corvi', abbr: 'Crv',
    english: 'The Crow', hemisphere: 'S', areaRank: 70, origin: 'ancient',
    brightest: 'Gienah (γ Crv)',
    notable: ['NGC 4038/4039 — the Antennae Galaxies'],
    factsKids: ['Corvus is a small four-sided shape. In the myth the crow was punished for lying to the god Apollo.'],
    factsAdvanced: [
      'The Antennae Galaxies are the nearest and best-studied major galaxy merger in progress, with long tidal tails and a burst of star formation triggered by the collision.',
    ],
  },
  {
    id: 'crater', name: 'Crater', genitive: 'Crateris', abbr: 'Crt',
    english: 'The Cup', hemisphere: 'S', areaRank: 53, origin: 'ancient',
    brightest: 'δ Crateris',
    notable: ['Crater 2 — an extremely diffuse dwarf galaxy'],
    factsKids: ['Crater is the cup of the god Apollo, right next to the crow that was sent to fetch water in it.'],
    factsAdvanced: [
      'Crater 2, found in 2016, is one of the largest but faintest known Milky Way satellites — a "feeble giant" whose low velocity dispersion has been used to test dark-matter models.',
    ],
  },
  {
    id: 'crux', name: 'Crux', genitive: 'Crucis', abbr: 'Cru',
    english: 'The Southern Cross', hemisphere: 'S', areaRank: 88, origin: 'modern',
    brightest: 'Acrux (α Cru)',
    notable: ['The Coalsack Nebula — a dark nebula', 'NGC 4755 — the Jewel Box Cluster'],
    factsKids: [
      'The Southern Cross is the smallest constellation of all 88, but one of the most famous.',
      'It appears on the flags of Australia, New Zealand, Brazil, Papua New Guinea, and Samoa.',
      'People in the southern half of the world use it to find south, the way northerners use the North Star to find north.',
    ],
    factsAdvanced: [
      'Smallest by area at 68 square degrees. There is no bright southern pole star, so navigators extend the long axis of the Cross about 4.5 times its length to locate the south celestial pole.',
      'It was visible from the Mediterranean in antiquity and formed part of Centaurus; precession carried it below the horizon, and it was re-established as a separate constellation by European navigators in the 16th century.',
      'The Coalsack is a dark nebula — a dust cloud silhouetted against the Milky Way — and features in Aboriginal Australian and Inca sky traditions as a figure in its own right.',
    ],
  },
  {
    id: 'cygnus', name: 'Cygnus', genitive: 'Cygni', abbr: 'Cyg',
    english: 'The Swan', hemisphere: 'N', areaRank: 16, origin: 'ancient',
    brightest: 'Deneb (α Cyg)',
    notable: ['Cygnus X-1 — the first confirmed black hole', 'NGC 7000 — the North America Nebula', 'The Veil Nebula', 'Albireo — a superb colour-contrast double'],
    factsKids: [
      'Cygnus flies along the Milky Way with wings spread — it is also called the Northern Cross.',
      'It contains Albireo, a double star where one is golden and the other blue. It is one of the prettiest sights in a small telescope.',
      'The first black hole ever confirmed is in this constellation.',
    ],
    factsAdvanced: [
      'Cygnus X-1 was identified in 1971 as a strong X-ray source whose invisible ~21 M☉ companion exceeded any neutron-star limit — the first widely accepted stellar-mass black hole, and the subject of the famous Hawking–Thorne wager.',
      'The Kepler mission stared at a field in Cygnus and Lyra for four years, and most of the first few thousand confirmed exoplanets came from this patch of sky.',
      'The Cygnus Rift, the dark lane splitting the Milky Way here, is a foreground complex of dust clouds, not a genuine gap in the stars.',
    ],
  },
  {
    id: 'delphinus', name: 'Delphinus', genitive: 'Delphini', abbr: 'Del',
    english: 'The Dolphin', hemisphere: 'N', areaRank: 69, origin: 'ancient',
    brightest: 'Rotanev (β Del)',
    notable: ['NGC 6934 — a globular cluster'],
    factsKids: ['A small, compact diamond of stars with a tail — it really does look like a leaping dolphin.'],
    factsAdvanced: [
      'Its two brightest stars, Sualocin and Rotanev, spell "Nicolaus Venator" backwards — the Latinised name of Niccolò Cacciatore, assistant to Giuseppe Piazzi, who slipped his own name into a star catalogue in 1814 and was not caught for years.',
    ],
  },
  {
    id: 'dorado', name: 'Dorado', genitive: 'Doradus', abbr: 'Dor',
    english: 'The Dolphinfish', hemisphere: 'S', areaRank: 72, origin: 'modern',
    brightest: 'α Doradus',
    notable: ['Most of the Large Magellanic Cloud', 'The Tarantula Nebula (30 Doradus)', 'SN 1987A'],
    factsKids: [
      'Dorado contains most of the Large Magellanic Cloud — a whole small galaxy that orbits our own.',
      'The closest supernova seen in modern times exploded here in 1987.',
    ],
    factsAdvanced: [
      'The Tarantula Nebula is the most luminous and energetic star-forming region in the Local Group; at Orion\'s distance it would cast shadows.',
      'SN 1987A was the first naked-eye supernova since 1604 and the first with a detected neutrino burst, confirming core-collapse theory within hours.',
    ],
  },
  {
    id: 'draco', name: 'Draco', genitive: 'Draconis', abbr: 'Dra',
    english: 'The Dragon', hemisphere: 'N', areaRank: 8, origin: 'ancient',
    brightest: 'Eltanin (γ Dra)',
    notable: ['Thuban — the ancient pole star', 'NGC 6543 — the Cat\'s Eye Nebula'],
    factsKids: [
      'Draco is a long dragon that winds all the way around the North Star.',
      'One of its stars, Thuban, was the North Star when the Egyptians built the pyramids.',
    ],
    factsAdvanced: [
      'The eighth-largest constellation, circumpolar from most northern latitudes. The north ecliptic pole lies within it, so it stays fixed while precession moves the celestial pole around its circle.',
      'James Bradley\'s attempt to measure Eltanin\'s parallax in 1725–28 instead revealed the aberration of starlight — the first direct proof that Earth moves, and an early measurement of light\'s finite speed.',
    ],
  },
  {
    id: 'equuleus', name: 'Equuleus', genitive: 'Equulei', abbr: 'Equ',
    english: 'The Little Horse', hemisphere: 'N', areaRank: 87, origin: 'ancient',
    brightest: 'Kitalpha (α Equ)',
    notable: ['Very few notable objects'],
    factsKids: ['Equuleus is the second-smallest constellation, and just a faint little group of stars.'],
    factsAdvanced: [
      'Second-smallest after Crux, and the smallest of Ptolemy\'s original 48. No star brighter than magnitude 3.9 and no Messier objects.',
    ],
  },
  {
    id: 'eridanus', name: 'Eridanus', genitive: 'Eridani', abbr: 'Eri',
    english: 'The River', hemisphere: 'S', areaRank: 6, origin: 'ancient',
    brightest: 'Achernar (α Eri)',
    notable: ['Epsilon Eridani', 'NGC 1300 — a classic barred spiral', 'The CMB Cold Spot lies in this direction'],
    factsKids: [
      'Eridanus is a river of stars that winds a very long way across the sky.',
      'It is the sixth-largest constellation, and it takes a while to trace from one end to the other.',
    ],
    factsAdvanced: [
      'Runs from near Rigel in Orion all the way to Achernar, "the end of the river", spanning nearly 60° of declination.',
      'The CMB Cold Spot, an anomalously cool region of the microwave background, lies in this direction; a large foreground supervoid is one proposed but contested explanation.',
    ],
  },
  {
    id: 'fornax', name: 'Fornax', genitive: 'Fornacis', abbr: 'For',
    english: 'The Furnace', hemisphere: 'S', areaRank: 41, origin: 'modern',
    brightest: 'Dalim (α For)',
    notable: ['The Hubble Ultra Deep Field', 'The Fornax Cluster of galaxies', 'NGC 1365 — a great barred spiral'],
    factsKids: [
      'Hubble pointed at a tiny empty-looking spot in this constellation for days, and found thousands of galaxies hiding there.',
    ],
    factsAdvanced: [
      'The Hubble Ultra Deep Field covered ~1/13,000,000 of the sky and revealed roughly 10,000 galaxies, some seen within a billion years of the Big Bang — the deepest optical image of its era.',
      'The Fornax Cluster is the second-richest galaxy cluster within 100 million light-years after Virgo.',
    ],
  },
  {
    id: 'gemini', name: 'Gemini', genitive: 'Geminorum', abbr: 'Gem',
    english: 'The Twins', hemisphere: 'N', areaRank: 30, origin: 'ancient',
    brightest: 'Pollux (β Gem)', zodiac: true,
    notable: ['M35 — a fine open cluster', 'NGC 2392 — the Eskimo Nebula', 'The Geminid meteor shower'],
    factsKids: [
      'Two bright stars side by side — Castor and Pollux, the twins.',
      'The best meteor shower of the year comes from this constellation, every December.',
      'Pluto was discovered here in 1930.',
    ],
    factsAdvanced: [
      'Beta (Pollux) is brighter than Alpha (Castor) — one of several Bayer misorderings. Pollux is also the nearest giant star with a confirmed planet.',
      'Castor is a six-star system: three spectroscopic binaries bound together.',
      'The Geminids are unusual in originating from an asteroid, 3200 Phaethon, rather than a comet.',
    ],
  },
  {
    id: 'grus', name: 'Grus', genitive: 'Gruis', abbr: 'Gru',
    english: 'The Crane', hemisphere: 'S', areaRank: 45, origin: 'modern',
    brightest: 'Alnair (α Gru)',
    notable: ['The Grus Quartet — interacting galaxies'],
    factsKids: ['Grus is a crane — a long-necked wading bird — in the southern sky.'],
    factsAdvanced: [
      'One of Plancius\' twelve southern constellations from Keyser and de Houtman\'s 1595–97 observations. Its stars were formerly part of Piscis Austrinus.',
    ],
  },
  {
    id: 'hercules', name: 'Hercules', genitive: 'Herculis', abbr: 'Her',
    english: 'The Hero', hemisphere: 'N', areaRank: 5, origin: 'ancient',
    brightest: 'Kornephoros (β Her)',
    notable: ['M13 — the Great Globular Cluster', 'M92 — another fine globular', 'The Hercules–Corona Borealis Great Wall'],
    factsKids: [
      'Hercules is the fifth-largest constellation, but surprisingly dim for such a famous hero.',
      'It contains M13, a ball of hundreds of thousands of stars that looks like a fuzzy snowball through binoculars.',
    ],
    factsAdvanced: [
      'M13 holds several hundred thousand stars at ~22,000 ly. The 1974 Arecibo message — humanity\'s first deliberate interstellar radio transmission — was aimed at it as a demonstration.',
      'The solar apex, the direction of the Sun\'s motion relative to nearby stars, lies in Hercules near the border with Lyra.',
    ],
  },
  {
    id: 'horologium', name: 'Horologium', genitive: 'Horologii', abbr: 'Hor',
    english: 'The Pendulum Clock', hemisphere: 'S', areaRank: 58, origin: 'modern',
    brightest: 'α Horologii',
    notable: ['NGC 1261 — a globular cluster'],
    factsKids: ['Horologium is a pendulum clock, named to honour the man who invented it.'],
    factsAdvanced: [
      'Lacaille named it for Christiaan Huygens\' pendulum clock — the instrument that made precise longitude determination and modern positional astronomy possible.',
    ],
  },
  {
    id: 'hydra', name: 'Hydra', genitive: 'Hydrae', abbr: 'Hya',
    english: 'The Water Snake', hemisphere: 'S', areaRank: 1, origin: 'ancient',
    brightest: 'Alphard (α Hya)',
    notable: ['M83 — the Southern Pinwheel Galaxy', 'M48, M68 — clusters', 'NGC 3242 — the Ghost of Jupiter'],
    factsKids: [
      'Hydra is the largest constellation of all — a snake stretching more than a quarter of the way around the sky.',
      'It takes about seven hours for the whole thing to rise.',
    ],
    factsAdvanced: [
      'Largest at 1,303 square degrees, spanning over 100° of right ascension, yet with only one star brighter than magnitude 3 — Alphard, "the solitary one", well named.',
    ],
  },
  {
    id: 'hydrus', name: 'Hydrus', genitive: 'Hydri', abbr: 'Hyi',
    english: 'The Lesser Water Snake', hemisphere: 'S', areaRank: 61, origin: 'modern',
    brightest: 'β Hydri',
    notable: ['Lies between the two Magellanic Clouds'],
    factsKids: ['Hydrus is a small water snake, easy to confuse with the much bigger Hydra.'],
    factsAdvanced: [
      'Beta Hydri is one of the nearest and oldest Sun-like stars, a subgiant of ~6.5 billion years — effectively a portrait of the Sun\'s near future.',
    ],
  },
  {
    id: 'indus', name: 'Indus', genitive: 'Indi', abbr: 'Ind',
    english: 'The Indian', hemisphere: 'S', areaRank: 49, origin: 'modern',
    brightest: 'α Indi',
    notable: ['Epsilon Indi — a nearby star system'],
    factsKids: ['Indus represents an indigenous person, from the age of European sea voyages.'],
    factsAdvanced: [
      'Epsilon Indi at 11.9 ly is one of the nearest star systems, with a K dwarf primary and a bound pair of brown dwarfs — among the closest brown dwarfs known.',
    ],
  },
  {
    id: 'lacerta', name: 'Lacerta', genitive: 'Lacertae', abbr: 'Lac',
    english: 'The Lizard', hemisphere: 'N', areaRank: 68, origin: 'modern',
    brightest: 'α Lacertae',
    notable: ['BL Lacertae — prototype of the blazars'],
    factsKids: ['Lacerta is a small zigzag of stars squeezed between Cygnus and Andromeda.'],
    factsAdvanced: [
      'BL Lacertae was catalogued as a variable star until 1968, when it was recognised as an active galactic nucleus with a relativistic jet pointed nearly at us — giving its name to the entire BL Lac / blazar class.',
    ],
  },
  {
    id: 'leo', name: 'Leo', genitive: 'Leonis', abbr: 'Leo',
    english: 'The Lion', hemisphere: 'N', areaRank: 12, origin: 'ancient',
    brightest: 'Regulus (α Leo)', zodiac: true,
    notable: ['M65, M66, NGC 3628 — the Leo Triplet', 'The Leonid meteor shower', 'The Leo Ring'],
    factsKids: [
      'Leo actually looks like a crouching lion — the head is a backwards question mark called the Sickle.',
      'The Leonid meteor shower comes from here every November, and occasionally becomes a storm of thousands of meteors an hour.',
    ],
    factsAdvanced: [
      'The 1833 Leonid storm produced estimated rates over 100,000 per hour and effectively founded meteor science by demonstrating a radiant fixed against the stars — proving the meteors were extraterrestrial and following a common orbit.',
      'Regulus lies within 0.5° of the ecliptic, making it the brightest star routinely occulted by the Moon.',
    ],
  },
  {
    id: 'leo-minor', name: 'Leo Minor', genitive: 'Leonis Minoris', abbr: 'LMi',
    english: 'The Lesser Lion', hemisphere: 'N', areaRank: 64, origin: 'modern',
    brightest: 'Praecipua (46 LMi)',
    notable: ["Hanny's Voorwerp — a quasar light echo"],
    factsKids: ['Leo Minor is a faint little lion tucked above the big one.'],
    factsAdvanced: [
      'One of Hevelius\' 1687 additions, and notable for a labelling accident: it has no Alpha star, because Francis Baily\'s lettering left the brightest star as 46 LMi.',
      "Hanny's Voorwerp, found by a volunteer in the Galaxy Zoo project in 2007, is a glowing gas cloud ionised by a quasar that has since switched off — a light echo of recent black-hole activity.",
    ],
  },
  {
    id: 'lepus', name: 'Lepus', genitive: 'Leporis', abbr: 'Lep',
    english: 'The Hare', hemisphere: 'S', areaRank: 51, origin: 'ancient',
    brightest: 'Arneb (α Lep)',
    notable: ['M79 — an unusual globular cluster', "Hind's Crimson Star (R Leporis)"],
    factsKids: ['Lepus is a hare crouching beneath Orion\'s feet, being chased by his hunting dogs.'],
    factsAdvanced: [
      'M79 is unusual for a globular cluster: it sits opposite the galactic centre, and may have been captured from the Canis Major dwarf galaxy.',
      'R Leporis is a carbon star of famously deep red colour, its blue light absorbed by carbon compounds in its atmosphere.',
    ],
  },
  {
    id: 'libra', name: 'Libra', genitive: 'Librae', abbr: 'Lib',
    english: 'The Scales', hemisphere: 'S', areaRank: 29, origin: 'ancient',
    brightest: 'Zubeneschamali (β Lib)', zodiac: true,
    notable: ['Gliese 581 — a well-studied planetary system'],
    factsKids: [
      'Libra is the only zodiac constellation that is an object, not an animal or person — it is a set of weighing scales.',
      'Its two brightest star names mean "northern claw" and "southern claw", because it used to be part of the scorpion next door.',
    ],
    factsAdvanced: [
      'The Romans separated it from Scorpius; the Bayer names Zubenelgenubi and Zubeneschamali preserve the older Arabic "claws of the scorpion".',
      'Gliese 581 hosted a series of contested habitable-zone planet claims through 2007–2014; several were later attributed to stellar activity, and the system became a case study in radial-velocity false positives.',
    ],
  },
  {
    id: 'lupus', name: 'Lupus', genitive: 'Lupi', abbr: 'Lup',
    english: 'The Wolf', hemisphere: 'S', areaRank: 46, origin: 'ancient',
    brightest: 'α Lupi',
    notable: ['SN 1006 remnant — the brightest supernova in recorded history'],
    factsKids: ['Lupus is a wolf, shown as an animal speared by the neighbouring centaur.'],
    factsAdvanced: [
      'SN 1006 was the brightest stellar event in recorded history, reaching roughly magnitude −7.5 — bright enough to read by, and documented in Chinese, Japanese, Arabic, and European records.',
    ],
  },
  {
    id: 'lynx', name: 'Lynx', genitive: 'Lyncis', abbr: 'Lyn',
    english: 'The Lynx', hemisphere: 'N', areaRank: 28, origin: 'modern',
    brightest: 'α Lyncis',
    notable: ['NGC 2419 — the "Intergalactic Wanderer"'],
    factsKids: ['Hevelius named this one the Lynx because he said you needed the eyes of a lynx to see it at all.'],
    factsAdvanced: [
      'NGC 2419 lies ~275,000 ly away — further than the Magellanic Clouds — and was long thought to be escaping the Galaxy, hence its nickname, though it is now considered bound.',
    ],
  },
  {
    id: 'lyra', name: 'Lyra', genitive: 'Lyrae', abbr: 'Lyr',
    english: 'The Lyre', hemisphere: 'N', areaRank: 52, origin: 'ancient',
    brightest: 'Vega (α Lyr)',
    notable: ['M57 — the Ring Nebula', 'Epsilon Lyrae — the Double Double', 'RR Lyrae — a standard candle prototype'],
    factsKids: [
      'Small but easy to find, thanks to brilliant blue-white Vega.',
      'It holds the Ring Nebula — a perfect smoke ring made by a dying star.',
    ],
    factsAdvanced: [
      'RR Lyrae stars are the prototype short-period pulsating variables used to measure distances to globular clusters and the galactic halo — the older, fainter counterpart to Cepheids.',
      'Epsilon Lyrae resolves into two pairs in a small telescope, and each pair is itself a genuine binary — a true quadruple system.',
    ],
  },
  {
    id: 'mensa', name: 'Mensa', genitive: 'Mensae', abbr: 'Men',
    english: 'The Table Mountain', hemisphere: 'S', areaRank: 75, origin: 'modern',
    brightest: 'α Mensae',
    notable: ['Part of the Large Magellanic Cloud'],
    factsKids: ['Mensa is named after a real mountain — Table Mountain in South Africa.'],
    factsAdvanced: [
      'The only constellation named for a terrestrial geographic feature. Lacaille named it for the mountain overlooking the site of his southern survey, and its faintest stars make it the dimmest constellation in the sky.',
    ],
  },
  {
    id: 'microscopium', name: 'Microscopium', genitive: 'Microscopii', abbr: 'Mic',
    english: 'The Microscope', hemisphere: 'S', areaRank: 66, origin: 'modern',
    brightest: 'γ Microscopii',
    notable: ['AU Microscopii — a young star with a debris disk'],
    factsKids: ['Microscopium is a microscope — another scientific instrument in the southern sky.'],
    factsAdvanced: [
      'AU Mic is a young (~23 Myr) M dwarf with an edge-on debris disk and transiting planets, making it one of the best laboratories for watching planet formation in progress.',
    ],
  },
  {
    id: 'monoceros', name: 'Monoceros', genitive: 'Monocerotis', abbr: 'Mon',
    english: 'The Unicorn', hemisphere: 'both', areaRank: 35, origin: 'modern',
    brightest: 'β Monocerotis',
    notable: ['NGC 2237 — the Rosette Nebula', 'The Cone Nebula', 'V838 Monocerotis — a famous light echo'],
    factsKids: [
      'A unicorn hiding in the faint sky between Orion and the two dogs.',
      'It contains the Rosette Nebula, a huge flower-shaped cloud with a cluster of new stars in the middle.',
    ],
    factsAdvanced: [
      'V838 Monocerotis erupted in 2002, and Hubble imaged the expanding light echo through surrounding dust over subsequent years — one of the most striking image sequences ever produced, and often misdescribed as an expanding explosion when it is light sweeping outward through pre-existing dust.',
    ],
  },
  {
    id: 'musca', name: 'Musca', genitive: 'Muscae', abbr: 'Mus',
    english: 'The Fly', hemisphere: 'S', areaRank: 77, origin: 'modern',
    brightest: 'α Muscae',
    notable: ['The Dark Doodad Nebula', 'NGC 4833 — a globular cluster'],
    factsKids: ['Musca is the only insect among the 88 constellations.'],
    factsAdvanced: [
      'The Dark Doodad is a strikingly linear dark nebula about 3° long — a filamentary dust lane silhouetted against a rich star field.',
    ],
  },
  {
    id: 'norma', name: 'Norma', genitive: 'Normae', abbr: 'Nor',
    english: "The Carpenter's Square", hemisphere: 'S', areaRank: 74, origin: 'modern',
    brightest: 'γ² Normae',
    notable: ['The Norma Cluster', 'Lies toward the Great Attractor'],
    factsKids: ['Norma is a carpenter\'s set square, for drawing right angles.'],
    factsAdvanced: [
      'The Great Attractor, a mass concentration pulling the Local Group and thousands of other galaxies, lies in this direction — obscured behind the Milky Way\'s Zone of Avoidance, which is why it took decades to characterise.',
      'Norma has no Alpha or Beta star: those designations were reassigned to Scorpius when the boundaries were fixed.',
    ],
  },
  {
    id: 'octans', name: 'Octans', genitive: 'Octantis', abbr: 'Oct',
    english: 'The Octant', hemisphere: 'S', areaRank: 50, origin: 'modern',
    brightest: 'ν Octantis',
    notable: ['Sigma Octantis — the south pole star'],
    factsKids: [
      'Octans contains the southern pole star — but it is so faint you can barely see it, unlike the bright North Star.',
    ],
    factsAdvanced: [
      'Sigma Octantis sits about 1° from the south celestial pole but shines at only magnitude 5.4 — near the naked-eye limit and useless for practical navigation, which is why southern navigators use the Southern Cross instead.',
    ],
  },
  {
    id: 'ophiuchus', name: 'Ophiuchus', genitive: 'Ophiuchi', abbr: 'Oph',
    english: 'The Serpent Bearer', hemisphere: 'both', areaRank: 11, origin: 'ancient',
    brightest: 'Rasalhague (α Oph)',
    notable: ["Barnard's Star", "Kepler's Supernova (SN 1604)", 'M9, M10, M12 — globular clusters'],
    factsKids: [
      'The Sun passes through Ophiuchus every year, but it is not one of the twelve zodiac signs — the zodiac was set long ago and never updated.',
      'It holds Barnard\'s Star, the fastest-moving star in the sky.',
    ],
    factsAdvanced: [
      'The Sun spends about 18 days in Ophiuchus each year, more than in Scorpius. The astrological zodiac uses twelve equal 30° signs that stopped matching the constellations once precession moved them.',
      'SN 1604, "Kepler\'s Star", was the last supernova observed in the Milky Way with the naked eye.',
    ],
  },
  {
    id: 'orion', name: 'Orion', genitive: 'Orionis', abbr: 'Ori',
    english: 'The Hunter', hemisphere: 'both', areaRank: 26, origin: 'ancient',
    brightest: 'Rigel (β Ori)',
    notable: ['M42 — the Orion Nebula', 'The Horsehead Nebula', 'Betelgeuse', "Orion's Belt"],
    factsKids: [
      'Orion is the easiest constellation to find: three bright stars in a straight line make his belt.',
      'Almost everyone on Earth can see it — it sits right on the celestial equator.',
      'Look at the two shoulder-and-foot stars: Betelgeuse is orange, Rigel is blue-white. That is a real temperature difference you can see without any equipment.',
      'The fuzzy patch under the belt is the Orion Nebula, where new stars are being born right now.',
    ],
    factsAdvanced: [
      'M42 at ~1,344 ly is the nearest region of massive star formation and the most studied nebula in the sky. Its Trapezium cluster ionises the whole complex.',
      'The Belt stars — Alnitak, Alnilam, Mintaka — are all hot B and O supergiants belonging to the Orion OB1 association, a genuine physical grouping rather than a chance alignment.',
      'Orion straddles the celestial equator, which is why it is visible from essentially every inhabited latitude, and why it appears in the sky traditions of nearly every culture.',
      'Rigel (Beta) usually outshines Betelgeuse (Alpha) — Bayer\'s lettering caught Betelgeuse at a brighter phase of its irregular variability.',
    ],
  },
  {
    id: 'pavo', name: 'Pavo', genitive: 'Pavonis', abbr: 'Pav',
    english: 'The Peacock', hemisphere: 'S', areaRank: 44, origin: 'modern',
    brightest: 'Peacock (α Pav)',
    notable: ['NGC 6752 — a bright globular cluster'],
    factsKids: ['Pavo is a peacock, and its brightest star is simply called Peacock.'],
    factsAdvanced: [
      'The name "Peacock" was invented in the 1930s by the British Nautical Almanac Office, which needed pronounceable proper names for all 57 navigation stars — several southern stars got English names this way.',
    ],
  },
  {
    id: 'pegasus', name: 'Pegasus', genitive: 'Pegasi', abbr: 'Peg',
    english: 'The Winged Horse', hemisphere: 'N', areaRank: 7, origin: 'ancient',
    brightest: 'Enif (ε Peg)',
    notable: ['The Great Square of Pegasus', 'M15 — a dense globular cluster', '51 Pegasi — the first exoplanet host'],
    factsKids: [
      'Four stars make the Great Square of Pegasus — a big empty box that is easy to spot in autumn.',
      'The first planet ever found around another Sun-like star is in this constellation.',
    ],
    factsAdvanced: [
      '51 Pegasi b, announced in 1995 by Mayor and Queloz, was the first exoplanet found orbiting a Sun-like star. A Jupiter-mass planet on a 4.2-day orbit contradicted every formation model of the time and opened the field; it won the 2019 Nobel Prize in Physics.',
      'M15 has one of the densest cores of any known globular cluster and may harbour an intermediate-mass black hole.',
    ],
  },
  {
    id: 'perseus', name: 'Perseus', genitive: 'Persei', abbr: 'Per',
    english: 'The Hero', hemisphere: 'N', areaRank: 24, origin: 'ancient',
    brightest: 'Mirfak (α Per)',
    notable: ['Algol — the Demon Star', 'The Double Cluster (NGC 869/884)', 'The Perseid meteor shower'],
    factsKids: [
      'Perseus is the hero who rescued Andromeda from the sea monster.',
      'Its star Algol dims noticeably every 2.87 days — ancient astronomers called it the Demon Star, and it really is winking at you.',
      'The Perseid meteors come from here every August.',
    ],
    factsAdvanced: [
      'Algol is the prototype eclipsing binary. John Goodricke correctly proposed the eclipse explanation in 1783 at age 19; its variability may have been noticed millennia earlier, and an Egyptian calendar papyrus has been argued to encode its period.',
      'The Algol paradox — the less massive star is the more evolved — was resolved by recognising mass transfer between the components, a foundational result in binary evolution.',
    ],
  },
  {
    id: 'phoenix', name: 'Phoenix', genitive: 'Phoenicis', abbr: 'Phe',
    english: 'The Phoenix', hemisphere: 'S', areaRank: 37, origin: 'modern',
    brightest: 'Ankaa (α Phe)',
    notable: ['The Phoenix Dwarf Galaxy', 'The Phoenix Cluster'],
    factsKids: ['The phoenix is the mythical bird that burns up and is reborn from its own ashes.'],
    factsAdvanced: [
      'The Phoenix Cluster hosts one of the most extreme starburst cooling flows known, forming hundreds of solar masses of stars per year in its central galaxy — far above typical cluster cores.',
    ],
  },
  {
    id: 'pictor', name: 'Pictor', genitive: 'Pictoris', abbr: 'Pic',
    english: "The Painter's Easel", hemisphere: 'S', areaRank: 59, origin: 'modern',
    brightest: 'α Pictoris',
    notable: ['Beta Pictoris — a famous debris disk and imaged planet'],
    factsKids: ['Pictor is a painter\'s easel. One of its stars has a planet that astronomers have actually photographed.'],
    factsAdvanced: [
      'Beta Pictoris is the archetypal young debris-disk system: the disk was imaged in 1984, and Beta Pic b was directly imaged in 2008 — among the first exoplanets photographed rather than inferred.',
    ],
  },
  {
    id: 'pisces', name: 'Pisces', genitive: 'Piscium', abbr: 'Psc',
    english: 'The Fishes', hemisphere: 'N', areaRank: 14, origin: 'ancient',
    brightest: 'Alpherg (η Psc)', zodiac: true,
    notable: ['M74 — a face-on spiral galaxy', 'The vernal equinox currently lies here'],
    factsKids: [
      'Pisces is two fish tied together by their tails.',
      'The Sun crosses this constellation at the moment spring begins in the northern half of the world.',
    ],
    factsAdvanced: [
      'The vernal equinox — the zero point of right ascension — currently sits in Pisces, having precessed out of Aries. It moves into Aquarius in a few centuries.',
      'Large in area but faint: no star brighter than magnitude 3.6.',
    ],
  },
  {
    id: 'piscis-austrinus', name: 'Piscis Austrinus', genitive: 'Piscis Austrini', abbr: 'PsA',
    english: 'The Southern Fish', hemisphere: 'S', areaRank: 60, origin: 'ancient',
    brightest: 'Fomalhaut (α PsA)',
    notable: ['Fomalhaut\'s debris ring'],
    factsKids: ['A single bright star, Fomalhaut, sitting alone in an empty stretch of autumn sky.'],
    factsAdvanced: [
      'Fomalhaut dominates completely; no other star exceeds magnitude 4.3. Its sharply bounded debris ring made it one of the first systems where planet-shepherding of dust was inferred directly.',
    ],
  },
  {
    id: 'puppis', name: 'Puppis', genitive: 'Puppis', abbr: 'Pup',
    english: 'The Stern', hemisphere: 'S', areaRank: 20, origin: 'ancient',
    brightest: 'Naos (ζ Pup)',
    notable: ['M46, M47, M93 — open clusters', 'NGC 2440 — a planetary nebula'],
    factsKids: ['Puppis is the stern — the back end — of the ship Argo.'],
    factsAdvanced: [
      'Naos is an O4-type supergiant, one of the hottest and most luminous naked-eye stars at ~40,000 K, radiating overwhelmingly in the ultraviolet. It is also a runaway star.',
      'Like Carina and Vela, it retains only a fragment of Argo Navis\' Bayer letters — Puppis begins at Zeta.',
    ],
  },
  {
    id: 'pyxis', name: 'Pyxis', genitive: 'Pyxidis', abbr: 'Pyx',
    english: 'The Compass Box', hemisphere: 'S', areaRank: 65, origin: 'modern',
    brightest: 'α Pyxidis',
    notable: ['T Pyxidis — a recurrent nova'],
    factsKids: ['Pyxis is a ship\'s magnetic compass — the kind that points north.'],
    factsAdvanced: [
      'T Pyxidis is a recurrent nova with recorded outbursts in 1890, 1902, 1920, 1944, 1967, and 2011 — a white dwarf accreting from a companion and detonating its surface repeatedly.',
    ],
  },
  {
    id: 'reticulum', name: 'Reticulum', genitive: 'Reticuli', abbr: 'Ret',
    english: 'The Reticle', hemisphere: 'S', areaRank: 82, origin: 'modern',
    brightest: 'α Reticuli',
    notable: ['Zeta Reticuli — a nearby binary of solar analogues'],
    factsKids: ['A reticle is the crosshair grid inside a telescope eyepiece, used for measuring positions.'],
    factsAdvanced: [
      'Lacaille named it for the reticle in his own instrument — the tool he used to make the survey that produced fourteen of the 88 constellations.',
    ],
  },
  {
    id: 'sagitta', name: 'Sagitta', genitive: 'Sagittae', abbr: 'Sge',
    english: 'The Arrow', hemisphere: 'N', areaRank: 86, origin: 'ancient',
    brightest: 'γ Sagittae',
    notable: ['M71 — a loose globular cluster'],
    factsKids: ['Sagitta is the third-smallest constellation, but it genuinely looks like an arrow.'],
    factsAdvanced: [
      'Third-smallest yet one of Ptolemy\'s original 48 — small size did not prevent ancient recognition when the shape is this distinct.',
    ],
  },
  {
    id: 'sagittarius', name: 'Sagittarius', genitive: 'Sagittarii', abbr: 'Sgr',
    english: 'The Archer', hemisphere: 'S', areaRank: 15, origin: 'ancient',
    brightest: 'Kaus Australis (ε Sgr)', zodiac: true,
    notable: ['Sagittarius A* — the galactic centre black hole', 'M8 — the Lagoon Nebula', 'M20 — the Trifid Nebula', 'M22 — a superb globular'],
    factsKids: [
      'Look toward Sagittarius and you are looking straight at the centre of our galaxy.',
      'Its brightest stars make a shape most people call the Teapot — and the Milky Way steams out of its spout.',
      'A black hole four million times heavier than the Sun sits at the middle of it all.',
    ],
    factsAdvanced: [
      'Sagittarius A* is the Milky Way\'s central supermassive black hole, ~4.3 million M☉ at ~26,000 ly. Tracking individual stellar orbits around it won the 2020 Nobel Prize, and the Event Horizon Telescope imaged it in 2022.',
      'The richest region of the Milky Way as seen from Earth — we are looking through the entire galactic disk toward the bulge, which is why so many Messier objects cluster here.',
    ],
  },
  {
    id: 'scorpius', name: 'Scorpius', genitive: 'Scorpii', abbr: 'Sco',
    english: 'The Scorpion', hemisphere: 'S', areaRank: 33, origin: 'ancient',
    brightest: 'Antares (α Sco)', zodiac: true,
    notable: ['M4 — a nearby globular cluster', 'M6, M7 — bright open clusters', 'Scorpius X-1 — the first cosmic X-ray source'],
    factsKids: [
      'Scorpius is one of the few constellations that really looks like its name — a curving body with a stinger at the end.',
      'Red Antares is its heart. In the myth, this is the scorpion that killed Orion, which is why the two are never in the sky at the same time.',
    ],
    factsAdvanced: [
      'Scorpius X-1, found in 1962, was the first X-ray source detected outside the Solar System and effectively founded X-ray astronomy — the discovery earned Riccardo Giacconi a share of the 2002 Nobel Prize.',
      'The Sun spends only about six days in Scorpius, less than in any other zodiac constellation, and far less than the eighteen it spends in neighbouring Ophiuchus.',
    ],
  },
  {
    id: 'sculptor', name: 'Sculptor', genitive: 'Sculptoris', abbr: 'Scl',
    english: "The Sculptor's Studio", hemisphere: 'S', areaRank: 36, origin: 'modern',
    brightest: 'α Sculptoris',
    notable: ['NGC 253 — the Sculptor Galaxy', 'The Sculptor Dwarf Galaxy', 'The south galactic pole'],
    factsKids: ['Sculptor is a sculptor\'s workshop, and it is a good place to look for other galaxies.'],
    factsAdvanced: [
      'The south galactic pole lies here, so we look out of the Milky Way\'s disk with minimal dust obscuration — which is why so many external galaxies are visible in this direction.',
      'NGC 253 is one of the brightest and dustiest starburst galaxies in the sky.',
    ],
  },
  {
    id: 'scutum', name: 'Scutum', genitive: 'Scuti', abbr: 'Sct',
    english: 'The Shield', hemisphere: 'S', areaRank: 84, origin: 'modern',
    brightest: 'α Scuti',
    notable: ['M11 — the Wild Duck Cluster', 'The Scutum Star Cloud', 'UY Scuti'],
    factsKids: ['Scutum is a shield, and it sits in front of one of the brightest patches of the Milky Way.'],
    factsAdvanced: [
      'The only constellation named for a specific historical political event: Hevelius named it Scutum Sobiescianum for John III Sobieski after the 1683 Battle of Vienna.',
      'M11 is one of the richest and most compact open clusters known, with a distinctly globular-like concentration.',
    ],
  },
  {
    id: 'serpens', name: 'Serpens', genitive: 'Serpentis', abbr: 'Ser',
    english: 'The Serpent', hemisphere: 'both', areaRank: 23, origin: 'ancient',
    brightest: 'Unukalhai (α Ser)',
    notable: ['M16 — the Eagle Nebula and the Pillars of Creation', 'M5 — a fine globular cluster'],
    factsKids: [
      'Serpens is the only constellation split into two separate pieces — a head and a tail, with Ophiuchus holding the middle.',
      'It contains the Pillars of Creation, probably the most famous space photograph ever taken.',
    ],
    factsAdvanced: [
      'The only constellation divided into two disjoint regions: Serpens Caput (the head) and Serpens Cauda (the tail), separated by Ophiuchus but counted as one constellation.',
      'The Pillars of Creation in M16 are columns of cold molecular gas being photo-evaporated by radiation from nearby O stars. This app raymarches them on the Nebula rung.',
    ],
  },
  {
    id: 'sextans', name: 'Sextans', genitive: 'Sextantis', abbr: 'Sex',
    english: 'The Sextant', hemisphere: 'both', areaRank: 47, origin: 'modern',
    brightest: 'α Sextantis',
    notable: ['NGC 3115 — the Spindle Galaxy', 'The Sextans Dwarf Galaxy'],
    factsKids: ['A sextant is the instrument sailors used to measure the height of stars above the horizon.'],
    factsAdvanced: [
      'Hevelius named it for the sextant he used for pre-telescopic positional measurements — destroyed in the 1679 fire that consumed his observatory, which he noted pointedly when naming it.',
    ],
  },
  {
    id: 'taurus', name: 'Taurus', genitive: 'Tauri', abbr: 'Tau',
    english: 'The Bull', hemisphere: 'N', areaRank: 17, origin: 'ancient',
    brightest: 'Aldebaran (α Tau)', zodiac: true,
    notable: ['M45 — the Pleiades', 'The Hyades cluster', 'M1 — the Crab Nebula'],
    factsKids: [
      'Taurus holds the Pleiades — a tight little group of stars also called the Seven Sisters. Most people see six; sharp eyes see more.',
      'The V-shaped face of the bull is a real star cluster called the Hyades.',
      'It also holds the Crab Nebula, the wreckage of a star that exploded in the year 1054 and was bright enough to see in daylight.',
    ],
    factsAdvanced: [
      'The Pleiades at ~444 ly is among the nearest and most recognisable open clusters, appearing in sky traditions worldwide — Japanese Subaru, Māori Matariki, Greek Seven Sisters.',
      'The Hyades at ~153 ly is the nearest open cluster, and its convergent-point distance was historically a critical calibration rung for the whole distance ladder.',
      'M1 is the remnant of SN 1054, recorded by Chinese and Japanese astronomers. Its pulsar spins ~30 times per second; this app renders it on the Nebula rung with the beat deliberately slowed and declared in the copy.',
    ],
  },
  {
    id: 'telescopium', name: 'Telescopium', genitive: 'Telescopii', abbr: 'Tel',
    english: 'The Telescope', hemisphere: 'S', areaRank: 57, origin: 'modern',
    brightest: 'α Telescopii',
    notable: ['NGC 6584 — a globular cluster'],
    factsKids: ['Telescopium honours the telescope itself.'],
    factsAdvanced: [
      'Lacaille named it for the long aerial refractors of the era. He shrank it considerably from his original outline, returning borrowed stars to Sagittarius, Ophiuchus, and Corona Australis.',
    ],
  },
  {
    id: 'triangulum', name: 'Triangulum', genitive: 'Trianguli', abbr: 'Tri',
    english: 'The Triangle', hemisphere: 'N', areaRank: 78, origin: 'ancient',
    brightest: 'β Trianguli',
    notable: ['M33 — the Triangulum Galaxy'],
    factsKids: [
      'A simple, honest triangle of three stars.',
      'It contains the Triangulum Galaxy, the third-largest galaxy in our local neighbourhood.',
    ],
    factsAdvanced: [
      'M33 at ~2.7 million ly is the third-largest Local Group member after Andromeda and the Milky Way, and is sometimes claimed as the most distant object visible to the unaided eye under exceptional conditions.',
    ],
  },
  {
    id: 'triangulum-australe', name: 'Triangulum Australe', genitive: 'Trianguli Australis', abbr: 'TrA',
    english: 'The Southern Triangle', hemisphere: 'S', areaRank: 83, origin: 'modern',
    brightest: 'Atria (α TrA)',
    notable: ['NGC 6025 — an open cluster'],
    factsKids: ['A southern triangle, brighter and easier to see than the northern one.'],
    factsAdvanced: [
      'Its three main stars are brighter than those of Triangulum, making it the more conspicuous of the two despite being smaller.',
    ],
  },
  {
    id: 'tucana', name: 'Tucana', genitive: 'Tucanae', abbr: 'Tuc',
    english: 'The Toucan', hemisphere: 'S', areaRank: 48, origin: 'modern',
    brightest: 'α Tucanae',
    notable: ['The Small Magellanic Cloud', '47 Tucanae — a magnificent globular cluster'],
    factsKids: [
      'Tucana holds the Small Magellanic Cloud, a little galaxy that orbits our own.',
      'It also has 47 Tucanae, one of the finest globular star clusters in the whole sky.',
    ],
    factsAdvanced: [
      '47 Tucanae is the second-brightest globular cluster after Omega Centauri, with a dense core rich in millisecond pulsars and blue stragglers.',
      'The Small Magellanic Cloud is where Henrietta Leavitt found the Cepheid period–luminosity relation — all its stars share effectively one distance, which is what made the relation visible at all.',
    ],
  },
  {
    id: 'ursa-major', name: 'Ursa Major', genitive: 'Ursae Majoris', abbr: 'UMa',
    english: 'The Great Bear', hemisphere: 'N', areaRank: 3, origin: 'ancient',
    brightest: 'Alioth (ε UMa)',
    notable: ['The Big Dipper / Plough', 'M81 and M82 — a famous galaxy pair', 'M101 — the Pinwheel Galaxy', 'Mizar and Alcor'],
    factsKids: [
      'The Big Dipper is not a constellation — it is just the brightest part of the Great Bear.',
      'The two stars at the end of the bowl point straight at the North Star. That is how you find north.',
      'Look carefully at the middle star of the handle: there are two stars there. Being able to see both was once used as an eyesight test.',
    ],
    factsAdvanced: [
      'Third-largest constellation. Five of the seven Dipper stars share a common motion as the Ursa Major Moving Group — a genuine physical association at ~80 ly. Dubhe and Alkaid do not, so the asterism\'s shape is slowly deforming and will be visibly different in 100,000 years.',
      'Mizar was the first telescopic double discovered (1617) and the first spectroscopic binary identified (1889). The Mizar–Alcor system contains six stars in total.',
    ],
  },
  {
    id: 'ursa-minor', name: 'Ursa Minor', genitive: 'Ursae Minoris', abbr: 'UMi',
    english: 'The Little Bear', hemisphere: 'N', areaRank: 56, origin: 'ancient',
    brightest: 'Polaris (α UMi)',
    notable: ['Polaris — the North Star', 'The Ursa Minor Dwarf Galaxy'],
    factsKids: [
      'The Little Dipper, with the North Star at the very end of its handle.',
      'Because Polaris sits above the North Pole, the whole sky appears to spin around this constellation all night.',
    ],
    factsAdvanced: [
      'Contains the north celestial pole, so it is circumpolar from every northern latitude and completely invisible from most of the southern hemisphere.',
      'Beta and Gamma UMi are called the Guardians of the Pole, circling Polaris through the night.',
    ],
  },
  {
    id: 'vela', name: 'Vela', genitive: 'Velorum', abbr: 'Vel',
    english: 'The Sails', hemisphere: 'S', areaRank: 32, origin: 'ancient',
    brightest: 'γ Velorum (Regor)',
    notable: ['The Vela Supernova Remnant', 'The Vela Pulsar', 'The Gum Nebula'],
    factsKids: ['Vela is the sails of the ship Argo, and it contains the shredded remains of a star that exploded long ago.'],
    factsAdvanced: [
      'The Vela Pulsar spins about 11 times per second and was among the first pulsars firmly linked to a supernova remnant, establishing the connection between core collapse and neutron stars.',
      'Gamma Velorum is the brightest Wolf–Rayet star in the sky — a massive star that has shed its hydrogen envelope, exposing fusion products directly.',
    ],
  },
  {
    id: 'virgo', name: 'Virgo', genitive: 'Virginis', abbr: 'Vir',
    english: 'The Maiden', hemisphere: 'both', areaRank: 2, origin: 'ancient',
    brightest: 'Spica (α Vir)', zodiac: true,
    notable: ['The Virgo Cluster', 'M87 — first black hole ever imaged', 'M104 — the Sombrero Galaxy', '3C 273 — the first quasar identified'],
    factsKids: [
      'Virgo is the second-largest constellation, and the largest of the zodiac.',
      'The first photograph of a black hole ever taken was of one in this constellation.',
    ],
    factsAdvanced: [
      'The Virgo Cluster, ~54 million ly away with over 1,300 galaxies, is the heart of the Virgo Supercluster and the mass that governs the Local Group\'s infall.',
      'M87\'s supermassive black hole (~6.5 billion M☉) was the subject of the Event Horizon Telescope\'s 2019 image — the first direct picture of a black hole\'s shadow.',
      '3C 273 was the first object recognised as a quasar, when Maarten Schmidt identified its bizarre spectrum in 1963 as hugely redshifted hydrogen.',
    ],
  },
  {
    id: 'volans', name: 'Volans', genitive: 'Volantis', abbr: 'Vol',
    english: 'The Flying Fish', hemisphere: 'S', areaRank: 76, origin: 'modern',
    brightest: 'β Volantis',
    notable: ['The Meathook Galaxy (NGC 2442)'],
    factsKids: ['Volans is a flying fish — a real animal that leaps out of the water and glides.'],
    factsAdvanced: [
      'Another Keyser and de Houtman southern constellation, named for the flying fish Dutch sailors saw in tropical waters.',
    ],
  },
  {
    id: 'vulpecula', name: 'Vulpecula', genitive: 'Vulpeculae', abbr: 'Vul',
    english: 'The Little Fox', hemisphere: 'N', areaRank: 55, origin: 'modern',
    brightest: 'Anser (α Vul)',
    notable: ['M27 — the Dumbbell Nebula', 'PSR B1919+21 — the first pulsar discovered'],
    factsKids: [
      'Vulpecula is a little fox, and it holds the Dumbbell Nebula — a dying star that looks like an apple core.',
    ],
    factsAdvanced: [
      'The first pulsar, PSR B1919+21, was found here by Jocelyn Bell Burnell in 1967. The signal was so regular it was half-jokingly catalogued LGM-1, for "Little Green Men", before being identified as a rotating neutron star.',
      'M27 was the first planetary nebula ever discovered, by Charles Messier in 1764.',
    ],
  },
]

/** The twelve zodiac constellations, in the order the Sun crosses them. */
export const ZODIAC = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpius', 'sagittarius', 'capricornus', 'aquarius', 'pisces',
]

/** Lookup helpers — pure, no side effects. */
export const constellationById = (id) => CONSTELLATIONS.find((c) => c.id === id)
export const constellationByAbbr = (abbr) =>
  CONSTELLATIONS.find((c) => c.abbr.toLowerCase() === String(abbr).toLowerCase())
export const constellationsByHemisphere = (h) =>
  CONSTELLATIONS.filter((c) => c.hemisphere === h || c.hemisphere === 'both')
export const zodiacConstellations = () => ZODIAC.map(constellationById)

/** Sanity constant — the IAU list is closed at 88 and has been since 1922/1930. */
export const IAU_CONSTELLATION_COUNT = 88
