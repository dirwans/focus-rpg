import { useEffect, useRef } from 'react'
import { registerBackHandler } from '../lib/backButtonManager'

/**
 * Custom React hook to register a hardware back button close handler.
 * @param {Function} handler Callback to execute when hardware back button is pressed.
 * @param {boolean} active Whether the handler is currently active (e.g., modal is open).
 */
export function useBackHandler(handler, active = true) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!active) return
    const unregister = registerBackHandler(() => {
      if (typeof handlerRef.current === 'function') {
        handlerRef.current()
      }
    })
    return () => unregister()
  }, [active])
}
