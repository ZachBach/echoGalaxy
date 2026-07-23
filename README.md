# echoGalaxy

A free, open educational tool for exploring galaxies and the universe.

**v0.1** is an interactive galaxy-type explorer: orbit a procedurally generated
galaxy and cycle through the four broad Hubble classes — spiral, barred spiral,
elliptical, and irregular — each with a short explainer and a few facts.

## Stack

Vite + React 19 + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + three, with a
bloom pass from @react-three/postprocessing.

## Run

```
npm install
npm run dev
```

Open the printed localhost URL. `npm run build` produces a production bundle.

## Structure

- `src/App.jsx` — the canvas, orbit controls, bloom pass, and the HUD panel.
- `src/Galaxy.jsx` — the point-cloud galaxy (rebuilds when the class changes).
- `src/galaxyData.js` — the galaxy classes, their educational copy, and the
  procedural generator that shapes each one.

## Roadmap ideas

- Real catalogue objects (Messier / NGC) with imagery, distances, and redshift.
- Scale context — zoom from planet → star → galaxy → cluster → cosmic web.
- Star lifecycle / stellar-nursery mode.
- Guided tours and a search box for named objects.
