/**
 * shoot — headless screenshots of a running dev/preview server, with ZERO
 * dependencies. Drives Chrome over the DevTools Protocol using Node's
 * built-in WebSocket (Node 22+), so it adds no package to this repo.
 *
 * This exists because the obvious approach does not work. Chrome's
 * `--screenshot` flag fires at the load event, but this app's renderer
 * initialises asynchronously (`await renderer.init()`), so a plain
 * screenshot catches the "initialising renderer…" overlay. And
 * `--virtual-time-budget` cannot rescue it: virtual time fast-forwards the
 * page clock but NOT GPU frames, so the canvas stays empty however long you
 * budget. The only thing that works is waiting in real time for the app to
 * report itself ready, which is what this does.
 *
 * Usage:
 *   node scripts/shoot.mjs --url "http://localhost:4178/?scale=system" \
 *                          --out shot.png [--backend webgl] [--wait 12000]
 *
 * `--backend webgl` deletes `navigator.gpu` before navigation, which is the
 * only reliable way to exercise the WebGL2 fallback: headless Chrome ships
 * WebGPU via Dawn, so `--disable-features=WebGPU` does not remove it.
 */

import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const argv = process.argv.slice(2)
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`)
  return i === -1 ? d : argv[i + 1]
}

const URL_ = arg('url', 'http://localhost:4178/')
const OUT = resolve(arg('out', 'shot.png'))
const BACKEND = arg('backend', 'webgpu')
const WAIT_MS = Number(arg('wait', 20000))
const W = Number(arg('width', 1000))
const H = Number(arg('height', 640))
const PORT = Number(arg('port', 9333))

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p))
if (!CHROME) {
  console.error('shoot: no Chrome found')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--window-size=${W},${H}`,
    '--enable-unsafe-webgpu',
    '--use-angle=swiftshader',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--user-data-dir=' + resolve(process.env.TEMP || '/tmp', `shoot-${PORT}`),
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let ws
const cleanup = () => {
  try { ws?.close() } catch {}
  try { chrome.kill() } catch {}
}
process.on('exit', cleanup)

// --- find the page target ---
let target = null
for (let i = 0; i < 60 && !target; i++) {
  await sleep(250)
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
    const list = await res.json()
    target = list.find((t) => t.type === 'page')
  } catch {
    /* not up yet */
  }
}
if (!target) {
  console.error('shoot: Chrome never exposed a page target')
  cleanup()
  process.exit(1)
}

ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.onopen = res
  ws.onerror = () => rej(new Error('shoot: CDP websocket failed'))
})

let nextId = 1
const pending = new Map()
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
  }
}
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = nextId++
    pending.set(id, { res, rej })
    ws.send(JSON.stringify({ id, method, params }))
  })

const errors = []
await send('Page.enable')
await send('Runtime.enable')
await send('Log.enable')

ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.method === 'Runtime.exceptionThrown') {
    errors.push(m.params.exceptionDetails.exception?.description ?? 'exception')
  }
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
    errors.push(m.params.entry.text)
  }
})

if (BACKEND === 'webgl') {
  // Headless Chrome supplies WebGPU through Dawn, so the only reliable way
  // to reach the WebGL2 fallback is to remove the adapter outright.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source:
      "Object.defineProperty(navigator,'gpu',{get:()=>undefined});",
  })
}

await send('Page.navigate', { url: URL_ })

// --- wait for the app to actually be rendering, in REAL time ---
const readyExpr = `(() => {
  const c = document.querySelector('canvas');
  if (!c) return 'no-canvas';
  if (c.width < 2 || c.height < 2) return 'canvas-unsized';
  const overlay = [...document.querySelectorAll('*')].some(
    (e) => e.children.length === 0 && /initializing renderer/i.test(e.textContent || '')
  );
  if (overlay) return 'booting';
  return 'ready';
})()`

let state = 'booting'
const deadline = Date.now() + WAIT_MS
while (Date.now() < deadline) {
  await sleep(400)
  const r = await send('Runtime.evaluate', {
    expression: readyExpr,
    returnByValue: true,
  })
  state = r.result?.value
  if (state === 'ready') break
}
// let a few real frames land after the overlay clears
await sleep(2500)

const shot = await send('Page.captureScreenshot', { format: 'png' })
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, Buffer.from(shot.data, 'base64'))

const backendReport = await send('Runtime.evaluate', {
  expression:
    "(document.querySelector('.backend-badge')?.textContent || 'n/a')",
  returnByValue: true,
})

console.log(
  `shoot: ${OUT}  state=${state}  badge=${backendReport.result?.value}  errors=${errors.length}`,
)
for (const e of errors.slice(0, 8)) console.log('   ! ' + e.split('\n')[0])
cleanup()
process.exit(state === 'ready' ? 0 : 2)
