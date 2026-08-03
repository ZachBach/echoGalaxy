import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BASE_H_FOV } from './shots'

// Deterministic offline frame capture for echoGalaxy.
//
// Mount this inside <Canvas> when ?capture is present. It does four things:
//
//   1. Takes the camera away from OrbitControls and drives it along the
//      shot's path.
//   2. Replaces THREE.Clock.getDelta with a fixed step, so every animation
//      in the app advances by exactly 1/fps per frame regardless of how
//      long the frame actually took to render. Without this the capture is
//      not reproducible: R3F's advance(timestamp) does not feed its
//      argument into getDelta, so the clock would still read wall time.
//   3. Steps the frame loop manually via R3F's advance().
//   4. Grabs each frame off the canvas and writes it to a directory the
//      user picks.
//
// Because Galaxy.jsx accumulates rotation (rotation.y += dt * 0.05) rather
// than deriving it from absolute time, the timeline cannot be seeked. Each
// shot runs from its own frame zero. That is fine: shots are captured one
// at a time and assembled afterwards.
//
// Frame readback caveat, read this before you run it:
// Reading pixels back off a WebGPU-backed canvas after present is not
// guaranteed by the spec, and three's WebGPURenderer does not expose a
// preserveDrawingBuffer equivalent on that path. Capture with
// ?backend=webgl to force the WebGL2 backend, which you have already
// verified pixel-equivalent. If toBlob returns transparent or black frames
// on the WebGPU path, that is the reason, and the WebGL2 path is the fix
// rather than a workaround.

// Vertical fov that produces the requested horizontal fov at a given aspect.
//   hFov = 2 * atan(tan(vFov / 2) * aspect)
//   vFov = 2 * atan(tan(hFov / 2) / aspect)
const DEG = Math.PI / 180

export function fovFor({ lock, aspect, baseVFov = 55, baseHFov = BASE_H_FOV }) {
  if (lock === 'v') return baseVFov
  const halfH = (baseHFov * DEG) / 2
  return (2 * Math.atan(Math.tan(halfH) / aspect)) / DEG
}

function easeInOut(t) {
  // Smootherstep. Zero first and second derivative at both ends, which
  // matters here because a dissolve across a shot boundary will expose a
  // velocity discontinuity that plain smoothstep leaves behind.
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function buildCurve(shot) {
  const pts = [new THREE.Vector3(...shot.from.pos)]
  if (shot.via?.pos) pts.push(new THREE.Vector3(...shot.via.pos))
  pts.push(new THREE.Vector3(...shot.to.pos))
  if (pts.length === 2) {
    return {
      at(t) {
        return pts[0].clone().lerp(pts[1], t)
      },
    }
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
  return {
    at(t) {
      return curve.getPoint(t)
    },
  }
}

async function pickDirectory() {
  if (!window.showDirectoryPicker) {
    throw new Error(
      'File System Access API unavailable. Run the capture in Chrome or Edge.',
    )
  }
  return window.showDirectoryPicker({ mode: 'readwrite' })
}

async function writeBlob(dirHandle, name, blob) {
  const fileHandle = await dirHandle.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(blob)
  await writable.close()
}

async function postBlob(sink, name, blob) {
  const url = new URL(sink)
  url.searchParams.set('name', name)
  const response = await fetch(url, {
    method: 'POST',
    // An untyped Blob keeps this cross-origin request simple, so the local
    // capture sink does not need a preflight for every frame.
    body: new Blob([blob]),
  })
  if (!response.ok) {
    throw new Error(`capture sink rejected ${name}: ${response.status} ${await response.text()}`)
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
      'image/png',
    )
  })
}

