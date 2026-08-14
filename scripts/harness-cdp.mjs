/**
 * harness-cdp — the shared rig behind the browser gates (check-frozen,
 * check-parity). Drives system Chrome over the DevTools Protocol using Node's
 * built-in WebSocket, so the harnesses add no dependency to this repo.
 *
 * Phase TH: these used to be rebuilt in a scratch directory every session and
 * thrown away with it, which is why "the rig is deterministic" kept being an
 * assertion in a commit message rather than a command anyone could re-run.
 *
 * Two things here are load-bearing and were both learned the expensive way.
 *
 * 1. NEVER pass --use-angle=swiftshader to a run that claims WebGPU. It leaves
 *    navigator.gpu in place but makes requestAdapter() return null, so three
 *    falls back and the run reports WebGL2 while printing a green pass — the
 *    same backend measured twice, and a parity bar of 0/255 that means
 *    nothing. Measured on Chrome 151. openPage() asserts the badge instead of
 *    trusting the flag.
 *
 * 2. ?freeze is NOT enough for determinism. three's core Timer captures
 *    performance.now() at renderer creation and reads it on every node-frame
 *    update, so TSL.time runs on wall clock however the R3F clock behaves
 *    (App.jsx says this in the comment above its capture patch). ?freeze stops
 *    spin, orbits and camera drift; twinkle, corona, plasma and the veil bake
 *    keep moving. So the clock is pinned here too, from OUTSIDE the app: a
 *    virtual timeline that advances a fixed step per animation frame, injected
 *    before any page script runs. That is what CaptureRig does internally,
 *    done without touching App.jsx — a coordinate-before-editing file.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
export const RUNGS = ['planet', 'system', 'nebula', 'galaxy', 'group', 'cluster']
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p))

// A virtual clock, advanced one fixed step per animation frame. Injected
// before page scripts so it is in place when three's Timer reads its start
// time. Frame N therefore lands on the same instant in every run, on either
// backend, which is what makes both gates comparisons rather than races.
const PINNED_CLOCK = `(() => {
  const STEP = 1000 / 60;
  let t = 0, frames = 0;
  performance.now = () => t;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf(() => { t += STEP; frames++; cb(t); });
  Object.defineProperty(window, '__harnessFrames', { get: () => frames });
})();`

function unusedPort() {
  return new Promise((res, rej) => {
    const s = createServer()
    s.on('error', rej)
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => res(port))
    })
  })
}

export async function startVite() {
  const port = await unusedPort()
  const entry = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
  if (!existsSync(entry)) throw new Error('Vite is not installed. Run npm install first.')
  const child = spawn(
    process.execPath,
    [entry, '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
  )
  let logs = ''
  const collect = (c) => { logs = (logs + c).slice(-4000) }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const url = `http://127.0.0.1:${port}/`
  const deadline = Date.now() + 30_000
  for (;;) {
    try { await fetch(url); break } catch { /* not up yet */ }
    if (Date.now() > deadline) { child.kill(); throw new Error(`Vite did not start\n${logs}`) }
    await sleep(120)
  }
  return { child, url, stop: () => { try { child.kill() } catch {} } }
}

/**
 * Launch a headless Chrome and attach to its page target.
 * `profile` must differ between concurrently-open browsers, and differing it
 * between sequential runs is what makes check-frozen an independent-run test
 * rather than a cache-hit test.
 */
