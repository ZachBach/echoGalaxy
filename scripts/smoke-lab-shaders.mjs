/**
 * smoke-lab-shaders — prove every tsl-lib entry COMPILES and DRAWS in a real
 * browser, on both backends, with zero added dependencies.
 *
 * Why this exists on top of `smoke-tsl-lib.mjs`: that gate builds each node
 * graph against the installed three and catches renamed/removed TSL members.
 * It never reaches a GPU. A graph can assemble perfectly and still fail to
 * compile to WGSL or GLSL, and a material can compile and still draw nothing.
 * Upstream bench-verifies on r178; this repo runs r184, and the forty-three
 * materials had no runtime coverage here at all until now.
 *
 * Two checks per entry, both cheap:
 *   1. no console error / uncaught exception while it is on screen
 *   2. the rendered sphere is not byte-identical to another entry's — a
 *      material that compiles but emits nothing shows up as a duplicate of
 *      whatever else renders blank. Reported, not fatal: a few near-black
 *      entries are legitimate, so this flags rather than fails.
 *
 * Screenshots are hashed, never decoded, which is what keeps it dependency
 * free — no PNG reader, no image library.
 *
 * Usage:
 *   node scripts/smoke-lab-shaders.mjs
 *   node scripts/smoke-lab-shaders.mjs --backend webgpu   # one backend
 *   node scripts/smoke-lab-shaders.mjs --roster materials --shots out/
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import path from 'node:path'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const argv = process.argv.slice(2)
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`)
  return i === -1 ? d : argv[i + 1]
}

const ROSTER = arg('roster', 'all')            // all | nodes | materials
const ONLY_BACKEND = arg('backend', null)      // webgpu | webgl
const SHOTS_DIR = arg('shots', null)
const SETTLE_MS = Number(arg('settle', 380))
const W = 1000
const H = 640

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- vite ----
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

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url)
      if (r.ok || r.status === 404) return
    } catch { /* not up yet */ }
    await sleep(120)
  }
  throw new Error(`timed out waiting for ${url}`)
}

async function startVite() {
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
  try {
    await waitForHttp(url, 30_000)
  } catch (e) {
    child.kill()
    throw new Error(`Vite did not start: ${e.message}\n${logs}`)
  }
  return { child, url }
}

// --------------------------------------------------------------- chrome ----
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p))
if (!CHROME) {
  console.error('smoke-lab-shaders: no Chrome found')
  process.exit(1)
}

