import { useGameStore } from '../store/gameStore'
import { TRANSLATIONS } from './translationData'

export { TRANSLATIONS }

export function t(key, replacements = {}) {
  const language = useGameStore.getState().player?.language || 'en'
  const dict = TRANSLATIONS[language] || TRANSLATIONS['en']
  let text = dict[key] || TRANSLATIONS['en'][key] || key
  
  Object.entries(replacements).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v)
  })
  
  return text
}