export default function CaptureRig({
  shot,
  fps,
  width,
  height,
  sink,
  onStart,
  onProgress,
  onDone,
}) {
  const camera = useThree((s) => s.camera)
  const clock = useThree((s) => s.clock)
  const advance = useThree((s) => s.advance)
  const gl = useThree((s) => s.gl)
  const controls = useThree((s) => s.controls)
  const started = useRef(false)

  const curve = useMemo(() => buildCurve(shot), [shot])
  const target = useMemo(
    () => new THREE.Vector3(...(shot.to.target ?? shot.from.target ?? [0, 0, 0])),
    [shot],
  )

  // OrbitControls will fight the rig for the camera every frame it updates.
  useEffect(() => {
    if (!controls) return
    const prev = controls.enabled
    controls.enabled = false
    return () => {
      controls.enabled = prev
    }
  }, [controls])

  // Exact output resolution. The app runs dpr [1, 2]; capture pins it to 1
  // and sizes the drawing buffer to the delivery resolution so nothing has
  // to be rescaled afterwards.
  useEffect(() => {
    gl.setPixelRatio(1)
    gl.setSize(width, height, false)
    camera.aspect = width / height
    camera.fov = fovFor({ lock: shot.fovLock, aspect: width / height })
    camera.updateProjectionMatrix()
  }, [gl, camera, width, height, shot])

  useEffect(() => {
    if (started.current) return
    started.current = true

    let cancelled = false
    let restored = false
    const totalFrames = Math.round(shot.seconds * fps)
    const step = 1 / fps

    // Take the clock. Restored in cleanup.
    const originalGetDelta = clock.getDelta.bind(clock)
    const originalElapsed = clock.elapsedTime
    clock.elapsedTime = 0
    clock.getDelta = () => {
      clock.elapsedTime += step
      return step
    }
    const restoreClock = () => {
      if (restored) return
      restored = true
      clock.getDelta = originalGetDelta
      clock.elapsedTime = originalElapsed
    }

    // The deterministic timeline. App.jsx patches performance.now at
    // MODULE scope (three's Timer captures its _startTime at renderer
    // creation, so a later patch cannot help); this box is the single
    // time source the rig advances.
    const clockBox = (window.__captureClock ??= { t: 0 })

    const run = async () => {
      try {
        let dir
        if (sink) {
          // Validate early so a bad automation URL never consumes a shot.
          new URL(sink)
        } else {
          // showDirectoryPicker requires transient user activation — calling
          // it straight from this mount effect throws SecurityError. Arm on a
          // click and open the picker inside the click's own task.
          console.log(
            '[capture] armed — click the page to choose the frames folder and start',
          )
          dir = await new Promise((resolve, reject) => {
            window.addEventListener(
              'click',
              () => pickDirectory().then(resolve, reject),
              { once: true },
            )
          })
        }
        if (cancelled) return

        onStart?.()
        // Let React remove the arming prompt before a captured frame renders.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

        const canvas = gl.domElement
        // Constant 4-digit padding across every shot regardless of length, so
        // the assembly script can use one %04d pattern for all of them.
        const pad = 4

        // A few warm-up frames before the first captured one. The galaxy
        // position bake and the veil render-target bake both run inside React
        // effects on type change, and the first frame after a material swap
        // can land before they have settled.
        for (let i = 0; i < 4; i += 1) {
          clockBox.t = i * step * 1000
          camera.position.copy(curve.at(0))
          camera.lookAt(target)
          advance(clockBox.t)
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => requestAnimationFrame(r))
        }

        // Reset the clock so the warm-up does not leak into the shot. Galaxy
        // rotation accumulates, so those four frames would otherwise show up
        // as a small offset in the disc angle.
        clock.elapsedTime = 0

        for (let f = 0; f < totalFrames && !cancelled; f += 1) {
          const raw = totalFrames === 1 ? 0 : f / (totalFrames - 1)
          const t = shot.ease === 'linear' ? raw : easeInOut(raw)

          camera.position.copy(curve.at(t))
          camera.lookAt(target)
          camera.updateMatrixWorld()

          clockBox.t = (4 + f) * step * 1000
          advance(clockBox.t)

          // Grab in the same task as the render. On the WebGL2 backend the
          // drawing buffer is still intact here even without
          // preserveDrawingBuffer, because compositing has not run yet.
          // eslint-disable-next-line no-await-in-loop
          const blob = await canvasToBlob(canvas)
          const name = `${shot.id}.${String(f).padStart(pad, '0')}.png`
          // eslint-disable-next-line no-await-in-loop
          await (sink ? postBlob(sink, name, blob) : writeBlob(dir, name, blob))

          onProgress?.({ frame: f + 1, total: totalFrames })
        }

        if (!cancelled) {
          onDone?.({ ok: true, frames: totalFrames })
          console.log(`[capture] ${shot.id}: ${totalFrames} frames at ${fps} fps`)
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        console.error('[capture] failed:', error)
        if (!cancelled) onDone?.({ ok: false, error })
      } finally {
        restoreClock()
      }

    }
    run()

    return () => {
      cancelled = true
      restoreClock()
    }
  }, [
    shot,
    fps,
    clock,
    advance,
    gl,
    camera,
    curve,
    target,
    sink,
    onStart,
    onProgress,
    onDone,
  ])

  return null
}
