import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dev-only scenes (?lab=1 → tsl-lib portability lab; ?planet=1 → planet
// core smoke). The DEV constant folds to false in prod, so neither chunk
// is built into the production bundle.
const devParams = import.meta.env.DEV
  ? new URLSearchParams(window.location.search)
  : null

// `system` is the one flag that is double-booked, and it is checked BY VALUE
// for that reason while every other route below checks presence.
//
// App reads ?system=<id> to pick a star system (initialSystemIndex), and the
// dev route wants ?system=1 for the standalone scene. With a presence check
// the route always won, so in dev ?system=proxima-centauri silently rendered
// SystemLab on the DEFAULT system — a documented flag that could not work,
// failing by showing you a plausible wrong answer rather than an error.
//
// Production was never affected (devParams is null there) and neither was
// capture, which pins its system from the shot definition rather than the
// URL. It cost a debugging round to find, which is exactly what it will cost
// the next person.
const devSystemLab = devParams?.get('system') === '1'

const Root = devParams?.has('lab')
  ? lazy(() => import('./Lab.jsx'))
  : devParams?.has('planet')
    ? lazy(() => import('./PlanetLab.jsx'))
    : devSystemLab
      ? lazy(() => import('./SystemLab.jsx'))
      : devParams?.has('group')
        ? lazy(() => import('./LocalGroupLab.jsx'))
        : devParams?.has('pillars')
          ? lazy(() => import('./PillarsLab.jsx'))
          : devParams?.has('cluster')
            ? lazy(() => import('./ClusterLab.jsx'))
            : devParams?.has('crab')
              ? lazy(() => import('./CrabLab.jsx'))
              : devParams?.has('wr')
                ? lazy(() => import('./WolfRayetLab.jsx'))
                : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)

// MB-10: the PWA service worker — prod only (a dev SW fights HMR).
// Relative path keeps the /galaxy/ subpath scope correct.
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {})
  })
}