export async function openBrowser({ port, profile, width = 900, height = 700 }) {
  if (!CHROME) throw new Error('no Chrome found')
  const child = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`,
    '--enable-unsafe-webgpu',
    // No --use-angle=swiftshader. See the note at the top of this file.
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--user-data-dir=' + resolve(process.env.TEMP || '/tmp', profile),
    'about:blank',
  ], { stdio: 'ignore' })

  let target = null
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(250)
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      target = list.find((t) => t.type === 'page')
    } catch { /* not up yet */ }
  }
  if (!target) { child.kill(); throw new Error('Chrome never exposed a page target') }

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = () => rej(new Error('CDP websocket failed'))
  })

  let nextId = 1
  const pending = new Map()
  const errors = []
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)
      return
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params.exceptionDetails.exception?.description ?? 'exception')
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      errors.push(m.params.entry.text)
    }
  }
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = nextId++
      pending.set(id, { res, rej })
      ws.send(JSON.stringify({ id, method, params }))
    })
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    return r.result?.value
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.addScriptToEvaluateOnNewDocument', { source: PINNED_CLOCK })

  return {
    send,
    ev,
    errors,
    close: () => { try { ws.close() } catch {} ; try { child.kill() } catch {} },
  }
}

const READY = `(() => {
  const c = document.querySelector('canvas');
  if (!c) return 'no-canvas';
  if (c.width < 2 || c.height < 2) return 'canvas-unsized';
  if ([...document.querySelectorAll('*')].some((e) => e.children.length === 0 &&
      /initializing renderer/i.test(e.textContent || ''))) return 'booting';
  return 'ready';
})()`

// Hide every overlay so a comparison measures the RENDER and nothing else.
// The HUD sits as siblings of the canvas inside .app, and it is opaque text
// across a third of the frame on some rungs. Leaving it in does two bad
// things: it makes a determinism gate partly a test of React and CSS, and it
// makes a PARITY gate flatter than the truth, because text pixels are
// identical on both backends by construction and drag the mean toward zero.
// Written generically — anything that is not the canvas goes — so a new HUD
// element cannot silently re-enter the measurement.
const HIDE_CHROME = `(() => {
  const canvas = document.querySelector('canvas');
  const root = document.querySelector('.app') || document.body;
  let hidden = 0;
  for (const el of root.children) {
    if (!el.contains(canvas)) { el.style.setProperty('display', 'none', 'important'); hidden++; }
  }
  return hidden;
})()`

/**
 * Navigate to a rung and settle on a fixed VIRTUAL frame. Waiting on the frame
 * counter rather than on a wall-clock sleep is the whole point: a slow boot
 * shifts when frame 120 happens, never which instant frame 120 depicts.
 */
export async function renderRung(page, baseUrl, { rung, backend, frames = 120, timeoutMs = 60_000 }) {
  const q = [`scale=${rung}`, 'freeze']
  if (backend === 'webgl') q.push('backend=webgl')
  await page.send('Page.navigate', { url: `${baseUrl}?${q.join('&')}` })

  // Separate budgets, deliberately. Sharing one deadline between "did it boot"
  // and "has it reached frame N" means a slow boot silently eats the frame
  // budget and the run screenshots at frame 12 instead of 120 — with no error,
  // and two runs then compare different instants. Each phase gets its own, and
  // missing the frame target is a hard failure rather than a shrug.
  const bootBy = Date.now() + timeoutMs
  let state = 'booting'
  while (Date.now() < bootBy) {
    await sleep(250)
    state = await page.ev(READY)
    if (state === 'ready') break
  }
  if (state !== 'ready') throw new Error(`${rung}/${backend}: never became ready (${state})`)

  const framesBy = Date.now() + timeoutMs
  let n = 0
  while (Date.now() < framesBy) {
    n = await page.ev('window.__harnessFrames || 0')
    if (n >= frames) break
    await sleep(120)
  }
  if (n < frames) {
    throw new Error(`${rung}/${backend}: only reached frame ${n}/${frames} — comparisons would be of different instants`)
  }

  const badge = await page.ev("document.querySelector('.backend-badge')?.textContent || 'n/a'")
  const wanted = backend === 'webgl' ? 'WebGL2' : 'WebGPU'
  if (badge !== wanted) {
    throw new Error(`${rung}: asked for ${wanted}, got ${badge} — the run would prove nothing about ${wanted}`)
  }

  // Badge is read first, then the chrome goes, so the screenshot is pure render.
  await page.ev(HIDE_CHROME)
  await sleep(120)
  return badge
}

/**
 * Is there actually anything on screen? A blank frame is byte-identical to
 * another blank frame, so without this a rung that regressed to black would
 * sail through the determinism gate reporting 0/255.
 */
export async function contentStats(page, b64) {
  return page.ev(`(async () => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + ${JSON.stringify(b64)};
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let sum = 0; const seen = new Set();
    for (let i = 0; i < d.length; i += 4) {
      sum += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
      if (seen.size < 4096) seen.add((d[i] << 16) | (d[i+1] << 8) | d[i+2]);
    }
    return { meanLum: +(sum / (d.length / 4)).toFixed(2), distinct: seen.size };
  })()`)
}

/** Centre crop of the viewport, as base64 PNG. Bounded so the in-page diff stays cheap. */
export async function shoot(page, { size = 420 } = {}) {
  const geo = await page.ev("(() => { const c = document.querySelector('canvas'); return { w: c.clientWidth, h: c.clientHeight } })()")
  const n = Math.min(size, Math.min(geo.w, geo.h))
  const shot = await page.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: Math.floor(geo.w / 2 - n / 2), y: Math.floor(geo.h / 2 - n / 2), width: n, height: n, scale: 1 },
  })
  return shot.data
}

/**
 * Per-pixel difference between two base64 PNGs, computed IN the page — a live
 * WebGPU/WebGL canvas reads back blank through drawImage without
 * preserveDrawingBuffer, but a screenshot handed back as a data URL is an
 * ordinary decodable image. Keeps the harness free of a PNG library.
 */
export async function diff(page, a, b) {
  const out = await page.ev(`(async () => {
    const load = (s) => new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('decode failed'));
      i.src = 'data:image/png;base64,' + s;
    });
    const [ia, ib] = await Promise.all([load(${JSON.stringify(a)}), load(${JSON.stringify(b)})]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { error: 'size mismatch' };
    const n = ia.width, m = ia.height;
    const mk = (img) => {
      const c = document.createElement('canvas');
      c.width = n; c.height = m;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, n, m).data;
    };
    const da = mk(ia), db = mk(ib);
    let max = 0, sum = 0, differing = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i]-db[i]), Math.abs(da[i+1]-db[i+1]), Math.abs(da[i+2]-db[i+2]));
      if (d > max) max = d;
      if (d > 0) differing++;
      sum += d;
    }
    const px = da.length / 4;
    return { max, mean: +(sum / px).toFixed(4), differing, pixels: px, w: n, h: m };
  })()`)
  if (!out || out.error) throw new Error('diff failed: ' + (out?.error ?? 'no result'))
  return out
}

export function parseArgs(argv) {
  const arg = (k, d) => {
    const i = argv.indexOf(`--${k}`)
    return i === -1 ? d : argv[i + 1]
  }
  const only = arg('rungs', null)
  return {
    rungs: only ? only.split(',').map((s) => s.trim()).filter(Boolean) : RUNGS,
    backend: arg('backend', null),
    frames: Number(arg('frames', 120)),
    record: argv.includes('--record'),
  }
}