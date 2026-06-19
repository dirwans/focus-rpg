import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export function useTimer() {
  const tick = useGameStore((s) => s.tick)
  const timerState = useGameStore((s) => s.timer.state)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => tick(), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerState])
}
