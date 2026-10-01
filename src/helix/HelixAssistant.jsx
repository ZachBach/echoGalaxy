import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Helix } from '@aureliusdynamic/helix-capacitor'
import { askHelix } from './client.js'
import { parseHelixCommand } from './actions.js'


function errorMessage(error) {
  return error instanceof Error ? error.message : 'Helix could not complete that request.'
}

/**
 * Helix lives in a section of the ⋮ menu, not in a floating corner widget.
 *
 * It used to be a launcher pinned bottom-right with its panel opening above
 * it, and on a phone that corner was already taken: the launcher sat across
 * "Next ›" in the facts pager and on top of the Systems tab, and the panel
 * opened over the subject without taking turns with either drawer. The floor
 * has no free corner on compact, and the menu is where the next thing needing
 * a home was always meant to go.
 *
 * The component stays MOUNTED whether or not the menu is open — the wake word
 * keeps listening and an answer keeps arriving with the menu shut — and only
 * its view is portalled into `slot`, the menu section App hands down while the
 * menu is open. `onArmedChange` reports the wake word so App can mark the ⋮
 * button: a live microphone must stay visible when its controls are not.
 */
export default function HelixAssistant({ context, onAction, slot, onArmedChange }) {
  const [armed, setArmed] = useState(false)
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const armedRef = useRef(false)
  const mountedRef = useRef(true)
  const contextRef = useRef(context)
  const actionRef = useRef(onAction)
  const transcriptHandlerRef = useRef(null)

  contextRef.current = context
  actionRef.current = onAction

  useEffect(() => {
    onArmedChange?.(armed)
  }, [armed, onArmedChange])

  const say = useCallback(async (text) => {
    try {
      await Helix.speak({ text })
    } catch (cause) {
      if (mountedRef.current) {
        setError(errorMessage(cause))
        setStatus('error')
      }
    }
  }, [])

  const processTranscript = useCallback(async (text) => {
    if (!mountedRef.current) return
    setTranscript(text)
    setError('')
    setStatus('processing')

    try {
      const localAction = parseHelixCommand(text, contextRef.current)
      if (localAction) {
        const confirmation = actionRef.current(localAction)
        const spoken = confirmation || 'That control is not available in this view.'
        setAnswer(spoken)
        await say(spoken)
        return
      }

      const result = await askHelix(text, contextRef.current)
      let response = result.answer
      if (result.action) {
        const confirmation = actionRef.current(result.action)
        response += confirmation
          ? ` ${confirmation}`
          : ' I could not apply that control in the current view.'
      }
      if (!mountedRef.current) return
      setAnswer(response)
      await say(response)
    } catch (cause) {
      if (!mountedRef.current) return
      const message = errorMessage(cause)
      setError(message)
      setAnswer('')
      await say(message)
    }
  }, [say])

  transcriptHandlerRef.current = processTranscript

  const startQuestion = useCallback(async () => {
    setError('')
    setStatus('starting')
    try {
      await Helix.startSpeechRecognition()
    } catch (cause) {
      if (mountedRef.current) {
        setError(errorMessage(cause))
        setStatus('error')
      }
    }
  }, [])

  const startWakeWord = useCallback(async () => {
    setError('')
    armedRef.current = true
    setArmed(true)
    setStatus('starting')
    try {
      await Helix.startWakeWord()
    } catch (cause) {
      armedRef.current = false
      if (mountedRef.current) {
        setArmed(false)
        setError(errorMessage(cause))
        setStatus('error')
      }
    }
  }, [])

  const stopWakeWord = useCallback(async () => {
    armedRef.current = false
    setArmed(false)
    try {
      await Promise.all([
        Helix.stopWakeWord(),
        Helix.stopSpeechRecognition(),
      ])
      if (mountedRef.current) setStatus('idle')
    } catch (cause) {
      if (mountedRef.current) {
        setError(errorMessage(cause))
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false
    let listeners = []

    Promise.allSettled([
      Helix.addListener('wakeWordDetected', () => {
        if (!mountedRef.current) return
        setStatus('transcribing')
        void startQuestion()
      }),
      Helix.addListener('transcript', ({ text }) => {
        void transcriptHandlerRef.current?.(text)
      }),
      Helix.addListener('state', ({ status: nextStatus }) => {
        if (mountedRef.current) setStatus(nextStatus)
      }),
      Helix.addListener('voiceError', ({ message }) => {
        if (!mountedRef.current) return
        setError(message || 'Helix encountered an error.')
        setStatus('error')
      }),
      Helix.addListener('speechFinished', async () => {
        if (!mountedRef.current) return
        if (!armedRef.current) {
          setStatus('idle')
          return
        }
        try {
          await Helix.startWakeWord()
        } catch (cause) {
          if (mountedRef.current) {
            setError(errorMessage(cause))
            setStatus('error')
          }
        }
      }),
    ]).then((results) => {
      const rejected = results.find((result) => result.status === 'rejected')
      listeners = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
      if (cancelled) {
        listeners.forEach((listener) => void listener.remove())
      }
      if (rejected) throw rejected.reason
    }).catch((cause) => {
      if (mountedRef.current) {
        setError(errorMessage(cause))
        setStatus('error')
      }
    })

    return () => {
      cancelled = true
      mountedRef.current = false
      listeners.forEach((listener) => void listener.remove())
      void Helix.stopWakeWord().catch((cause) => {
        console.error('Helix wake-word cleanup failed:', cause)
      })
      void Helix.stopSpeechRecognition().catch((cause) => {
        console.error('Helix speech cleanup failed:', cause)
      })
    }
  }, [startQuestion])

  const busy = ['starting', 'hearing', 'transcribing', 'processing'].includes(status)
  const statusLabel = {
    idle: 'Ready',
    starting: 'Starting',
    listening: 'Listening for “Helix”',
    hearing: 'Listening to your question',
    transcribing: 'Transcribing on device',
    processing: 'Working',
    paused: 'Paused in background',
    error: 'Needs attention',
  }[status] || status

  if (!slot) return null

  return createPortal(
    <>
      <div className="helix-heading">
        <h2>Voice assistant · Helix</h2>
        <span className={'helix-indicator' + (status === 'listening' ? ' live' : '')} />
      </div>
      <p className="helix-status" aria-live="polite">{statusLabel}</p>
      <button
        type="button"
        className={'menu-action' + (armed ? ' armed' : '')}
        aria-pressed={armed}
        onClick={() => void (armed ? stopWakeWord() : startWakeWord())}
      >
        {armed ? 'Stop wake word' : 'Listen for “Helix”'}
      </button>
      <button
        type="button"
        className="menu-action"
        onClick={() => void startQuestion()}
        disabled={busy}
      >
        Ask a question
      </button>
      {transcript && (
        <p className="helix-transcript"><b>You:</b> {transcript}</p>
      )}
      {answer && (
        <p className="helix-answer" aria-live="polite"><b>Helix:</b> {answer}</p>
      )}
      {error && <p className="helix-error" role="alert">{error}</p>}
      <p className="helix-privacy">
        Wake detection and speech transcription run on this device. Only
        transcripts and the current scene context go to your configured
        Helix server; raw audio is not sent.
      </p>
    </>,
    slot,
  )
}
