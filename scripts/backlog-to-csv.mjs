/**
 * Generate a Planner-importable CSV from BACKLOG.md.
 *
 *   node scripts/backlog-to-csv.mjs
 *
 * Parses phase headings, section headings, and `- [ ] ST-###` task lines,
 * then writes one row per task to backlog-planner.csv. Regenerates from
 * scratch every run — re-run it after adding a batch to BACKLOG.md rather
 * than hand-editing the CSV, which would drift.
 *
 * Fails loudly on out-of-order or duplicate IDs; reports missing IDs in the
 * ST-001..ST-500 range as a warning, since batches arrive incrementally.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'BACKLOG.md')
const OUT = join(root, 'backlog-planner.csv')
const TOTAL = 500

const PHASE = /^# Phase (ST[A-E]) — (.+?)\s*$/
const SECTION = /^## Section ([A-Z]) — (.+?)(?:\s*\(ST-\d+.*\))?\s*$/
const TASK = /^- \[( |x)\] (ST-\d{3})\s+(.*)$/

const rows = []
let phaseId = '', phaseName = '', section = ''

for (const raw of readFileSync(SRC, 'utf8').split(/\r?\n/)) {
  const line = raw.trimEnd()

  const phase = PHASE.exec(line)
  if (phase) {
    ;[, phaseId, phaseName] = phase
    section = ''
    continue
  }

  const sec = SECTION.exec(line)
  if (sec) {
    section = `${sec[1]} — ${sec[2]}`
    continue
  }

  const task = TASK.exec(line)
  if (!task) continue

  const [, mark, id, rest] = task
  // Guidance annotations are appended in bold after the sentence; the task
  // name is the sentence itself, and the annotation stays in the markdown.
  const title = rest.split(' **')[0].trim()
  rows.push({
    ID: id,
    'Task Name': `${id} ${title}`,
    'Bucket Name': section ? `${phaseId} · ${section}` : phaseId,
    Phase: `${phaseId} — ${phaseName}`,
    Progress: mark === 'x' ? 'Completed' : 'Not started',
    Priority: 'Medium',
    Notes: '',
  })
}

const ids = rows.map((r) => r.ID)
if (new Set(ids).size !== ids.length) throw new Error('duplicate task IDs in BACKLOG.md')
if (ids.some((id, i) => i && id <= ids[i - 1])) throw new Error('task IDs out of order in BACKLOG.md')

const FIELDS = ['ID', 'Task Name', 'Bucket Name', 'Phase', 'Progress', 'Priority', 'Notes']
const cell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const csv = [FIELDS.join(','), ...rows.map((r) => FIELDS.map((f) => cell(r[f])).join(','))].join('\r\n')

// BOM so Excel opens the UTF-8 (Boötes, Māori) without mangling it.
writeFileSync(OUT, '﻿' + csv + '\r\n', 'utf8')

const present = new Set(ids)
const missing = Array.from({ length: TOTAL }, (_, i) => `ST-${String(i + 1).padStart(3, '0')}`)
  .filter((id) => !present.has(id))

console.log(`${rows.length} tasks → ${OUT}`)
console.log(`${new Set(rows.map((r) => r['Bucket Name'])).size} buckets`)
if (missing.length) console.log(`⚠ ${missing.length} missing: ${missing[0]} .. ${missing.at(-1)}`)
