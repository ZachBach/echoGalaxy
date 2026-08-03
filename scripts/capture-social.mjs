#!/usr/bin/env node
//
// Deterministically captures every social-video shot without screen recording.
// It starts Vite and an isolated Chromium session, receives each PNG frame on a
// loopback-only sink, and verifies the expected frame count before moving on.
//
// Usage:
//   npm run capture:social -- --aspect 4x5 --fps 30 --out video\frames-4x5
//   npm run capture:social -- --aspect 9x16 --fps 30 --out video\frames-9x16

import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { access, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ASPECTS, SHOTS } from '../src/capture/shots.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)

function option(name, fallback) {
  const index = argv.indexOf(`--${name}`)
  if (index === -1) return fallback
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`--${name} requires a value.`)
  return value
}

function positiveInteger(name, fallback) {
  const value = Number(option(name, String(fallback)))
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`--${name} must be a positive integer.`)
  }
  return value
}

function nonNegativeInteger(name, fallback) {
  const value = Number(option(name, String(fallback)))
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`--${name} must be a non-negative integer.`)
  }
  return value
}

const ASPECT = option('aspect', '4x5')
const SIZE = ASPECTS[ASPECT]
if (!SIZE) throw new Error(`Unknown aspect "${ASPECT}". Use ${Object.keys(ASPECTS).join(', ')}.`)

const FPS = positiveInteger('fps', 30)
const TIMEOUT_MS = positiveInteger('timeout', 900) * 1000
const OUT = path.resolve(ROOT, option('out', path.join('video', `frames-${ASPECT}`)))
const EXTERNAL_URL = option('url', null)
const REQUESTED_SHOTS = option('shots', null)
const BROWSER_OVERRIDE = option('browser', process.env.ECHOGALAXY_BROWSER)
const VITE_PORT = nonNegativeInteger('port', 0)
const MAX_FRAME_BYTES = 32 * 1024 * 1024
const FRAME_NAME = /^[a-z0-9-]+\.\d{4}\.png$/i

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function humanPath(target) {
  const relative = path.relative(ROOT, target)
  return relative && !relative.startsWith('..') ? relative : target
}

function requestedShots() {
  if (!REQUESTED_SHOTS) return SHOTS
  const ids = REQUESTED_SHOTS.split(',').map((id) => id.trim()).filter(Boolean)
  if (ids.length === 0) throw new Error('--shots must name at least one shot.')
  const selected = ids.map((id) => SHOTS.find((shot) => shot.id === id))
  const missing = ids.filter((_, index) => !selected[index])
  if (missing.length > 0) throw new Error(`Unknown shot: ${missing.join(', ')}.`)
  if (new Set(ids).size !== ids.length) throw new Error('--shots cannot contain duplicates.')
  return selected
}

async function pathExists(target) {
  try {
    await access(target)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') return false
    throw error
  }
}

async function prepareOutput(output) {
  if (!(await pathExists(output))) {
    await mkdir(output, { recursive: true })
    return
  }
  const entries = await readdir(output)
  if (entries.length > 0) {
    throw new Error(
      `Output directory is not empty: ${humanPath(output)}. Choose a new directory to avoid mixing frame sets.`,
    )
  }
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Unable to allocate a loopback port.')
  return address.port
}

async function closeServer(server) {
  if (!server.listening) return
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
}

async function unusedPort() {
  const server = createServer()
  const port = await listen(server)
  await closeServer(server)
  return port
}

