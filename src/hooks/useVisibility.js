import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

// Idle/AFK System: tracks whether the screen/tab is currently in the foreground.
// Active Mode (foreground) grants a live bonus (+10% EXP, +5% Drop Rate) during Focus Sessions;
// Idle Mode (backgrounded/screen off) keeps auto-battle/auto-loot/EXP/CRD/drops running with no bonus.
export function useVisibility() {
  const setScreenActive = useGameStore((s) => s.setScreenActive)

  useEffect(() => {
    setScreenActive(!document.hidden)
    const onChange = () => setScreenActive(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    window.addEventListener('focus', onChange)
    window.addEventListener('blur', onChange)
    return () => {
      document.removeEventListener('visibilitychange', onChange)
      window.removeEventListener('focus', onChange)
      window.removeEventListener('blur', onChange)
    }
  }, [setScreenActive])
}
