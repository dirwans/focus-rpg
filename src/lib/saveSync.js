import { supabase } from './supabase'

export async function loadSave(userId) {
  const { data, error } = await supabase
    .from('player_saves')
    .select('game_state')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data.game_state
}

export async function syncSave(userId, gameState) {
  await supabase
    .from('player_saves')
    .upsert({ user_id: userId, game_state: gameState, updated_at: new Date().toISOString() })
}
