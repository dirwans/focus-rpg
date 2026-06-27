import { create } from 'zustand'
import { apiRegister, apiLogin, apiMe, apiLogout, apiGoogleAuth, setToken, clearToken, getToken } from '../lib/api'

export const useAuthStore = create((set) => ({
  user: null,      // { username }
  loading: true,
  error: null,

  init: async () => {
    if (!getToken()) { set({ user: null, loading: false }); return }
    try {
      const { username } = await apiMe()
      set({ user: { username }, loading: false })
    } catch {
      clearToken()
      set({ user: null, loading: false })
    }
  },

  signUp: async (username, password) => {
    set({ error: null, loading: true })
    try {
      const { token, username: u } = await apiRegister(username, password)
      setToken(token)
      set({ user: { username: u }, loading: false })
      return true
    } catch (e) {
      set({ error: e.message, loading: false })
      return false
    }
  },

  signIn: async (username, password) => {
    set({ error: null, loading: true })
    try {
      const { token, username: u } = await apiLogin(username, password)
      setToken(token)
      set({ user: { username: u }, loading: false })
      return true
    } catch (e) {
      set({ error: e.message, loading: false })
      return false
    }
  },

  signInWithGoogle: async (credential) => {
    set({ error: null, loading: true })
    try {
      const { token, username } = await apiGoogleAuth(credential)
      setToken(token)
      set({ user: { username }, loading: false })
      return true
    } catch (e) {
      set({ error: e.message, loading: false })
      return false
    }
  },

  signOut: async () => {
    try { await apiLogout() } catch (err) { console.warn('[authStore] logout request fail:', err) }
    clearToken()
    localStorage.removeItem('focus-rpg-save') // Prevent state bleeding to new sessions
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
