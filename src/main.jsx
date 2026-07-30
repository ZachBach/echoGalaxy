import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ?lab=1 (dev only) swaps in the tsl-lib version-portability lab. The
// DEV constant folds to false in prod, so the lab chunk is never built
// into the production bundle.
const useLab =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('lab')
const Root = useLab ? lazy(() => import('./Lab.jsx')) : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
