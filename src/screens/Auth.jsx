import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | register
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const error = useAuthStore((s) => s.error)
  const loading = useAuthStore((s) => s.loading)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (mode === 'login') await signIn(username.trim(), password)
    else await signUp(username.trim(), password)
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <div style={styles.logoText}>FOCUS RPG</div>
          <div style={styles.logoSub}>IDLE BATTLE SYSTEM</div>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(mode === 'login')} onClick={() => { setMode('login'); clearError() }}>LOGIN</button>
          <button style={styles.tab(mode === 'register')} onClick={() => { setMode('register'); clearError() }}>REGISTER</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>USERNAME</label>
            <input
              style={styles.input}
              type="text"
              placeholder="ironewan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <button style={styles.submit} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? '⚡ LOGIN' : '🚀 CREATE PILOT'}
          </button>
        </form>

        <div style={styles.hint}>
          {mode === 'login' ? 'Belum punya akun? Pilih REGISTER' : 'Progress tersimpan di server — sync semua device'}
        </div>
      </div>
    </div>
  )
}

const styles = {
  root:     { minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(180deg,#06101f 0%,#050810 100%)', fontFamily: 'var(--font-body)' },
  card:     { width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 },
  logo:     { textAlign: 'center', marginBottom: 8 },
  logoIcon: { fontSize: 48, marginBottom: 8 },
  logoText: { fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 900, color: '#00e5ff', letterSpacing: 4 },
  logoSub:  { fontFamily: 'var(--font-title)', fontSize: 14, color: '#7ab0d0', letterSpacing: 3, marginTop: 4, fontWeight: 800 },
  tabs:     { display: 'flex', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: 10, overflow: 'hidden' },
  tab:      (active) => ({ flex: 1, padding: '12px', border: 'none', fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, letterSpacing: 1, cursor: 'pointer', background: active ? 'rgba(0,100,200,0.3)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#00e5ff' : '#7ab0d0', borderBottom: active ? '3px solid #00c8ff' : 'none' }),
  form:     { display: 'flex', flexDirection: 'column', gap: 14 },
  field:    { display: 'flex', flexDirection: 'column', gap: 8 },
  label:    { fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, letterSpacing: 2, color: '#7ab0d0' },
  input:    { background: 'rgba(3, 8, 20, 0.8)', border: '1.5px solid rgba(0, 229, 255, 0.2)', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, color: '#e0f4ff', outline: 'none' },
  error:    { background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ff6666', fontWeight: 800 },
  submit:   { padding: '16px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#0050cc,#00a8ff)', fontFamily: 'var(--font-title)', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', marginTop: 4 },
  hint:     { fontFamily: 'var(--font-body)', fontSize: 14, color: '#4a8fa8', textAlign: 'center', lineHeight: 1.6, fontWeight: 700 },
}
