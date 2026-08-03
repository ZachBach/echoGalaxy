#!/usr/bin/env node
//
// Assembles the captured PNG sequences into a single social master.
//
// Reads shot durations straight out of src/capture/shots.js, so the shot
// list stays the one source of truth. Change a duration there and the
// dissolve offsets recompute here with no second place to forget.
//
// Usage:
//   node scripts/assemble.mjs --frames ./frames --out echogalaxy-4x5.mp4 --aspect 4x5 --titles
//   node scripts/assemble.mjs --frames ./frames-9x16 --out echogalaxy-9x16.mp4 --aspect 9x16 --titles
//
// Flags:
//   --frames <dir>   directory holding the PNG sequences (default ./frames)
//   --out <file>     output file (default echogalaxy.mp4)
//   --fps <n>        must match the fps used at capture (default 60)
//   --aspect <id>    4x5, 9x16, or 1x1 (default 4x5)
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
const ASPECT = arg('aspect', '4x5')
const WANT_TITLES = flag('titles')

const TITLE_LAYOUTS = {
  '4x5': { fontSize: 'h/30', y: 'h*0.78', boxBorder: 16 },
  '9x16': { fontSize: 'h/34', y: 'h*0.66', boxBorder: 20 },
  '1x1': { fontSize: 'h/28', y: 'h*0.76', boxBorder: 14 },
}
const TITLE_LAYOUT = TITLE_LAYOUTS[ASPECT]
if (!TITLE_LAYOUT) {
  throw new Error(`Unknown aspect "${ASPECT}". Use 4x5, 9x16, or 1x1.`)
}

// Silent autoplay is the default on all three target platforms, so the title
// cards carry the explainer. Cues anchor to shots rather than absolute time:
// adding or trimming a shot never makes the copy drift off its visual.
const TITLE_CUES = [
  { shot: '01-hook', offset: 0.2, seconds: 2.4, text: 'echoGalaxy' },
  { shot: '02-rocky', offset: 2.4, seconds: 3.8, text: 'Five shader worlds' },
  { shot: '05-system', offset: 0.8, seconds: 4.0, text: 'Real Kepler orbits' },
  { shot: '05b-pillars', offset: 0.4, seconds: 3.5, text: 'Pillars of Creation' },
  { shot: '06-spiral', offset: 0.6, seconds: 4.2, text: 'Four Hubble classes. GPU-built.' },
  { shot: '10-group', offset: 0.8, seconds: 4.2, text: 'The Local Group. Free + open.' },
]

// Cumulative xfade offsets. After merging clips 0..n the running length is
// sum(d[0..n]) minus one dissolve per join, so the next transition starts
// one dissolve before the end of what has been built so far.
function timeline() {
  const offsets = []
  const starts = new Map([[SHOTS[0].id, 0]])
  let running = SHOTS[0].seconds
  for (let i = 1; i < SHOTS.length; i += 1) {
    const start = Number((running - DISSOLVE).toFixed(4))
    offsets.push(start)
    starts.set(SHOTS[i].id, start)
    running = start + SHOTS[i].seconds
  }
  return { offsets, starts, total: Number(running.toFixed(4)) }
}

function titleCards(starts, total) {
  return TITLE_CUES.map((cue) => {
    const start = starts.get(cue.shot)
    if (start == null) throw new Error(`Title cue references missing shot "${cue.shot}".`)
    const at = Number((start + cue.offset).toFixed(4))
    const until = Number((at + cue.seconds).toFixed(4))
    if (until > total) {
      throw new Error(`Title cue "${cue.text}" ends after the assembled runtime.`)
    }
    return { at, until, text: cue.text }
  })
}

function build() {
  const { offsets, starts, total } = timeline()

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
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:')
    const font = FONT.replace(/\\/g, '/').replace(/:/g, '\\\\:')
    titleCards(starts, total).forEach((t, i) => {
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
          `fontsize=${TITLE_LAYOUT.fontSize}:fontcolor=white:` +
          `box=1:boxcolor=0x02030a@0.62:boxborderw=${TITLE_LAYOUT.boxBorder}:` +
          `borderw=1:bordercolor=0x02030a@0.85:` +
          `alpha='${fade}':` +
          `x=(w-text_w)/2:y=${TITLE_LAYOUT.y}:` +
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
console.log(`aspect:    ${ASPECT}`)
console.log(`output:    ${OUT}`)
console.log('')

if (flag('print')) {
  console.log('ffmpeg ' + args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' '))
  process.exit(0)
}

const proc = spawn('ffmpeg', args, { stdio: 'inherit' })
proc.on('exit', (code) => process.exit(code ?? 1))
