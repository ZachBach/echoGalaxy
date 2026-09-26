import { useCallback, useEffect, useRef, useState } from 'react'
import { registerPlugin } from '@capacitor/core'
import { askHelix } from './client.js'
import { parseHelixCommand } from './actions.js'

const Helix = registerPlugin('Helix')

function errorMessage(error) {
  return error instanceof Error ? error.message : 'Helix could not complete that request.'
}

export default function HelixAssistant({ context, onAction }) {
  const [open, setOpen] = useState(false)
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

  return (
    <section className={'helix-widget' + (open ? ' open' : '')} aria-label="Helix voice assistant">
      {open && (
        <div className="helix-panel">
          <div className="helix-heading">
            <div>
              <span className="helix-kicker">VOICE ASSISTANT</span>
              <h2>Helix</h2>
            </div>
            <span className={'helix-indicator ' + (status === 'listening' ? 'live' : '')} />
          </div>
          <p className="helix-status" aria-live="polite">{statusLabel}</p>
          <div className="helix-actions">
            <button
              type="button"
              className={armed ? 'armed' : ''}
              aria-pressed={armed}
              onClick={() => void (armed ? stopWakeWord() : startWakeWord())}
            >
              {armed ? 'Stop wake word' : 'Listen for “Helix”'}
            </button>
            <button
              type="button"
              onClick={() => void startQuestion()}
              disabled={busy}
            >
              Ask a question
            </button>
          </div>
          <p className="helix-privacy">
            Wake detection and speech transcription run on this device. Only
            transcripts and the current scene context go to your configured
            Helix server; raw audio is not sent.
          </p>
          {transcript && (
            <p className="helix-transcript"><b>You:</b> {transcript}</p>
          )}
          {answer && (
            <p className="helix-answer" aria-live="polite"><b>Helix:</b> {answer}</p>
          )}
          {error && <p className="helix-error" role="alert">{error}</p>}
        </div>
      )}
      <button
        type="button"
        className="helix-launcher"
        aria-expanded={open}
        aria-label={open ? 'Close Helix assistant' : 'Open Helix assistant'}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">✦</span>
        <span>Helix</span>
        {armed && <span className="helix-launcher-live" aria-label="Wake word active" />}
      </button>
    </section>
  )
}