async function openBrowser(port) {
  const child = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--window-size=${W},${H}`,
    '--enable-unsafe-webgpu',
    // NO --use-angle=swiftshader here, deliberately. It silently returns null
    // from navigator.gpu.requestAdapter(), so Chrome keeps `navigator.gpu` but
    // has no adapter behind it and three falls back to WebGL2 — a "WebGPU" run
    // that never touches WebGPU. Measured on Chrome 151: with the flag,
    // adapter=null; without it, adapter=OK (vendor=intel). scripts/shoot.mjs
    // still carries the flag and has the same blind spot.
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--user-data-dir=' + resolve(process.env.TEMP || '/tmp', `labsmoke-${port}`),
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
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
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

  return { child, ws, send, errors, close: () => { try { ws.close() } catch {} ; try { child.kill() } catch {} } }
}

const evalJs = async (send, expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return r.result?.value
}

// ----------------------------------------------------------------- run ----
async function runBackend(baseUrl, backend) {
  const cdpPort = 9400 + (backend === 'webgl' ? 1 : 0)
  const b = await openBrowser(cdpPort)
  const { send, errors } = b
  const results = []

  try {
    await send('Page.enable')
    await send('Runtime.enable')
    await send('Log.enable')

    if (backend === 'webgl') {
      // Headless Chrome supplies WebGPU through Dawn, so removing the adapter
      // is the only reliable way to reach the WebGL2 fallback.
      await send('Page.addScriptToEvaluateOnNewDocument', {
        source: "Object.defineProperty(navigator,'gpu',{get:()=>undefined});",
      })
    }

    await send('Page.navigate', { url: `${baseUrl}?lab=1` })

    // Wait in real time for the renderer — virtual time does not advance GPU
    // frames, so there is no shortcut here (the shoot.mjs lesson).
    const readyExpr = `(() => {
      const c = document.querySelector('canvas');
      if (!c) return 'no-canvas';
      if (c.width < 2 || c.height < 2) return 'canvas-unsized';
      if ([...document.querySelectorAll('*')].some(e => e.children.length === 0 &&
          /initializing renderer/i.test(e.textContent || ''))) return 'booting';
      if (!document.querySelector('.hud h1')) return 'no-hud';
      return 'ready';
    })()`
    let state = 'booting'
    const deadline = Date.now() + 45_000
    while (Date.now() < deadline) {
      await sleep(400)
      state = await evalJs(send, readyExpr)
      if (state === 'ready') break
    }
    if (state !== 'ready') throw new Error(`app never became ready (${state})`)
    await sleep(1500)

    const badge = await evalJs(send, "document.querySelector('.backend-badge')?.textContent || 'n/a'")

    // Refuse to report a backend we did not actually exercise. Without this the
    // WebGPU pass falls back to WebGL2 and prints 43/43 green twice over — the
    // exact failure that hid behind --use-angle=swiftshader.
    const wanted = backend === 'webgl' ? 'WebGL2' : 'WebGPU'
    if (badge !== wanted) {
      throw new Error(`asked for ${wanted}, got ${badge} — the run would prove nothing about ${wanted}`)
    }

    // Select the roster by clicking its button, so the harness drives the same
    // control a person does rather than reaching into React state.
    if (ROSTER !== 'all') {
      const wanted = ROSTER === 'nodes' ? 'Nodes' : 'Materials'
      const picked = await evalJs(send, `(() => {
        const b = [...document.querySelectorAll('.hud .nav button')]
          .find(x => x.textContent.trim().startsWith(${JSON.stringify(wanted)}));
        if (!b) return false; b.click(); return true;
      })()`)
      if (!picked) throw new Error(`roster button '${wanted}' not found`)
      await sleep(600)
    }

    const total = await evalJs(send, `(() => {
      const m = (document.querySelector('.hud .cls')?.textContent || '').match(/\\/\\s*(\\d+)\\s*$/);
      return m ? Number(m[1]) : 0;
    })()`)
    if (!total) throw new Error('could not read entry count from the HUD')

    const seenHash = new Map()
    for (let n = 0; n < total; n++) {
      const before = errors.length
      const meta = await evalJs(send, `(() => ({
        name: document.querySelector('.hud h1')?.textContent || '?',
        cls: document.querySelector('.hud .cls')?.textContent || '?',
      }))()`)
      await sleep(SETTLE_MS)

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: W / 2 - 150, y: H / 2 - 150, width: 300, height: 300, scale: 1 },
      })
      const hash = createHash('sha1').update(shot.data).digest('hex').slice(0, 12)

      if (SHOTS_DIR) {
        const dir = resolve(ROOT, SHOTS_DIR, backend)
        mkdirSync(dir, { recursive: true })
        const safe = String(n).padStart(2, '0') + '-' + meta.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        writeFileSync(path.join(dir, `${safe}.png`), Buffer.from(shot.data, 'base64'))
      }

      const id = (meta.cls.split('·')[1] || meta.name).trim()
      const newErrors = errors.slice(before)
      results.push({ id, name: meta.name, hash, errors: newErrors, twin: seenHash.get(hash) ?? null })
      if (!seenHash.has(hash)) seenHash.set(hash, id)

      // Step with the same keyboard control the Lab exposes to a person.
      await evalJs(send, "window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}))")
    }

    return { backend, badge, results }
  } finally {
    b.close()
  }
}

// ---------------------------------------------------------------- main ----
const backends = ONLY_BACKEND ? [ONLY_BACKEND] : ['webgpu', 'webgl']
let vite
let exitCode = 0
try {
  vite = await startVite()
  const all = []
  for (const backend of backends) {
    process.stdout.write(`smoke-lab-shaders: ${backend} …\n`)
    all.push(await runBackend(vite.url, backend))
  }

  console.log('')
  for (const run of all) {
    const failed = run.results.filter((r) => r.errors.length)
    const dupes = run.results.filter((r) => r.twin && r.twin !== r.id)
    console.log(`— ${run.backend} (badge: ${run.badge}) — ${run.results.length} entries`)
    for (const f of failed) {
      console.log(`   ✗ ${f.id}: ${f.errors[0].split('\n')[0].slice(0, 160)}`)
    }
    if (dupes.length) {
      console.log(`   ⚠ ${dupes.length} entr${dupes.length === 1 ? 'y' : 'ies'} rendered identically to another (possible blank):`)
      for (const d of dupes.slice(0, 10)) console.log(`       ${d.id}  ≡  ${d.twin}`)
    }
    console.log(`   ${failed.length ? '✗' : '✓'} ${run.results.length - failed.length}/${run.results.length} compiled and drew without console errors`)
    if (failed.length) exitCode = 1
  }

  // Cross-backend agreement: an entry that fails on one backend only is the
  // single most useful signal here, so name those explicitly.
  if (all.length === 2) {
    const [a, b] = all
    const bad = (run) => new Set(run.results.filter((r) => r.errors.length).map((r) => r.id))
    const A = bad(a), B = bad(b)
    const only = [...new Set([...A, ...B])].filter((id) => A.has(id) !== B.has(id))
    console.log('')
    console.log(only.length
      ? `⚠ ${only.length} entr${only.length === 1 ? 'y' : 'ies'} differ between backends: ${only.join(', ')}`
      : '✓ both backends agree on every entry')
  }
} catch (e) {
  console.error('smoke-lab-shaders: ' + (e?.message ?? e))
  exitCode = 1
} finally {
  try { vite?.child.kill() } catch {}
}
process.exit(exitCode)
