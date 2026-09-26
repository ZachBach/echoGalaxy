import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseHelixCommand, validateHelixAction } from '../src/helix/actions.js'
import { askHelix } from '../src/helix/client.js'

test('recognizes known scale navigation phrases', () => {
  assert.deepEqual(parseHelixCommand('Please take me to the galaxy'), {
    type: 'navigate-scale',
    scaleId: 'galaxy',
  })
  assert.deepEqual(parseHelixCommand('go to galaxy'), {
    type: 'navigate-scale',
    scaleId: 'galaxy',
  })
  assert.deepEqual(parseHelixCommand('show local group'), {
    type: 'navigate-scale',
    scaleId: 'group',
  })
})

test('recognizes available object, star-system, and redshift controls', () => {
  assert.deepEqual(parseHelixCommand('next planet', {
    scaleId: 'planet',
    canCycle: true,
  }), { type: 'navigate-object', direction: 1 })
  assert.deepEqual(parseHelixCommand('previous star system', {
    scaleId: 'system',
    canCycle: true,
  }), { type: 'navigate-system', direction: -1 })
  assert.deepEqual(parseHelixCommand('show redshift space', {
    scaleId: 'cluster',
  }), { type: 'set-redshift', enabled: true })
})

test('rejects unknown and unavailable app actions', () => {
  assert.equal(validateHelixAction({ type: 'run-script' }), null)
  assert.equal(validateHelixAction({ type: 'navigate-scale', scaleId: 'unknown' }), null)
  assert.equal(parseHelixCommand('next planet', { scaleId: 'cluster' }), null)
})

test('sends only transcript and scene context to the configured server', async () => {
  let request
  const result = await askHelix(
    'What is a nebula?',
    { scaleId: 'nebula', subject: 'Pillars of Creation' },
    {
      apiBase: 'https://assistant.example.test/',
      fetchImpl: async (url, options) => {
        request = { url, options }
        return {
          ok: true,
          json: async () => ({
            answer: 'A nebula is a cloud of gas and dust.',
            action: null,
          }),
        }
      },
    },
  )

  assert.equal(request.url, 'https://assistant.example.test/v1/assistant/chat')
  assert.deepEqual(JSON.parse(request.options.body), {
    message: 'What is a nebula?',
    context: { scaleId: 'nebula', subject: 'Pillars of Creation' },
  })
  assert.equal(result.answer, 'A nebula is a cloud of gas and dust.')
})

test('reports unconfigured and malformed assistant responses', async () => {
  await assert.rejects(
    askHelix('question', {}, { apiBase: '' }),
    /not configured/,
  )
  await assert.rejects(
    askHelix('question', {}, {
      apiBase: 'https://assistant.example.test',
      fetchImpl: async () => ({ ok: true, json: async () => ({ answer: '' }) }),
    }),
    /non-empty answer/,
  )
})
