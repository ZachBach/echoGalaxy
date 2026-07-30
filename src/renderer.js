import { WebGPURenderer } from 'three/webgpu'

// Async `gl` factory for the R3F <Canvas> (Phase G0). WebGPU when the
// browser has it; renderer.init() swaps in three's WebGL2 backend
// otherwise (three logs a warning). Backend identity is only trustworthy
// after init() resolves — read it via backendName(), not at construction.
//
// Query-string flags:
//   ?backend=webgl — forceWebGL: pick the WebGL2 backend outright, in any
//     build, so both paths are testable side by side in one browser.
//   ?simulate-no-webgpu (dev only) — hide navigator.gpu so the real
//     fallback path runs in a WebGPU-capable browser.
export async function createRenderer(props) {
  const params = new URLSearchParams(window.location.search)

  if (import.meta.env.DEV && params.has('simulate-no-webgpu') && navigator.gpu) {
    Object.defineProperty(navigator, 'gpu', {
      value: undefined,
      configurable: true,
    })
  }

  const renderer = new WebGPURenderer({
    ...props,
    antialias: true,
    forceWebGL: params.get('backend') === 'webgl',
  })
  await renderer.init()
  if (import.meta.env.DEV) window.__gl = renderer
  return renderer
}

export function backendName(renderer) {
  if (!renderer?.backend) return null
  return renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2'
}
