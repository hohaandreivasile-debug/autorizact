import { useState, useRef, useCallback } from 'react'

export function useVoice(onResult) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Dictarea vocală necesită Chrome sau Edge.')
      return
    }
    const r = new SR()
    r.lang = 'ro-RO'
    r.continuous = false
    r.interimResults = false
    r.onresult = e => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
      setListening(false)
    }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    recRef.current = r
    setListening(true)
  }, [onResult])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, start, stop }
}
