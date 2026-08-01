#!/usr/bin/env node
//
// Assembles the captured PNG sequences into a single social master.
//
// Reads shot durations straight out of src/capture/shots.js, so the shot
// list stays the one source of truth. Change a duration there and the
// dissolve offsets recompute here with no second place to forget.
//
// Usage:
//   node scripts/assemble.mjs --frames ./frames --out echogalaxy-4x5.mp4
//   node scripts/assemble.mjs --frames ./frames-9x16 --out echogalaxy-9x16.mp4 --titles
//
// Flags:
//   --frames <dir>   directory holding the PNG sequences (default ./frames)
//   --out <file>     output file (default echogalaxy.mp4)
//   --fps <n>        must match the fps used at capture (default 60)
//   --titles         burn in the title cards
//   --font <path>    font file for --titles
//   --print          print the ffmpeg command instead of running it
//
// Requires ffmpeg on PATH.

import { spawn } from 'node:child_process'
import { SHOTS, DISSOLVE } from '../src/capture/shots.js'

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}
const flag = (name) => argv.includes(`--${name}`)

const FRAMES = arg('frames', './frames')
const OUT = arg('out', 'echogalaxy.mp4')
const FPS = Number(arg('fps', '60'))
const FONT = arg('font', '/Windows/Fonts/segoeui.ttf')
const WANT_TITLES = flag('titles')

// Title cards. Silent autoplay is the default on all three target
// platforms, so these are not decoration, they are the entire voiceover.
// Keep them short enough to read at feed size on a phone.
//
// `at` and `until` are seconds on the assembled timeline.
const TITLES = [
  { at: 0.2, until: 2.6, text: 'echoGalaxy' },
  { at: 3.4, until: 7.6, text: 'Five worlds, built from shader nodes' },
  { at: 13.0, until: 18.0, text: 'Real Kepler orbits' },
  { at: 19.4, until: 23.4, text: 'Four Hubble classes, generated on the GPU' },
  { at: 31.4, until: 35.8, text: 'The real Local Group. Free and open.' },
]

// Cumulative xfade offsets. After merging clips 0..n the running length is
// sum(d[0..n]) minus one dissolve per join, so the next transition starts
// one dissolve before the end of what has been built so far.
function timeline() {
  const offsets = []
  let running = SHOTS[0].seconds
  for (let i = 1; i < SHOTS.length; i += 1) {
    offsets.push(Number((running - DISSOLVE).toFixed(4)))
    running = running + SHOTS[i].seconds - DISSOLVE
  }
  return { offsets, total: Number(running.toFixed(4)) }
}

function build() {
  const { offsets, total } = timeline()

  const inputs = SHOTS.flatMap((s) => [
    '-framerate',
    String(FPS),
    '-i',
    `${FRAMES}/${s.id}.%04d.png`,
  ])

  const parts = []

  // Normalise every input. setsar keeps ffmpeg from inventing a sample
  // aspect ratio, format=yuv420p up front means xfade blends in one pixel
  // format the whole way down the chain.
  SHOTS.forEach((_, i) => {
    parts.push(`[${i}:v]format=yuv420p,setsar=1,fps=${FPS}[v${i}]`)
  })

  // Chain the dissolves. Each xfade consumes the running result plus the
  // next clip.
  let prev = 'v0'
  offsets.forEach((offset, i) => {
    const next = `x${i}`
    parts.push(
      `[${prev}][v${i + 1}]xfade=transition=fade:duration=${DISSOLVE}:offset=${offset}[${next}]`,
    )
    prev = next
  })

  if (WANT_TITLES) {
    const esc = (s) => s.replace(/'/g, "\\'").replace(/:/g, '\\:')
    const font = FONT.replace(/\\/g, '/').replace(/:/g, '\\\\:')
    TITLES.forEach((t, i) => {
      const next = `t${i}`
      // Fade the card in and out over 0.35s at each end rather than
      // popping it. alpha uses the same expression style as enable.
      const fade =
        `if(lt(t,${t.at}),0,` +
        `if(lt(t,${t.at + 0.35}),(t-${t.at})/0.35,` +
        `if(lt(t,${t.until - 0.35}),1,` +
        `if(lt(t,${t.until}),(${t.until}-t)/0.35,0))))`
      parts.push(
        `[${prev}]drawtext=fontfile='${font}':` +
          `text='${esc(t.text)}':` +
          `fontsize=h/22:fontcolor=white:` +
          `alpha='${fade}':` +
          `x=(w-text_w)/2:y=h*0.82:` +
          `enable='between(t,${t.at},${t.until})'[${next}]`,
      )
      prev = next
    })
  }

  parts.push(`[${prev}]format=yuv420p[vout]`)

  const args = [
    '-y',
    ...inputs,
    '-filter_complex',
    parts.join(';'),
    '-map',
    '[vout]',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '17',
    '-pix_fmt',
    'yuv420p',
    // Keyframe every second. Feed players seek badly on sparse keyframes
    // and all three platforms re-encode anyway, so give them a clean input.
    '-g',
    String(FPS),
    '-movflags',
    '+faststart',
    OUT,
  ]

  return { args, total }
}

const { args, total } = build()

console.log(`shots:     ${SHOTS.length}`)
console.log(`dissolve:  ${DISSOLVE}s`)
console.log(`runtime:   ${total}s`)
console.log(`output:    ${OUT}`)
console.log('')

if (flag('print')) {
  console.log('ffmpeg ' + args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' '))
  process.exit(0)
}

const proc = spawn('ffmpeg', args, { stdio: 'inherit' })
proc.on('exit', (code) => process.exit(code ?? 1))
