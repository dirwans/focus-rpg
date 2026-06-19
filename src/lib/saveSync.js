import { supabase } from './supabase'

export async function loadSave(userId) {
  const { data, error } = await supabase
    .from('player_saves')
    .select('game_state')
    .eq('user_id', userId)
    .single()
  if (error) {
    if (error.code !== 'PGRST116') console.error('[saveSync] loadSave error:', error)
    return null
  }
  return data?.game_state ?? null
}

export async function syncSave(userId, gameState) {
  const { error } = await supabase
    .from('player_saves')
    .upsert(
      { user_id: userId, game_state: gameState, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) console.error('[saveSync] syncSave error:', error)
}
