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
const Root = devParams?.has('lab')
  ? lazy(() => import('./Lab.jsx'))
  : devParams?.has('planet')
    ? lazy(() => import('./PlanetLab.jsx'))
    : devParams?.has('system')
      ? lazy(() => import('./SystemLab.jsx'))
      : devParams?.has('group')
        ? lazy(() => import('./LocalGroupLab.jsx'))
        : devParams?.has('pillars')
          ? lazy(() => import('./PillarsLab.jsx'))
          : devParams?.has('cluster')
            ? lazy(() => import('./ClusterLab.jsx'))
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
