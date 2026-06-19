import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [done, setDone] = useState(false)

  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const error = useAuthStore((s) => s.error)
  const loading = useAuthStore((s) => s.loading)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (mode === 'login') {
      await signIn(email, password)
    } else {
      const ok = await signUp(email, password, username)
      if (ok) setDone(true)
    }
  }

  if (done) {
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={{ fontSize: 40, textAlign: 'center' }}>📧</div>
          <div style={styles.title}>CHECK YOUR EMAIL</div>
          <div style={styles.sub}>Confirmation link sent to<br /><strong style={{ color: '#00e5ff' }}>{email}</strong></div>
          <button style={styles.btn} onClick={() => { setDone(false); setMode('login') }}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <div style={styles.logoText}>FOCUS RPG</div>
          <div style={styles.logoSub}>IDLE BATTLE SYSTEM</div>
        </div>

        {/* Tab */}
        <div style={styles.tabs}>
          <button style={styles.tab(mode === 'login')} onClick={() => { setMode('login'); clearError() }}>LOGIN</button>
          <button style={styles.tab(mode === 'register')} onClick={() => { setMode('register'); clearError() }}>REGISTER</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>USERNAME</label>
              <input
                style={styles.input}
                type="text"
                placeholder="YourPilotName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              style={styles.input}
              type="email"
              placeholder="pilot@sector.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? '...' : mode === 'login' ? '⚡ DEPLOY LOGIN' : '🚀 CREATE PILOT'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  root: { minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(180deg,#06101f 0%,#050810 100%)' },
  card: { width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 },
  logo: { textAlign: 'center', marginBottom: 8 },
  logoIcon: { fontSize: 48, marginBottom: 8 },
  logoText: { fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: '#00e5ff', letterSpacing: 4 },
  logoSub: { fontFamily: 'monospace', fontSize: 13, color: '#7ab0d0', letterSpacing: 3, marginTop: 4 },
  tabs: { display: 'flex', border: '2px solid #0d2a50', borderRadius: 10, overflow: 'hidden' },
  tab: (active) => ({ flex: 1, padding: '12px', border: 'none', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', background: active ? 'rgba(0,100,200,0.3)' : 'rgba(0,10,30,0.6)', color: active ? '#00e5ff' : '#7ab0d0', borderBottom: active ? '3px solid #00c8ff' : 'none' }),
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#7ab0d0' },
  input: { background: 'rgba(0,20,50,0.8)', border: '2px solid #0d3060', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 16, color: '#e0f4ff', outline: 'none' },
  error: { background: 'rgba(255,68,68,0.1)', border: '2px solid #ff4444', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 14, color: '#ff6666' },
  submit: { padding: '16px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#0050cc,#00a8ff)', fontFamily: 'monospace', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', marginTop: 4 },
  btn: { padding: '14px', borderRadius: 10, border: '2px solid #0d3060', background: 'rgba(0,20,60,0.8)', fontFamily: 'monospace', fontSize: 15, color: '#00e5ff', cursor: 'pointer' },
  sub: { fontFamily: 'monospace', fontSize: 15, color: '#7ab0d0', textAlign: 'center', lineHeight: 1.8 },
  title: { fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#00e5ff', textAlign: 'center', letterSpacing: 2, margin: '8px 0' },
}
