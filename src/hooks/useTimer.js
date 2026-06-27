import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'

export function useTimer() {
  const tick = useGameStore((s) => s.tick)
  const timerState = useGameStore((s) => s.timer.state)
  const authUser = useAuthStore((s) => s.user)
  const playerUsername = useGameStore((s) => s.player?.username)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (timerState === 'running' && authUser && authUser.username === playerUsername) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => tick(), 1000)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState, authUser?.username, playerUsername])
}