async function readRequest(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_FRAME_BYTES) {
      throw new Error(`frame exceeds the ${MAX_FRAME_BYTES / (1024 * 1024)} MB capture limit`)
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function createFrameSink(output) {
  const received = new Set()
  const server = createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Cache-Control', 'no-store')

    if (request.method === 'OPTIONS') {
      response.writeHead(204, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' })
      response.end()
      return
    }
    if (request.method !== 'POST') {
      response.writeHead(405)
      response.end('POST required')
      return
    }

    const requestUrl = new URL(request.url, 'http://127.0.0.1')
    if (requestUrl.pathname !== '/frame') {
      response.writeHead(404)
      response.end('Unknown capture endpoint')
      return
    }

    const name = requestUrl.searchParams.get('name')
    if (!name || !FRAME_NAME.test(name)) {
      response.writeHead(400)
      response.end('Invalid frame name')
      return
    }

    const destination = path.resolve(output, name)
    if (path.dirname(destination) !== output) {
      response.writeHead(400)
      response.end('Invalid frame destination')
      return
    }

    try {
      await writeFile(destination, await readRequest(request))
      received.add(name)
      response.writeHead(201)
      response.end()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[capture sink] ${name}: ${message}`)
      response.writeHead(500)
      response.end(message)
    }
  })

  const port = await listen(server)
  return {
    url: `http://127.0.0.1:${port}/frame`,
    received,
    close: () => closeServer(server),
  }
}

async function waitForHttp(url, timeoutMs, processToWatch) {
  const deadline = Date.now() + timeoutMs
  let lastError = null
  while (Date.now() < deadline) {
    if (processToWatch?.exitCode != null) {
      throw new Error(`Process exited with code ${processToWatch.exitCode} while starting ${url}.`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) return
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await sleep(100)
  }
  const detail = lastError instanceof Error ? ` (${lastError.message})` : ''
  throw new Error(`Timed out waiting for ${url}${detail}.`)
}

async function startVite() {
  const port = VITE_PORT || (await unusedPort())
  const entry = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
  if (!(await pathExists(entry))) throw new Error('Vite is not installed. Run npm install first.')

  const child = spawn(
    process.execPath,
    [entry, '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
  )
  let logs = ''
  const collect = (chunk) => {
    logs = (logs + chunk).slice(-4000)
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const url = `http://127.0.0.1:${port}/`
  try {
    await waitForHttp(url, 30_000, child)
  } catch (error) {
    await stopProcess(child)
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Vite did not start: ${message}\n${logs}`)
  }
  return { child, url }
}

async function browserPath() {
  // Chrome before Edge: headless Edge + swiftshader stalled indefinitely on
  // the system rung's star material (0 frames in 900 s) where Chrome renders
  // the same shot in minutes. Override with --browser or ECHOGALAXY_BROWSER.
  const candidates = [
    BROWSER_OVERRIDE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate
  }
  throw new Error('No Chromium browser was found. Pass --browser <path-to-chrome-or-edge>.')
}

async function connectSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url)
    const onError = () => reject(new Error(`Unable to connect to Chrome DevTools at ${url}.`))
    socket.addEventListener('error', onError, { once: true })
    socket.addEventListener(
      'open',
      () => {
        socket.removeEventListener('error', onError)
        resolve(socket)
      },
      { once: true },
    )
  })
}

class CdpClient {
  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    socket.addEventListener('message', (event) => {
      const text = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString()
      const message = JSON.parse(text)
      if (!message.id) return
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.error) {
        pending.reject(new Error(`${message.error.message} (${message.error.code})`))
      } else {
        pending.resolve(message.result)
      }
    })
    socket.addEventListener('close', () => {
      for (const pending of this.pending.values()) {
        pending.reject(new Error('Chrome DevTools connection closed unexpectedly.'))
      }
      this.pending.clear()
    })
  }

  send(method, params = {}) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`Chrome DevTools is unavailable for ${method}.`))
    }
    const id = this.nextId
    this.nextId += 1
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      try {
        this.socket.send(JSON.stringify({ id, method, params }))
      } catch (error) {
        this.pending.delete(id)
        reject(error)
      }
    })
  }

  close() {
    this.socket.close()
  }
}

async function browserPage(debugPort) {
  const debugUrl = `http://127.0.0.1:${debugPort}/json/list`
  const deadline = Date.now() + 30_000
  let lastError = null
  while (Date.now() < deadline) {
    try {
      const response = await fetch(debugUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const targets = await response.json()
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
      if (page) {
        const socket = await connectSocket(page.webSocketDebuggerUrl)
        const client = new CdpClient(socket)
        await client.send('Page.enable')
        await client.send('Runtime.enable')
        return client
      }
      lastError = new Error('No debuggable page target is available yet.')
    } catch (error) {
      lastError = error
    }
    await sleep(100)
  }
  const detail = lastError instanceof Error ? ` (${lastError.message})` : ''
  throw new Error(`Timed out waiting for Chrome DevTools${detail}.`)
}

// The browser's crashpad handler outlives the main process briefly and
// holds files open inside the profile; on Windows that makes the unlink
// race an EBUSY. Retry, and if the directory still will not go, leave it —
// it lives in the OS temp dir and must never fail a finished capture.
async function removeProfile(profile) {
  try {
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[capture] temp profile left behind (${message}): ${profile}`)
  }
}

async function startBrowser() {
  const executable = await browserPath()
  const profile = await mkdtemp(path.join(tmpdir(), 'echogalaxy-capture-'))
  const debugPort = await unusedPort()
  const child = spawn(
    executable,
    [
      '--headless=new',
      '--remote-allow-origins=*',
      '--remote-debugging-address=127.0.0.1',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      `--window-size=${SIZE.w},${SIZE.h}`,
      '--force-device-scale-factor=1',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--disable-gpu-sandbox',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-features=CalculateNativeWinOcclusion',
      '--no-default-browser-check',
      '--no-first-run',
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true },
  )

  try {
    const page = await browserPage(debugPort)
    return { child, page, profile }
  } catch (error) {
    await stopProcess(child)
    await removeProfile(profile)
    throw error
  }
}

async function closeBrowser(browser) {
  if (!browser) return
  try {
    browser.page.close()
  } finally {
    try {
      await stopProcess(browser.child)
    } finally {
      await removeProfile(browser.profile)
    }
  }
}

async function stopProcess(child) {
  if (!child || child.exitCode != null) return
  const exited = once(child, 'exit')
  child.kill()
  await Promise.race([exited, sleep(5_000)])
}

function captureUrl(base, shot, sink) {
  const url = new URL(base)
  url.searchParams.set('capture', shot.id)
  url.searchParams.set('aspect', ASPECT)
  url.searchParams.set('fps', String(FPS))
  url.searchParams.set('backend', 'webgl')
  url.searchParams.set('captureSink', sink)
  return url.toString()
}

async function waitForCapture(page, shot) {
  const deadline = Date.now() + TIMEOUT_MS
  let lastError = null
  while (Date.now() < deadline) {
    try {
      const result = await page.send('Runtime.evaluate', {
        expression: 'JSON.stringify(window.__echoGalaxyCapture || null)',
        returnByValue: true,
      })
      const value = result.result?.value
      if (value) {
        const status = JSON.parse(value)
        if (status?.id === shot.id && status.state === 'failed') {
          throw new Error(`Capture failed for ${shot.id}: ${status.error}`)
        }
        if (status?.id === shot.id && status.state === 'complete') return status
      }
    } catch (error) {
      lastError = error
      if (error instanceof Error && error.message.startsWith(`Capture failed for ${shot.id}:`)) {
        throw error
      }
    }
    await sleep(250)
  }
  const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : ''
  throw new Error(`Timed out capturing ${shot.id}.${detail}`)
}

function expectedFrameNames(shot) {
  const count = Math.round(shot.seconds * FPS)
  return Array.from(
    { length: count },
    (_, frame) => `${shot.id}.${String(frame).padStart(4, '0')}.png`,
  )
}

function verifyFrames(sink, shot, status) {
  const expected = expectedFrameNames(shot)
  if (status.frames !== expected.length) {
    throw new Error(
      `${shot.id} reported ${status.frames} frames; expected ${expected.length}.`,
    )
  }
  const missing = expected.filter((name) => !sink.received.has(name))
  if (missing.length > 0) {
    throw new Error(`${shot.id} is missing ${missing.length} frame(s), beginning with ${missing[0]}.`)
  }
}

async function main() {
  const shots = requestedShots()
  await prepareOutput(OUT)
  const sink = await createFrameSink(OUT)
  let vite = null

  try {
    if (EXTERNAL_URL) {
      await waitForHttp(EXTERNAL_URL, 30_000)
    } else {
      vite = await startVite()
    }
    const base = EXTERNAL_URL ?? vite.url

    console.log(`Capturing ${shots.length} shot(s) at ${SIZE.w}x${SIZE.h}, ${FPS} fps`)
    console.log(`Frames: ${humanPath(OUT)}`)

    for (const [index, shot] of shots.entries()) {
      console.log(`[${index + 1}/${shots.length}] ${shot.id}`)
      const browser = await startBrowser()
      try {
        await browser.page.send('Page.navigate', { url: captureUrl(base, shot, sink.url) })
        const status = await waitForCapture(browser.page, shot)
        verifyFrames(sink, shot, status)
      } finally {
        await closeBrowser(browser)
      }
    }

    console.log(`Captured ${shots.length} shot(s) successfully.`)
  } finally {
    await sink.close()
    await stopProcess(vite?.child)
  }
}

main().catch((error) => {
  console.error(`Capture failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
